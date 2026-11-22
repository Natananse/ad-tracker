import { z } from "zod";
import {
	campaignAmount,
	campaignCurrency,
	campaignLabel,
} from "./campaign-constraints.mjs";

const channel = campaignLabel.refine(
	(value) => value.toLowerCase() !== "unmatched",
	"Unmatched is reserved for orders without an eligible click.",
);
const id = z
	.string()
	.min(1)
	.max(128)
	.regex(/^[A-Za-z0-9_./:-]+$/, {
		message: "Use an opaque source ID with letters, digits, or _ . / : -.",
	});
const timestamp = z.iso
	.datetime()
	.regex(
		/T\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/,
		"Use a UTC timestamp with seconds and at most millisecond precision.",
	);
const click = z.strictObject({
	id,
	at: timestamp,
	channel,
	campaign: campaignLabel,
	eligible: z.boolean(),
});

export const attributionSnapshot = z
	.strictObject({
		currency: campaignCurrency,
		orders: z
			.array(
				z.strictObject({
					id,
					paidAt: timestamp,
					sales: campaignAmount,
					costs: campaignAmount.nullable(),
					refunds: z
						.array(z.strictObject({ id, amount: campaignAmount }))
						.max(32),
					clicks: z.array(click).max(32),
				}),
			)
			.max(2000),
		spend: z
			.array(
				z.strictObject({
					date: z.iso.date(),
					channel,
					campaign: campaignLabel,
					amount: campaignAmount.nullable(),
				}),
			)
			.max(5000),
	})
	.refine((snapshot) => snapshot.orders.length + snapshot.spend.length > 0, {
		message:
			"Supply at least one order or one daily campaign spend record.",
	});

export const attributionInput = z.strictObject({
	snapshot: attributionSnapshot,
	model: z.enum(["first-click", "last-click"]),
	windowDays: z.union([z.literal(7), z.literal(28)]),
});

export type AttributionSnapshot = z.infer<typeof attributionSnapshot>;
export type AttributionInput = z.infer<typeof attributionInput>;
