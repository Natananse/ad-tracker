import { ORPCError } from "@orpc/client";
import { config } from "@repo/config";
import { getOrganizationMembership, getPurchaseById } from "@repo/database";
import { logger } from "@repo/logs";
import { createCustomerPortalLink as createCustomerPortalLinkFn } from "@repo/payments";
import { z } from "zod";
import { localeMiddleware } from "../../../orpc/middleware/locale-middleware";
import { createRateLimitMiddleware } from "../../../orpc/middleware/rate-limit-middleware";
import { protectedProcedure } from "../../../orpc/procedures";
import { getSafeRedirectUrl } from "../lib/redirect-url";

export const createCustomerPortalLink = protectedProcedure
	// Authenticated, but every call hits the payment provider's API.
	.use(
		createRateLimitMiddleware(
			"customer-portal",
			config.rateLimits.api.checkout,
		),
	)
	.use(localeMiddleware)
	.route({
		method: "POST",
		path: "/payments/create-customer-portal-link",
		tags: ["Payments"],
		summary: "Create customer portal link",
		description:
			"Creates a customer portal link for the customer or team. If a purchase is provided, the link will be created for the customer of the purchase.",
	})
	.input(
		z.object({
			purchaseId: z.string(),
			redirectUrl: z.string().optional(),
		}),
	)
	.handler(
		async ({ input: { purchaseId, redirectUrl }, context: { user } }) => {
			const safeRedirectUrl = getSafeRedirectUrl(redirectUrl);
			const purchase = await getPurchaseById(purchaseId);

			if (!purchase) {
				throw new ORPCError("FORBIDDEN");
			}

			if (purchase.organizationId) {
				const userOrganizationMembership =
					await getOrganizationMembership(
						purchase.organizationId,
						user.id,
					);
				if (userOrganizationMembership?.role !== "owner") {
					throw new ORPCError("FORBIDDEN");
				}
			}

			if (purchase.userId && purchase.userId !== user.id) {
				throw new ORPCError("FORBIDDEN");
			}

			try {
				const customerPortalLink = await createCustomerPortalLinkFn({
					subscriptionId: purchase.subscriptionId ?? undefined,
					customerId: purchase.customerId,
					redirectUrl: safeRedirectUrl,
				});

				if (!customerPortalLink) {
					throw new ORPCError("INTERNAL_SERVER_ERROR");
				}

				return { customerPortalLink };
			} catch (e) {
				logger.error("Could not create customer portal link", e);
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
		},
	);
