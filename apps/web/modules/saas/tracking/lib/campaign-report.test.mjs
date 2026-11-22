import assert from "node:assert/strict";
import test from "node:test";
import {
	buildCampaignReport,
	campaignOverview,
	formatMoney,
	makeReportCsv,
	parseCampaignCsv,
	SAMPLE_CSV,
} from "./campaign-report.ts";

const header = "date,channel,campaign,currency,sales,refunds,spend,costs";
const filter = { currency: "USD", start: "", end: "" };
const csv = (...lines) => [header, ...lines].join("\r\n");

test("the example reproduces the product brief after refunds and costs", () => {
	const report = buildCampaignReport(parseCampaignCsv(SAMPLE_CSV), filter);
	assert.deepEqual(
		report
			.map((row) => [
				row.netRevenue,
				row.spend,
				row.roas,
				row.contribution,
			])
			.sort((a, b) => b[0] - a[0]),
		[
			[80000, 20000, 4, -5000],
			[70000, 20000, 3.5, 18000],
		],
	);
});

test("overview weights return by spend and marks partial totals incomplete", () => {
	const rows = parseCampaignCsv(
		csv(
			"2026-11-01,Meta,First,USD,80,20,20,30",
			"2026-11-01,Meta,Second,USD,300,0,50,30",
			"2026-11-01,Google,Other,EUR,100,0,0,0",
		),
	);
	assert.deepEqual(campaignOverview(buildCampaignReport(rows, filter)), {
		netRevenue: 36000,
		spend: 7000,
		contribution: 23000,
		roas: 36000 / 7000,
	});
	rows[0].costs = null;
	assert.equal(
		campaignOverview(buildCampaignReport(rows, filter)).contribution,
		null,
	);
	rows[0].spend = null;
	const unknown = campaignOverview(buildCampaignReport(rows, filter));
	assert.equal(unknown.spend, null);
	assert.equal(unknown.roas, null);
});

test("comparison uses summed amounts, inclusive dates and one currency", () => {
	const rows = parseCampaignCsv(
		csv(
			"2026-11-01,Meta,Autumn,USD,100,0,50,25",
			"2026-11-02,Meta,Autumn,USD,50,30,10,20",
			"2026-11-03,Meta,Autumn,USD,0,90,0,0",
			"2026-11-02,Meta,Autumn,EUR,700,0,10,10",
			"2026-11-02,Google,Autumn,USD,20,0,10,10",
		),
	);
	const report = buildCampaignReport(rows, {
		...filter,
		start: "2026-11-01",
		end: "2026-11-02",
	});
	assert.equal(report.length, 2);
	const meta = report.find((row) => row.channel === "Meta");
	assert.equal(meta.days, 2);
	assert.equal(meta.netRevenue, 12000);
	assert.equal(meta.roas, 2);
	assert.equal(meta.contribution, 1500);
	assert.deepEqual(
		buildCampaignReport(rows, { ...filter, end: "2026-10-31" }),
		[],
	);
});

test("missing spend and variable costs propagate independently across days", () => {
	const rows = parseCampaignCsv(
		csv(
			"2026-11-01,Meta,Missing costs,USD,10,1,3,0",
			"2026-11-02,Meta,Missing costs,USD,10,1,3,",
			"2026-11-01,Meta,Missing spend,USD,10,1,3,0",
			"2026-11-02,Meta,Missing spend,USD,10,1,,0",
			"2026-11-01,Meta,Zero spend,USD,1,2,0,0",
		),
	);
	const report = Object.fromEntries(
		buildCampaignReport(rows, filter).map((row) => [
			row.campaign,
			[row.netRevenue, row.spend, row.roas, row.contribution],
		]),
	);
	assert.deepEqual(report, {
		"Missing costs": [1800, 600, 3, null],
		"Missing spend": [1800, null, null, null],
		"Zero spend": [-100, 0, null, -100],
	});
});

test("quoted fields, UTF-8 BOM, CRLF and currency precision survive import", () => {
	const [jpy, kwd] = parseCampaignCsv(
		"\uFEFF" +
			csv(
				'2024-02-29,Search,"Winter, ""west""",JPY,700,0,1,4',
				"2024-02-29,Search,Winter,KWD,1.001,0.123,0.001,0.010",
			),
	);
	assert.equal(jpy.campaign, 'Winter, "west"');
	assert.equal(jpy.sales, 700);
	assert.equal(kwd.sales, 1001);
	assert.equal(kwd.refunds, 123);
	assert.match(formatMoney(kwd.sales, "KWD", "en-US"), /1\.001/);
});

test("invalid rows or duplicate daily totals reject the entire import", () => {
	const valid = "2026-11-01,Meta,Launch,USD,100,0,30,10";
	assert.throws(() => parseCampaignCsv(csv(valid, valid)), /repeats/);
	for (const bad of [
		valid.replace("11-01", "02-30"),
		valid.replace("USD", "ZZZ"),
		valid.replace("100", "1.234"),
		valid.replace("100", "-1"),
		valid.replace("100", "9007199254740992"),
		valid.replace("Launch", '"unclosed'),
		valid.replace(",100,", ",,"),
		valid.replace(",30,10", ",30"),
	]) {
		assert.throws(() => parseCampaignCsv(csv(bad)));
	}
});

test("large decimal amounts retain their last cent and unsafe totals are rejected", () => {
	const row = "2026-11-01,Search,Large,USD,90071992547409.91,0,0,0";
	const [summary] = buildCampaignReport(parseCampaignCsv(csv(row)), filter);
	assert.equal(
		formatMoney(summary.netRevenue, "USD", "en-US"),
		"$90,071,992,547,409.91",
	);
	assert.throws(() =>
		parseCampaignCsv(csv(row, "2026-11-02,Search,Large,USD,0.01,0,0,0")),
	);
});

test("CSV export carries filter context and escapes spreadsheet formulas in names", () => {
	const rows = parseCampaignCsv(
		csv('2026-11-01,Meta,"=SUM(1,1)",USD,10,0,2,1'),
	);
	const selected = { ...filter, start: "2026-11-01", end: "2026-11-04" };
	const output = makeReportCsv(buildCampaignReport(rows, selected), selected);
	assert.match(output, /"'=SUM\(1,1\)"/);
	assert.match(output, /USD/);
	assert.match(output, /2026-11-04/);
});
