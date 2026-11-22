import { LocaleLink } from "@i18n/routing";
import { formatMoney } from "@saas/tracking/lib/campaign-report";
import {
	ArrowUpRightIcon,
	ChartNoAxesCombinedIcon,
	CoinsIcon,
	MousePointerClickIcon,
	RotateCcwIcon,
	ShoppingBagIcon,
} from "lucide-react";
import { useLocale } from "next-intl";
import {
	demoCampaignReports,
	demoCurrency,
	demoWindowDays,
} from "../lib/demo-campaign-reports";
import styles from "./AttributionFlow.module.css";

const sources = [
	{ label: "Store orders", icon: ShoppingBagIcon, color: styles.orders },
	{ label: "Refunds", icon: RotateCcwIcon, color: styles.refunds },
	{ label: "Ad clicks", icon: MousePointerClickIcon, color: styles.clicks },
	{ label: "Ad spend", icon: CoinsIcon, color: styles.spend },
];

const { overview } = demoCampaignReports["last-click"];
const metrics = [
	{ label: "Net revenue", value: overview.netRevenue },
	{ label: "Ad spend", value: overview.spend },
	{ label: "Contribution", value: overview.contribution },
];

// Both the fine wire and its travelling point use this same route.
const wireRoutes = {
	incoming: {
		horizontal: [
			"M0 0 H35 Q50 0 50 15 V35 Q50 50 65 50 H100",
			"M0 100 H35 Q50 100 50 85 V65 Q50 50 65 50 H100",
		],
		vertical: [
			"M25 0 V24 Q25 50 33 50 H44 Q50 50 50 70 V100",
			"M75 0 V24 Q75 50 67 50 H56 Q50 50 50 70 V100",
		],
	},
	outgoing: {
		horizontal: [
			"M0 50 H36 Q50 50 50 36 V14 Q50 0 64 0 H100",
			"M0 50 H100",
			"M0 50 H36 Q50 50 50 64 V86 Q50 100 64 100 H100",
		],
		vertical: [
			"M50 0 V28 Q50 50 43 50 H23 Q16.5 50 16.5 72 V100",
			"M50 0 V100",
			"M50 0 V28 Q50 50 57 50 H77 Q83.5 50 83.5 72 V100",
		],
	},
};

function FlowWires({ direction }: { direction: keyof typeof wireRoutes }) {
	return (
		<div
			className={`${styles.wires} ${styles[direction]}`}
			aria-hidden="true"
		>
			{(["horizontal", "vertical"] as const).map((layout) => (
				<svg
					key={layout}
					className={styles[layout]}
					viewBox="0 0 100 100"
					preserveAspectRatio="none"
					aria-hidden="true"
					focusable="false"
				>
					{wireRoutes[direction][layout].map((route) => (
						<g key={route}>
							<path className={styles.wire} d={route} />
							<path
								className={styles.signal}
								d={route}
								pathLength="100"
								data-flow-signal=""
							/>
						</g>
					))}
				</svg>
			))}
		</div>
	);
}

export function AttributionFlow() {
	const locale = useLocale();
	return (
		<section
			id="attribution-flow"
			className={styles.section}
			aria-labelledby="attribution-flow-title"
		>
			<div className={styles.content}>
				<header className={styles.intro}>
					<h2 id="attribution-flow-title">
						From order data to campaign returns.
					</h2>
					<p>
						Match paid orders to ad clicks, then follow what’s left
						after refunds, variable costs and ad spend.
					</p>
				</header>
				<figure className={styles.figure}>
					<div className={styles.diagram}>
						<ul
							className={styles.sources}
							aria-label="Attribution inputs"
						>
							{sources.map(({ label, icon: Icon, color }) => (
								<li key={label}>
									<span
										className={`${styles.sourceIcon} ${color}`}
									>
										<Icon aria-hidden="true" />
									</span>
									<span>{label}</span>
								</li>
							))}
						</ul>
						<FlowWires direction="incoming" />
						<div className={styles.hub}>
							<div className={styles.hubMark}>
								<ChartNoAxesCombinedIcon aria-hidden="true" />
							</div>
							<span className={styles.hubName}>AdsTracking</span>
						</div>
						<FlowWires direction="outgoing" />
						<dl
							className={styles.metrics}
							aria-label="Calculated campaign returns"
						>
							{metrics.map(({ label, value }) => (
								<div key={label}>
									<dt>{label}</dt>
									<dd>
										{value === null
											? "—"
											: formatMoney(
													value,
													demoCurrency,
													locale,
												)}
									</dd>
								</div>
							))}
						</dl>
					</div>
					<figcaption className={styles.caption}>
						<span>
							Demo store <span aria-hidden="true">·</span> Last
							click <span aria-hidden="true">·</span>{" "}
							{demoWindowDays}-day window
						</span>
						<LocaleLink href="/demo">
							Open campaign report{" "}
							<ArrowUpRightIcon size={15} aria-hidden="true" />
						</LocaleLink>
					</figcaption>
				</figure>
			</div>
		</section>
	);
}
