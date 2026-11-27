"use client";

import type { WorkspaceCostDefaults } from "@repo/api/modules/tracking/cost-settings";
import { Alert } from "@ui/components/alert";
import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { type FormEvent, useState } from "react";
import { parseCostInput } from "../lib/campaign-cost-input";
import { currencyFormat, decimalAmount } from "../lib/campaign-report";

const currencies = Intl.supportedValuesOf("currency");
const fields = {
	productCostBps: { label: "Product cost", unit: "percent" },
	paymentFeeBps: { label: "Payment fee", unit: "percent" },
	fixedPaymentFeeMinor: {
		label: "Fixed payment fee per order",
		unit: "money",
	},
	fulfillmentCostMinor: {
		label: "Shipping and fulfillment per order",
		unit: "money",
	},
} as const;
type CostField = keyof typeof fields;
type Draft = Record<keyof WorkspaceCostDefaults, string>;
type Errors = Partial<Record<CostField, string>>;
const fieldNames = Object.keys(fields) as CostField[];

function initialDraft(
	settings: WorkspaceCostDefaults | null,
	currency: string,
): Draft {
	const places = currencyFormat(currency, "en").places;
	return {
		currency,
		productCostBps: settings
			? decimalAmount(settings.productCostBps, 2)
			: "",
		paymentFeeBps: settings ? decimalAmount(settings.paymentFeeBps, 2) : "",
		fixedPaymentFeeMinor: settings
			? decimalAmount(settings.fixedPaymentFeeMinor, places)
			: "",
		fulfillmentCostMinor: settings
			? decimalAmount(settings.fulfillmentCostMinor, places)
			: "",
	};
}

export function WorkspaceCostSettingsForm({
	settings,
	canEdit,
	suggestedCurrency = "USD",
	onSave,
}: {
	settings: WorkspaceCostDefaults | null;
	canEdit: boolean;
	suggestedCurrency?: string;
	onSave: (settings: WorkspaceCostDefaults | null) => Promise<void>;
}) {
	const [draft, setDraft] = useState<Draft | null>(null);
	const [errors, setErrors] = useState<Errors>({});
	const [saving, setSaving] = useState(false);
	const [failed, setFailed] = useState(false);
	const [notice, setNotice] = useState("");
	const currency =
		settings?.currency ??
		(currencies.includes(suggestedCurrency) ? suggestedCurrency : "USD");
	const values = (canEdit && draft) || initialDraft(settings, currency);

	function edit(changes: Partial<Draft>) {
		setDraft({ ...values, ...changes });
		setErrors({});
		setFailed(false);
		setNotice("");
	}

	async function save(profile: WorkspaceCostDefaults | null) {
		if (!canEdit || saving) {
			return;
		}
		setSaving(true);
		setFailed(false);
		setNotice("");
		try {
			await onSave(profile);
			setDraft(null);
			setErrors({});
			setNotice(
				profile
					? "Cost settings saved."
					: "Workspace cost estimates turned off.",
			);
		} catch {
			setFailed(true);
		} finally {
			setSaving(false);
		}
	}

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!canEdit || saving) {
			return;
		}
		const problems: Errors = {};
		const places = currencyFormat(values.currency, "en").places;
		function read(field: CostField) {
			const result = parseCostInput(
				values[field],
				fields[field].unit,
				places,
			);
			if ("value" in result) {
				return result.value;
			}
			problems[field] = result.error;
			return null;
		}
		const productCostBps = read("productCostBps");
		const paymentFeeBps = read("paymentFeeBps");
		const fixedPaymentFeeMinor = read("fixedPaymentFeeMinor");
		const fulfillmentCostMinor = read("fulfillmentCostMinor");
		setErrors(problems);
		if (
			productCostBps === null ||
			paymentFeeBps === null ||
			fixedPaymentFeeMinor === null ||
			fulfillmentCostMinor === null
		) {
			const first = event.currentTarget.elements.namedItem(
				Object.keys(problems)[0],
			);
			if (first instanceof HTMLElement) {
				first.focus();
			}
			return;
		}
		void save({
			currency: values.currency,
			productCostBps,
			paymentFeeBps,
			fixedPaymentFeeMinor,
			fulfillmentCostMinor,
		});
	}

	return (
		<Card className="p-4 sm:px-6">
			<details id="workspace-cost-settings">
				<summary className="cursor-pointer rounded-sm font-semibold focus-visible:outline-ring">
					Workspace cost settings
					<span className="ml-2 text-sm font-normal text-muted-foreground">
						{settings
							? `Estimates on · ${settings.currency}`
							: "Estimates off"}
					</span>
				</summary>
				<p className="mt-3 text-sm text-muted-foreground">
					Use these defaults for blank variable costs in this
					currency. Imported costs, including zero, take priority.
				</p>
				{!canEdit && (
					<p className="mt-2 text-sm text-muted-foreground">
						Organization owners and admins can change these
						settings.
					</p>
				)}
				{(canEdit || settings) && (
					<form
						className="mt-4 space-y-4"
						onSubmit={submit}
						noValidate
					>
						<div className="max-w-52 space-y-1.5">
							<Label htmlFor="cost-currency">Currency</Label>
							<select
								id="cost-currency"
								disabled={saving || !canEdit}
								className="h-9 w-full rounded-md border border-input bg-card px-2.5 text-sm"
								value={values.currency}
								onChange={(event) =>
									edit({
										currency: event.target.value,
										fixedPaymentFeeMinor: "",
										fulfillmentCostMinor: "",
									})
								}
							>
								{currencies.map((code) => (
									<option key={code}>{code}</option>
								))}
							</select>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							{fieldNames.map((name) => (
								<div key={name} className="min-w-0 space-y-1.5">
									<Label htmlFor={`cost-${name}`}>
										{fields[name].label} (
										{fields[name].unit === "percent"
											? "% of sales"
											: values.currency}
										)
									</Label>
									<Input
										id={`cost-${name}`}
										name={name}
										inputMode="decimal"
										autoComplete="off"
										value={values[name]}
										disabled={saving}
										readOnly={!canEdit}
										required={canEdit}
										aria-invalid={Boolean(errors[name])}
										aria-describedby={
											errors[name]
												? `cost-${name}-error`
												: undefined
										}
										onChange={(event) =>
											edit({ [name]: event.target.value })
										}
									/>
									{errors[name] && (
										<p
											id={`cost-${name}-error`}
											className="text-sm text-destructive"
										>
											{errors[name]}
										</p>
									)}
								</div>
							))}
						</div>
						<p className="text-sm text-muted-foreground">
							Both percentages use sales before refunds. Positive
							per-order costs need an order count.
							{canEdit &&
								" Enter all four values. Use 0 for any cost that does not apply."}
						</p>
						{canEdit && (
							<div className="flex flex-wrap gap-2">
								<Button
									type="submit"
									variant="primary"
									loading={saving}
								>
									Save cost settings
								</Button>
								{settings && (
									<Button
										type="button"
										variant="outline"
										disabled={saving}
										onClick={() => void save(null)}
									>
										Turn off estimates
									</Button>
								)}
							</div>
						)}
					</form>
				)}
				{failed && (
					<Alert variant="error" className="mt-3">
						Your cost settings could not be saved. Try again.
					</Alert>
				)}
				<p role="status" className="mt-2 text-sm empty:hidden">
					{notice}
				</p>
			</details>
		</Card>
	);
}
