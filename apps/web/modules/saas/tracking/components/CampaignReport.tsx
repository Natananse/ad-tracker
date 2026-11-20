"use client";

import { PageHeader } from "@saas/shared/components/PageHeader";
import { Alert } from "@ui/components/alert";
import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@ui/components/table";
import { DownloadIcon, UploadIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { type ChangeEvent, useMemo, useRef, useState } from "react";
import {
	buildCampaignReport,
	type CampaignDay,
	formatMoney,
	makeReportCsv,
	parseCampaignCsv,
	SAMPLE_CSV,
	TEMPLATE_CSV,
} from "../lib/campaign-report";

const pageSize = 50;
const maxFileBytes = 2 * 1024 * 1024;

function downloadCsv(text: string, filename: string) {
	const url = URL.createObjectURL(
		new Blob([text], { type: "text/csv;charset=utf-8" }),
	);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function ReportResults({ rows }: { rows: CampaignDay[] }) {
	const locale = useLocale();
	const ranges = useMemo(() => {
		const byCurrency = new Map<string, { first: string; last: string }>();
		for (const { currency, date } of rows) {
			const range = byCurrency.get(currency);
			if (!range) {
				byCurrency.set(currency, { first: date, last: date });
			} else {
				if (date < range.first) {
					range.first = date;
				}
				if (date > range.last) {
					range.last = date;
				}
			}
		}
		return byCurrency;
	}, [rows]);
	const currencies = Array.from(ranges.keys()).sort();
	const [filter, setFilter] = useState({
		currency: currencies[0],
		start: "",
		end: "",
	});
	const [page, setPage] = useState(0);
	const invalidDates = Boolean(
		filter.start && filter.end && filter.start > filter.end,
	);
	const summaries = useMemo(
		() => (invalidDates ? [] : buildCampaignReport(rows, filter)),
		[rows, filter, invalidDates],
	);
	const ratioFormat = new Intl.NumberFormat(locale, {
		maximumFractionDigits: 2,
	});
	const range = ranges.get(filter.currency);
	const dateFormat = new Intl.DateTimeFormat(locale, {
		dateStyle: "medium",
		timeZone: "UTC",
	});

	function money(amount: number | null, missing = "Unknown") {
		return amount === null
			? missing
			: formatMoney(amount, filter.currency, locale);
	}

	function changeFilter(field: keyof typeof filter, value: string) {
		setFilter((previous) => ({ ...previous, [field]: value }));
		setPage(0);
	}

	return (
		<Card className="w-full min-w-0 max-w-full overflow-hidden">
			<div className="space-y-5 p-4 sm:p-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h2 className="font-semibold text-xl">
						Campaign performance
					</h2>
					<Button
						type="button"
						variant="outline"
						disabled={summaries.length === 0}
						onClick={() =>
							downloadCsv(
								makeReportCsv(summaries, filter),
								`campaign-report-${filter.currency}.csv`,
							)
						}
					>
						<DownloadIcon className="size-4" aria-hidden="true" />
						Export report
					</Button>
				</div>
				<div className="grid gap-3 sm:grid-cols-3">
					<div className="space-y-1.5">
						<Label htmlFor="report-currency">Currency</Label>
						<select
							id="report-currency"
							value={filter.currency}
							onChange={(event) =>
								changeFilter("currency", event.target.value)
							}
							className="h-9 w-full rounded-md border border-input bg-card px-3 shadow-xs focus-visible:ring-1 focus-visible:ring-ring"
						>
							{currencies.map((currency) => (
								<option key={currency}>{currency}</option>
							))}
						</select>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="report-start">From</Label>
						<Input
							id="report-start"
							type="date"
							value={filter.start}
							max={filter.end || undefined}
							aria-invalid={invalidDates}
							aria-describedby={
								invalidDates ? "report-date-error" : undefined
							}
							onChange={(event) =>
								changeFilter("start", event.target.value)
							}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="report-end">Through</Label>
						<Input
							id="report-end"
							type="date"
							value={filter.end}
							min={filter.start || undefined}
							aria-invalid={invalidDates}
							aria-describedby={
								invalidDates ? "report-date-error" : undefined
							}
							onChange={(event) =>
								changeFilter("end", event.target.value)
							}
						/>
					</div>
				</div>
				{range && (
					<p className="text-muted-foreground text-sm">
						Available dates for {filter.currency} ·{" "}
						{dateFormat.formatRange(
							new Date(range.first),
							new Date(range.last),
						)}
					</p>
				)}
				{invalidDates ? (
					<Alert id="report-date-error" variant="error">
						Choose an end date on or after the start date.
					</Alert>
				) : (
					<p role="status" className="text-muted-foreground text-sm">
						{summaries.length > 0
							? `${summaries.length.toLocaleString(locale)} ${summaries.length === 1 ? "campaign" : "campaigns"} in ${filter.currency}`
							: "No campaign data matches these dates and currency."}
					</p>
				)}
			</div>
			{summaries.length > 0 && (
				<>
					<Table className="min-w-[56rem]">
						<caption className="sr-only">
							Campaign performance in {filter.currency}
						</caption>
						<TableHeader>
							<TableRow className="bg-muted/60">
								<TableHead scope="col">Campaign</TableHead>
								{[
									"Sales",
									"Refunds",
									"Net revenue",
									"Ad spend",
									"ROAS",
									"Variable costs",
									"Contribution after ads",
								].map((label) => (
									<TableHead
										key={label}
										scope="col"
										className="text-right"
									>
										{label}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{summaries
								.slice(page * pageSize, (page + 1) * pageSize)
								.map((summary) => (
									<TableRow
										key={JSON.stringify([
											summary.channel,
											summary.campaign,
										])}
										className="tabular-nums"
									>
										<th
											scope="row"
											className="max-w-xs break-words p-4 text-left font-medium"
										>
											{summary.campaign}
											<span className="block text-muted-foreground text-xs">
												{summary.channel} ·{" "}
												{summary.days.toLocaleString(
													locale,
												)}{" "}
												{summary.days === 1
													? "day"
													: "days"}
											</span>
										</th>
										<TableCell className="text-right">
											{money(summary.sales)}
										</TableCell>
										<TableCell className="text-right">
											{money(summary.refunds)}
										</TableCell>
										<TableCell className="text-right">
											{money(summary.netRevenue)}
										</TableCell>
										<TableCell className="text-right">
											{money(summary.spend)}
										</TableCell>
										<TableCell className="text-right">
											{summary.roas === null
												? "N/A"
												: `${ratioFormat.format(summary.roas)}×`}
										</TableCell>
										<TableCell className="text-right">
											{money(summary.costs)}
										</TableCell>
										<TableCell className="text-right font-medium">
											{money(
												summary.contribution,
												"Incomplete",
											)}
										</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
					{summaries.length > pageSize && (
						<div className="flex items-center justify-end gap-3 border-t px-4 py-3">
							<Button
								type="button"
								size="sm"
								variant="outline"
								disabled={page === 0}
								onClick={() => setPage(page - 1)}
							>
								Previous
							</Button>
							<span className="text-sm">
								Page {page + 1} of{" "}
								{Math.ceil(summaries.length / pageSize)}
							</span>
							<Button
								type="button"
								size="sm"
								variant="outline"
								disabled={
									(page + 1) * pageSize >= summaries.length
								}
								onClick={() => setPage(page + 1)}
							>
								Next
							</Button>
						</div>
					)}
					<p className="border-t px-4 py-4 text-muted-foreground text-sm sm:px-6">
						Net revenue is merchandise sales after discounts, less
						refunds. ROAS divides net revenue by ad spend and
						requires known, positive spend. Contribution subtracts
						ad spend and variable costs from net revenue and
						requires both inputs on every included day.
					</p>
				</>
			)}
		</Card>
	);
}

export function CampaignReport() {
	const locale = useLocale();
	const input = useRef<HTMLInputElement>(null);
	const [source, setSource] = useState<{
		name: string;
		rows: CampaignDay[];
		version: number;
	} | null>(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	function loadCsv(csv: string, name: string) {
		const rows = parseCampaignCsv(csv);
		setSource((previous) => ({
			name,
			rows,
			version: (previous?.version ?? 0) + 1,
		}));
		setError("");
	}

	async function importFile(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) {
			return;
		}
		if (file.size > maxFileBytes) {
			setError("Choose a CSV file of 2 MiB or less.");
			return;
		}
		setLoading(true);
		setError("");
		try {
			loadCsv(await file.text(), file.name);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: "The CSV could not be read.",
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-w-0">
			<PageHeader
				title="Campaign report"
				subtitle="Compare campaign revenue, ad spend, and contribution after refunds."
			/>
			<div className="space-y-6">
				<Card className="space-y-4 p-4 sm:p-6">
					<div className="space-y-1">
						<h2 className="font-semibold text-xl">Report data</h2>
						<p className="text-muted-foreground text-sm">
							Import daily campaign totals from a CSV up to 2 MiB.
							Your file stays in this browser tab. Refreshing or
							leaving this page clears the report.
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<input
							ref={input}
							type="file"
							accept=".csv,text/csv"
							aria-label="Campaign CSV file"
							hidden
							disabled={loading}
							onChange={importFile}
						/>
						<Button
							type="button"
							variant="primary"
							loading={loading}
							onClick={() => input.current?.click()}
						>
							<UploadIcon className="size-4" aria-hidden="true" />
							{source ? "Replace CSV" : "Import CSV"}
						</Button>
						<Button
							type="button"
							variant="outline"
							disabled={loading}
							onClick={() => loadCsv(SAMPLE_CSV, "Example data")}
						>
							Load example
						</Button>
						{source && (
							<Button
								type="button"
								variant="ghost"
								disabled={loading}
								onClick={() => {
									setSource(null);
									setError("");
								}}
							>
								Clear data
							</Button>
						)}
					</div>
					<p
						role="status"
						className="break-words text-sm empty:hidden"
					>
						{loading
							? "Reading CSV…"
							: source &&
								`${source.name} · ${source.rows.length.toLocaleString(locale)} daily ${source.rows.length === 1 ? "record" : "records"}`}
					</p>
					{error && <Alert variant="error">{error}</Alert>}
					<details className="border-t pt-3 text-sm">
						<summary className="w-fit cursor-pointer font-medium">
							CSV format and downloads
						</summary>
						<div className="mt-3 space-y-2 text-muted-foreground">
							<p>
								Use one row per date, channel, campaign, and
								currency. Use YYYY-MM-DD dates, three-letter
								currency codes, and decimal amounts without
								currency symbols. Reports compare one currency
								at a time.
							</p>
							<p>
								Enter merchandise sales after discounts,
								excluding taxes and shipping. Enter refunds as
								positive amounts. For spend and variable costs,
								use zero for a confirmed zero and leave the
								amount blank when unknown.
							</p>
							<p>
								Variable costs include the cost of goods sold,
								fulfillment, payment fees, and other per-order
								expenses.
							</p>
							<div className="flex flex-wrap gap-2 pt-1">
								<Button
									type="button"
									size="sm"
									variant="outline"
									onClick={() =>
										downloadCsv(
											TEMPLATE_CSV,
											"campaign-template.csv",
										)
									}
								>
									Download template
								</Button>
								<Button
									type="button"
									size="sm"
									variant="outline"
									onClick={() =>
										downloadCsv(
											SAMPLE_CSV,
											"campaign-example.csv",
										)
									}
								>
									Download example
								</Button>
							</div>
						</div>
					</details>
				</Card>
				{source && (
					<ReportResults key={source.version} rows={source.rows} />
				)}
			</div>
		</div>
	);
}
