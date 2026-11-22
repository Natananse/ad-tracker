import { LocaleLink } from "@i18n/routing";
import {
	ArrowRightIcon,
	ChartColumnIcon,
	MousePointerClickIcon,
	ReceiptTextIcon,
} from "lucide-react";
import styles from "./Features.module.css";

export function Features() {
	return (
		<section
			id="features"
			className={styles.features}
			aria-labelledby="features-title"
		>
			<div className={styles.inner}>
				<div className={styles.intro}>
					<div>
						<h2 id="features-title">
							Understand where your ad budget goes.
						</h2>
						<p>
							Follow the numbers from the click that earned the
							sale to the money left after costs.
						</p>
					</div>
					<LocaleLink href="/demo" className={styles.link}>
						Explore the report{" "}
						<ArrowRightIcon size={16} aria-hidden="true" />
					</LocaleLink>
				</div>
				<div className={styles.cards}>
					<article className={styles.card}>
						<div className={styles.heading}>
							<ReceiptTextIcon aria-hidden="true" />
							<h3>Account for refunds</h3>
						</div>
						<p>
							See how much of each campaign’s sales you kept after
							customers returned an order.
						</p>
						<dl
							className={styles.panel}
							aria-label="Sample Prospecting campaign"
						>
							<div>
								<dt>Merchandise sales</dt>
								<dd>$1,000</dd>
							</div>
							<div>
								<dt>Refunds</dt>
								<dd>−$200</dd>
							</div>
							<div className={styles.total}>
								<dt>Net sales</dt>
								<dd>$800</dd>
							</div>
						</dl>
					</article>
					<article className={`${styles.card} ${styles.highlight}`}>
						<div className={styles.heading}>
							<MousePointerClickIcon aria-hidden="true" />
							<h3>Trace each order</h3>
						</div>
						<p>
							Switch between first and last click to see which
							campaign gets credit for an order.
						</p>
						<dl
							className={styles.panel}
							aria-label="Sample order 101 with a 28-day lookback"
						>
							<div>
								<dt>First click</dt>
								<dd>Google Ads</dd>
							</div>
							<div>
								<dt>Last click</dt>
								<dd>Meta Ads</dd>
							</div>
							<div className={styles.total}>
								<dt>Order 101</dt>
								<dd>28-day window</dd>
							</div>
						</dl>
					</article>
					<article className={styles.card}>
						<div className={styles.heading}>
							<ChartColumnIcon aria-hidden="true" />
							<h3>Compare what’s left</h3>
						</div>
						<p>
							Compare the amount each campaign contributes after
							ad spend and variable costs.
						</p>
						<dl
							className={styles.panel}
							aria-label="Sample contribution after ads"
						>
							<div>
								<dt>Prospecting</dt>
								<dd className={styles.negative}>−$50</dd>
							</div>
							<div>
								<dt>Shopping</dt>
								<dd>+$180</dd>
							</div>
							<div className={styles.total}>
								<dt>Combined</dt>
								<dd>+$130</dd>
							</div>
						</dl>
					</article>
				</div>
			</div>
		</section>
	);
}
