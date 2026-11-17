import { ORPCError } from "@orpc/client";
import { type Config, config } from "@repo/config";
import { getOrganizationById, getOrganizationMembership } from "@repo/database";
import { logger } from "@repo/logs";
import {
	createCheckoutLink as createCheckoutLinkFn,
	getCustomerIdFromEntity,
} from "@repo/payments";
import { z } from "zod";
import { localeMiddleware } from "../../../orpc/middleware/locale-middleware";
import { createRateLimitMiddleware } from "../../../orpc/middleware/rate-limit-middleware";
import { protectedProcedure } from "../../../orpc/procedures";
import { getSafeRedirectUrl } from "../lib/redirect-url";

export const createCheckoutLink = protectedProcedure
	// Authenticated, but every call hits the payment provider's API.
	.use(createRateLimitMiddleware("checkout", config.rateLimits.api.checkout))
	.use(localeMiddleware)
	.route({
		method: "POST",
		path: "/payments/create-checkout-link",
		tags: ["Payments"],
		summary: "Create checkout link",
		description:
			"Creates a checkout link for a one-time or subscription product",
	})
	.input(
		z.object({
			type: z.enum(["one-time", "subscription"]),
			productId: z.string(),
			redirectUrl: z.string().optional(),
			organizationId: z.string().optional(),
		}),
	)
	.handler(
		async ({
			input: { productId, redirectUrl, type, organizationId },
			context: { user },
		}) => {
			const safeRedirectUrl = getSafeRedirectUrl(redirectUrl);

			if (organizationId) {
				const membership = await getOrganizationMembership(
					organizationId,
					user.id,
				);

				if (membership?.role !== "owner") {
					throw new ORPCError("FORBIDDEN");
				}
			}

			const customerId = await getCustomerIdFromEntity(
				organizationId
					? {
							organizationId,
						}
					: {
							userId: user.id,
						},
			);

			const plans = config.payments.plans as Config["payments"]["plans"];

			const plan = Object.entries(plans).find(([_planId, plan]) =>
				plan.prices?.find((price) => price.productId === productId),
			);
			const price = plan?.[1].prices?.find(
				(price) => price.productId === productId,
			);

			// The product id comes straight from the request body. Without this
			// check any signed-in user could check out an arbitrary product from
			// the merchant account - including ones we never meant to sell, and
			// ones whose purchase maps to no plan at all.
			if (!plan || !price) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Unknown product.",
				});
			}

			// A one-time product must not be bought as a subscription (or the
			// reverse) - the type drives how the purchase is recorded.
			const expectedType =
				price.type === "recurring" ? "subscription" : "one-time";

			if (type !== expectedType) {
				throw new ORPCError("BAD_REQUEST", {
					message: "Product type mismatch.",
				});
			}

			const trialPeriodDays =
				price && "trialPeriodDays" in price
					? price.trialPeriodDays
					: undefined;

			const organization = organizationId
				? await getOrganizationById(organizationId)
				: undefined;

			if (organization === null) {
				throw new ORPCError("NOT_FOUND");
			}

			const seats =
				organization && price && "seatBased" in price && price.seatBased
					? organization.members.length
					: undefined;

			try {
				const checkoutLink = await createCheckoutLinkFn({
					type,
					productId,
					email: user.email,
					name: user.name ?? "",
					redirectUrl: safeRedirectUrl,
					...(organizationId
						? { organizationId }
						: { userId: user.id }),
					trialPeriodDays,
					seats,
					customerId: customerId ?? undefined,
				});

				if (!checkoutLink) {
					throw new ORPCError("INTERNAL_SERVER_ERROR");
				}

				return { checkoutLink };
			} catch (e) {
				logger.error(e);
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
		},
	);
