import { z } from "zod";
import {
	campaignAmount,
	campaignCurrency,
} from "./attribution/campaign-constraints.mjs";

const basisPoints = z.int().min(0).max(10_000);

export const workspaceCostDefaults = z.strictObject({
	currency: campaignCurrency,
	productCostBps: basisPoints,
	paymentFeeBps: basisPoints,
	fixedPaymentFeeMinor: campaignAmount,
	fulfillmentCostMinor: campaignAmount,
});

export type WorkspaceCostDefaults = z.infer<typeof workspaceCostDefaults>;
