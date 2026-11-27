import assert from "node:assert/strict";
import { test } from "node:test";
import { workspaceCostDefaults } from "./cost-settings.ts";
import { workspaceAccess } from "./workspace-access.ts";

const defaults = {
	currency: "USD",
	productCostBps: 3500,
	paymentFeeBps: 290,
	fixedPaymentFeeMinor: 30,
	fulfillmentCostMinor: 0,
};

test("cost settings require a currency and all four integer defaults, including explicit zero", () => {
	assert.deepEqual(workspaceCostDefaults.parse(defaults), defaults);
	assert.ok(
		workspaceCostDefaults.safeParse({
			...defaults,
			productCostBps: 0,
			paymentFeeBps: 10_000,
			fixedPaymentFeeMinor: Number.MAX_SAFE_INTEGER,
		}).success,
	);
	for (const invalid of [
		{ currency: "ZZZ" },
		{ productCostBps: 10_001 },
		{ paymentFeeBps: -1 },
		{ paymentFeeBps: 2.5 },
		{ fixedPaymentFeeMinor: 0.3 },
		{ fixedPaymentFeeMinor: Number.MAX_SAFE_INTEGER + 1 },
		{ fulfillmentCostMinor: null },
		{ fulfillmentCostMinor: undefined },
		{ userId: "another-user" },
	]) {
		assert.equal(
			workspaceCostDefaults.safeParse({ ...defaults, ...invalid })
				.success,
			false,
		);
	}
});

test("personal settings always use the signed-in user's own workspace", async () => {
	for (const write of [false, true]) {
		assert.deepEqual(
			await workspaceAccess({}, "personal-owner", undefined, write),
			{
				scope: { userId: "personal-owner" },
				canEdit: true,
			},
		);
	}
});

test("organization settings allow member reads and restrict writes to the current owner's or admin's membership", async () => {
	const organizationId = "store";
	const userId = "current-user";
	for (const role of ["owner", "admin", "member", null]) {
		const membership = role === null ? null : { role };
		const canEdit = role === "owner" || role === "admin";
		const expected = { scope: { organizationId }, canEdit };
		const read = {
			member: {
				findUnique: async ({ where }) => {
					assert.deepEqual(where, {
						organizationId_userId: { organizationId, userId },
					});
					return membership;
				},
			},
		};
		const write = {
			$queryRaw: async (sql, ...values) => {
				assert.deepEqual(values, [organizationId, userId]);
				assert.match(sql.join("?"), /FOR SHARE/);
				return membership ? [membership] : [];
			},
		};
		const readResult = workspaceAccess(read, userId, organizationId, false);
		if (membership) {
			assert.deepEqual(await readResult, expected);
		} else {
			await assert.rejects(readResult, { code: "FORBIDDEN" });
		}
		const writeResult = workspaceAccess(
			write,
			userId,
			organizationId,
			true,
		);
		if (canEdit) {
			assert.deepEqual(await writeResult, expected);
		} else {
			await assert.rejects(writeResult, { code: "FORBIDDEN" });
		}
	}
});
