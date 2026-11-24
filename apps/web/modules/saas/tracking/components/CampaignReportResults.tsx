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
import {
	BanknoteIcon,
	ChartNoAxesColumnIncreasingIcon,
	CreditCardIcon,
	DownloadIcon,
	RotateCcwIcon,
} from "lucide-react";
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
import { CampaignComparison } from "./CampaignComparison";

const pageSize = 50;
const selectStyle =
	"h-9 w-full min-w-0 rounded-md border border-input bg-card px-2.5 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-ring";

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
		channel: "",
	});
	const [page, setPage] = useState(0);
	const channels = useMemo(
		() =>
			Array.from(
				new Set(
					rows
						.filter((row) => row.currency === filter.currency)
						.map((row) => row.channel),
				),
			).sort(),
		[rows, filter.currency],
	);
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
	const hasFilters = Boolean(filter.channel || filter.start || filter.end);
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
		setFilter((previous) => ({
			...previous,
			...(field === "currency" ? { channel: "" } : {}),
			[field]: value,
		}));
		setPage(0);
	}

	return (
		<section
			aria-label="Campaign performance"
			className="w-full min-w-0 space-y-4"
		>
			<Card className="space-y-5 p-4 sm:p-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h2 className="text-xl font-semibold tracking-tight">
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
				<div className="grid min-w-0 grid-cols-1 gap-3 min-[375px]:grid-cols-2 md:grid-cols-4">
					<div className="min-w-0 space-y-1.5">
						<Label htmlFor="report-currency">Currency</Label>
						<select
							id="report-currency"
							value={filter.currency}
							onChange={(event) =>
								changeFilter("currency", event.target.value)
							}
							className={selectStyle}
						>
							{currencies.map((currency) => (
								<option key={currency}>{currency}</option>
							))}
						</select>
					</div>
					<div className="min-w-0 space-y-1.5">
						<Label htmlFor="report-channel">Channel</Label>
						<select
							id="report-channel"
							value={filter.channel}
							className={selectStyle}
							onChange={(event) =>
								changeFilter("channel", event.target.value)
							}
						>
							<option value="">All channels</option>
							{channels.map((channel) => (
								<option key={channel}>{channel}</option>
							))}
						</select>
					</div>
					<div className="min-w-0 space-y-1.5">
						<Label htmlFor="report-start">From</Label>
						<Input
							id="report-start"
							type="date"
							className="min-w-0 text-sm"
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
					<div className="min-w-0 space-y-1.5">
						<Label htmlFor="report-end">Through</Label>
						<Input
							id="report-end"
							type="date"
							className="min-w-0 text-sm"
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
				<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted-foreground">
					<div role="status">
						{!invalidDates &&
							(summaries.length ? (
								<>
									<strong className="font-semibold text-foreground">
										{summaries.length.toLocaleString(
											locale,
										)}{" "}
										{summaries.length === 1
											? "campaign"
											: "campaigns"}
									</strong>
									{range && (
										<>
											{" "}
											· Available{" "}
											{dateFormat.formatRange(
												new Date(range.first),
												new Date(range.last),
											)}
										</>
									)}
								</>
							) : (
								"No campaigns match these filters."
							))}
					</div>
					{hasFilters && (
						<Button
							type="button"
							size="sm"
							variant="ghost"
							onClick={() => {
								setFilter({
									currency: filter.currency,
									channel: "",
									start: "",
									end: "",
								});
								setPage(0);
							}}
						>
							<RotateCcwIcon size={13} aria-hidden="true" /> Reset
							filters
						</Button>
					)}
				</div>
				{invalidDates && (
					<Alert id="report-date-error" variant="error">
						Choose an end date on or after the start date.
					</Alert>
				)}
			</Card>
			{summaries.length > 0 && (
				<>
					<dl className="grid gap-2 sm:grid-cols-3 sm:gap-3">
						{[
							{
								label: "Net revenue",
								value: money(overview.netRevenue),
								Icon: BanknoteIcon,
							},
							{
								label: "Ad spend",
								value: money(overview.spend),
								Icon: CreditCardIcon,
							},
							{
								label: "Return on ad spend",
								value:
									overview.roas === null
										? "N/A"
										: `${ratioFormat.format(overview.roas)}×`,
								Icon: ChartNoAxesColumnIncreasingIcon,
							},
						].map(({ label, value, Icon }) => (
							<div
								key={label}
								className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-2 rounded-2xl border bg-card px-4 py-3 sm:block sm:px-5 sm:py-4"
							>
								<dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
									<Icon
										size={16}
										className="shrink-0 text-teal-700 dark:text-teal-400"
										aria-hidden="true"
									/>
									{label}
								</dt>
								<dd className="max-w-full break-words text-xl font-semibold tracking-tight tabular-nums sm:mt-2 sm:text-3xl">
									{value}
								</dd>
							</div>
						))}
					</dl>
					<div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
						<CampaignComparison
							summaries={summaries}
							currency={filter.currency}
							locale={locale}
						/>
						<section
							aria-labelledby="contribution-heading"
							className="min-w-0 rounded-2xl border border-teal-950 bg-teal-950 p-5 text-teal-50 sm:p-6 dark:border-teal-800"
						>
							<h3
								id="contribution-heading"
								className="text-base font-semibold"
							>
								Contribution after ads
							</h3>
							<p className="my-3 break-words text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
								{money(overview.contribution, "Incomplete")}
							</p>
							<dl className="divide-y divide-teal-50/15 border-t border-teal-50/20 text-sm">
								{[
									[
										"Merchandise sales",
										money(overview.sales),
									],
									["Refunds", money(-overview.refunds)],
									[
										"Ad spend",
										money(
											overview.spend === null
												? null
												: -overview.spend,
										),
									],
									[
										"Variable costs",
										money(
											overview.costs === null
												? null
												: -overview.costs,
										),
									],
								].map(([label, value]) => (
									<div
										key={label}
										className="flex flex-wrap items-baseline justify-between gap-x-2 py-2"
									>
										<dt className="text-teal-100">
											{label}
										</dt>
										<dd className="max-w-full break-words font-medium tabular-nums">
											{value}
										</dd>
									</div>
								))}
							</dl>
						</section>
					</div>
					<Card className="min-w-0 overflow-hidden">
						<h3 className="border-b px-4 py-4 text-lg font-semibold tracking-tight sm:px-6">
							Campaign details
						</h3>
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
									.slice(
										page * pageSize,
										(page + 1) * pageSize,
									)
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
												className="min-w-32 max-w-xs break-words p-4 text-left font-medium"
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
										(page + 1) * pageSize >=
										summaries.length
									}
									onClick={() => setPage(page + 1)}
								>
									Next
								</Button>
							</div>
						)}
						<p className="border-t px-4 py-4 text-muted-foreground text-sm sm:px-6">
							Net revenue is merchandise sales after discounts,
							less refunds. ROAS divides net revenue by ad spend
							and requires known, positive spend. Contribution
							subtracts ad spend and variable costs from net
							revenue and requires both inputs on every included
							day.
						</p>
					</Card>
				</>
			)}
		</section>
	);
}
