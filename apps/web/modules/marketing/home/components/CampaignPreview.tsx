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
	BarChart3Icon,
	CalendarDaysIcon,
	ChartNoAxesCombinedIcon,
	ChevronRightIcon,
	ReceiptTextIcon,
	StoreIcon,
} from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";
import styles from "./CampaignPreview.module.css";

const campaigns = buildCampaignReport(
	computeAttribution({
		snapshot: example,
		model: "last-click",
		windowDays: 28,
	}).rows,
	{ currency: example.currency, start: "", end: "" },
);
const overview = campaignOverview(campaigns);
const categories = [
	{ key: "sales", label: "Sales" },
	{ key: "netRevenue", label: "Net sales" },
	{ key: "costs", label: "Costs" },
	{ key: "spend", label: "Ad spend" },
] as const;
const chartMaximum = Math.max(
	1,
	...campaigns.flatMap((campaign) =>
		categories.map(({ key }) => campaign[key] ?? 0),
	),
);

export function CampaignPreview() {
	const locale = useLocale();
	const [view, setView] = useState<"returns" | "costs">("returns");
	const money = (value: number | null) =>
		value === null ? "—" : formatMoney(value, example.currency, locale);
	const isReturns = view === "returns";
	return (
		<div className={styles.window} data-test="campaign-preview">
			<div className={styles.toolbar}>
				<span className={styles.brand}>
					<ChartNoAxesCombinedIcon
						size={18}
						strokeWidth={2.6}
						aria-hidden="true"
					/>
					AdsTracking
				</span>
				<div className={styles.breadcrumb}>
					<StoreIcon size={13} aria-hidden="true" />
					Demo store <ChevronRightIcon size={11} aria-hidden="true" />{" "}
					Analytics
				</div>
				<span className={styles.sample}>Sample data</span>
			</div>
			<div className={styles.workspace}>
				<aside className={styles.sidebar}>
					<fieldset
						className={styles.choices}
						aria-label="Preview metrics"
					>
						<legend>Reports</legend>
						<button
							type="button"
							aria-pressed={isReturns}
							onClick={() => setView("returns")}
						>
							<BarChart3Icon aria-hidden="true" />
							Campaign returns
						</button>
						<button
							type="button"
							aria-pressed={!isReturns}
							onClick={() => setView("costs")}
						>
							<ReceiptTextIcon aria-hidden="true" />
							Campaign costs
						</button>
					</fieldset>
					<LocaleLink href="/demo" className={styles.fullReport}>
						Full report{" "}
						<ArrowUpRightIcon size={13} aria-hidden="true" />
					</LocaleLink>
				</aside>
				<section
					className={styles.report}
					aria-label="Sample campaign overview"
				>
					<div className={styles.heading}>
						<h2>Campaign overview</h2>
						<time dateTime={example.spend[0].date}>
							<CalendarDaysIcon size={13} aria-hidden="true" />
							{new Intl.DateTimeFormat(locale, {
								dateStyle: "medium",
								timeZone: "UTC",
							}).format(new Date(example.spend[0].date))}
						</time>
					</div>
					<div className={styles.summary}>
						<figure className={styles.chart}>
							<figcaption>Campaign breakdown</figcaption>
							<ul
								className={styles.legend}
								aria-label="Chart series"
							>
								{campaigns.map((c) => (
									<li key={c.channel}>
										<i aria-hidden="true" />
										{c.channel}
									</li>
								))}
							</ul>
							<div className={styles.plot}>
								{categories.map(({ key, label }) => (
									<div key={key} className={styles.group}>
										<div className={styles.bars}>
											{campaigns.map((c) => (
												<div
													key={c.channel}
													className={styles.bar}
													style={{
														height: `${(100 * (c[key] ?? 0)) / chartMaximum}%`,
													}}
													title={`${c.channel} · ${label}: ${money(c[key])}`}
												>
													<span className="sr-only">
														{c.channel} {label}{" "}
														{money(c[key])}
													</span>
												</div>
											))}
										</div>
										<span aria-hidden="true">{label}</span>
									</div>
								))}
							</div>
						</figure>
						<dl className={styles.metrics}>
							{(
								[
									["Net revenue", overview.netRevenue],
									["Ad spend", overview.spend],
									["Contribution", overview.contribution],
								] as const
							).map(([label, value]) => (
								<div key={label}>
									<dt>{label}</dt>
									<dd>{money(value)}</dd>
								</div>
							))}
						</dl>
					</div>
					<div className={styles.tableFrame}>
						<table>
							<caption className="sr-only">
								{isReturns
									? "Campaign returns"
									: "Campaign costs"}{" "}
								in {example.currency}
							</caption>
							<thead>
								<tr>
									{[
										"Campaign",
										isReturns ? "Revenue" : "Refunds",
										isReturns ? "ROAS" : "Costs",
										"After ads",
									].map((label) => (
										<th key={label} scope="col">
											{label}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{campaigns.map((c) => (
									<tr key={c.channel}>
										<th scope="row">
											{c.campaign}
											<span>{c.channel}</span>
										</th>
										<td>
											{money(
												isReturns
													? c.netRevenue
													: c.refunds,
											)}
										</td>
										<td>
											{isReturns
												? c.roas === null
													? "—"
													: `${c.roas.toFixed(1)}×`
												: money(c.costs)}
										</td>
										<td
											className={
												c.contribution !== null &&
												c.contribution < 0
													? styles.negative
													: styles.positive
											}
										>
											{money(c.contribution)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
			</div>
		</div>
	);
}
