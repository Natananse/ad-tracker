"use client";

import { cn } from "@ui/lib";
import { ChevronDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

const faqItems = [
	{
		question: "How do I bring in my store data?",
		answer: "Import daily campaign totals as a CSV, or upload a JSON snapshot with orders, refunds, clicks, and spend to calculate attribution. Both formats have downloadable examples in your workspace.",
	},
	{
		question: "What does contribution after ads include?",
		answer: "Start with merchandise sales after discounts. Subtract refunds, ad spend, and variable costs such as product costs, fulfillment, and payment fees. The amount left can help cover overhead.",
	},
	{
		question: "What happens when data is missing?",
		answer: "Missing spend and costs are marked as unknown. Orders without a qualifying click appear as unmatched, so you can still account for their sales.",
	},
	{
		question: "Can I compare attribution models?",
		answer: "Yes. With an order snapshot, choose first-click or last-click attribution and a 7-day or 28-day window. Review the credited click for each order before saving the report.",
	},
];

export function Faq({ className }: { className?: string }) {
	const t = useTranslations();
	const [openIndex, setOpenIndex] = useState<number | null>(0);

	return (
		<section
			className={cn("scroll-mt-20 border-t py-12 lg:py-16", className)}
			id="faq"
		>
			<div className="container max-w-3xl">
				<div className="mb-12 text-center">
					<h2 className="mb-2 font-bold text-4xl lg:text-5xl">
						{t("faq.title")}
					</h2>
					<p className="text-lg text-foreground/60">
						{t("faq.description")}
					</p>
				</div>

				<div className="space-y-3">
					{faqItems.map((item, i) => (
						<div
							key={`faq-item-${i}`}
							className="border border-border rounded-lg overflow-hidden"
						>
							<button
								type="button"
								aria-expanded={openIndex === i}
								onClick={() =>
									setOpenIndex(openIndex === i ? null : i)
								}
								className="w-full flex items-center justify-between p-4 lg:p-6 hover:bg-card/50 transition-colors"
							>
								<span className="font-semibold text-lg text-left">
									{item.question}
								</span>
								<ChevronDownIcon
									className={cn(
										"size-5 text-foreground/60 transition-transform flex-shrink-0 ml-4",
										openIndex === i && "rotate-180",
									)}
								/>
							</button>
							{openIndex === i && (
								<div className="px-4 pb-4 lg:px-6 lg:pb-6 border-t border-border">
									<p className="text-foreground/60">
										{item.answer}
									</p>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
