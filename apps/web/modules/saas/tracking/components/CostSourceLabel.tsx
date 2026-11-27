import type { CostSource } from "@repo/api/modules/tracking/workspace-costs";

const labels: Record<CostSource, string> = {
	entered: "Entered costs",
	estimated: "Estimated from settings",
	mixed: "Entered and estimated costs",
	unknown: "Costs incomplete",
};

export function CostSourceLabel({ source }: { source: CostSource }) {
	return <span className="block text-xs font-normal">{labels[source]}</span>;
}
