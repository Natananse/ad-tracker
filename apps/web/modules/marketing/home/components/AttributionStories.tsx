import { LocaleLink } from "@i18n/routing";
import example from "@repo/api/modules/tracking/attribution/example.json";
import { ArrowUpRightIcon, DownloadIcon } from "lucide-react";
import styles from "./AttributionStories.module.css";
import { CampaignComparison } from "./CampaignComparison";
import { ReportInputDiagram } from "./ReportInputDiagram";

const sampleDownload = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(example, null, 2))}`;

export function AttributionStories() {
	return (
		<div className={styles.stories}>
			<section
				id="report-inputs"
				className={styles.row}
				aria-labelledby="inputs-title"
			>
				<div className={styles.copy}>
					<h2 id="inputs-title">
						Start with your store’s own numbers.
					</h2>
					<p>
						Bring Shopify orders, refunds, and ad spend into one
						report. Import daily campaign totals as a CSV, or use a
						JSON file to trace the clicks behind individual orders.
					</p>
					<a
						className={styles.link}
						href={sampleDownload}
						download="adstracking-sample-orders.json"
					>
						<DownloadIcon size={16} aria-hidden="true" /> Download
						sample JSON
					</a>
				</div>
				<div className={styles.visual}>
					<ReportInputDiagram />
				</div>
			</section>
			<section
				id="campaign-comparison"
				className={`${styles.row} ${styles.reverse}`}
				aria-labelledby="comparison-title"
			>
				<div className={styles.copy}>
					<h2 id="comparison-title">
						See which campaign earns the sale.
					</h2>
					<p>
						A shopper clicks a Google ad and later comes back
						through Meta. Switch between first and last click to see
						where that order’s revenue goes and how each campaign’s
						return changes.
					</p>
					<LocaleLink className={styles.link} href="/demo">
						Explore the full report{" "}
						<ArrowUpRightIcon size={17} aria-hidden="true" />
					</LocaleLink>
				</div>
				<div className={styles.visual}>
					<CampaignComparison />
				</div>
			</section>
		</div>
	);
}
