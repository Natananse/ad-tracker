import assert from "node:assert/strict";
import test from "node:test";
import {
	buildCampaignReport,
	buildCampaignTrend,
	campaignExtremes,
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

test("existing stored rows keep their totals and ROAS without a new CSV import", () => {
	const first = {
		date: "2026-04-01",
		channel: "Meta",
		campaign: "Spring",
		currency: "USD",
		sales: 10000,
		refunds: 1000,
		spend: 2500,
		costs: 4000,
	};
	const stored = [
		first,
		{
			...first,
			date: "2026-04-02",
			sales: 4000,
			refunds: 0,
			spend: 1500,
			costs: 2000,
		},
		{
			...first,
			currency: "JPY",
			sales: 500,
			refunds: 0,
			spend: 0,
			costs: null,
		},
	];
	assert.deepEqual(campaignOverview(buildCampaignReport(stored, filter)), {
		sales: 14000,
		refunds: 1000,
		netRevenue: 13000,
		spend: 4000,
		costs: 6000,
		contribution: 3000,
		roas: 3.25,
	});
	assert.deepEqual(
		campaignOverview(
			buildCampaignReport(stored, { ...filter, currency: "JPY" }),
		),
		{
			sales: 500,
			refunds: 0,
			netRevenue: 500,
			spend: 0,
			costs: null,
			contribution: null,
			roas: null,
		},
	);
});

test("overview weights return by spend and marks partial totals incomplete", () => {
	const rows = parseCampaignCsv(
		csv(
			"2026-11-01,Meta,First,USD,80,20,20,30",
			"2026-11-01,Meta,Second,USD,300,0,50,30",
		),
	);
	// Previously saved multi-currency reports remain readable.
	rows.push(
		...parseCampaignCsv(csv("2026-11-01,Google,Other,EUR,100,0,0,0")),
	);
	assert.deepEqual(campaignOverview(buildCampaignReport(rows, filter)), {
		sales: 38000,
		refunds: 2000,
		costs: 6000,
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
	assert.equal(unknown.costs, null);
	assert.equal(unknown.spend, null);
	assert.equal(unknown.roas, null);
});

test("comparison uses summed amounts, inclusive dates and one currency", () => {
	const rows = parseCampaignCsv(
		csv(
			"2026-11-01,Meta,Autumn,USD,100,0,50,25",
			"2026-11-02,Meta,Autumn,USD,50,30,10,20",
			"2026-11-03,Meta,Autumn,USD,0,90,0,0",
			"2026-11-02,Google,Autumn,USD,20,0,10,10",
		),
	);
	rows.push(
		...parseCampaignCsv(csv("2026-11-02,Meta,Autumn,EUR,700,0,10,10")),
	);
	const report = buildCampaignReport(rows, {
		...filter,
		start: "2026-11-01",
		end: "2026-11-02",
	});
	assert.equal(report.length, 2);
	const meta = report.find((row) => row.channel === "Meta");
	assert.deepEqual(
		buildCampaignReport(rows, {
			...filter,
			end: "2026-11-02",
			channel: "Meta",
		}),
		[meta],
	);
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
	const [jpy] = parseCampaignCsv(
		`\uFEFF${csv('2024-02-29,Search,"Winter, ""west""",JPY,700,0,1,4')}`,
	);
	const [kwd] = parseCampaignCsv(
		csv("2024-02-29,Search,Winter,KWD,1.001,0.123,0.001,0.010"),
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
	const rows = parseCampaignCsv(csv(row));
	const [summary] = buildCampaignReport(rows, filter);
	const [day] = buildCampaignTrend(rows, filter);
	assert.equal(day.netRevenue, Number.MAX_SAFE_INTEGER);
	assert.equal(day.contribution, Number.MAX_SAFE_INTEGER);
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

test("daily trends aggregate filtered rows by reported date and preserve gaps and unknowns", () => {
	const rows = parseCampaignCsv(
		csv(
			"2026-11-05,Meta,Autumn,USD,5,0,,2",
			"2026-11-01,Meta,Autumn,USD,10.01,2,2,1",
			"2026-11-01,Google,Autumn,USD,15,1.02,4,5",
			"2026-11-03,Meta,Autumn,USD,0,9,0,",
			"2026-11-03,Email,Autumn,USD,1,0,0.50,0",
			"2026-11-05,Email,Autumn,USD,1,0,0.50,0",
			"2026-11-01,Google,Spring,USD,90,0,10,15",
			"2026-10-31,Google,Autumn,USD,20,0,1,0",
			"2026-11-06,Google,Autumn,USD,20,0,1,0",
		),
	);
	rows.push(
		...parseCampaignCsv(csv("2026-11-01,Google,Autumn,EUR,10,0,3,0")),
	);
	const selected = {
		...filter,
		campaign: "Autumn",
		start: "2026-11-01",
		end: "2026-11-05",
	};
	assert.deepEqual(buildCampaignTrend(rows, selected), [
		{
			date: "2026-11-01",
			netRevenue: 2199,
			spend: 600,
			contribution: 999,
			costSource: "entered",
		},
		{
			date: "2026-11-03",
			netRevenue: -800,
			spend: 50,
			contribution: null,
			costSource: "unknown",
		},
		{
			date: "2026-11-05",
			netRevenue: 600,
			spend: null,
			contribution: null,
			costSource: "entered",
		},
	]);
	const onlyGoogle = { ...selected, channel: "Google" };
	const summaries = buildCampaignReport(rows, onlyGoogle);
	assert.equal(summaries.length, 1);
	assert.equal(summaries[0].campaign, "Autumn");
	assert.equal(summaries[0].netRevenue, 1398);
	assert.deepEqual(buildCampaignTrend(rows, onlyGoogle), [
		{
			date: "2026-11-01",
			netRevenue: 1398,
			spend: 400,
			contribution: 498,
			costSource: "entered",
		},
	]);
	assert.deepEqual(
		buildCampaignTrend(rows, { ...selected, campaign: "Absent" }),
		[],
	);
});

test("break-even ROAS uses aggregated net sales and known variable costs with positive spend", () => {
	const rows = parseCampaignCsv(
		csv(
			"2026-11-01,Meta,Tracked,USD,100,10,12,30",
			"2026-11-02,Meta,Tracked,USD,60,5,5,20",
			"2026-11-01,Meta,Zero costs,USD,10,0,1,0",
			"2026-11-01,Meta,Missing costs,USD,10,0,1,",
			"2026-11-01,Meta,Missing spend,USD,10,0,,1",
			"2026-11-01,Meta,Zero spend,USD,10,0,0,1",
			"2026-11-01,Meta,Zero margin,USD,10,0,2,10",
			"2026-11-01,Meta,Negative margin,USD,10,0,2,11",
			"2026-11-01,Meta,Refunded,USD,10,10,1,0",
			"2026-11-01,Meta,Negative sales,USD,10,20,1,0",
		),
	);
	const report = buildCampaignReport(rows, filter);
	assert.deepEqual(
		Object.fromEntries(
			report.map((row) => [row.campaign, row.breakEvenRoas]),
		),
		{
			Tracked: 145 / 95,
			"Zero costs": 1,
			"Missing costs": null,
			"Missing spend": null,
			"Zero spend": null,
			"Zero margin": null,
			"Negative margin": null,
			Refunded: null,
			"Negative sales": null,
		},
	);
});

test("best and worst retain all ties and omit the synthetic attribution bucket and unknown contributions", () => {
	const rows = parseCampaignCsv(
		csv(
			"2026-11-01,Unmatched,No eligible click,USD,500,0,0,0",
			"2026-11-01,Search,No eligible click,USD,10,0,2,0",
			"2026-11-01,Social,News,USD,10,0,1,1",
			"2026-11-01,Search,News,USD,10,0,6,6",
			"2026-11-01,Search,Brand,USD,10,0,7,5",
			"2026-11-01,Search,Unknown,USD,1000,0,1,",
		),
	);
	const { best, worst } = campaignExtremes(buildCampaignReport(rows, filter));
	assert.deepEqual(
		best.map((row) => [row.channel, row.campaign]),
		[
			["Social", "News"],
			["Search", "No eligible click"],
		],
	);
	assert.deepEqual(
		worst.map((row) => [row.channel, row.campaign]),
		[
			["Search", "Brand"],
			["Search", "News"],
		],
	);
	const onlyWinner = buildCampaignReport(rows, {
		...filter,
		channel: "Social",
	});
	assert.deepEqual(campaignExtremes(onlyWinner), {
		best: onlyWinner,
		worst: onlyWinner,
	});
	for (const channel of ["Unmatched", "Absent"]) {
		assert.deepEqual(
			campaignExtremes(buildCampaignReport(rows, { ...filter, channel })),
			{ best: [], worst: [] },
		);
	}
	assert.deepEqual(
		campaignExtremes(
			buildCampaignReport(rows, { ...filter, campaign: "Unknown" }),
		),
		{ best: [], worst: [] },
	);
});

test("export identifies the exact campaign and channel selection and leaves unknown break-even blank", () => {
	const rows = parseCampaignCsv(
		csv(
			"2026-11-01,@Social,=Launch,USD,24,4,5,10",
			"2026-11-01,@Social,Other,USD,9,0,1,",
			"2026-11-01,Search,=Launch,USD,150,10,5,7",
		),
	);
	const selected = {
		...filter,
		channel: "@Social",
		campaign: "=Launch",
		start: "2026-11-01",
		end: "2026-11-02",
	};
	const output = makeReportCsv(buildCampaignReport(rows, selected), selected)
		.trimEnd()
		.split("\r\n");
	assert.equal(output.length, 2);
	const headings = output[0].split(",");
	const cells = Object.fromEntries(
		headings.map((key, i) => [key, output[1].split(",")[i]]),
	);
	assert.equal(cells.filter_channel, '"\'@Social"');
	assert.equal(cells.filter_campaign, '"\'=Launch"');
	assert.equal(cells.filter_start, selected.start);
	assert.equal(cells.filter_end, selected.end);
	assert.equal(cells.currency, selected.currency);
	assert.equal(cells.roas, "4");
	assert.equal(cells.break_even_roas, "2");
	const unknown = { ...selected, campaign: "Other" };
	const unknownCsv = makeReportCsv(
		buildCampaignReport(rows, unknown),
		unknown,
	);
	assert.equal(
		unknownCsv.split("\r\n")[1].split(",")[
			headings.indexOf("break_even_roas")
		],
		"",
	);
});
