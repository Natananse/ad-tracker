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

export const TEMPLATE_CSV = `${columns.join(",")}\r\n`;
export const SAMPLE_CSV =
	TEMPLATE_CSV +
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
}

export interface CampaignFilter {
	currency: string;
	start: string;
	end: string;
}

export interface CampaignSummary extends Omit<CampaignDay, "date"> {
	firstDate: string;
	lastDate: string;
	days: number;
	netRevenue: number;
	contribution: number | null;
	roas: number | null;
}

const supportedCurrencies = new Set(Intl.supportedValuesOf("currency"));
const currencyFormats = new Map<
	string,
	{ formatter: Intl.NumberFormat; places: number }
>();

function currencyFormat(currency: string, locale: string) {
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

function decimalAmount(minor: number, places: number) {
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

function* csvRecords(text: string) {
	const source = `${text.replace(/^\uFEFF/, "")}\n`;
	// A field must consume its closing delimiter. A stray quote cannot be skipped.
	const field = /(?:"((?:[^"]|"")*)"|([^",\r\n]*))(,|\r\n|\n|\r)/y;
	let cells: string[] = [];
	let record = 1;
	while (field.lastIndex < source.length) {
		const match = field.exec(source);
		if (!match) {
			throw new Error(`Row ${record} has invalid CSV quoting.`);
		}
		cells.push((match[1]?.replaceAll('""', '"') ?? match[2]).trim());
		if (cells.length > columns.length) {
			throw new Error(
				`Row ${record} has more than ${columns.length} columns.`,
			);
		}
		if (match[3] !== ",") {
			if (cells.length > 1 || cells[0] !== "") {
				yield { record, cells };
			}
			record++;
			cells = [];
		}
	}
}

function readAmount(value: string, places: number, label: string): number {
	const [whole, fraction = ""] = value.split(".");
	if (!/^\d+(\.\d+)?$/.test(value) || fraction.length > places) {
		throw new Error(
			`${label} requires a nonnegative amount with up to ${places} decimal places.`,
		);
	}
	const amount = Number(whole + fraction.padEnd(places, "0"));
	if (!Number.isSafeInteger(amount)) {
		throw new Error(`${label} is too large to total accurately.`);
	}
	return amount;
}

export function parseCampaignCsv(text: string): CampaignDay[] {
	const records = csvRecords(text);
	const header = records.next();
	if (
		header.done ||
		header.value.cells.length !== columns.length ||
		!columns.every((name) => header.value.cells.includes(name))
	) {
		throw new Error(`The CSV header must contain ${columns.join(", ")}.`);
	}
	const headers = header.value.cells;
	const rows: CampaignDay[] = [];
	const seen = new Set<string>();
	const magnitudeByCurrency = new Map<string, number>();
	for (const { record, cells } of records) {
		if (cells.length !== headers.length) {
			throw new Error(
				`Row ${record} must contain ${headers.length} columns. Leave unknown spend or costs blank.`,
			);
		}
		const value = (name: (typeof columns)[number]) =>
			cells[headers.indexOf(name)];
		const date = value("date");
		const timestamp = Date.parse(`${date}T00:00:00Z`);
		if (
			!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
			!Number.isFinite(timestamp) ||
			new Date(timestamp).toISOString().slice(0, 10) !== date
		) {
			throw new Error(
				`Row ${record} needs a valid date in YYYY-MM-DD format.`,
			);
		}
		const currency = value("currency").toUpperCase();
		if (!supportedCurrencies.has(currency)) {
			throw new Error(
				`Row ${record} needs a supported ISO currency code such as USD.`,
			);
		}
		const channel = value("channel");
		const campaign = value("campaign");
		if (!channel || !campaign) {
			throw new Error(
				`Row ${record} needs both a channel and a campaign name.`,
			);
		}
		const key = JSON.stringify([date, channel, campaign, currency]);
		if (seen.has(key)) {
			throw new Error(
				`Row ${record} repeats a daily total for the same channel, campaign and currency.`,
			);
		}
		seen.add(key);
		const { places } = currencyFormat(currency, "en");
		const amount = (name: "sales" | "refunds" | "spend" | "costs") =>
			readAmount(value(name), places, `Row ${record}, ${name}`);
		const sales = amount("sales");
		const refunds = amount("refunds");
		const spend = value("spend") === "" ? null : amount("spend");
		const costs = value("costs") === "" ? null : amount("costs");
		// Bound all future sums and differences, including any filtered subset.
		const magnitude =
			(magnitudeByCurrency.get(currency) ?? 0) +
			sales +
			refunds +
			(spend ?? 0) +
			(costs ?? 0);
		if (!Number.isSafeInteger(magnitude)) {
			throw new Error(
				`Row ${record} exceeds the reporting range for ${currency} totals.`,
			);
		}
		magnitudeByCurrency.set(currency, magnitude);
		rows.push({
			date,
			channel,
			campaign,
			currency,
			sales,
			refunds,
			spend,
			costs,
		});
	}
	if (!rows.length) {
		throw new Error(
			"Add at least one daily campaign row below the CSV header.",
		);
	}
	return rows;
}

function addKnown(total: number | null, value: number | null) {
	return total === null || value === null ? null : total + value;
}

export function campaignOverview(summaries: CampaignSummary[]) {
	let netRevenue = 0;
	let spend: number | null = 0;
	let contribution: number | null = 0;
	for (const campaign of summaries) {
		netRevenue += campaign.netRevenue;
		spend = addKnown(spend, campaign.spend);
		contribution = addKnown(contribution, campaign.contribution);
	}
	return {
		netRevenue,
		spend,
		contribution,
		roas: spend ? netRevenue / spend : null,
	};
}

export function buildCampaignReport(
	rows: CampaignDay[],
	filter: CampaignFilter,
): CampaignSummary[] {
	const groups = new Map<string, CampaignSummary>();
	for (const row of rows) {
		if (
			row.currency !== filter.currency ||
			(filter.start && row.date < filter.start) ||
			(filter.end && row.date > filter.end)
		) {
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
				days: 0,
				firstDate: row.date,
				lastDate: row.date,
				netRevenue: 0,
				contribution: null,
				roas: null,
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
		summary.costs = addKnown(summary.costs, row.costs);
		summary.netRevenue = summary.sales - summary.refunds;
		summary.contribution =
			summary.spend === null || summary.costs === null
				? null
				: summary.netRevenue - summary.spend - summary.costs;
		summary.roas = summary.spend
			? summary.netRevenue / summary.spend
			: null;
	}
	return [...groups.values()].sort(
		(a, b) =>
			a.campaign.localeCompare(b.campaign) ||
			a.channel.localeCompare(b.channel),
	);
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
		"channel,campaign,currency,filter_start,filter_end,first_date,last_date,reported_days,sales,refunds,net_revenue,spend,costs,roas,contribution_after_ads,spend_complete,costs_complete,generated_at_utc",
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
			].join(","),
		);
	}
	return lines.join("\r\n") + "\r\n";
}
