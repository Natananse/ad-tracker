"use client";

import { useId, useMemo, useState } from "react";
import { type CampaignTrendDay, formatMoney } from "../lib/campaign-report";
import { chartMetrics } from "./campaign-chart-metrics";

const dayInMs = 86_400_000;
const daysPerPage = 14;
const plotWidth = 600;
const plotHeight = 160;
const inset = 5;

function buildPlot(days: CampaignTrendDay[]) {
	const dates = days.map((day) => Date.parse(`${day.date}T00:00:00Z`));
	const duration = dates[dates.length - 1] - dates[0];
	let minimum = 0;
	let maximum = 0;
	let hasGaps = false;
	for (const [index, day] of days.entries()) {
		if (index > 0 && dates[index] - dates[index - 1] > dayInMs) {
			hasGaps = true;
		}
		for (const { key } of chartMetrics) {
			const value = day[key];
			if (value === null) {
				hasGaps = true;
			} else {
				minimum = Math.min(minimum, value);
				maximum = Math.max(maximum, value);
			}
		}
	}
	const span = maximum - minimum;
	function y(value: number) {
		return span
			? inset + ((maximum - value) / span) * (plotHeight - 2 * inset)
			: plotHeight / 2;
	}
	const ticks = new Set([minimum, maximum]);
	if (minimum === 0 || maximum === 0) {
		ticks.add(Math.round((minimum + maximum) / 2));
	} else if (Math.min(-minimum, maximum) / span >= 0.12) {
		ticks.add(0);
	}
	const series = chartMetrics.map((metric) => {
		const lines: string[] = [];
		const dots: string[] = [];
		for (const [index, day] of days.entries()) {
			const value = day[metric.key];
			if (value === null) {
				continue;
			}
			const x = duration
				? inset +
					((dates[index] - dates[0]) / duration) *
						(plotWidth - 2 * inset)
				: plotWidth / 2;
			const coords = `${x.toFixed(2)} ${y(value).toFixed(2)}`;
			const connectedBefore =
				index > 0 &&
				dates[index] - dates[index - 1] === dayInMs &&
				days[index - 1][metric.key] !== null;
			const connectedAfter =
				index + 1 < days.length &&
				dates[index + 1] - dates[index] === dayInMs &&
				days[index + 1][metric.key] !== null;
			lines.push(`${connectedBefore ? "L" : "M"}${coords}`);
			// Short round-capped strokes keep isolated dates visible on every screen size.
			if (days.length <= 31 || (!connectedBefore && !connectedAfter)) {
				dots.push(`M${coords}h0.01`);
			}
		}
		return { ...metric, lines: lines.join(" "), dots: dots.join(" ") };
	});
	return {
		series,
		ticks: [...ticks]
			.sort((a, b) => b - a)
			.map((value) => ({ value, y: y(value) })),
		zeroY: y(0),
		hasGaps,
	};
}

export function CampaignTrend({
	days,
	currency,
	locale,
}: {
	days: CampaignTrendDay[];
	currency: string;
	locale: string;
}) {
	const titleId = useId();
	const [page, setPage] = useState(0);
	const plot = useMemo(() => buildPlot(days), [days]);
	const dateFormat = useMemo(
		() =>
			new Intl.DateTimeFormat(locale, {
				month: "short",
				day: "numeric",
				year: "numeric",
				timeZone: "UTC",
			}),
		[locale],
	);
	if (!days.length) {
		return null;
	}
	const lastPage = Math.ceil(days.length / daysPerPage) - 1;
	const currentPage = Math.min(page, lastPage);
	const start = currentPage * daysPerPage;
	const firstDate = dateFormat.format(new Date(days[0].date));
	const lastDate = dateFormat.format(new Date(days[days.length - 1].date));
	return (
		<section
			aria-labelledby={titleId}
			className="min-w-0 rounded-2xl border bg-card p-4 shadow-xs sm:p-6"
		>
			<div className="mb-4 flex flex-wrap items-start justify-between gap-3">
				<div>
					<h3
						id={titleId}
						className="text-lg font-semibold tracking-tight"
					>
						Performance over time
					</h3>
					<p className="text-xs text-muted-foreground">
						Daily totals in {currency}
					</p>
				</div>
				<ul
					aria-label="Trend lines"
					className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs"
				>
					{chartMetrics.map(({ key, label, color, dash }) => (
						<li key={key} className="flex items-center gap-1.5">
							<svg
								aria-hidden="true"
								className={`h-2 w-6 ${color}`}
								viewBox="0 0 24 8"
							>
								<path
									d="M1 4H23"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
									strokeDasharray={dash}
								/>
							</svg>
							{label}
						</li>
					))}
				</ul>
			</div>
			<div className="grid grid-cols-[minmax(0,max-content)_minmax(0,1fr)] gap-x-2 gap-y-1 sm:gap-x-3">
				<div
					aria-hidden="true"
					className="relative max-w-24 text-right text-[11px] leading-tight text-muted-foreground tabular-nums sm:max-w-40"
				>
					{plot.ticks.map(({ value }) => (
						<div key={value} className="invisible">
							{formatMoney(value, currency, locale)}
						</div>
					))}
					{plot.ticks.map(({ value, y }) => (
						<span
							key={value}
							className="absolute right-0 -translate-y-1/2 [overflow-wrap:anywhere]"
							style={{ top: `${(y / plotHeight) * 100}%` }}
						>
							{formatMoney(value, currency, locale)}
						</span>
					))}
				</div>
				<svg
					role="img"
					aria-label={`Daily campaign totals in ${currency}, ${firstDate}${days.length > 1 ? ` – ${lastDate}` : ""}. Exact amounts are under View daily values.`}
					viewBox={`0 0 ${plotWidth} ${plotHeight}`}
					preserveAspectRatio="none"
					className="block h-40 w-full overflow-visible sm:h-48"
				>
					{plot.ticks.map(({ value, y }) => (
						<line
							key={value}
							x1="0"
							x2={plotWidth}
							y1={y}
							y2={y}
							stroke="currentColor"
							className="text-border"
							vectorEffect="non-scaling-stroke"
							strokeDasharray="2 4"
						/>
					))}
					<line
						x1="0"
						x2={plotWidth}
						y1={plot.zeroY}
						y2={plot.zeroY}
						stroke="currentColor"
						className="text-foreground/35"
						vectorEffect="non-scaling-stroke"
					/>
					{plot.series.map(({ key, color, dash, lines, dots }) => (
						<g
							key={key}
							fill="none"
							stroke="currentColor"
							className={color}
						>
							<path
								d={lines}
								strokeWidth="2.5"
								strokeDasharray={dash}
								strokeLinejoin="round"
								vectorEffect="non-scaling-stroke"
							/>
							<path
								d={dots}
								strokeWidth="5"
								strokeLinecap="round"
								vectorEffect="non-scaling-stroke"
							/>
						</g>
					))}
				</svg>
				<div
					aria-hidden="true"
					className={`col-start-2 flex flex-wrap gap-1 text-[11px] text-muted-foreground ${days.length === 1 ? "justify-center" : "justify-between"}`}
				>
					<span>{firstDate}</span>
					{days.length > 1 && <span>{lastDate}</span>}
				</div>
			</div>
			{plot.hasGaps && (
				<p className="mt-3 text-xs text-muted-foreground">
					Lines break where a day or an amount is missing.
				</p>
			)}
			<details className="mt-4 border-t pt-3 text-xs">
				<summary className="w-fit cursor-pointer rounded-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">
					View daily values
				</summary>
				<div className="mt-3 overflow-x-auto">
					<table className="w-full text-left text-xs tabular-nums">
						<caption className="sr-only">
							Daily totals in {currency}
						</caption>
						<thead>
							<tr className="border-b text-muted-foreground">
								<th
									scope="col"
									className="pb-2 pr-2 font-medium"
								>
									Date (UTC)
								</th>
								{chartMetrics.map(({ key, label }) => (
									<th
										key={key}
										scope="col"
										className="pb-2 pl-2 text-right font-medium"
									>
										{label}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{days
								.slice(start, start + daysPerPage)
								.map((day) => (
									<tr
										key={day.date}
										className="border-b last:border-0"
									>
										<th
											scope="row"
											className="whitespace-nowrap py-2 pr-2 font-normal"
										>
											<time dateTime={day.date}>
												{dateFormat.format(
													new Date(day.date),
												)}
											</time>
										</th>
										{chartMetrics.map(({ key }) => (
											<td
												key={key}
												className="whitespace-nowrap py-2 pl-2 text-right"
											>
												{day[key] === null
													? "Unknown"
													: formatMoney(
															day[key],
															currency,
															locale,
														)}
											</td>
										))}
									</tr>
								))}
						</tbody>
					</table>
				</div>
				{lastPage > 0 && (
					<div className="mt-2 flex flex-wrap items-center justify-end gap-3">
						<button
							type="button"
							aria-label="Previous daily values"
							disabled={!currentPage}
							onClick={() => setPage(currentPage - 1)}
							className="rounded-md border px-2 py-1 disabled:opacity-40"
						>
							Previous
						</button>
						<span role="status">
							Page {currentPage + 1} of {lastPage + 1}
						</span>
						<button
							type="button"
							aria-label="Next daily values"
							disabled={currentPage === lastPage}
							onClick={() => setPage(currentPage + 1)}
							className="rounded-md border px-2 py-1 disabled:opacity-40"
						>
							Next
						</button>
					</div>
				)}
			</details>
		</section>
	);
}
