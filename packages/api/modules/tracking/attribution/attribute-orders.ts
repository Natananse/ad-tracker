import { ORPCError } from "@orpc/server";
import { protectedProcedure } from "../../../orpc/procedures";
import { AttributionInputError, computeAttribution } from "./compute";
import { attributionInput } from "./model";

export const attributeOrders = protectedProcedure
	.route({
		method: "POST",
		path: "/tracking/attribution/preview",
		tags: ["Tracking"],
		summary: "Preview a first-click or last-click campaign report",
	})
	.input(attributionInput)
	.handler(({ input }) => {
		try {
			return computeAttribution(input);
		} catch (error) {
			if (error instanceof AttributionInputError) {
				throw new ORPCError("BAD_REQUEST", { message: error.message });
			}
			throw error;
		}
	});
