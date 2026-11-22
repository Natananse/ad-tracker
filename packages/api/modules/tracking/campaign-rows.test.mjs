import assert from "node:assert/strict";
import { test } from "node:test";
import { campaignRows } from "./campaign-rows.ts";

const day = {
	date: "2026-11-02",
	channel: "Google",
	campaign: "Autumn",
	currency: "USD",
	sales: Number.MAX_SAFE_INTEGER,
	refunds: 0,
	spend: null,
	costs: 0,
};

test("campaign imports bound totals per currency and preserve unknown costs", () => {
	const inputs = [day, { ...day, currency: "JPY", spend: 0, costs: null }];
	assert.deepEqual(campaignRows.parse(inputs), inputs);
	assert.equal(
		campaignRows.safeParse([day, { ...day, date: "2026-11-03", sales: 1 }])
			.success,
		false,
	);
});

test("campaign imports reject duplicate daily facts after trimming names", () => {
	assert.equal(
		campaignRows.safeParse([
			day,
			{ ...day, sales: 0, campaign: " Autumn " },
		]).success,
		false,
	);
});
