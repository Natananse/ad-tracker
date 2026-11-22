import { LocaleLink } from "@i18n/routing";
import { config } from "@repo/config";
import {
	MousePointer2Icon,
	ReceiptTextIcon,
	WaypointsIcon,
} from "lucide-react";
import Link from "next/link";
import { CampaignPreview } from "./CampaignPreview";
import styles from "./Hero.module.css";

export function Hero() {
	return (
		<section className={styles.hero} aria-labelledby="home-title">
			<div
				className={styles.sky}
				data-test="hero-sky"
				aria-hidden="true"
			/>
			<div className={styles.copy}>
				<h1 id="home-title">
					See the profit behind <span>every campaign.</span>
				</h1>
				<p>
					Compare Shopify sales with Meta and Google ad spend to see
					what you earn after refunds, product costs, and fees.
				</p>
				<div className={styles.actions}>
					{config.ui.saas.enabled && (
						<Link
							className={styles.primary}
							href={
								config.auth.enableSignup
									? "/auth/signup"
									: "/auth/login"
							}
						>
							{config.auth.enableSignup
								? "Get started for free"
								: "Open workspace"}
						</Link>
					)}
					<LocaleLink className={styles.demo} href="/demo">
						<span className={styles.dot} aria-hidden="true" /> View
						demo store
					</LocaleLink>
				</div>
			</div>
			<div className={styles.stage}>
				<div className={styles.journey} aria-hidden="true">
					<div>
						<WaypointsIcon /> Order 101
					</div>
					<span>
						<MousePointer2Icon /> Google Ads
					</span>
					<span>
						<MousePointer2Icon /> Meta Ads
					</span>
					<span>
						<ReceiptTextIcon /> Shopify
					</span>
				</div>
				<div className={styles.device}>
					<CampaignPreview />
				</div>
			</div>
		</section>
	);
}
