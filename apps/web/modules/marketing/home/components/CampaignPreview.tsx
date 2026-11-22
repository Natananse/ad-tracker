"use client";

import { LocaleLink } from "@i18n/routing";
import { computeAttribution } from "@repo/api/modules/tracking/attribution/compute";
import example from "@repo/api/modules/tracking/attribution/example.json";
import {
	buildCampaignReport,
	campaignOverview,
	formatMoney,
} from "@saas/tracking/lib/campaign-report";
import {
	ArrowUpRightIcon,
	CalendarDaysIcon,
	ChartNoAxesCombinedIcon,
	DatabaseIcon,
	StoreIcon,
} from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";

const campaigns = buildCampaignReport(
	computeAttribution({
		snapshot: example,
		model: "last-click",
		windowDays: 28,
	}).rows,
	{
		currency: "USD",
		start: "",
		end: "",
	},
);
const overview = campaignOverview(campaigns);

export function CampaignPreview() {
	const locale = useLocale();
	const [view, setView] = useState<"returns" | "costs">("returns");
	const money = (value: number | null) =>
		value === null ? "—" : formatMoney(value, "USD", locale);
	return (
		<div className="mx-auto max-w-5xl overflow-hidden rounded-xl border-[5px] border-[#254551] bg-[#f5f7f9] text-start text-[#152c37] shadow-2xl sm:border-[7px]">
			<div className="flex items-center justify-between gap-3 border-b border-[#d5dee3] bg-white px-4 py-3 sm:px-6">
				<span className="flex items-center gap-2 text-sm font-semibold">
					<StoreIcon className="size-4 text-[#00775a]" /> Demo store
				</span>
				<span className="inline-flex items-center gap-1.5 text-xs text-[#506370]">
					<DatabaseIcon size={13} /> Sample data
				</span>
			</div>
			<div className="p-4 sm:p-6">
				<div className="mb-5 flex flex-wrap items-center justify-between gap-2">
					<h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight sm:text-xl">
						<ChartNoAxesCombinedIcon className="size-5 text-[#00775a]" />{" "}
						Campaign performance
					</h2>
					<span className="inline-flex items-center gap-2 rounded-md border border-[#d1dee4] bg-white px-2.5 py-1.5 text-xs">
						<CalendarDaysIcon size={14} /> Nov 3, 2026
					</span>
				</div>
				<dl className="grid grid-cols-3 gap-2 sm:gap-3">
					{(
						[
							["Net revenue", overview.netRevenue],
							["Ad spend", overview.spend],
							["After costs", overview.contribution],
						] as const
					).map(([label, value]) => (
						<div
							key={label}
							className="rounded-lg border border-[#dce4e8] bg-white p-2.5 sm:p-4"
						>
							<dt className="text-xs font-medium text-[#506370]">
								{label}
							</dt>
							<dd className="mt-1 text-base font-bold tracking-tight tabular-nums sm:text-2xl">
								{money(value)}
							</dd>
						</div>
					))}
				</dl>
				<div className="mt-4 overflow-hidden rounded-lg border border-[#dce4e8] bg-white">
					<fieldset
						className="flex border-b border-[#dce4e8] px-3"
						aria-label="Preview metrics"
					>
						{(["returns", "costs"] as const).map((choice) => (
							<button
								key={choice}
								type="button"
								aria-pressed={choice === view}
								onClick={() => setView(choice)}
								className={`border-b-2 px-3 py-2.5 text-xs font-semibold ${choice === view ? "border-[#078365] text-[#006b50]" : "border-transparent text-[#506370] hover:text-[#152c37]"}`}
							>
								{choice === "returns"
									? "Campaign returns"
									: "Campaign costs"}
							</button>
						))}
					</fieldset>
					<table className="w-full text-left text-xs sm:text-sm">
						<thead className="bg-[#f3f6f7] text-[#425866]">
							<tr>
								{[
									"Campaign",
									view === "returns" ? "Revenue" : "Refunds",
									view === "returns" ? "ROAS" : "Costs",
									"After ads",
								].map((label) => (
									<th
										key={label}
										scope="col"
										className="px-2.5 py-2.5 font-medium sm:px-4"
									>
										{label}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{campaigns.map((c) => (
								<tr
									key={c.channel}
									className="border-t border-[#e0e7eb]"
								>
									<th
										scope="row"
										className="px-2.5 py-3 sm:px-4"
									>
										<span className="block font-semibold">
											{c.campaign}
										</span>
										<span className="font-normal text-[#62727b]">
											{c.channel}
										</span>
									</th>
									<td className="px-2.5 sm:px-4">
										{money(
											view === "returns"
												? c.netRevenue
												: c.refunds,
										)}
									</td>
									<td className="px-2.5 sm:px-4">
										{view === "returns"
											? `${c.roas?.toFixed(1)}×`
											: money(c.costs)}
									</td>
									<td
										className={`px-2.5 font-semibold sm:px-4 ${(c.contribution ?? 0) < 0 ? "text-[#a13f44]" : "text-[#006c50]"}`}
									>
										{money(c.contribution)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<LocaleLink
					href="/demo"
					className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#006c50] hover:underline"
				>
					Explore the full report <ArrowUpRightIcon size={14} />
				</LocaleLink>
			</div>
		</div>
	);
}
