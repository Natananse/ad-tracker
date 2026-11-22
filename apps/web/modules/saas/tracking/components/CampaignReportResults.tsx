"use client";

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
import { DownloadIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";
import {
	buildCampaignReport,
	type CampaignDay,
	campaignOverview,
	formatMoney,
	makeReportCsv,
} from "../lib/campaign-report";
import { downloadReportFile } from "../lib/download-report-file";

const pageSize = 50;

export function ReportResults({ rows }: { rows: CampaignDay[] }) {
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
	const overview = campaignOverview(summaries);
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
							downloadReportFile(
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
				{summaries.length > 0 && (
					<dl className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
						{[
							["Net revenue", money(overview.netRevenue)],
							["Ad spend", money(overview.spend)],
							[
								"Return on ad spend",
								overview.roas === null
									? "N/A"
									: `${ratioFormat.format(overview.roas)}×`,
							],
							[
								"Contribution after ads",
								money(overview.contribution, "Incomplete"),
							],
						].map(([label, value]) => (
							<div
								key={label}
								className="min-w-0 rounded-xl border bg-muted/50 p-4"
							>
								<dt className="text-sm text-muted-foreground">
									{label}
								</dt>
								<dd className="mt-2 break-words text-xl font-semibold tracking-tight tabular-nums">
									{value}
								</dd>
							</div>
						))}
					</dl>
				)}
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
										<TableCell
											className={`text-right font-semibold ${summary.contribution === null ? "text-muted-foreground" : summary.contribution < 0 ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"}`}
										>
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
