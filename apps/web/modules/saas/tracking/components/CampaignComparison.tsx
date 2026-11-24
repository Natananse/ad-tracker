"use client";

import {
	ArrowDownWideNarrowIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import { type CampaignSummary, formatMoney } from "../lib/campaign-report";

const metrics = {
	netRevenue: { label: "Net revenue", bar: "bg-teal-500 dark:bg-teal-400" },
	contribution: {
		label: "Contribution",
		bar: "bg-cyan-600 dark:bg-cyan-400",
	},
	spend: { label: "Ad spend", bar: "bg-blue-500 dark:bg-blue-400" },
};

type Metric = keyof typeof metrics;
const metricKeys = Object.keys(metrics) as Metric[];
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
	const [metric, setMetric] = useState<Metric>("netRevenue");
	const [page, setPage] = useState(0);
	const ranked = useMemo(
		() =>
			[...summaries].sort((a, b) => {
				const first = a[metric];
				const second = b[metric];
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
		[summaries, metric, locale],
	);
	if (!ranked.length) {
		return null;
	}

	const maximum = Math.max(0, ranked[0][metric] ?? 0);
	const minimum = Math.min(
		0,
		ranked.findLast((row) => row[metric] !== null)?.[metric] ?? 0,
	);
	const span = maximum - minimum || 1;
	const zero = (-minimum / span) * 100;
	const lastPage = Math.ceil(ranked.length / campaignsPerPage) - 1;
	const currentPage = Math.min(page, lastPage);
	const start = currentPage * campaignsPerPage;
	const visible = ranked.slice(start, start + campaignsPerPage);

	return (
		<section
			aria-labelledby={titleId}
			className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-6"
		>
			<div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
				<h3
					id={titleId}
					className="flex items-center gap-2 font-semibold text-lg tracking-tight"
				>
					<ArrowDownWideNarrowIcon
						aria-hidden="true"
						className="size-5 text-teal-700 dark:text-teal-400"
					/>
					Campaign ranking
				</h3>
				<fieldset className="flex min-w-0 flex-wrap gap-0.5 rounded-lg border border-border/70 bg-muted/50 p-1">
					<legend className="sr-only">Rank campaigns by</legend>
					{metricKeys.map((key) => (
						<button
							key={key}
							type="button"
							aria-pressed={metric === key}
							onClick={() => {
								setMetric(key);
								setPage(0);
							}}
							className="rounded-md px-2.5 py-1.5 font-medium text-muted-foreground text-xs hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-sm"
						>
							{metrics[key].label}
						</button>
					))}
				</fieldset>
			</div>
			<ol
				start={start + 1}
				aria-label={`Campaigns ranked by ${metrics[metric].label.toLowerCase()} in ${currency}`}
				className="divide-y divide-border/60 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(6rem,auto)] sm:gap-x-4"
			>
				{visible.map((summary) => {
					const value = summary[metric];
					return (
						<li
							key={JSON.stringify([
								summary.channel,
								summary.campaign,
							])}
							className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-3 sm:col-span-full sm:grid-cols-subgrid"
						>
							<div className="min-w-0">
								<p className="break-words font-medium text-sm">
									{summary.campaign}
								</p>
								<p className="break-words text-muted-foreground text-xs">
									{summary.channel}
								</p>
							</div>
							<div
								aria-hidden="true"
								className={`relative col-span-2 col-start-1 row-start-2 h-3 rounded-sm sm:col-span-1 sm:col-start-2 sm:row-start-1 ${value === null ? "border-y border-dashed border-border" : "bg-muted/75"}`}
							>
								{value !== null && (
									<>
										<span
											className="absolute inset-y-0 w-px bg-foreground/30"
											style={{
												left: `clamp(0px, ${zero}%, calc(100% - 1px))`,
											}}
										/>
										{value !== 0 && (
											<span
												className={`absolute inset-y-0 rounded-sm ${value < 0 ? "bg-rose-500 dark:bg-rose-400" : metrics[metric].bar}`}
												style={{
													left: `${zero + (Math.min(value, 0) / span) * 100}%`,
													width: `${(Math.abs(value) / span) * 100}%`,
												}}
											/>
										)}
									</>
								)}
							</div>
							<span
								className={`col-start-2 row-start-1 break-all text-right font-medium text-sm tabular-nums sm:col-start-3 ${value === null ? "text-muted-foreground" : value < 0 ? "text-rose-700 dark:text-rose-300" : "text-foreground"}`}
							>
								{value === null
									? "Unknown"
									: formatMoney(value, currency, locale)}
							</span>
						</li>
					);
				})}
			</ol>
			{lastPage > 0 && (
				<div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
					<span
						role="status"
						className="text-muted-foreground text-xs tabular-nums"
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
