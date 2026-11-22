import { z } from "zod";

const currencies = new Set(Intl.supportedValuesOf("currency"));
export const campaignLabel = z
	.string()
	.trim()
	.min(1)
	.max(200)
	.refine(
		(value) => !value.includes("\0"),
		"Names cannot contain a NUL character.",
	);
export const campaignCurrency = z
	.string()
	.length(3)
	.refine(
		(value) => currencies.has(value),
		"Choose a supported ISO currency code.",
	);
export const campaignAmount = z.int().nonnegative();
