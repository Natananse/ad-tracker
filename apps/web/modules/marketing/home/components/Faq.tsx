"use client";

import { cn } from "@ui/lib";
import { ChevronDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

const faqItems = [
	{
		question: "What is the refund policy?",
		answer: "We offer a 30-day money-back guarantee if you're not happy with our product.",
	},
	{
		question: "How do I cancel my subscription?",
		answer: "You can cancel your subscription by visiting the billing page.",
	},
	{
		question: "Can I change my plan?",
		answer: "Yes, you can change your plan at any time by visiting the billing page.",
	},
	{
		question: "Do you offer a free trial?",
		answer: "Yes, we offer a 14-day free trial.",
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
								onClick={() =>
									setOpenIndex(openIndex === i ? null : i)
								}
								className="w-full flex items-center justify-between p-4 lg:p-6 hover:bg-card/50 transition-colors"
							>
								<h4 className="font-semibold text-lg text-left">
									{item.question}
								</h4>
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
