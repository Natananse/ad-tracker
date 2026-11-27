import assert from "node:assert/strict";
import test from "node:test";
import {
	CampaignCsvError,
	parseCampaignCsv,
	TEMPLATE_CSV,
} from "./campaign-report.ts";

const header = "date,channel,campaign,currency,sales,refunds,spend,costs";
const file = (...lines) => [header, ...lines].join("\r\n");

function problems(csv) {
	try {
		parseCampaignCsv(csv);
	} catch (error) {
		assert.ok(error instanceof CampaignCsvError);
		return error.issues;
	}
	assert.fail("Expected the file to have validation errors.");
}

test("each independent field and row problem is returned in one import", () => {
	const issues = problems(
		file(
			"2026-11-02,Meta,Launch,USD,100,0,25,0",
			"2026-02-30,,Spring,ZZZ,nope,-1,?,",
			"2026-11-02,Meta,Launch,usd,100,0,25,0",
			"2026-11-04,Shop,Winter,EUR,3.999,,1,no",
		),
	);
	assert.deepEqual(
		issues.map(({ row, column }) => [row, column]),
		[
			[3, "date"],
			[3, "currency"],
			[3, "channel"],
			[3, "sales"],
			[3, "refunds"],
			[3, "spend"],
			[4, "date, channel, campaign, currency"],
			[5, "currency"],
			[5, "sales"],
			[5, "refunds"],
			[5, "costs"],
		],
	);
	assert.match(issues[6].message, /row 2/);
	assert.match(issues[7].message, /USD.*EUR/);
});

test("bad quoting, field counts, NUL characters and long names identify their cells", () => {
	const issues = problems(
		file(
			'2026-01-01,Me"ta,Example,USD,1,0,,',
			"2026-01-03,Search,Example,USD,1,0",
			'2026-01-04,Meta,"North\r\nWest",USD,3,0,,',
			`2026-01-05,Null\0label,${"x".repeat(201)},USD,4,0,,,extra`,
			"2026-01-06,Search,Another,USD,bad,0,,",
		),
	);
	assert.deepEqual(
		issues.map(({ row, column }) => [row, column]),
		[
			[2, "channel"],
			[3, "spend"],
			[3, "costs"],
			[6, "Column 9"],
			[6, "channel"],
			[6, "campaign"],
			[7, "sales"],
		],
	);
});

test("unbalanced quotes can recover at the next physical record", () => {
	const issues = problems(
		file(
			'2026-01-01,Meta,"Winter,USD,1,0,,',
			"2026-01-02,Search,Another,USD,1,0,wrong,",
		),
	);
	assert.deepEqual(
		issues.map(({ row, column }) => [row, column]),
		[
			[2, "campaign"],
			[3, "spend"],
		],
	);
});

test("missing, duplicate and unrecognized headers report their names while other fields are checked", () => {
	const issues = problems(
		"campaign,channel,channel,currency,sales,spend,costs,extra\nWinter,Meta,Meta,USD,no,,,x",
	);
	assert.deepEqual(
		issues.map(({ row, column }) => [row, column]),
		[
			[1, "channel"],
			[1, "extra"],
			[1, "date"],
			[1, "refunds"],
			[2, "sales"],
		],
	);
});

test("every mismatched currency gets its own cell error and spelling case is normalized", () => {
	const issues = problems(
		file(
			"2026-01-01,Meta,One,usd,1,0,,",
			"2026-01-02,Meta,Two,EUR,1,0,,",
			"2026-01-03,Meta,Three,GBP,1,0,,",
			"2026-01-04,Meta,Four,USD,1,0,,",
		),
	);
	assert.deepEqual(
		issues.map(({ row, column }) => [row, column]),
		[
			[3, "currency"],
			[4, "currency"],
		],
	);
});

test("single-currency CSV files accept reordered columns, UTF-8 BOM, quoted multiline fields and currency precision", () => {
	const [row] = parseCampaignCsv(
		'\uFEFFspend,costs,sales,refunds,date,campaign,currency,channel\r\n,0,1.001,0,2024-02-29,"North, ""west""\nlaunch",kwd,Search\r\n',
	);
	assert.deepEqual(row, {
		spend: null,
		costs: 0,
		sales: 1001,
		refunds: 0,
		date: "2024-02-29",
		campaign: 'North, "west"\nlaunch',
		currency: "KWD",
		channel: "Search",
	});
});

test("row cap reports the first excess record and other errors are still accessible", () => {
	const rows = Array.from(
		{ length: 10_002 },
		(_, i) => `2026-01-01,Meta,c${i},USD,${i === 10_001 ? "x" : "0"},0,,`,
	);
	const issues = problems(file(...rows));
	assert.deepEqual(
		issues.map(({ row, column }) => [row, column]),
		[
			[10_002, "File"],
			[10_003, "sales"],
		],
	);
});

test("the download template contains the exact header and one complete importable example", () => {
	assert.equal(TEMPLATE_CSV.trimEnd().split("\r\n")[0], `${header},orders`);
	assert.equal(TEMPLATE_CSV.trimEnd().split("\r\n").length, 2);
	const rows = parseCampaignCsv(TEMPLATE_CSV);
	assert.equal(rows.length, 1);
	assert.equal(rows[0].currency, "USD");
	assert.equal(rows[0].orders, 10);
	assert.ok(rows[0].sales > 0);
});
