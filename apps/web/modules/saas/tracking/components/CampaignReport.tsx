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
	FileSpreadsheetIcon,
	FolderIcon,
	UploadIcon,
} from "lucide-react";
import { useLocale } from "next-intl";
import { type ChangeEvent, useRef, useState } from "react";
import {
	type CampaignDay,
	parseCampaignCsv,
	SAMPLE_CSV,
	TEMPLATE_CSV,
} from "../lib/campaign-report";
import { downloadReportFile } from "../lib/download-report-file";
import { ReportResults } from "./CampaignReportResults";
import {
	AttributionEvidence,
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

export function CampaignReport({
	viewerId,
	organizationId,
}: {
	viewerId: string;
	organizationId?: string;
}) {
	const locale = useLocale();
	const input = useRef<HTMLInputElement>(null);
	const [preview, setPreview] = useState<ReportPreview | null>(null);
	const [version, setVersion] = useState(0);
	const [alert, setAlert] = useState("");
	const [notice, setNotice] = useState("");
	const [reading, setReading] = useState(false);
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
	const busy = reading || save.isPending;
	const displayKey = preview ? `preview-${version}` : saved?.revision;
	const firstReport = saved && !saved.revision && !preview;
	const WorkspaceIcon = organizationId ? Building2Icon : FolderIcon;

	function showPreview(data: Omit<ReportPreview, "expectedRevision">) {
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
		setAlert("");
		setNotice("");
		setReading(true);
		try {
			if (file.size > 2 * 1024 * 1024) {
				throw new Error("Choose a CSV file of 2 MiB or less.");
			}
			const data = parseCampaignCsv(await file.text());
			if (data.length > 10000) {
				throw new Error("A report supports up to 10,000 daily totals.");
			}
			if (
				data.some(
					(row) =>
						row.channel.length > 200 || row.campaign.length > 200,
				)
			) {
				throw new Error(
					"Use 200 characters or fewer for campaign and channel names.",
				);
			}
			showPreview({
				name: file.name,
				sample: false,
				rows: data,
				attributionSource: null,
				attribution: null,
			});
		} catch (cause) {
			setAlert(
				cause instanceof Error
					? cause.message
					: "The CSV could not be read.",
			);
		} finally {
			setReading(false);
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
		<div className="min-w-0 space-y-6">
			<header className="space-y-2">
				<p className="mb-3 flex items-center gap-2 font-medium text-muted-foreground text-sm">
					<WorkspaceIcon className="size-4" aria-hidden="true" />
					{organizationId
						? "Organization workspace"
						: "Personal workspace"}
				</p>
				<h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
					Campaign report
				</h1>
				<p className="max-w-2xl text-pretty text-muted-foreground">
					Compare what each campaign earns after refunds, ad spend,
					and variable costs.
				</p>
			</header>
			<Card className="overflow-hidden">
				<div className="relative isolate flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-b border-teal-900/10 bg-teal-50/80 p-5 sm:p-6 dark:border-teal-200/10 dark:bg-teal-950/35">
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-1/3 bg-[repeating-linear-gradient(90deg,currentColor_0_1px,transparent_1px_20px)] text-teal-900/[0.045] sm:block dark:text-teal-200/[0.055]"
					/>
					<div className="flex min-w-0 flex-1 basis-80 items-start gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-teal-800/15 bg-card text-teal-800 dark:border-teal-300/20 dark:text-teal-300">
							<FileSpreadsheetIcon
								className="size-5"
								aria-hidden="true"
							/>
						</div>
						<div className="min-w-0 space-y-1">
							<h2 className="font-semibold text-lg leading-tight">
								{firstReport
									? "Import your first report"
									: "Report data"}
							</h2>
							<p className="break-words text-muted-foreground text-sm leading-relaxed">
								{preview?.sample
									? "Sample data · Preview only"
									: preview
										? `Import preview · ${preview.name}`
										: saved?.revision
											? "Saved report"
											: report.isPending
												? "Loading your saved report…"
												: "Upload daily campaign totals as a CSV, or explore the example data."}
								{rows.length > 0 &&
									` · ${rows.length.toLocaleString(locale)} daily ${rows.length === 1 ? "record" : "records"}`}
							</p>
						</div>
					</div>
					<div className="flex flex-wrap gap-2">
						<input
							ref={input}
							type="file"
							accept=".csv,text/csv"
							aria-label="Campaign CSV file"
							hidden
							disabled={busy}
							onChange={importFile}
						/>
						<Button
							type="button"
							variant={preview ? "outline" : "primary"}
							className={
								preview
									? "bg-card"
									: "bg-teal-800 text-white shadow-none hover:bg-teal-900 dark:bg-teal-300 dark:text-teal-950 dark:hover:bg-teal-200"
							}
							disabled={busy}
							onClick={() => input.current?.click()}
						>
							<UploadIcon className="size-4" aria-hidden="true" />
							Import CSV
						</Button>
						<Button
							type="button"
							variant="outline"
							className="bg-card"
							disabled={busy}
							onClick={() =>
								showPreview({
									name: "Example data",
									sample: true,
									rows: parseCampaignCsv(SAMPLE_CSV),
									attributionSource: null,
									attribution: null,
								})
							}
						>
							Load example
						</Button>
					</div>
				</div>
				<div className="space-y-4 p-5 sm:px-6">
					{preview && (
						<div className="flex flex-wrap items-center gap-2">
							{!preview.sample && saved?.canEdit && (
								<Button
									type="button"
									variant="primary"
									className="bg-teal-800 text-white shadow-none hover:bg-teal-900 dark:bg-teal-300 dark:text-teal-950 dark:hover:bg-teal-200"
									disabled={
										busy ||
										preview.expectedRevision !==
											saved.revision
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
								variant="ghost"
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
					)}
					{preview &&
						!preview.sample &&
						saved &&
						preview.expectedRevision !== saved.revision &&
						!alert && (
							<Alert>
								The saved report has changed. Close the preview
								to review the latest version before importing
								again.
							</Alert>
						)}
					{saved && !saved.canEdit && (
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
									Download template
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
				</div>
			</Card>
			{rows.length > 0 && <ReportResults key={displayKey} rows={rows} />}
			{source?.attribution && source.attributionSource && (
				<AttributionEvidence
					key={`evidence-${displayKey}`}
					result={source.attribution}
					source={source.attributionSource}
				/>
			)}
		</div>
	);
}
