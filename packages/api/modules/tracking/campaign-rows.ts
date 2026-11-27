/// <reference lib="es2022.intl" />
import { z } from "zod";
import {
	campaignAmount,
	campaignCurrency,
	campaignLabel,
} from "./attribution/campaign-constraints.mjs";

const campaignDay = z
	.strictObject({
		date: z.iso.date(),
		channel: campaignLabel,
		campaign: campaignLabel,
		currency: campaignCurrency,
		sales: campaignAmount,
		refunds: campaignAmount,
		spend: campaignAmount.nullable(),
		costs: campaignAmount.nullable(),
		orders: z.int().min(0).max(2_147_483_647).nullish(),
		costSource: z
			.enum(["entered", "estimated", "mixed", "unknown"])
			.optional(),
		estimatedCosts: campaignAmount.nullish(),
	})
	// A caller may send back rows from getReport. Only imported facts are stored.
	.transform(
		({ costSource: _source, estimatedCosts: _estimate, ...row }) => row,
	);

export const campaignRows = z
	.array(campaignDay)
	.min(1)
	.max(10_000)
	.superRefine((rows, ctx) => {
		const keys = new Set<string>();
		const magnitudeByCurrency = new Map<string, number>();
		for (const [index, row] of rows.entries()) {
			const key = JSON.stringify([
				row.date,
				row.channel,
				row.campaign,
				row.currency,
			]);
			if (keys.has(key)) {
				ctx.addIssue({
					code: "custom",
					path: [index],
					message: "A daily campaign total is repeated.",
				});
				return;
			}
			keys.add(key);
			const total =
				(magnitudeByCurrency.get(row.currency) ?? 0) +
				row.sales +
				row.refunds +
				(row.spend ?? 0) +
				(row.costs ?? 0);
			if (!Number.isSafeInteger(total)) {
				ctx.addIssue({
					code: "custom",
					path: [index],
					message: `The total exceeds the reporting range for ${row.currency}.`,
				});
				return;
			}
			magnitudeByCurrency.set(row.currency, total);
		}
	});
