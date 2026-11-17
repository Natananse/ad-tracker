import type { z } from "zod";
import { db } from "../client";
import type { PurchaseSchema } from "../zod";

export async function getPurchaseById(id: string) {
	return db.purchase.findUnique({
		where: { id },
	});
}

export async function getPurchasesByOrganizationId(organizationId: string) {
	return db.purchase.findMany({
		where: {
			organizationId,
		},
	});
}

export async function getPurchasesByUserId(userId: string) {
	return db.purchase.findMany({
		where: {
			userId,
		},
	});
}

export async function getPurchaseBySubscriptionId(subscriptionId: string) {
	return db.purchase.findFirst({
		where: {
			subscriptionId,
		},
	});
}

export async function createPurchase(
	purchase: Omit<
		z.infer<typeof PurchaseSchema>,
		"id" | "createdAt" | "updatedAt"
	>,
) {
	const created = await db.purchase.create({
		data: purchase,
	});

	return getPurchaseById(created.id);
}

export async function updatePurchase(
	purchase: Partial<
		Omit<z.infer<typeof PurchaseSchema>, "createdAt" | "updatedAt">
	> & { id: string },
) {
	const updated = await db.purchase.update({
		where: {
			id: purchase.id,
		},
		data: purchase,
	});

	return getPurchaseById(updated.id);
}

/**
 * Looks up an existing one-time purchase for a customer/product pair.
 *
 * Used to make the payment webhooks idempotent: providers retry deliveries, and
 * a one-time order has no unique column on Purchase to fall back on.
 */
export async function getOneTimePurchase({
	customerId,
	productId,
}: {
	customerId: string;
	productId: string;
}) {
	return db.purchase.findFirst({
		where: {
			customerId,
			productId,
			type: "ONE_TIME",
		},
	});
}

export async function deleteOneTimePurchase({
	customerId,
	productId,
}: {
	customerId: string;
	productId: string;
}) {
	await db.purchase.deleteMany({
		where: {
			customerId,
			productId,
			type: "ONE_TIME",
		},
	});
}

export async function deletePurchaseBySubscriptionId(subscriptionId: string) {
	// deleteMany, not delete: `delete` throws when the row is absent, which for
	// a webhook means a non-2xx response and the provider retrying the same
	// event forever.
	await db.purchase.deleteMany({
		where: {
			subscriptionId,
		},
	});
}
