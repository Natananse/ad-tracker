import type { CostSource } from "@repo/api/modules/tracking/workspace-costs";

export type { CostSource } from "@repo/api/modules/tracking/workspace-costs";

const columns = [
	"date",
	"channel",
	"campaign",
	"currency",
	"sales",
	"refunds",
	"spend",
	"costs",
] as const;

const csvHeader = `${columns.join(",")}\r\n`;
export const TEMPLATE_CSV =
	`${columns.join(",")},orders\r\n` +
	"2026-11-02,Meta,Autumn launch,USD,600.00,0.00,125.00,350.00,10\r\n";
export const SAMPLE_CSV =
	csvHeader +
	[
		"2026-11-02,Meta,Campaign A,USD,600,0,125,350",
		"2026-11-02,Google,Campaign B,USD,300,0,90,140",
		"2026-11-03,Meta,Campaign A,USD,400,200,75,300",
		"2026-11-03,Google,Campaign B,USD,400,0,110,180",
	].join("\r\n");

export interface CampaignDay {
	date: string;
	channel: string;
	campaign: string;
	currency: string;
	sales: number;
	refunds: number;
	spend: number | null;
	costs: number | null;
	orders?: number | null;
	costSource?: CostSource;
	estimatedCosts?: number | null;
}

export interface CampaignFilter {
	currency: string;
	channel?: string;
	campaign?: string;
	start: string;
	end: string;
}

export interface CampaignSummary
	extends Omit<CampaignDay, "date" | "orders" | "estimatedCosts"> {
	costSource: CostSource;
	firstDate: string;
	lastDate: string;
	days: number;
	netRevenue: number;
	contribution: number | null;
	roas: number | null;
	breakEvenRoas: number | null;
}

export interface CampaignTrendDay {
	date: string;
	costSource: CostSource;
	netRevenue: number;
	spend: number | null;
	contribution: number | null;
}

const supportedCurrencies = new Set(Intl.supportedValuesOf("currency"));
const currencyFormats = new Map<
	string,
	{ formatter: Intl.NumberFormat; places: number }
>();

export function currencyFormat(currency: string, locale: string) {
	const key = `${currency}/${locale}`;
	let format = currencyFormats.get(key);
	if (!format) {
		const formatter = new Intl.NumberFormat(locale, {
			style: "currency",
			currency,
		});
		format = {
			formatter,
			places: formatter.resolvedOptions().maximumFractionDigits ?? 0,
		};
		currencyFormats.set(key, format);
	}
	return format;
}

export function decimalAmount(minor: number, places: number) {
	const digits = Math.abs(minor)
		.toString()
		.padStart(places + 1, "0");
	const amount = places
		? `${digits.slice(0, -places)}.${digits.slice(-places)}`
		: digits;
	return `${minor < 0 ? "-" : ""}${amount}` as `${number}`;
}

export function formatMoney(minor: number, currency: string, locale: string) {
	const { formatter, places } = currencyFormat(currency, locale);
	return formatter.format(decimalAmount(minor, places));
}

export interface CampaignCsvIssue {
	row: number;
	column: string;
	message: string;
}

export class CampaignCsvError extends Error {
	issues: CampaignCsvIssue[];

	constructor(issues: CampaignCsvIssue[]) {
		const first = issues[0];
		super(`Row ${first.row}, ${first.column}: ${first.message}`);
		this.name = "CampaignCsvError";
		this.issues = issues;
	}
}

function* csvRecords(text: string) {
	const source = `${text.replace(/^\uFEFF/, "")}\n`;
	// The last alternative recovers malformed fields up to the next delimiter.
	const field =
		/(?:"((?:[^"]|"")*)"|([^",\r\n]*)|([^,\r\n]*))(,|\r\n|\n|\r)/gy;
	let cells: string[] = [];
	let malformed = new Set<number>();
	let line = 1;
	let row = 1;
	for (const [, quoted, plain, broken, delimiter] of source.matchAll(field)) {
		if (broken !== undefined) {
			malformed.add(cells.length);
		}
		cells.push((quoted?.replaceAll('""', '"') ?? plain ?? broken).trim());
		if (quoted) {
			line += quoted.match(/\r\n|[\r\n]/g)?.length ?? 0;
		}
		if (delimiter !== ",") {
			if (cells.length > 1 || cells[0] !== "") {
				yield { row, cells, malformed };
			}
			cells = [];
			malformed = new Set();
			row = ++line;
		}
	}
}

export function parseCampaignCsv(text: string): CampaignDay[] {
	const records = csvRecords(text);
	const header = records.next();
	if (header.done) {
		throw new CampaignCsvError(
			columns.map((column) => ({
				row: 1,
				column,
				message: "Add this column to the CSV header.",
			})),
		);
	}
	const issues: CampaignCsvIssue[] = [];
	const headers = header.value.cells;
	const indices = new Map<string, number>();
	for (const [index, name] of headers.entries()) {
		const column = name || `Column ${index + 1}`;
		let message: string | undefined;
		if (header.value.malformed.has(index)) {
			message = "Fix the quoting in this header.";
		} else if (
			name !== "orders" &&
			!columns.some((expected) => expected === name)
		) {
			message =
				"Remove this unrecognized column or use its exact template name.";
		} else if (indices.has(name)) {
			message = "This column appears more than once in the header.";
		} else {
			indices.set(name, index);
		}
		if (message) {
			issues.push({ row: header.value.row, column, message });
		}
	}
	for (const column of columns) {
		if (!indices.has(column)) {
			issues.push({
				row: header.value.row,
				column,
				message: "Add this column to the CSV header.",
			});
		}
	}

	const rows: CampaignDay[] = [];
	const seen = new Map<string, number>();
	const magnitudeByCurrency = new Map<string, number>();
	let fileCurrency: string | undefined;
	let recordCount = 0;
	for (const { row, cells, malformed } of records) {
		recordCount++;
		const initialIssues = issues.length;
		const problem = (column: string, message: string) => {
			issues.push({ row, column, message });
		};
		if (recordCount === 10_001) {
			problem(
				"File",
				"A report supports up to 10,000 daily totals. Split the file.",
			);
		}
		for (const index of malformed) {
			problem(
				headers[index] || `Column ${index + 1}`,
				"Fix the invalid CSV quoting.",
			);
		}
		if (cells.length < headers.length) {
			for (const [column, index] of indices) {
				if (index >= cells.length && column !== "orders") {
					problem(
						column,
						"This field is missing. Keep an empty cell for unknown spend or costs.",
					);
				}
			}
		} else if (cells.length > headers.length) {
			problem(
				`Column ${headers.length + 1}`,
				`Expected ${headers.length} columns, found ${cells.length}. Quote any commas inside a name.`,
			);
		}
		const value = (name: (typeof columns)[number] | "orders") => {
			const index = indices.get(name);
			return index === undefined || malformed.has(index)
				? undefined
				: cells[index];
		};

		const date = value("date");
		const timestamp = Date.parse(`${date}T00:00:00Z`);
		const validDate =
			date !== undefined &&
			/^\d{4}-\d{2}-\d{2}$/.test(date) &&
			Number.isFinite(timestamp) &&
			new Date(timestamp).toISOString().slice(0, 10) === date;
		if (date !== undefined && !validDate) {
			problem("date", "Use a valid calendar date in YYYY-MM-DD format.");
		}

		const currency = value("currency")?.toUpperCase();
		const supported =
			currency !== undefined && supportedCurrencies.has(currency);
		if (currency !== undefined && !supported) {
			problem(
				"currency",
				"Use a supported three-letter ISO currency code such as USD.",
			);
		} else if (supported) {
			fileCurrency ??= currency;
			if (currency !== fileCurrency) {
				problem(
					"currency",
					`Mixed currencies. This file starts with ${fileCurrency}. Put ${currency} in a separate file.`,
				);
			}
		}

		const label = (name: "channel" | "campaign") => {
			const text = value(name);
			if (text === undefined) {
				return;
			}
			if (!text) {
				problem(name, "Enter a name.");
			} else if (text.length > 200 || text.includes("\0")) {
				problem(
					name,
					"Use a name of up to 200 characters without NUL characters.",
				);
			} else {
				return text;
			}
		};
		const channel = label("channel");
		const campaign = label("campaign");
		if (validDate && channel && campaign && supported) {
			const key = JSON.stringify([date, channel, campaign, currency]);
			const original = seen.get(key);
			if (original !== undefined) {
				problem(
					"date, channel, campaign, currency",
					`This daily total repeats row ${original}. Combine the totals into one row.`,
				);
			} else {
				seen.set(key, row);
			}
		}

		const places = supported
			? currencyFormat(currency, "en").places
			: undefined;
		const amount = (name: "sales" | "refunds" | "spend" | "costs") => {
			const input = value(name);
			if (input === undefined) {
				return;
			}
			if (input === "" && (name === "spend" || name === "costs")) {
				return null;
			}
			if (!/^\d+(\.\d+)?$/.test(input)) {
				problem(
					name,
					"Enter a nonnegative number without a currency symbol or thousands separators.",
				);
				return;
			}
			if (places === undefined) {
				return;
			}
			const [whole, fraction = ""] = input.split(".");
			if (fraction.length > places) {
				problem(
					name,
					`Use up to ${places} decimal places for ${currency}.`,
				);
				return;
			}
			const minor = Number(whole + fraction.padEnd(places, "0"));
			if (!Number.isSafeInteger(minor)) {
				problem(name, "This amount is too large to total accurately.");
				return;
			}
			return minor;
		};
		const sales = amount("sales");
		const refunds = amount("refunds");
		const spend = amount("spend");
		const costs = amount("costs");
		const orderCell = value("orders");
		const orders = orderCell ? Number(orderCell) : null;
		if (
			orderCell &&
			orders !== null &&
			(!/^\d+$/.test(orderCell) || orders > 2_147_483_647)
		) {
			problem(
				"orders",
				"Enter a whole order count from 0 to 2,147,483,647 or leave this cell blank.",
			);
		}
		if (
			!supported ||
			sales == null ||
			refunds == null ||
			spend === undefined ||
			costs === undefined
		) {
			continue;
		}
		const magnitude =
			(magnitudeByCurrency.get(currency) ?? 0) +
			sales +
			refunds +
			(spend ?? 0) +
			(costs ?? 0);
		if (!Number.isSafeInteger(magnitude)) {
			problem(
				"sales, refunds, spend, costs",
				`The total exceeds the reporting range for ${currency}.`,
			);
		} else {
			magnitudeByCurrency.set(currency, magnitude);
		}
		if (
			issues.length === initialIssues &&
			validDate &&
			channel &&
			campaign &&
			recordCount <= 10_000
		) {
			rows.push({
				date,
				channel,
				campaign,
				currency,
				sales,
				refunds,
				spend,
				costs,
				...(indices.has("orders") ? { orders } : {}),
			});
		}
	}
	if (!recordCount) {
		issues.push({
			row: header.value.row + 1,
			column: "File",
			message: "Add at least one daily campaign row below the header.",
		});
	}
	if (issues.length) {
		throw new CampaignCsvError(issues);
	}
	return rows;
}

function addKnown(total: number | null, value: number | null) {
	if (total === null || value === null) {
		return null;
	}
	const sum = total + value;
	return Number.isSafeInteger(sum) ? sum : null;
}

function rowCostSource(row: CampaignDay): CostSource {
	if (row.costs !== null) {
		return "entered";
	}
	return row.estimatedCosts == null
		? "unknown"
		: (row.costSource ?? "estimated");
}

function mergeCostSources(first: CostSource, second: CostSource): CostSource {
	if (first === "unknown" || second === "unknown") {
		return "unknown";
	}
	return first === second ? first : "mixed";
}

export function combinedCostSource(summaries: CampaignSummary[]): CostSource {
	let source: CostSource | undefined;
	let total: number | null = 0;
	for (const campaign of summaries) {
		source = source
			? mergeCostSources(source, campaign.costSource)
			: campaign.costSource;
		total = addKnown(total, campaign.costs);
	}
	return total === null ? "unknown" : (source ?? "unknown");
}

export function matchesCampaignFilter(
	row: Pick<CampaignDay, "date" | "channel" | "campaign" | "currency">,
	filter: CampaignFilter,
): boolean {
	return (
		row.currency === filter.currency &&
		(!filter.channel || row.channel === filter.channel) &&
		(!filter.campaign || row.campaign === filter.campaign) &&
		(!filter.start || row.date >= filter.start) &&
		(!filter.end || row.date <= filter.end)
	);
}

function contributionAfterAds(
	netRevenue: number,
	spend: number | null,
	costs: number | null,
) {
	if (spend === null || costs === null) {
		return null;
	}
	const amount = netRevenue - spend - costs;
	return Number.isSafeInteger(amount) ? amount : null;
}

export function buildCampaignTrend(
	rows: CampaignDay[],
	filter: CampaignFilter,
): CampaignTrendDay[] {
	const days = new Map<string, CampaignTrendDay & { costs: number | null }>();
	for (const row of rows) {
		if (!matchesCampaignFilter(row, filter)) {
			continue;
		}
		let day = days.get(row.date);
		if (!day) {
			day = {
				date: row.date,
				netRevenue: 0,
				spend: 0,
				costs: 0,
				contribution: 0,
				costSource: rowCostSource(row),
			};
			days.set(row.date, day);
		}
		const netRevenue = row.sales - row.refunds;
		day.netRevenue += netRevenue;
		day.spend = addKnown(day.spend, row.spend);
		day.costs = addKnown(
			day.costs,
			row.costs ?? row.estimatedCosts ?? null,
		);
		day.costSource =
			day.costs === null
				? "unknown"
				: mergeCostSources(day.costSource, rowCostSource(row));
		day.contribution = contributionAfterAds(
			day.netRevenue,
			day.spend,
			day.costs,
		);
	}
	return [...days.values()]
		.map(({ costs, ...day }) => day)
		.sort((a, b) => a.date.localeCompare(b.date));
}

export function campaignOverview(summaries: CampaignSummary[]) {
	let sales = 0;
	let refunds = 0;
	let costs: number | null = 0;
	let spend: number | null = 0;
	for (const campaign of summaries) {
		sales += campaign.sales;
		refunds += campaign.refunds;
		costs = addKnown(costs, campaign.costs);
		spend = addKnown(spend, campaign.spend);
	}
	const netRevenue = sales - refunds;
	return {
		sales,
		refunds,
		costs,
		netRevenue,
		spend,
		contribution: contributionAfterAds(netRevenue, spend, costs),
		roas: spend ? netRevenue / spend : null,
	};
}

export function buildCampaignReport(
	rows: CampaignDay[],
	filter: CampaignFilter,
): CampaignSummary[] {
	const groups = new Map<string, CampaignSummary>();
	for (const row of rows) {
		if (!matchesCampaignFilter(row, filter)) {
			continue;
		}
		const key = JSON.stringify([row.channel, row.campaign]);
		let summary = groups.get(key);
		if (!summary) {
			summary = {
				campaign: row.campaign,
				channel: row.channel,
				currency: row.currency,
				sales: 0,
				refunds: 0,
				spend: 0,
				costs: 0,
				costSource: rowCostSource(row),
				days: 0,
				firstDate: row.date,
				lastDate: row.date,
				netRevenue: 0,
				contribution: null,
				roas: null,
				breakEvenRoas: null,
			};
			groups.set(key, summary);
		}
		summary.days++;
		if (row.date < summary.firstDate) {
			summary.firstDate = row.date;
		}
		if (row.date > summary.lastDate) {
			summary.lastDate = row.date;
		}
		summary.sales += row.sales;
		summary.refunds += row.refunds;
		summary.spend = addKnown(summary.spend, row.spend);
		summary.costs = addKnown(
			summary.costs,
			row.costs ?? row.estimatedCosts ?? null,
		);
		summary.costSource =
			summary.costs === null
				? "unknown"
				: mergeCostSources(summary.costSource, rowCostSource(row));
		summary.netRevenue = summary.sales - summary.refunds;
		summary.contribution = contributionAfterAds(
			summary.netRevenue,
			summary.spend,
			summary.costs,
		);
		summary.roas = summary.spend
			? summary.netRevenue / summary.spend
			: null;
		// Compare observed ROAS against the threshold implied by the pre-ad contribution margin.
		const margin =
			summary.costs === null ? null : summary.netRevenue - summary.costs;
		summary.breakEvenRoas =
			summary.spend !== null &&
			summary.spend > 0 &&
			summary.netRevenue > 0 &&
			margin !== null &&
			margin > 0
				? summary.netRevenue / margin
				: null;
	}
	return [...groups.values()].sort(
		(a, b) =>
			a.campaign.localeCompare(b.campaign) ||
			a.channel.localeCompare(b.channel),
	);
}

export function campaignExtremes(summaries: CampaignSummary[]) {
	const eligible = summaries.filter(
		(campaign): campaign is CampaignSummary & { contribution: number } =>
			campaign.contribution !== null &&
			!(
				campaign.channel === "Unmatched" &&
				campaign.campaign === "No eligible click"
			),
	);
	let highest = Number.NEGATIVE_INFINITY;
	let lowest = Number.POSITIVE_INFINITY;
	for (const campaign of eligible) {
		highest = Math.max(highest, campaign.contribution);
		lowest = Math.min(lowest, campaign.contribution);
	}
	return {
		best: eligible.filter((campaign) => campaign.contribution === highest),
		worst: eligible.filter((campaign) => campaign.contribution === lowest),
	};
}

function exportLabel(value: string) {
	// Quotes alone do not prevent a spreadsheet from evaluating a text label.
	const text = /^[\s]*[=+@\-＝＋＠－]/u.test(value) ? `'${value}` : value;
	return `"${text.replaceAll('"', '""')}"`;
}

export function makeReportCsv(
	summaries: CampaignSummary[],
	filter: CampaignFilter,
) {
	const generatedAt = new Date().toISOString();
	const lines = [
		"channel,campaign,currency,filter_start,filter_end,first_date,last_date,reported_days,sales,refunds,net_revenue,spend,costs,roas,contribution_after_ads,spend_complete,costs_complete,generated_at_utc,filter_channel,filter_campaign,break_even_roas,cost_source",
	];
	for (const summary of summaries) {
		const { places } = currencyFormat(summary.currency, "en");
		const money = (amount: number | null) =>
			amount === null ? "" : decimalAmount(amount, places);
		lines.push(
			[
				exportLabel(summary.channel),
				exportLabel(summary.campaign),
				summary.currency,
				filter.start,
				filter.end,
				summary.firstDate,
				summary.lastDate,
				summary.days,
				money(summary.sales),
				money(summary.refunds),
				money(summary.netRevenue),
				money(summary.spend),
				money(summary.costs),
				summary.roas ?? "",
				money(summary.contribution),
				summary.spend !== null,
				summary.costs !== null,
				generatedAt,
				exportLabel(filter.channel ?? ""),
				exportLabel(filter.campaign ?? ""),
				summary.breakEvenRoas ?? "",
				summary.costSource,
			].join(","),
		);
	}
	return `${lines.join("\r\n")}\r\n`;
}
