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
		<div className="space-y-5">
			<header className="flex flex-wrap items-end justify-between gap-5 rounded-xl border bg-card p-5 sm:p-7">
				<div>
					<p className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400">
						<StoreIcon size={16} /> Demo store
					</p>
					<h1 className="text-3xl font-bold tracking-tight">
						Campaign report
					</h1>
					<p className="mt-2 max-w-xl text-sm text-muted-foreground">
						Explore sample Shopify orders and ad spend. Switch
						attribution models to see how credit moves between
						campaigns.
					</p>
				</div>
				<div className="flex flex-wrap gap-3">
					<label className="grid gap-1.5 text-sm font-medium">
						Attribution model
						<select
							className="rounded-md border bg-background px-3 py-2"
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
							className="rounded-md border bg-background px-3 py-2"
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
