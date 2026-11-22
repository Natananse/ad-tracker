import { LocaleLink } from "@i18n/routing";
import {
	ArrowRightIcon,
	MousePointerClickIcon,
	ScanLineIcon,
	ShoppingBagIcon,
} from "lucide-react";

export function Features() {
	return (
		<section
			id="features"
			className="scroll-mt-28 border-b border-border bg-card"
		>
			<div className="mx-auto max-w-6xl px-5 py-16 lg:px-10 lg:py-24">
				<h2 className="mx-auto max-w-3xl text-balance text-center text-3xl leading-tight font-bold tracking-tight sm:text-5xl">
					Trace each campaign from{" "}
					<span className="text-emerald-700 dark:text-emerald-400">
						click to contribution
					</span>
				</h2>
				<div className="mt-12 grid overflow-hidden rounded-2xl border border-border md:grid-cols-2">
					<div className="flex flex-col items-start justify-center gap-4 p-6 sm:p-10">
						<h3 className="text-2xl font-semibold tracking-tight">
							See which click gets credit
						</h3>
						<p className="max-w-lg text-muted-foreground">
							Compare first-click and last-click results over 7 or
							28 days. Open an order to see the click that
							qualified and keep unmatched orders visible.
						</p>
						<LocaleLink
							href="/demo"
							className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
						>
							Explore the demo <ArrowRightIcon size={16} />
						</LocaleLink>
					</div>
					<div className="grid content-center gap-3 bg-[#edf5f2] p-6 sm:p-10 dark:bg-[#102922]">
						{[
							{
								Icon: MousePointerClickIcon,
								label: "Observed ad click",
								value: "Ad channel and campaign",
							},
							{
								Icon: ShoppingBagIcon,
								label: "Paid order",
								value: "Order date, sales, and refunds",
							},
							{
								Icon: ScanLineIcon,
								label: "Attribution result",
								value: "Selected click or unmatched",
							},
						].map(({ Icon, label, value }) => (
							<div
								key={label}
								className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3"
							>
								<Icon
									size={19}
									className="shrink-0 text-emerald-700 dark:text-emerald-400"
								/>
								<div>
									<div className="text-sm font-semibold">
										{label}
									</div>
									<div className="text-xs text-muted-foreground">
										{value}
									</div>
								</div>
							</div>
						))}
					</div>
					<div className="order-4 flex items-center bg-[#edf5f2] p-6 sm:p-10 md:order-3 dark:bg-[#102922]">
						<dl className="w-full rounded-lg border bg-card p-5">
							<div className="mb-3 font-semibold">
								Prospecting · sample report
							</div>
							{[
								["Sales after discounts", "$1,000"],
								["Refunds", "−$200"],
								["Product and variable costs", "−$650"],
								["Ad spend", "−$200"],
								["Contribution after ads", "−$50"],
							].map(([term, amount]) => (
								<div
									key={term}
									className="flex justify-between gap-3 border-b border-border/60 py-1.5 text-sm last:border-0 last:pt-3 last:font-bold"
								>
									<dt>{term}</dt>
									<dd className="tabular-nums">{amount}</dd>
								</div>
							))}
						</dl>
					</div>
					<div className="order-3 flex flex-col justify-center gap-4 p-6 sm:p-10 md:order-4">
						<h3 className="text-2xl font-semibold tracking-tight">
							Follow the money after a sale
						</h3>
						<p className="max-w-lg text-muted-foreground">
							A campaign can return four dollars in revenue for
							every dollar spent and still lose money. Review its
							refunds, ad spend, and variable costs together
							before you change the budget.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
