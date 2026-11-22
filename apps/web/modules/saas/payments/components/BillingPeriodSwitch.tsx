"use client";

import { cn } from "@ui/lib";
import { useTranslations } from "next-intl";
import { useId } from "react";

type BillingPeriod = "month" | "year";

export function BillingPeriodSwitch({
	value,
	onChange,
	disabled = false,
}: {
	value: BillingPeriod;
	onChange: (value: BillingPeriod) => void;
	disabled?: boolean;
}) {
	const t = useTranslations("pricing");
	const name = useId();

	return (
		<fieldset
			className="w-fit rounded-full border bg-card p-1 shadow-sm disabled:opacity-50"
			disabled={disabled}
			data-test="price-table-interval-tabs"
		>
			<legend className="sr-only">{t("billingPeriod")}</legend>
			<div className="relative grid grid-cols-2">
				<span
					aria-hidden="true"
					className={cn(
						"pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-full bg-secondary shadow-sm motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out",
						value === "year" && "translate-x-full",
					)}
				/>
				{(["month", "year"] as const).map((period) => (
					<label key={period} className="relative">
						<input
							type="radio"
							name={name}
							value={period}
							checked={value === period}
							onChange={() => onChange(period)}
							className="peer absolute inset-0 z-10 m-0 size-full opacity-0 enabled:cursor-pointer"
						/>
						<span
							className={cn(
								"pointer-events-none flex min-h-11 items-center justify-center rounded-full px-5 font-semibold text-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-card motion-safe:transition-colors",
								value === period
									? "text-secondary-foreground forced-colors:outline"
									: "text-muted-foreground peer-enabled:peer-hover:bg-foreground/8 peer-enabled:peer-hover:text-foreground",
							)}
						>
							{period === "month" ? t("monthly") : t("yearly")}
						</span>
					</label>
				))}
			</div>
		</fieldset>
	);
}
