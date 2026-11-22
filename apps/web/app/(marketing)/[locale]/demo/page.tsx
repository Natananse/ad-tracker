import { DemoStore } from "@marketing/home/components/DemoStore";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
	title: "Demo store",
	description:
		"Explore a sample Shopify campaign report with sales, refunds, ad spend, and contribution.",
};

export default async function DemoPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14">
			<DemoStore />
		</div>
	);
}
