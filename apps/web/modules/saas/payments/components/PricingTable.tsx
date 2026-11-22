"use client";
import { LocaleLink } from "@i18n/routing";
import { type Config, config } from "@repo/config";
import { BillingPeriodSwitch } from "@saas/payments/components/BillingPeriodSwitch";
import { usePlanData } from "@saas/payments/hooks/plan-data";
import { Spinner } from "@shared/components/Spinner";
import { useLocaleCurrency } from "@shared/hooks/locale-currency";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation } from "@tanstack/react-query";
import { buttonVariants } from "@ui/components/button";
import { cn } from "@ui/lib";
import {
	ArrowRightIcon,
	BadgePercentIcon,
	CheckIcon,
	StarIcon,
} from "lucide-react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

const plans = config.payments.plans as Config["payments"]["plans"];

const actionArrow = (
	<ArrowRightIcon
		aria-hidden="true"
		className="size-4 shrink-0 motion-safe:transition-transform motion-safe:group-hover/plan:translate-x-1 motion-safe:group-focus-within/plan:translate-x-1"
	/>
);

export function PricingTable({
	className,
	userId,
	organizationId,
	activePlanId,
}: {
	className?: string;
	userId?: string;
	organizationId?: string;
	activePlanId?: string;
}) {
	const t = useTranslations();
	const format = useFormatter();
	const needsSignup = !(userId || organizationId);
	const localeCurrency = useLocaleCurrency();
	const [interval, setInterval] = useState<"month" | "year">("month");

	const { planData } = usePlanData();

	const checkout = useMutation(
		orpc.payments.createCheckoutLink.mutationOptions({
			onSuccess: ({ checkoutLink }) =>
				window.location.assign(checkoutLink),
			onError: () => toast.error(t("pricing.checkoutError")),
		}),
	);

	const filteredPlans = Object.entries(plans).filter(
		([planId]) =>
			planId !== activePlanId && (!activePlanId || planId !== "free"),
	);

	const hasSubscriptions = filteredPlans.some(([_, plan]) =>
		plan.prices?.some(
			(price) =>
				!price.hidden &&
				price.type === "recurring" &&
				price.currency === localeCurrency,
		),
	);

	return (
		<div className={cn("@container", className)}>
			{hasSubscriptions && (
				<div className="mb-8 flex @xl:justify-center">
					<BillingPeriodSwitch
						value={interval}
						onChange={setInterval}
						disabled={checkout.isPending}
					/>
				</div>
			)}
			<div
				className={cn("grid grid-cols-1 gap-4", {
					"@xl:grid-cols-2": filteredPlans.length >= 2,
					"@3xl:grid-cols-3": filteredPlans.length >= 3,
					"@4xl:grid-cols-4": filteredPlans.length >= 4,
				})}
			>
				{filteredPlans.map(([planId, plan]) => {
					const { isFree, isEnterprise, prices, recommended } = plan;
					const { title, description, features } =
						planData[planId as keyof typeof planData];

					let price = prices?.find(
						(price) =>
							!price.hidden &&
							(price.type === "one-time" ||
								price.interval === interval) &&
							price.currency === localeCurrency,
					);

					if (isFree) {
						price = {
							amount: 0,
							currency: localeCurrency,
							interval,
							productId: "",
							type: "recurring",
						};
					}

					if (!(price || isEnterprise)) {
						return null;
					}

					const openingCheckout =
						checkout.isPending &&
						checkout.variables.productId === price?.productId;
					const canCheckout = Boolean(price?.productId);
					const interactive =
						isEnterprise ||
						needsSignup ||
						isFree ||
						(canCheckout && !checkout.isPending);
					const actionClass = cn(
						buttonVariants({ size: "lg", variant: null }),
						"mt-5 h-auto min-h-11 w-full justify-between gap-2 rounded-xl px-4 py-2.5 text-start text-sm",
						"motion-safe:transition-[background-color,border-color,color,scale] motion-safe:active:scale-[.98] motion-reduce:transition-none",
						"[&>svg]:mr-0 [&>svg]:opacity-100",
						recommended
							? "border-secondary bg-secondary text-secondary-foreground"
							: "border-input bg-card text-card-foreground",
						interactive &&
							"group-hover/plan:border-indigo-700 group-hover/plan:bg-indigo-700 group-hover/plan:text-white group-focus-within/plan:border-indigo-700 group-focus-within/plan:bg-indigo-700 group-focus-within/plan:text-white dark:group-hover/plan:border-indigo-300 dark:group-hover/plan:bg-indigo-300 dark:group-hover/plan:text-indigo-950 dark:group-focus-within/plan:border-indigo-300 dark:group-focus-within/plan:bg-indigo-300 dark:group-focus-within/plan:text-indigo-950",
					);

					return (
						<div
							key={planId}
							className={cn(
								"relative rounded-3xl border bg-card p-6 text-card-foreground",
								"motion-safe:transition-[border-color,box-shadow,translate] motion-safe:duration-200",
								recommended && "border-primary/70 shadow-sm",
								interactive &&
									"group/plan focus-within:border-primary focus-within:shadow-md hover:border-primary hover:shadow-md motion-safe:hover:-translate-y-1",
							)}
							data-test="price-table-plan"
						>
							<div className="flex h-full flex-col justify-between gap-4">
								<div>
									{recommended && (
										<div className="absolute inset-x-0 top-0 flex -translate-y-1/2 justify-center">
											<div className="flex h-6 w-auto items-center gap-1.5 rounded-full bg-primary px-2 py-1 font-semibold text-primary-foreground text-xs">
												<StarIcon className="size-3" />
												{t("pricing.recommended")}
											</div>
										</div>
									)}
									<h3
										className={cn(
											"my-0 font-semibold text-2xl",
											{
												"font-bold text-primary":
													recommended,
											},
										)}
									>
										{title}
									</h3>
									{description && (
										<div className="prose mt-2 text-foreground/60 text-sm">
											{description}
										</div>
									)}

									{!!features?.length && (
										<ul className="mt-4 grid list-none gap-2 text-sm">
											{features.map((feature, key) => (
												<li
													key={key}
													className="flex items-center justify-start"
												>
													<CheckIcon className="mr-2 size-4 text-primary" />
													<span>{feature}</span>
												</li>
											))}
										</ul>
									)}

									{price &&
										"trialPeriodDays" in price &&
										price.trialPeriodDays && (
											<div className="mt-4 flex items-center justify-start font-medium text-primary text-sm opacity-80">
												<BadgePercentIcon className="mr-2 size-4" />
												{t("pricing.trialPeriod", {
													days: price.trialPeriodDays,
												})}
											</div>
										)}
								</div>

								<div>
									{price && (
										<strong
											className="block font-medium text-2xl lg:text-3xl"
											data-test="price-table-plan-price"
										>
											{format.number(price.amount, {
												style: "currency",
												currency: price.currency,
											})}
											{"interval" in price && (
												<span className="font-normal text-xs opacity-60">
													{" / "}
													{interval === "month"
														? t("pricing.month", {
																count:
																	price.intervalCount ??
																	1,
															})
														: t("pricing.year", {
																count:
																	price.intervalCount ??
																	1,
															})}
												</span>
											)}
											{organizationId &&
												"seatBased" in price &&
												price.seatBased && (
													<span className="font-normal text-xs opacity-60">
														{" / "}
														{t("pricing.perSeat")}
													</span>
												)}
										</strong>
									)}

									{isEnterprise ? (
										<LocaleLink
											className={actionClass}
											href="/contact"
										>
											{t("pricing.contactSales")}
											{actionArrow}
										</LocaleLink>
									) : needsSignup || isFree ? (
										<Link
											className={actionClass}
											href={
												needsSignup
													? "/auth/signup"
													: "/app"
											}
										>
											<span>
												{needsSignup
													? t(
															isFree
																? "pricing.startFree"
																: "pricing.signUp",
														)
													: t(
															"pricing.continueToApp",
														)}
												<span className="sr-only">
													{" "}
													({title})
												</span>
											</span>
											{actionArrow}
										</Link>
									) : (
										<button
											type="button"
											className={actionClass}
											disabled={
												!canCheckout ||
												checkout.isPending
											}
											aria-busy={openingCheckout}
											onClick={() => {
												if (!price?.productId) {
													return;
												}
												checkout.mutate({
													type:
														price.type ===
														"recurring"
															? "subscription"
															: "one-time",
													productId: price.productId,
													organizationId,
													redirectUrl:
														window.location.href,
												});
											}}
										>
											{openingCheckout
												? t("pricing.openingCheckout")
												: canCheckout
													? t(
															"pricing.chooseNamedPlan",
															{ plan: title },
														)
													: t(
															"pricing.checkoutUnavailable",
														)}
											{openingCheckout ? (
												<Spinner className="text-inherit motion-reduce:animate-none" />
											) : (
												canCheckout && actionArrow
											)}
										</button>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
