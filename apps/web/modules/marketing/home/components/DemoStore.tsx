"use client";

import { computeAttribution } from "@repo/api/modules/tracking/attribution/compute";
import example from "@repo/api/modules/tracking/attribution/example.json";
import type { AttributionInput } from "@repo/api/modules/tracking/attribution/model";
import { ReportResults } from "@saas/tracking/components/CampaignReportResults";
import { AttributionEvidence } from "@saas/tracking/components/OrderAttributionImport";
import { StoreIcon } from "lucide-react";
import { useMemo, useState } from "react";

export function DemoStore() {
	const [model, setModel] = useState<AttributionInput["model"]>("last-click");
	const [windowDays, setWindowDays] = useState<7 | 28>(28);
	const source = useMemo(
		() => ({ snapshot: example, model, windowDays }),
		[model, windowDays],
	);
	const result = useMemo(() => computeAttribution(source), [source]);
	return (
		<div className="min-w-0 space-y-5">
			<header className="relative isolate flex min-w-0 flex-wrap items-end justify-between gap-5 overflow-hidden rounded-2xl border border-teal-900/15 bg-teal-50 p-5 sm:p-7 dark:border-teal-800/60 dark:bg-teal-950/50">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-1/2 bg-[repeating-linear-gradient(90deg,currentColor_0_1px,transparent_1px_24px)] text-teal-900/[0.04] dark:text-teal-200/[0.05]"
				/>
				<div className="min-w-0">
					<p className="mb-2 flex items-center gap-2 text-sm font-medium text-teal-800 dark:text-teal-300">
						<StoreIcon size={16} aria-hidden="true" /> Demo store
					</p>
					<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
						Campaign report
					</h1>
					<p className="mt-2 max-w-xl text-sm text-muted-foreground">
						Change the attribution model to see which campaign gets
						credit for each sample order.
					</p>
				</div>
				<div className="grid w-full gap-3 min-[375px]:grid-cols-2 md:w-auto">
					<label className="grid gap-1.5 text-sm font-medium">
						Attribution model
						<select
							className="h-10 w-full rounded-md border border-input bg-card px-3 text-foreground focus-visible:outline-2 focus-visible:outline-ring"
							value={model}
							onChange={(e) =>
								setModel(
									e.target.value === "first-click"
										? "first-click"
										: "last-click",
								)
							}
						>
							<option value="first-click">First click</option>
							<option value="last-click">Last click</option>
						</select>
					</label>
					<label className="grid gap-1.5 text-sm font-medium">
						Lookback window
						<select
							className="h-10 w-full rounded-md border border-input bg-card px-3 text-foreground focus-visible:outline-2 focus-visible:outline-ring"
							value={windowDays}
							onChange={(e) =>
								setWindowDays(e.target.value === "7" ? 7 : 28)
							}
						>
							<option value="7">7 days</option>
							<option value="28">28 days</option>
						</select>
					</label>
				</div>
			</header>
			<ReportResults rows={result.rows} />
			<AttributionEvidence source={source} result={result} />
		</div>
	);
}
