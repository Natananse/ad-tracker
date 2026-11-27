"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { type CampaignSummary, formatMoney } from "../lib/campaign-report";
import { CostSourceLabel } from "./CostSourceLabel";
import { type ChartMetric, chartMetrics } from "./campaign-chart-metrics";

const campaignsPerPage = 6;

export function CampaignComparison({
	summaries,
	currency,
	locale,
}: {
	summaries: CampaignSummary[];
	currency: string;
	locale: string;
}) {
	const titleId = useId();
	const [rankBy, setRankBy] = useState<ChartMetric>("netRevenue");
	const [page, setPage] = useState(0);
	const ranked = useMemo(
		() =>
			[...summaries].sort((a, b) => {
				const first = a[rankBy];
				const second = b[rankBy];
				if (first === second) {
					return (
						a.campaign.localeCompare(b.campaign, locale) ||
						a.channel.localeCompare(b.channel, locale)
					);
				}
				if (first === null) {
					return 1;
				}
				if (second === null) {
					return -1;
				}
				return second - first;
			}),
		[summaries, rankBy, locale],
	);
	const { minimum, span } = useMemo(() => {
		let minimum = 0;
		let maximum = 0;
		for (const summary of summaries) {
			for (const { key } of chartMetrics) {
				const value = summary[key];
				if (value !== null) {
					minimum = Math.min(minimum, value);
					maximum = Math.max(maximum, value);
				}
			}
		}
		return { minimum, span: maximum - minimum || 1 };
	}, [summaries]);
	if (!ranked.length) {
		return null;
	}
	const zero = (-minimum / span) * 100;
	const lastPage = Math.ceil(ranked.length / campaignsPerPage) - 1;
	const currentPage = Math.min(page, lastPage);
	const start = currentPage * campaignsPerPage;
	const visible = ranked.slice(start, start + campaignsPerPage);

	return (
		<section
			aria-labelledby={titleId}
			className="min-w-0 rounded-2xl border bg-card p-4 shadow-xs sm:p-6"
		>
			<div className="flex flex-wrap items-start justify-between gap-3 border-b pb-3">
				<div>
					<h3
						id={titleId}
						className="text-lg font-semibold tracking-tight"
					>
						Campaign comparison
					</h3>
					<p className="text-xs text-muted-foreground">
						Totals in {currency}
					</p>
				</div>
				<label className="flex items-center gap-2 text-xs text-muted-foreground">
					Rank by
					<select
						value={rankBy}
						onChange={(event) => {
							setRankBy(event.target.value as ChartMetric);
							setPage(0);
						}}
						className="h-8 rounded-md border bg-card px-2 text-xs text-foreground focus-visible:outline-2 focus-visible:outline-ring"
					>
						{chartMetrics.map(({ key, label }) => (
							<option key={key} value={key}>
								{label}
							</option>
						))}
					</select>
				</label>
			</div>
			<ol
				start={start + 1}
				className="divide-y divide-border/70"
				aria-label="Ranked campaign totals"
			>
				{visible.map((summary) => (
					<li
						key={JSON.stringify([
							summary.channel,
							summary.campaign,
						])}
						className="grid min-w-0 gap-2 py-3"
					>
						<div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
							<span className="[overflow-wrap:anywhere] text-sm font-semibold">
								{summary.campaign}
							</span>
							<span className="[overflow-wrap:anywhere] text-xs text-muted-foreground">
								{summary.channel}
							</span>
						</div>
						<dl className="grid grid-cols-[auto_minmax(1rem,1fr)_minmax(4rem,28%)] items-center gap-x-2 gap-y-1.5 text-xs">
							{chartMetrics.map(({ key, label, color }) => {
								const value = summary[key];
								return (
									<div
										key={key}
										className="col-span-full grid grid-cols-subgrid items-center"
									>
										<dt>{label}</dt>
										<dd className="col-span-2 grid grid-cols-subgrid items-center">
											<div
												aria-hidden="true"
												className={`relative h-2 ${value === null ? "border-b border-dashed" : "rounded-sm bg-muted"}`}
											>
												{value !== null && (
													<>
														<span
															className="absolute -inset-y-0.5 w-px bg-foreground/40"
															style={{
																left: `clamp(0px, ${zero}%, calc(100% - 1px))`,
															}}
														/>
														<span
															className={`absolute inset-y-0 rounded-sm bg-current ${color}`}
															style={{
																left: `${((Math.min(0, value) - minimum) / span) * 100}%`,
																width: `${(Math.abs(value) / span) * 100}%`,
															}}
														/>
													</>
												)}
											</div>
											<span
												className={`text-right font-medium tabular-nums [overflow-wrap:anywhere] ${value === null ? "text-muted-foreground" : ""}`}
											>
												{value === null
													? "Unknown"
													: formatMoney(
															value,
															currency,
															locale,
														)}
												{key === "contribution" &&
													value !== null && (
														<CostSourceLabel
															source={
																summary.costSource
															}
														/>
													)}
											</span>
										</dd>
									</div>
								);
							})}
						</dl>
					</li>
				))}
			</ol>
			{lastPage > 0 && (
				<div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
					<span
						role="status"
						className="text-xs text-muted-foreground tabular-nums"
					>
						{(start + 1).toLocaleString(locale)}–
						{(start + visible.length).toLocaleString(locale)} of{" "}
						{ranked.length.toLocaleString(locale)} campaigns
					</span>
					<div className="flex gap-1">
						<button
							type="button"
							disabled={currentPage === 0}
							aria-label="Previous ranked campaigns"
							onClick={() => setPage(currentPage - 1)}
							className="grid size-8 place-items-center rounded-md border hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40"
						>
							<ChevronLeftIcon
								aria-hidden="true"
								className="size-4"
							/>
						</button>
						<button
							type="button"
							disabled={currentPage === lastPage}
							aria-label="Next ranked campaigns"
							onClick={() => setPage(currentPage + 1)}
							className="grid size-8 place-items-center rounded-md border hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40"
						>
							<ChevronRightIcon
								aria-hidden="true"
								className="size-4"
							/>
						</button>
					</div>
				</div>
			)}
		</section>
	);
}
