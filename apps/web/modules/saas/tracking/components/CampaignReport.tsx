"use client";

import { ORPCError } from "@orpc/client";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert } from "@ui/components/alert";
import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import {
	Building2Icon,
	DownloadIcon,
	FolderIcon,
	UploadIcon,
} from "lucide-react";
import { useLocale } from "next-intl";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
	CampaignCsvError,
	type CampaignCsvIssue,
	type CampaignDay,
	parseCampaignCsv,
	SAMPLE_CSV,
	TEMPLATE_CSV,
} from "../lib/campaign-report";
import { downloadReportFile } from "../lib/download-report-file";
import { ReportResults } from "./CampaignReportResults";
import { FirstCampaignReport } from "./FirstCampaignReport";
import {
	type AttributionSource,
	OrderAttributionImport,
	type OrderEvidence,
} from "./OrderAttributionImport";

interface ReportPreview {
	name: string;
	sample: boolean;
	rows: CampaignDay[];
	attributionSource: AttributionSource | null;
	attribution: OrderEvidence | null;
	expectedRevision: string | null;
}

const issuesPerPage = 25;

function CsvProblems({
	name,
	issues,
	onChoose,
	busy,
}: {
	name: string;
	issues: CampaignCsvIssue[];
	onChoose: () => void;
	busy: boolean;
}) {
	const [page, setPage] = useState(0);
	const heading = useRef<HTMLHeadingElement>(null);
	useEffect(() => {
		heading.current?.focus();
	}, []);
	const start = page * issuesPerPage;
	const end = Math.min(start + issuesPerPage, issues.length);
	return (
		<section
			aria-label="CSV import errors"
			className="space-y-3 rounded-lg border border-destructive/35 bg-card p-4 text-sm"
		>
			<h2
				ref={heading}
				tabIndex={-1}
				className="break-words font-semibold"
			>
				{issues.length.toLocaleString()}{" "}
				{issues.length === 1 ? "problem" : "problems"} in {name}
			</h2>
			<p>Correct the listed cells, then choose the file again.</p>
			<ul className="space-y-1.5">
				{issues.slice(start, end).map((issue, index) => (
					<li
						key={`${issue.row}/${issue.column}/${start + index}`}
						className="break-words"
					>
						<strong>
							Row {issue.row} · {issue.column}
						</strong>{" "}
						{issue.message}
					</li>
				))}
			</ul>
			{issues.length > issuesPerPage && (
				<div className="flex flex-wrap items-center gap-2">
					<span role="status">
						Problems {start + 1}–{end} of {issues.length}
					</span>
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={!page}
						onClick={() => setPage(page - 1)}
					>
						Previous problems
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={end === issues.length}
						onClick={() => setPage(page + 1)}
					>
						Next problems
					</Button>
				</div>
			)}
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={busy}
				onClick={onChoose}
			>
				Choose corrected CSV
			</Button>
		</section>
	);
}

export function CampaignReport({
	viewerId,
	organizationId,
	organizationName,
}: {
	viewerId: string;
	organizationId?: string;
	organizationName?: string;
}) {
	const locale = useLocale();
	const input = useRef<HTMLInputElement>(null);
	const previewHeading = useRef<HTMLHeadingElement>(null);
	const [preview, setPreview] = useState<ReportPreview | null>(null);
	const [version, setVersion] = useState(0);
	const [alert, setAlert] = useState("");
	const [notice, setNotice] = useState("");
	const [reading, setReading] = useState(false);
	const [checkingCsv, setCheckingCsv] = useState("");
	const [csvProblems, setCsvProblems] = useState<{
		name: string;
		issues: CampaignCsvIssue[];
	} | null>(null);
	const report = useQuery(
		orpc.tracking.getReport.queryOptions({
			input: { organizationId },
			queryKey: ["campaign-report", viewerId, organizationId ?? null],
		}),
	);
	const save = useMutation(orpc.tracking.saveReport.mutationOptions());
	const saved = report.isSuccess ? report.data : undefined;
	const source = preview ?? saved;
	const rows = source?.rows ?? [];
	const busy = reading || save.isPending || Boolean(checkingCsv);
	const displayKey = preview ? `preview-${version}` : saved?.revision;
	const firstReport = saved && !saved.revision && !preview;
	const WorkspaceIcon = organizationId ? Building2Icon : FolderIcon;

	useEffect(() => {
		if (preview) {
			previewHeading.current?.focus();
		}
	}, [preview]);

	function openExample() {
		showPreview({
			name: "Example report",
			sample: true,
			rows: parseCampaignCsv(SAMPLE_CSV),
			attributionSource: null,
			attribution: null,
		});
	}

	function showPreview(data: Omit<ReportPreview, "expectedRevision">) {
		setCsvProblems(null);
		setPreview({ ...data, expectedRevision: saved?.revision ?? null });
		setVersion((previous) => previous + 1);
		setNotice("");
		setAlert("");
	}

	async function importFile(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) {
			return;
		}
		setPreview(null);
		setCsvProblems(null);
		setAlert("");
		setNotice("");
		setCheckingCsv(file.name);
		try {
			if (file.size > 2 * 1024 * 1024) {
				throw new Error("Choose a CSV file of 2 MiB or less.");
			}
			const data = parseCampaignCsv(await file.text());
			showPreview({
				name: file.name,
				sample: false,
				rows: data,
				attributionSource: null,
				attribution: null,
			});
		} catch (cause) {
			if (cause instanceof CampaignCsvError) {
				setCsvProblems({ name: file.name, issues: cause.issues });
			} else {
				setAlert(
					cause instanceof Error
						? cause.message
						: "The CSV could not be read. Choose the file again.",
				);
			}
		} finally {
			setCheckingCsv("");
		}
	}

	async function savePreview() {
		if (!preview || preview.sample || !saved?.canEdit) {
			return;
		}
		setReading(true);
		setAlert("");
		setNotice("");
		try {
			await save.mutateAsync({
				organizationId,
				expectedRevision: preview.expectedRevision,
				...(preview.attributionSource
					? { attributionSource: preview.attributionSource }
					: { rows: preview.rows }),
			});
			await report.refetch();
			setPreview(null);
			setNotice("Report saved.");
		} catch (cause) {
			if (cause instanceof ORPCError && cause.code === "CONFLICT") {
				setAlert(
					"The saved report changed after this preview opened. Close the preview to review the latest version before importing again.",
				);
				await report.refetch();
			} else {
				setAlert(
					"The report could not be saved. Your preview is still open.",
				);
			}
		} finally {
			setReading(false);
		}
	}

	return (
		<div className="min-w-0 space-y-5">
			<header className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
				<div className="min-w-0">
					<p className="mb-3 flex items-center gap-2 break-words text-sm font-medium text-muted-foreground">
						<WorkspaceIcon
							className="size-4 shrink-0"
							aria-hidden="true"
						/>
						{organizationId
							? (organizationName ?? "Organization workspace")
							: "Personal workspace"}
					</p>
					<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
						Campaign report
					</h1>
					<p className="mt-2 max-w-2xl text-muted-foreground">
						See which campaigns earn money after refunds, ad spend,
						and variable costs.
					</p>
				</div>
				{!firstReport && (!report.isPending || preview) && (
					<Button
						type="button"
						variant="outline"
						onClick={() => input.current?.click()}
						disabled={busy}
					>
						<UploadIcon className="size-4" aria-hidden="true" />{" "}
						Import CSV
					</Button>
				)}
			</header>
			<input
				ref={input}
				type="file"
				accept=".csv,text/csv"
				aria-label="Campaign CSV file"
				hidden
				disabled={busy}
				onChange={importFile}
			/>
			{checkingCsv && (
				<p
					role="status"
					className="break-words text-sm text-muted-foreground"
				>
					Checking {checkingCsv}…
				</p>
			)}
			{csvProblems && (
				<CsvProblems
					{...csvProblems}
					busy={busy}
					onChoose={() => input.current?.click()}
				/>
			)}
			{report.isPending && !preview && (
				<p role="status" className="text-sm text-muted-foreground">
					Loading your report…
				</p>
			)}
			{firstReport && (
				<FirstCampaignReport
					busy={busy}
					canEdit={saved.canEdit}
					onImport={() => input.current?.click()}
					onExample={openExample}
				/>
			)}
			{preview && (
				<section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-400/30 dark:bg-indigo-950/45">
					<div className="min-w-0">
						<h2
							ref={previewHeading}
							tabIndex={-1}
							className="break-words font-semibold"
						>
							{preview.sample
								? "Sample report"
								: `Import preview · ${preview.name}`}
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							{preview.sample
								? "Example data"
								: "Unsaved changes"}{" "}
							· {rows.length.toLocaleString(locale)} daily{" "}
							{rows.length === 1 ? "record" : "records"}
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						{!preview.sample && saved?.canEdit && (
							<Button
								type="button"
								variant="primary"
								disabled={
									busy ||
									preview.expectedRevision !== saved.revision
								}
								loading={save.isPending}
								onClick={savePreview}
							>
								{saved.revision
									? "Replace saved report"
									: "Save report"}
							</Button>
						)}
						<Button
							type="button"
							variant="outline"
							disabled={busy}
							onClick={() => {
								setPreview(null);
								setAlert("");
								setNotice("");
							}}
						>
							Close preview
						</Button>
					</div>
				</section>
			)}
			{preview &&
				!preview.sample &&
				saved &&
				preview.expectedRevision !== saved.revision &&
				!alert && (
					<Alert>
						The saved report has changed. Close the preview to
						review the latest version before importing again.
					</Alert>
				)}
			{saved && !saved.canEdit && !firstReport && (
				<p className="text-muted-foreground text-sm">
					Organization owners and admins can save reports.
				</p>
			)}
			{report.isError && (
				<Alert variant="error">
					Your saved report could not be loaded.{" "}
					<button
						type="button"
						className="font-medium underline"
						disabled={report.isFetching}
						onClick={() => report.refetch()}
					>
						Retry
					</button>
				</Alert>
			)}
			{alert && <Alert variant="error">{alert}</Alert>}
			<p role="status" className="text-sm empty:hidden">
				{notice}
			</p>

			{rows.length > 0 && (
				<ReportResults
					key={displayKey}
					rows={rows}
					attribution={
						source?.attribution && source.attributionSource
							? {
									result: source.attribution,
									source: source.attributionSource,
								}
							: undefined
					}
				/>
			)}
			<Card className="space-y-4 p-5 sm:px-6">
				<h2 className="text-lg font-semibold">Import options</h2>
				<div className="[&>details]:border-0 [&>details]:pt-0 [&_summary]:rounded-sm [&_summary]:focus-visible:outline-teal-700 dark:[&_summary]:focus-visible:outline-teal-300">
					<OrderAttributionImport
						key={displayKey}
						source={source?.attributionSource ?? null}
						busy={busy}
						setBusy={setReading}
						onPreview={(result, attributionSource) =>
							showPreview({
								name: "Order attribution",
								sample: false,
								rows: result.rows,
								attribution: result,
								attributionSource,
							})
						}
					/>
				</div>
				<details className="border-t pt-3 text-sm">
					<summary className="w-fit cursor-pointer rounded-sm font-medium focus-visible:outline-teal-700 dark:focus-visible:outline-teal-300">
						CSV format and downloads
					</summary>
					<div className="mt-3 space-y-2 text-muted-foreground">
						<p>
							Use one row per date, channel, campaign, and
							currency. Use YYYY-MM-DD dates, three-letter
							currency codes, and decimal amounts without currency
							symbols. Use one currency per CSV.
						</p>
						<p>
							Enter merchandise sales after discounts, excluding
							taxes and shipping. Enter refunds as positive
							amounts. For spend and variable costs, use zero for
							a confirmed zero and leave the amount blank when
							unknown.
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
									downloadReportFile(
										TEMPLATE_CSV,
										"campaign-template.csv",
									)
								}
							>
								<DownloadIcon
									className="size-3.5"
									aria-hidden="true"
								/>
								Download CSV template
							</Button>
							<Button
								type="button"
								size="sm"
								variant="outline"
								onClick={() =>
									downloadReportFile(
										SAMPLE_CSV,
										"campaign-example.csv",
									)
								}
							>
								<DownloadIcon
									className="size-3.5"
									aria-hidden="true"
								/>
								Download example
							</Button>
						</div>
					</div>
				</details>
				{saved?.revision && !preview?.sample && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={openExample}
						disabled={busy}
					>
						Explore sample report
					</Button>
				)}
			</Card>
		</div>
	);
}
