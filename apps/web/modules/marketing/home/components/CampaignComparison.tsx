"use client";

import { formatMoney } from "@saas/tracking/lib/campaign-report";
import {
	CalendarDaysIcon,
	Columns3Icon,
	InfinityIcon,
	SearchIcon,
	StoreIcon,
} from "lucide-react";
import { useLocale } from "next-intl";
import { useId, useState } from "react";
import {
	demoCampaignReports,
	demoCurrency,
	demoWindowDays,
} from "../lib/demo-campaign-reports";
import styles from "./CampaignComparison.module.css";

const models = [
	{ value: "last-click", label: "Last click" },
	{ value: "first-click", label: "First click" },
] as const;

type ComparisonModel = (typeof models)[number]["value"];

export function CampaignComparison() {
	const locale = useLocale();
	const modelName = useId();
	const [model, setModel] = useState<ComparisonModel>("last-click");
	const { campaigns } = demoCampaignReports[model];
	const percent = new Intl.NumberFormat(locale, { style: "percent" });
	const money = (value: number | null) =>
		value === null ? "—" : formatMoney(value, demoCurrency, locale);

	return (
		<figure
			className={styles.panel}
			aria-label="Interactive campaign comparison"
			data-test="campaign-comparison"
		>
			<figcaption className={styles.heading}>
				<span className={styles.mark} aria-hidden="true">
					<Columns3Icon />
				</span>
				<span className={styles.title}>Campaign performance</span>
				<span className={styles.store}>
					<StoreIcon aria-hidden="true" />
					Demo store
				</span>
			</figcaption>
			<div className={styles.toolbar}>
				<fieldset className={styles.models}>
					<legend className="sr-only">Attribution model</legend>
					{models.map((option) => (
						<label className={styles.option} key={option.value}>
							<input
								type="radio"
								name={modelName}
								value={option.value}
								checked={model === option.value}
								onChange={() => setModel(option.value)}
							/>
							<span>{option.label}</span>
						</label>
					))}
				</fieldset>
				<span className={styles.window}>
					<CalendarDaysIcon aria-hidden="true" />
					{demoWindowDays}-day window
				</span>
			</div>
			<table className={styles.table} aria-label="Campaign results">
				<thead>
					<tr>
						<th scope="col">Campaign</th>
						<th scope="col">Net sales</th>
						<th scope="col">After ads</th>
					</tr>
				</thead>
				<tbody>
					{campaigns.map((campaign) => (
						<tr key={campaign.campaign}>
							<th scope="row">
								<span className={styles.campaignName}>
									<span
										className={styles.channelMark}
										data-channel={campaign.channel}
										aria-hidden="true"
									>
										{campaign.channel === "Meta" ? (
											<InfinityIcon />
										) : (
											<SearchIcon />
										)}
									</span>
									<span>
										<strong>{campaign.campaign}</strong>
										<small>
											{campaign.channel} ·{" "}
											{campaign.orders}{" "}
											{campaign.orders === 1
												? "order"
												: "orders"}
										</small>
									</span>
								</span>
							</th>
							<td>{money(campaign.netRevenue)}</td>
							<td>
								<span
									className={styles.result}
									data-negative={
										campaign.contribution !== null &&
										campaign.contribution < 0
									}
								>
									{money(campaign.contribution)}
								</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<div className={styles.distribution}>
				<strong>Share of net sales</strong>
				<div className={styles.bar} aria-hidden="true">
					{campaigns.map((campaign) => (
						<span
							key={campaign.campaign}
							data-channel={campaign.channel}
							style={{ width: `${campaign.share * 100}%` }}
						/>
					))}
				</div>
				<ul className={styles.legend} aria-label="Net sales by channel">
					{campaigns.map((campaign) => (
						<li
							key={campaign.campaign}
							data-channel={campaign.channel}
						>
							<i aria-hidden="true" />
							{campaign.channel}{" "}
							<b>{percent.format(campaign.share)}</b>
						</li>
					))}
				</ul>
			</div>
		</figure>
	);
}
