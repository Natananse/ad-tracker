import {
	ChartNoAxesCombinedIcon,
	InfinityIcon,
	ShoppingBagIcon,
} from "lucide-react";
import { useLocale } from "next-intl";
import {
	demoCampaignReports,
	demoCurrency,
} from "../lib/demo-campaign-reports";
import styles from "./ReportInputDiagram.module.css";

const totals = demoCampaignReports["last-click"].overview;

const inputPaths = [
	"M50 0 V15 Q50 30 65 30 H150 V50",
	"M150 0 V50",
	"M250 0 V15 Q250 30 235 30 H150 V50",
];
const outputPaths = [
	"M150 0 V24 H85 Q75 24 75 35 V50",
	"M150 0 V24 H215 Q225 24 225 35 V50",
];

function ReportWires({
	paths,
	className,
}: {
	paths: string[];
	className: string;
}) {
	return (
		<svg
			aria-hidden="true"
			className={`${styles.wires} ${className}`}
			viewBox="0 0 300 50"
			preserveAspectRatio="none"
			fill="none"
		>
			{paths.map((d) => (
				<g key={d}>
					<path d={d} className={styles.line} />
					<path d={d} pathLength="1" className={styles.point} />
				</g>
			))}
		</svg>
	);
}

export function ReportInputDiagram() {
	const locale = useLocale();
	const currency = new Intl.NumberFormat(locale, {
		style: "currency",
		currency: demoCurrency,
		trailingZeroDisplay: "stripIfInteger",
	});
	const divisor =
		10 ** (currency.resolvedOptions().maximumFractionDigits ?? 0);
	const money = (minor: number | null) =>
		minor === null ? "—" : currency.format(minor / divisor);
	return (
		<figure
			className={styles.figure}
			aria-label="Demo store report inputs and totals"
		>
			<div className={styles.content}>
				<ul className={styles.sources}>
					<li>
						<span
							className={`${styles.mark} ${styles.shopify}`}
							aria-hidden="true"
						>
							<ShoppingBagIcon />
						</span>
						<strong>Shopify</strong>
						<small>Orders &amp; refunds</small>
					</li>
					<li>
						<span
							className={`${styles.mark} ${styles.meta}`}
							aria-hidden="true"
						>
							<InfinityIcon />
						</span>
						<strong>Meta Ads</strong>
						<small>Ad spend</small>
					</li>
					<li>
						<span
							className={`${styles.mark} ${styles.google}`}
							aria-hidden="true"
						>
							<span className={styles.googleMark} />
						</span>
						<strong>Google Ads</strong>
						<small>Ad spend</small>
					</li>
				</ul>
				<ReportWires className={styles.join} paths={inputPaths} />
				<div className={styles.hub}>
					<span className={styles.brand}>
						<ChartNoAxesCombinedIcon aria-hidden="true" />
						AdsTracking
					</span>
					<dl>
						<dt>Total ad spend</dt>
						<dd>{money(totals.spend)}</dd>
					</dl>
				</div>
				<div className={styles.outputs}>
					<ReportWires className={styles.split} paths={outputPaths} />
					<dl>
						<div>
							<dt>Net revenue</dt>
							<dd>{money(totals.netRevenue)}</dd>
						</div>
						<div>
							<dt>Contribution</dt>
							<dd>{money(totals.contribution)}</dd>
						</div>
					</dl>
				</div>
			</div>
		</figure>
	);
}
