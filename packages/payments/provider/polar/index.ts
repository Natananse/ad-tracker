import { Polar } from "@polar-sh/sdk";
import {
	validateEvent,
	WebhookVerificationError,
} from "@polar-sh/sdk/webhooks.js";
import {
	createPurchase,
	deleteOneTimePurchase,
	deletePurchaseBySubscriptionId,
	getOneTimePurchase,
	getPurchaseBySubscriptionId,
	updatePurchase,
} from "@repo/database";
import { logger } from "@repo/logs";
import { getBaseUrl } from "@repo/utils";
import { setCustomerIdToEntity } from "../../src/lib/customer";
import type {
	CancelSubscription,
	CreateCheckoutLink,
	CreateCustomerPortalLink,
	SetSubscriptionSeats,
	WebhookHandler,
} from "../../types";

let polarClient: Polar;

function getPolarClient() {
	if (polarClient) {
		return polarClient;
	}

	const polarAccessToken = process.env.POLAR_ACCESS_TOKEN as string;

	if (!polarAccessToken) {
		throw new Error("Missing env variable POLAR_ACCESS_TOKEN");
	}

	polarClient = new Polar({
		accessToken: polarAccessToken,
		server:
			process.env.NODE_ENV === "production" ? "production" : "sandbox",
	});

	return polarClient;
}

export const createCheckoutLink: CreateCheckoutLink = async (options) => {
	const polarClient = getPolarClient();

	const { productId, redirectUrl, customerId, organizationId, userId } =
		options;

	// This metadata is what the webhook later trusts to attribute the purchase
	// to an account. It is set here (server side, after the caller has been
	// authorized) and echoed back by Polar inside a signed payload, so it never
	// crosses a client.
	const metadata: Record<string, string> = {};

	if (organizationId) {
		metadata.organization_id = organizationId;
	}

	if (userId) {
		metadata.user_id = userId;
	}

	const response = await polarClient.checkouts.create({
		products: [productId],
		// An empty successUrl leaves the customer stranded on Polar's page after
		// paying. The caller's redirect has already been origin-checked by
		// getSafeRedirectUrl.
		successUrl: redirectUrl || getBaseUrl(),
		metadata,
		customerId: customerId || undefined,
	});

	return response.url;
};

export const createCustomerPortalLink: CreateCustomerPortalLink = async ({
	customerId,
}) => {
	const polarClient = getPolarClient();

	const response = await polarClient.customerSessions.create({
		customerId: customerId,
	});

	return response.customerPortalUrl;
};

export const setSubscriptionSeats: SetSubscriptionSeats = async () => {
	// Not implemented for Polar. The caller
	// (updateSeatsInOrganizationSubscription) catches and logs this, so seat
	// counts silently stop tracking membership changes. Implement this before
	// enabling config.organizations.enableBilling with a seat-based plan.
	throw new Error(
		"setSubscriptionSeats is not implemented for the Polar provider",
	);
};

export const cancelSubscription: CancelSubscription = async (id) => {
	const polarClient = getPolarClient();

	await polarClient.subscriptions.revoke({
		id,
	});
};

export const webhookHandler: WebhookHandler = async (req) => {
	const polarWebhookSecret = process.env.POLAR_WEBHOOK_SECRET as string;

	if (!polarWebhookSecret) {
		return new Response("Missing env variable POLAR_WEBHOOK_SECRET", {
			status: 500,
		});
	}

	try {
		if (!req.body) {
			return new Response("No body", {
				status: 400,
			});
		}

		// Headers.forEach rather than Object.fromEntries(headers.entries()):
		// the iterator form needs a DOM-iterable lib that not every package in
		// this workspace compiles with.
		const headers: Record<string, string> = {};
		req.headers.forEach((value, key) => {
			headers[key] = value;
		});

		const event = validateEvent(
			await req.text(),
			headers,
			polarWebhookSecret,
		);

		// Metadata is set by us at checkout creation and returned inside a
		// signature-verified payload, but a checkout can still be created in the
		// Polar dashboard with no metadata at all - so treat missing ids as null
		// rather than writing `undefined` into the database.
		const readOwner = (metadata?: Record<string, unknown> | null) => ({
			organizationId: (metadata?.organization_id as string) || null,
			userId: (metadata?.user_id as string) || null,
		});

		switch (event.type) {
			// order.created fires before payment settles ("the order might not be
			// paid yet"), so granting on it hands out a lifetime product for an
			// unpaid order. order.paid is the event that means money arrived; we
			// accept order.created only when it is already marked paid.
			case "order.created":
			case "order.paid": {
				const { metadata, customerId, subscription, productId, paid } =
					event.data;

				// Subscription orders are handled by the subscription.* events.
				if (subscription) {
					break;
				}

				if (!paid) {
					break;
				}

				const owner = readOwner(metadata);

				// Both events can arrive for the same order, and Polar retries
				// deliveries, so this must not create duplicates.
				const existing = await getOneTimePurchase({
					customerId,
					productId,
				});

				if (!existing) {
					await createPurchase({
						...owner,
						customerId,
						type: "ONE_TIME",
						productId,
					});
				}

				await setCustomerIdToEntity(customerId, {
					organizationId: owner.organizationId ?? undefined,
					userId: owner.userId ?? undefined,
				});

				break;
			}
			// A fully refunded one-time purchase must lose its entitlement.
			case "order.refunded": {
				const { customerId, productId, subscription, status } =
					event.data;

				if (subscription) {
					break;
				}

				// Polar sends this event for partial refunds too. Revoking on a
				// partial refund would take a $799 lifetime plan away over a $50
				// goodwill credit, so only a full refund ends access.
				if (status !== "refunded") {
					break;
				}

				await deleteOneTimePurchase({ customerId, productId });

				break;
			}
			case "subscription.created": {
				const { metadata, customerId, productId, id, status } =
					event.data;

				const owner = readOwner(metadata);

				// Retried deliveries would otherwise hit the unique constraint on
				// subscriptionId and 500, causing Polar to retry indefinitely.
				const existing = await getPurchaseBySubscriptionId(id);

				if (existing) {
					await updatePurchase({
						id: existing.id,
						status,
						productId,
					});
				} else {
					await createPurchase({
						subscriptionId: id,
						...owner,
						customerId,
						type: "SUBSCRIPTION",
						productId,
						status,
					});
				}

				await setCustomerIdToEntity(customerId, {
					organizationId: owner.organizationId ?? undefined,
					userId: owner.userId ?? undefined,
				});

				break;
			}
			// active / uncanceled / canceled are all status transitions. In
			// particular subscription.canceled means "cancellation scheduled" -
			// Polar's own docs note the customer keeps access until the end of the
			// current period - so it must NOT revoke the purchase.
			case "subscription.active":
			case "subscription.uncanceled":
			case "subscription.canceled":
			case "subscription.updated": {
				const { id, status, productId } = event.data;

				const existingPurchase = await getPurchaseBySubscriptionId(id);

				if (existingPurchase) {
					await updatePurchase({
						id: existingPurchase.id,
						status,
						productId,
					});
				} else {
					logger.warn(
						"Received a Polar subscription event for an unknown subscription",
						{ subscriptionId: id, eventType: event.type },
					);
				}

				break;
			}
			// revoked is the event that actually ends access.
			case "subscription.revoked": {
				const { id } = event.data;

				await deletePurchaseBySubscriptionId(id);

				break;
			}

			default:
				return new Response("Unhandled event type.", {
					status: 200,
				});
		}

		return new Response(null, {
			status: 202,
		});
	} catch (error) {
		if (error instanceof WebhookVerificationError) {
			return new Response("Invalid request.", {
				status: 403,
			});
		}
		throw error;
	}
};
