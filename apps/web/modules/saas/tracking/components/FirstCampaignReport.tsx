"use client";

import { Button } from "@ui/components/button";
import {
	ArrowRightIcon,
	DownloadIcon,
	FileSpreadsheetIcon,
} from "lucide-react";
import { useLocale } from "next-intl";
import {
	buildCampaignReport,
	formatMoney,
	parseCampaignCsv,
	SAMPLE_CSV,
	TEMPLATE_CSV,
} from "../lib/campaign-report";
import { downloadReportFile } from "../lib/download-report-file";

const sample = buildCampaignReport(parseCampaignCsv(SAMPLE_CSV), {
	currency: "USD",
	start: "",
	end: "",
});

export function FirstCampaignReport({
	busy,
	canEdit,
	onImport,
	onExample,
}: {
	busy: boolean;
	canEdit: boolean;
	onImport: () => void;
	onExample: () => void;
}) {
	const locale = useLocale();

	return (
		<div className="grid min-w-0 gap-4 lg:grid-cols-[1.05fr_1fr]">
			<section className="flex min-w-0 flex-col items-start rounded-2xl border bg-card p-6 sm:p-8">
				<span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
					<FileSpreadsheetIcon
						className="size-6"
						aria-hidden="true"
					/>
				</span>
				<h2 className="mt-5 text-2xl font-semibold tracking-tight">
					{canEdit
						? "Import your first report"
						: "Preview campaign data"}
				</h2>
				<p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
					Upload a CSV of daily sales, refunds, ad spend, and costs.
					{canEdit
						? " You can review the numbers before saving."
						: " An organization owner or admin can save it for the team."}
				</p>
				<div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
					<Button
						type="button"
						variant="primary"
						onClick={onImport}
						disabled={busy}
					>
						Import CSV
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() =>
							downloadReportFile(
								TEMPLATE_CSV,
								"campaign-template.csv",
							)
						}
					>
						<DownloadIcon className="size-4" aria-hidden="true" />
						Download CSV template
					</Button>
				</div>
			</section>
			<section className="min-w-0 rounded-2xl border border-indigo-950 bg-[#161d40] p-6 text-white sm:p-8 dark:border-indigo-300/20">
				<div className="flex flex-wrap items-baseline justify-between gap-2">
					<h2 className="text-lg font-semibold">Example report</h2>
					<span className="text-xs text-indigo-200">
						Sample data · USD
					</span>
				</div>
				<table className="mt-5 w-full table-fixed text-sm">
					<caption className="sr-only">
						Sample campaign results
					</caption>
					<thead className="text-xs text-indigo-200">
						<tr>
							<th
								scope="col"
								className="w-1/3 pb-2 text-left font-medium"
							>
								Channel
							</th>
							<th
								scope="col"
								className="pb-2 text-right font-medium"
							>
								Net revenue
							</th>
							<th
								scope="col"
								className="pb-2 text-right font-medium"
							>
								After costs
							</th>
						</tr>
					</thead>
					<tbody className="tabular-nums">
						{sample.map((campaign) => (
							<tr
								key={campaign.channel}
								className="border-t border-white/15"
							>
								<th
									scope="row"
									className="py-3 text-left font-medium"
								>
									{campaign.channel}
								</th>
								<td className="text-right">
									{formatMoney(
										campaign.netRevenue,
										campaign.currency,
										locale,
									)}
								</td>
								<td
									className={`text-right font-semibold ${(campaign.contribution ?? 0) < 0 ? "text-rose-300" : "text-teal-200"}`}
								>
									{campaign.contribution === null
										? "Unknown"
										: formatMoney(
												campaign.contribution,
												campaign.currency,
												locale,
											)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
				<button
					type="button"
					disabled={busy}
					onClick={onExample}
					className="mt-3 inline-flex items-center gap-2 rounded-sm py-1 text-sm font-semibold text-indigo-100 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50"
				>
					Explore sample report{" "}
					<ArrowRightIcon className="size-4" aria-hidden="true" />
				</button>
			</section>
		</div>
	);
}
