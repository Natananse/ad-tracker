import assert from "node:assert/strict";
import test from "node:test";
import { AttributionInputError, computeAttribution } from "./compute.ts";
import example from "./example.json" with { type: "json" };
import { attributionInput } from "./model.ts";

function preview(snapshot = example, model = "last-click", windowDays = 7) {
	return computeAttribution(
		attributionInput.parse({ snapshot, model, windowDays }),
	);
}

test("models allocate sales and refunds together while spend stays with the campaign", () => {
	const last = preview();
	assert.equal(last.matchedOrders, 2);
	assert.equal(last.totalOrders, 2);
	assert.deepEqual(
		last.evidence.map((order) => order.clickId),
		["click-12", "click-21"],
	);
	assert.deepEqual(
		last.rows.map(
			({ sales, refunds, spend, costs }) =>
				sales - refunds - spend - costs,
		),
		[18000, -5000],
	);
	assert.deepEqual(preview(example, "first-click", 7), last);
	const first = preview(example, "first-click", 28);
	assert.equal(first.evidence[0].clickId, "click-11");
	assert.deepEqual(
		first.rows.map(({ sales, refunds, spend }) => [sales, refunds, spend]),
		[
			[170000, 20000, 20000],
			[0, 0, 20000],
		],
	);
});

test("clicks must be eligible and inside the inclusive lookback before payment", () => {
	const snapshot = structuredClone(example);
	const order = snapshot.orders[0];
	const click = order.clicks[0];
	order.clicks = [
		{ ...click, id: "just-before", at: "2026-10-27T09:59:59.999Z" },
		{ ...click, id: "boundary", at: "2026-10-27T10:00:00Z" },
		{ ...click, id: "denied", at: "2026-11-03T09:59:59Z", eligible: false },
		{ ...click, id: "future", at: "2026-11-03T10:00:00.001Z" },
	];
	assert.equal(preview(snapshot).evidence[0].clickId, "boundary");
	order.clicks.splice(1, 1);
	const unmatched = preview(snapshot);
	assert.equal(unmatched.matchedOrders, 1);
	assert.equal(unmatched.evidence[0].clickId, null);
	assert.equal(unmatched.evidence[0].channel, "Unmatched");
	assert.equal(
		unmatched.rows.find((r) => r.channel === "Unmatched").spend,
		0,
	);
	order.clicks.push({ ...click, id: "at-payment", at: order.paidAt });
	assert.equal(preview(snapshot).evidence[0].clickId, "at-payment");
});

test("input order cannot change a tied click or the resulting report", () => {
	const snapshot = structuredClone(example);
	const clicks = snapshot.orders[0].clicks;
	clicks[0].at = clicks[1].at;
	const before = preview(snapshot);
	assert.equal(before.evidence[0].clickId, "click-11");
	clicks.reverse();
	snapshot.orders.reverse();
	snapshot.spend.reverse();
	assert.deepEqual(preview(snapshot), before);
});

test("duplicate orders, refunds, clicks within an order and spend keys are rejected", () => {
	for (const duplicate of [
		(s) => s.orders.push(s.orders[0]),
		(s) => s.orders[1].refunds.push(s.orders[0].refunds[0]),
		(s) => s.orders[0].clicks.push(s.orders[0].clicks[0]),
		(s) => s.spend.push(s.spend[0]),
	]) {
		const snapshot = structuredClone(example);
		duplicate(snapshot);
		assert.throws(() => preview(snapshot), AttributionInputError);
	}
});

test("missing cost and spend stay unknown; zero remains a known value", () => {
	const snapshot = structuredClone(example);
	snapshot.spend[0].amount = 0;
	snapshot.spend.pop();
	snapshot.orders[0].costs = null;
	const result = preview(snapshot).rows;
	assert.deepEqual(
		result.map(({ costs, spend }) => [costs, spend]),
		[
			[32000, null],
			[null, 0],
		],
	);
});

test("rejects unsupported currency, extra fields, invalid dates and unsafe sums", () => {
	for (const change of [
		(s) => {
			s.currency = "ZZZ";
		},
		(s) => {
			s.orders[0].email = "irrelevant";
		},
		(s) => {
			s.orders[0].clicks[0].at = "2026-02-30T00:00:00Z";
		},
		(s) => {
			s.orders[0].sales = -1;
		},
		(s) => {
			s.spend[0].amount = 1.25;
		},
		(s) => {
			s.spend[0].channel = "Unmatched";
		},
		(s) => {
			s.orders[0].sales = Number.MAX_SAFE_INTEGER;
		},
	]) {
		const snapshot = structuredClone(example);
		change(snapshot);
		assert.throws(() => preview(snapshot));
	}
});
