export const chartMetrics = [
	{
		key: "spend",
		label: "Ad spend",
		color: "text-blue-700 dark:text-blue-400",
		dash: "7 4",
	},
	{
		key: "netRevenue",
		label: "Net revenue",
		color: "text-teal-700 dark:text-teal-400",
		dash: undefined,
	},
	{
		key: "contribution",
		label: "Contribution",
		color: "text-amber-700 dark:text-amber-400",
		dash: "2 4",
	},
] as const;

export type ChartMetric = (typeof chartMetrics)[number]["key"];
