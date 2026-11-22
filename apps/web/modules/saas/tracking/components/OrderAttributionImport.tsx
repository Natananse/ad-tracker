"use client";

import example from "@repo/api/modules/tracking/attribution/example.json";
import { attributionSnapshot } from "@repo/api/modules/tracking/attribution/model";
import type { orpcClient } from "@shared/lib/orpc-client";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "@ui/components/alert";
import { Button } from "@ui/components/button";
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
import { useState } from "react";
import { downloadReportFile } from "../lib/download-report-file";

export type AttributionSource = Parameters<
	typeof orpcClient.tracking.attributeOrders
>[0];
type AttributionResult = Awaited<
	ReturnType<typeof orpcClient.tracking.attributeOrders>
>;
export type OrderEvidence = Pick<
	AttributionResult,
	"matchedOrders" | "totalOrders" | "evidence"
>;

export function OrderAttributionImport({
	source,
	busy,
	setBusy,
	onPreview,
}: {
	source: AttributionSource | null;
	busy: boolean;
	setBusy: (busy: boolean) => void;
	onPreview: (result: AttributionResult, source: AttributionSource) => void;
}) {
	const [file, setFile] = useState<File | null>(null);
	const [model, setModel] = useState<AttributionSource["model"]>(
		source?.model ?? "last-click",
	);
	const [windowDays, setWindowDays] = useState<
		AttributionSource["windowDays"]
	>(source?.windowDays ?? 7);
	const [error, setError] = useState("");
	const calculate = useMutation(
		orpc.tracking.attributeOrders.mutationOptions(),
	);

	async function preview() {
		setBusy(true);
		setError("");
		try {
			let snapshot = source?.snapshot;
			if (file) {
				if (file.size > 2 * 1024 * 1024) {
					throw new Error("Choose a JSON file of 2 MiB or less.");
				}
				let data: unknown;
				try {
					data = JSON.parse(await file.text());
				} catch {
					throw new Error("Choose a valid JSON file.");
				}
				const parsed = attributionSnapshot.safeParse(data);
				if (!parsed.success) {
					const issue = parsed.error.issues[0];
					throw new Error(
						`Check ${issue.path.join(".") || "the snapshot"}: ${issue.message}`,
					);
				}
				snapshot = parsed.data;
			}
			if (!snapshot) {
				throw new Error("Choose an order snapshot to preview.");
			}
			const input = { snapshot, model, windowDays };
			const result = await calculate.mutateAsync(input);
			onPreview(result, input);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: "The order report could not be calculated.",
			);
		} finally {
			setBusy(false);
		}
	}

	return (
		<details className="border-t pt-3 text-sm">
			<summary className="w-fit cursor-pointer font-medium">
				Order attribution
			</summary>
			<fieldset disabled={busy} className="mt-4 space-y-4">
				<p className="text-muted-foreground">
					Upload orders, refunds, eligible clicks and daily spend in
					one JSON file. The report credits each order to the first or
					last eligible click within the selected window.
				</p>
				<div className="grid gap-3 sm:grid-cols-2">
					<div className="space-y-1.5">
						<Label htmlFor="attribution-model">
							Attribution model
						</Label>
						<select
							id="attribution-model"
							value={model}
							onChange={(event) =>
								setModel(
									event.target.value === "first-click"
										? "first-click"
										: "last-click",
								)
							}
							className="h-9 w-full rounded-md border border-input bg-card px-3"
						>
							<option value="first-click">First click</option>
							<option value="last-click">Last click</option>
						</select>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="attribution-window">
							Lookback window
						</Label>
						<select
							id="attribution-window"
							value={windowDays}
							onChange={(event) =>
								setWindowDays(
									event.target.value === "28" ? 28 : 7,
								)
							}
							className="h-9 w-full rounded-md border border-input bg-card px-3"
						>
							<option value={7}>7 days</option>
							<option value={28}>28 days</option>
						</select>
					</div>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="attribution-file">
						Order snapshot (JSON)
					</Label>
					<Input
						id="attribution-file"
						type="file"
						accept=".json,application/json"
						onChange={(event) => {
							setFile(event.target.files?.[0] ?? null);
							setError("");
						}}
					/>
					{source && !file && (
						<p className="text-muted-foreground">
							Using the orders in the current report.
						</p>
					)}
				</div>
				<div className="flex flex-wrap gap-2">
					<Button
						type="button"
						variant="primary"
						disabled={busy || !(file || source)}
						onClick={preview}
						loading={calculate.isPending}
					>
						Preview order report
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() =>
							downloadReportFile(
								JSON.stringify(example, null, 2),
								"campaign-orders-example.json",
								"application/json",
							)
						}
					>
						Download example JSON
					</Button>
				</div>
				{error && <Alert variant="error">{error}</Alert>}
			</fieldset>
		</details>
	);
}

export function AttributionEvidence({
	result,
	source,
}: {
	result: OrderEvidence;
	source: AttributionSource;
}) {
	const [page, setPage] = useState(0);
	const pageSize = 25;
	return (
		<details className="rounded-2xl border bg-card p-4 sm:p-6">
			<summary className="cursor-pointer font-semibold">
				Order evidence · {result.matchedOrders} of {result.totalOrders}{" "}
				matched
			</summary>
			<p className="my-3 text-muted-foreground text-sm">
				{source.model === "first-click" ? "First click" : "Last click"}{" "}
				within {source.windowDays} days of payment. Times are in UTC.
			</p>
			<Table className="min-w-[38rem]">
				<caption className="sr-only">
					Attribution evidence by order
				</caption>
				<TableHeader>
					<TableRow>
						{[
							"Order",
							"Paid date",
							"Channel / campaign",
							"Credited click",
						].map((title) => (
							<TableHead key={title} scope="col">
								{title}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{result.evidence
						.slice(page * pageSize, (page + 1) * pageSize)
						.map((order) => (
							<TableRow key={order.orderId}>
								<TableCell className="break-all font-medium">
									{order.orderId}
								</TableCell>
								<TableCell>{order.date}</TableCell>
								<TableCell>
									{order.channel}
									<span className="block text-muted-foreground text-xs">
										{order.campaign}
									</span>
								</TableCell>
								<TableCell className="break-all">
									{order.clickId ?? "No eligible click"}
									{order.clickedAt && (
										<time
											className="block text-muted-foreground text-xs"
											dateTime={order.clickedAt}
										>
											{order.clickedAt}
										</time>
									)}
								</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>
			{result.evidence.length > pageSize && (
				<div className="mt-3 flex items-center justify-end gap-2 text-sm">
					<Button
						type="button"
						size="sm"
						variant="outline"
						disabled={page === 0}
						onClick={() => setPage(page - 1)}
					>
						Previous orders
					</Button>
					<span>
						Page {page + 1} of{" "}
						{Math.ceil(result.evidence.length / pageSize)}
					</span>
					<Button
						type="button"
						size="sm"
						variant="outline"
						disabled={
							(page + 1) * pageSize >= result.evidence.length
						}
						onClick={() => setPage(page + 1)}
					>
						Next orders
					</Button>
				</div>
			)}
		</details>
	);
}
