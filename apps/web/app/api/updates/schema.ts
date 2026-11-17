import { z } from "zod";

export const productUpdateSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1)
		.max(200)
		.refine((title) => !/[\r\n]/.test(title), {
			message: "Title must be a single line.",
		}),
	type: z.enum(["product", "stats", "announcement"]),
	published: z.boolean(),
	content: z
		.record(z.string(), z.unknown())
		.refine((content) => JSON.stringify(content).length <= 100_000, {
			message: "Content is too large.",
		}),
});
