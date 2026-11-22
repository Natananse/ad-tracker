"use client";
import { PricingTable } from "@saas/payments/components/PricingTable";
import { useTranslations } from "next-intl";

export function PricingSection() {
	const t = useTranslations();

	return (
		<section id="pricing" className="scroll-mt-32 py-12 lg:py-16">
			<div className="container max-w-5xl">
				<div className="mb-6 lg:text-center">
					<h2 className="font-bold text-4xl lg:text-5xl">
						{t("pricing.title")}
					</h2>
					<p className="mt-3 text-lg opacity-50">
						{t("pricing.description")}
					</p>
				</div>

				<PricingTable />
			</div>
		</section>
	);
}
