import assert from "node:assert/strict";
import test from "node:test";
import { computeAttribution } from "../../../../../../packages/api/modules/tracking/attribution/compute.ts";
import { applyWorkspaceCosts } from "../../../../../../packages/api/modules/tracking/workspace-costs.ts";
import {
	buildCampaignReport,
	buildCampaignTrend,
	campaignOverview,
	combinedCostSource,
	makeReportCsv,
	parseCampaignCsv,
} from "./campaign-report.ts";

const settings = {
	currency: "USD",
	productCostBps: 2500,
	paymentFeeBps: 290,
	fixedPaymentFeeMinor: 30,
	fulfillmentCostMinor: 500,
};
const day = {
	date: "2026-11-01",
	channel: "Google",
	campaign: "Autumn",
	currency: "USD",
	sales: 10000,
	refunds: 2000,
	spend: 1000,
	costs: null,
};
const filter = { currency: "USD", start: "", end: "" };

test("CSV order counts are optional and must be nonnegative whole numbers that fit the database", () => {
	const header = "date,channel,campaign,currency,sales,refunds,spend,costs";
	const record = "2026-11-01,Google,Autumn,USD,100,20,10,";
	assert.equal(parseCampaignCsv(`${header}\n${record}`)[0].orders, undefined);
	for (const [cell, orders] of [
		["", null],
		["0", 0],
		["2147483647", 2147483647],
	]) {
		assert.equal(
			parseCampaignCsv(`${header},orders\n${record},${cell}`)[0].orders,
			orders,
		);
	}
	for (const cell of ["-1", "3.5", "1e2", "abc", "2147483648"]) {
		assert.throws(
			() => parseCampaignCsv(`${header},orders\n${record},${cell}`),
			/Row 2, orders/,
		);
	}
});

test("percentages use sales before refunds and fixed fees use the actual order count", () => {
	const entered = { ...day, costs: 750, orders: 2 };
	const zero = { ...day, costs: 0 };
	const missing = { ...day, orders: 2 };
	const rows = applyWorkspaceCosts([entered, zero, missing], settings);
	assert.deepEqual(
		rows.map((r) => [r.costs, r.estimatedCosts, r.costSource]),
		[
			[750, null, "entered"],
			[0, null, "entered"],
			[null, 3850, "estimated"],
		],
	);
	assert.equal(missing.costs, null);
	const [summary] = buildCampaignReport([rows[2]], filter);
	assert.equal(summary.contribution, 3150);
	assert.equal(summary.breakEvenRoas, 8000 / 4150);
	assert.deepEqual(
		applyWorkspaceCosts([rows[2]], null).map((r) => r.estimatedCosts),
		[null],
	);
});

test("no count, no settings, a different currency and confirmed zero all retain their own meanings", () => {
	const zeroFees = {
		...settings,
		fixedPaymentFeeMinor: 0,
		fulfillmentCostMinor: 0,
	};
	const allZero = { ...zeroFees, productCostBps: 0, paymentFeeBps: 0 };
	for (const [row, defaults, cost, source] of [
		[day, null, null, "unknown"],
		[day, settings, null, "unknown"],
		[{ ...day, orders: 0 }, settings, 2790, "estimated"],
		[day, zeroFees, 2790, "estimated"],
		[day, allZero, 0, "estimated"],
		[{ ...day, currency: "JPY", orders: 1 }, settings, null, "unknown"],
	]) {
		const [resolved] = applyWorkspaceCosts([row], defaults);
		assert.equal(resolved.estimatedCosts, cost);
		assert.equal(resolved.costSource, source);
	}
});

test("snapshot orders keep entered and zero costs; percentage components round half up on each missing order", () => {
	const defaults = {
		...settings,
		productCostBps: 5000,
		paymentFeeBps: 5000,
		fixedPaymentFeeMinor: 2,
		fulfillmentCostMinor: 3,
	};
	const orders = [null, 7, 0, null].map((costs, i) => ({
		id: `o${i}`,
		paidAt: "2026-11-01T10:00:00Z",
		sales: 1,
		refunds: [],
		costs,
		clicks: [
			{
				id: "first",
				at: "2026-10-30T10:00:00Z",
				eligible: true,
				channel: "Meta",
				campaign: i === 2 ? "Retarget" : "Launch",
			},
			{
				id: "last",
				at: "2026-10-31T10:00:00Z",
				eligible: true,
				channel: "Google",
				campaign: "Autumn",
			},
		],
	}));
	const source = {
		snapshot: { currency: "USD", orders, spend: [] },
		model: "last-click",
		windowDays: 7,
	};
	const result = computeAttribution(source);
	const [mixed] = applyWorkspaceCosts(result.rows, defaults, {
		source,
		result,
	});
	assert.equal(mixed.costs, null);
	assert.equal(mixed.estimatedCosts, 21);
	assert.equal(mixed.costSource, "mixed");
	assert.equal(buildCampaignReport([mixed], filter)[0].contribution, null);
	const firstClick = { ...source, model: "first-click" };
	const first = computeAttribution(firstClick);
	const rows = applyWorkspaceCosts(first.rows, defaults, {
		source: firstClick,
		result: first,
	});
	assert.deepEqual(
		rows.map((r) => [r.campaign, r.costs, r.estimatedCosts, r.costSource]),
		[
			["Launch", null, 21, "mixed"],
			["Retarget", 0, null, "entered"],
		],
	);
});

test("filters, rankings inputs, trends, overall totals and exports carry the cost source", () => {
	const rows = applyWorkspaceCosts(
		[
			{ ...day, costs: 0 },
			{ ...day, date: "2026-11-02", orders: 1 },
			{ ...day, channel: "Meta", orders: 3 },
			{ ...day, date: "2026-11-03" },
		],
		settings,
	);
	const complete = { ...filter, end: "2026-11-02" };
	const campaigns = buildCampaignReport(rows, complete);
	assert.deepEqual(
		campaigns.map((c) => [c.channel, c.costs, c.costSource]),
		[
			["Google", 3320, "mixed"],
			["Meta", 4380, "estimated"],
		],
	);
	assert.equal(combinedCostSource(campaigns), "mixed");
	assert.equal(campaignOverview(campaigns).contribution, 13300);
	assert.deepEqual(
		buildCampaignTrend(rows, complete).map((d) => [
			d.date,
			d.costSource,
			d.contribution,
		]),
		[
			["2026-11-01", "mixed", 9620],
			["2026-11-02", "estimated", 3680],
		],
	);
	const selected = {
		...complete,
		start: "2026-11-02",
		channel: "Google",
		campaign: "Autumn",
	};
	const filtered = buildCampaignReport(rows, selected);
	assert.equal(combinedCostSource(filtered), "estimated");
	assert.equal(
		combinedCostSource(buildCampaignReport(rows, filter)),
		"unknown",
	);
	assert.match(
		makeReportCsv(filtered, selected),
		/cost_source\r\n[^\n]+,estimated\r\n/,
	);
});

test("large estimates use exact intermediate integers and totals outside the safe range stay unknown", () => {
	const percentOnly = {
		...settings,
		productCostBps: 9999,
		paymentFeeBps: 0,
		fixedPaymentFeeMinor: 0,
		fulfillmentCostMinor: 0,
	};
	const large = {
		...day,
		sales: Number.MAX_SAFE_INTEGER,
		spend: 0,
		refunds: 0,
	};
	const [exact] = applyWorkspaceCosts([large], percentOnly);
	const expected = Number((BigInt(large.sales) * 9999n + 5000n) / 10000n);
	assert.equal(exact.estimatedCosts, expected);
	const [overflow] = applyWorkspaceCosts([large], {
		...percentOnly,
		paymentFeeBps: 10000,
	});
	assert.deepEqual(
		[overflow.costSource, overflow.estimatedCosts],
		["unknown", null],
	);
	const fee = {
		...percentOnly,
		productCostBps: 0,
		fixedPaymentFeeMinor: Number.MAX_SAFE_INTEGER,
	};
	const smaller = { ...day, sales: 0, refunds: 0, spend: 0, orders: 1 };
	const huge = applyWorkspaceCosts(
		[smaller, { ...smaller, campaign: "Other" }],
		fee,
	);
	assert.equal(buildCampaignTrend(huge, filter)[0].contribution, null);
	const summaries = buildCampaignReport(huge, filter);
	assert.equal(combinedCostSource(summaries), "unknown");
	assert.equal(campaignOverview(summaries).costs, null);
	assert.equal(campaignOverview(summaries).contribution, null);
});
