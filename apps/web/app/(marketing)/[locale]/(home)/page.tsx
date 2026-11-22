import { AttributionFlow } from "@marketing/home/components/AttributionFlow";
import { AttributionStories } from "@marketing/home/components/AttributionStories";
import { Faq } from "@marketing/home/components/Faq";
import { Features } from "@marketing/home/components/Features";
import { Hero } from "@marketing/home/components/Hero";
import { PricingSection } from "@marketing/home/components/PricingSection";
import { ReportSourcesStrip } from "@marketing/home/components/ReportSourcesStrip";
import { setRequestLocale } from "next-intl/server";
import styles from "./page.module.css";

export const metadata = {
	description:
		"Compare Shopify campaign revenue, ad spend, and contribution after refunds. Explore a demo or import your own campaign data.",
};

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	return (
		<div className={styles.home}>
			<Hero />
			<ReportSourcesStrip />
			<Features />
			<AttributionStories />
			<AttributionFlow />
			<PricingSection />
			<Faq />
		</div>
	);
}
