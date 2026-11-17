"use client";

import { useTheme } from "next-themes";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { Card } from "@ui/components/card";
import { useEffect, useState } from "react";

const revenueData = [
	{ month: "Jan", revenue: 4000, users: 2400, subscriptions: 1200 },
	{ month: "Feb", revenue: 3000, users: 1398, subscriptions: 1100 },
	{ month: "Mar", revenue: 2000, users: 9800, subscriptions: 1500 },
	{ month: "Apr", revenue: 2780, users: 3908, subscriptions: 1300 },
	{ month: "May", revenue: 1890, users: 4800, subscriptions: 1600 },
	{ month: "Jun", revenue: 2390, users: 3800, subscriptions: 1400 },
];

const lineData = [
	{
		id: "Active Users",
		data: [
			{ x: "Jan", y: 100 },
			{ x: "Feb", y: 150 },
			{ x: "Mar", y: 200 },
			{ x: "Apr", y: 250 },
			{ x: "May", y: 300 },
			{ x: "Jun", y: 350 },
		],
	},
	{
		id: "New Users",
		data: [
			{ x: "Jan", y: 50 },
			{ x: "Feb", y: 75 },
			{ x: "Mar", y: 100 },
			{ x: "Apr", y: 125 },
			{ x: "May", y: 150 },
			{ x: "Jun", y: 175 },
		],
	},
];

const pieData = [
	{ id: "Free Plan", label: "Free Plan", value: 35 },
	{ id: "Pro Plan", label: "Pro Plan", value: 45 },
	{ id: "Enterprise", label: "Enterprise", value: 20 },
];

const heatmapData = [
	{
		id: "Mon",
		data: [
			{ x: "Morning", y: 85 },
			{ x: "Afternoon", y: 92 },
			{ x: "Evening", y: 78 },
		],
	},
	{
		id: "Tue",
		data: [
			{ x: "Morning", y: 88 },
			{ x: "Afternoon", y: 95 },
			{ x: "Evening", y: 81 },
		],
	},
	{
		id: "Wed",
		data: [
			{ x: "Morning", y: 90 },
			{ x: "Afternoon", y: 98 },
			{ x: "Evening", y: 84 },
		],
	},
	{
		id: "Thu",
		data: [
			{ x: "Morning", y: 87 },
			{ x: "Afternoon", y: 93 },
			{ x: "Evening", y: 79 },
		],
	},
	{
		id: "Fri",
		data: [
			{ x: "Morning", y: 92 },
			{ x: "Afternoon", y: 99 },
			{ x: "Evening", y: 88 },
		],
	},
	{
		id: "Sat",
		data: [
			{ x: "Morning", y: 75 },
			{ x: "Afternoon", y: 82 },
			{ x: "Evening", y: 70 },
		],
	},
	{
		id: "Sun",
		data: [
			{ x: "Morning", y: 72 },
			{ x: "Afternoon", y: 78 },
			{ x: "Evening", y: 65 },
		],
	},
];

export function Dashboard() {
	const { theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isDark = theme === "dark";
	const textColor = isDark ? "#e5e7eb" : "#1f2937";
	const gridColor = isDark ? "#374151" : "#e5e7eb";
	const axisColor = isDark ? "#9ca3af" : "#6b7280";

	const chartTheme = {
		background: "transparent",
		text: {
			fontSize: 12,
			fill: textColor,
			outlineWidth: 0,
			outlineColor: "transparent",
		},
		axis: {
			domain: { line: { stroke: gridColor, strokeWidth: 1 } },
			legend: { text: { fontSize: 12, fill: textColor } },
			ticks: {
				line: { stroke: gridColor, strokeWidth: 1 },
				text: { fontSize: 11, fill: axisColor },
			},
		},
		grid: { line: { stroke: gridColor, strokeWidth: 0.5 } },
		legends: { text: { fontSize: 12, fill: textColor } },
		tooltip: {
			container: {
				background: isDark ? "#1f2937" : "#ffffff",
				color: textColor,
				fontSize: 12,
				borderRadius: "4px",
				boxShadow: "0 3px 9px rgba(0, 0, 0, 0.5)",
			},
		},
	};

	if (!mounted) {
		return null;
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
					<div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
						Total Users
					</div>
					<div className="text-4xl font-bold mt-3 text-blue-900 dark:text-blue-100">
						12,543
					</div>
					<div className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
						↑ 12% from last month
					</div>
				</Card>
				<Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
					<div className="text-sm font-semibold text-green-600 dark:text-green-400">
						Total Revenue
					</div>
					<div className="text-4xl font-bold mt-3 text-green-900 dark:text-green-100">
						$45,231
					</div>
					<div className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
						↑ 8% from last month
					</div>
				</Card>
				<Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
					<div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
						Active Subscriptions
					</div>
					<div className="text-4xl font-bold mt-3 text-purple-900 dark:text-purple-100">
						1,234
					</div>
					<div className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">
						↑ 5% from last month
					</div>
				</Card>
				<Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
					<div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
						Conversion Rate
					</div>
					<div className="text-4xl font-bold mt-3 text-orange-900 dark:text-orange-100">
						3.24%
					</div>
					<div className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
						↓ 0.5% from last month
					</div>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<Card className="p-6 lg:col-span-2">
					<h3 className="text-lg font-bold mb-4 text-foreground">
						Revenue Trend
					</h3>
					<div style={{ height: 350 }}>
						<ResponsiveBar
							data={revenueData}
							keys={["revenue", "users", "subscriptions"]}
							indexBy="month"
							margin={{
								top: 20,
								right: 130,
								bottom: 50,
								left: 70,
							}}
							padding={0.4}
							valueScale={{ type: "linear" }}
							indexScale={{ type: "band", round: true }}
							colors={{ scheme: "spectral" }}
							borderColor={{
								from: "color",
								modifiers: [["darker", 1.6]],
							}}
							axisTop={null}
							axisRight={null}
							axisBottom={{
								tickSize: 5,
								tickPadding: 5,
								tickRotation: 0,
								legend: "Month",
								legendPosition: "middle",
								legendOffset: 40,
							}}
							axisLeft={{
								tickSize: 5,
								tickPadding: 5,
								tickRotation: 0,
								legend: "Amount ($)",
								legendPosition: "middle",
								legendOffset: -50,
							}}
							legends={[
								{
									dataFrom: "keys",
									anchor: "bottom-right",
									direction: "column",
									justify: false,
									translateX: 120,
									translateY: 0,
									itemsSpacing: 8,
									itemWidth: 100,
									itemHeight: 20,
									itemDirection: "left-to-right",
									symbolSize: 20,
									symbolShape: "square",
								},
							]}
							theme={chartTheme}
							animate={true}
							motionConfig="molasses"
						/>
					</div>
				</Card>

				<Card className="p-6">
					<h3 className="text-lg font-bold mb-4 text-foreground">
						Plan Distribution
					</h3>
					<div style={{ height: 350 }}>
						<ResponsivePie
							data={pieData}
							margin={{
								top: 40,
								right: 80,
								bottom: 40,
								left: 80,
							}}
							innerRadius={0.5}
							padAngle={0.7}
							cornerRadius={3}
							colors={{ scheme: "set2" }}
							borderWidth={2}
							borderColor={{
								from: "color",
								modifiers: [["darker", 0.2]],
							}}
							arcLabelsTextColor={textColor}
							theme={chartTheme}
							animate={true}
							motionConfig="molasses"
							legends={[
								{
									anchor: "bottom",
									direction: "row",
									justify: false,
									translateX: 0,
									translateY: 56,
									itemsSpacing: 8,
									itemWidth: 100,
									itemHeight: 18,
									itemTextColor: textColor,
									itemDirection: "left-to-right",
									symbolSize: 18,
									symbolShape: "circle",
								},
							]}
						/>
					</div>
				</Card>
			</div>

			<Card className="p-6">
				<h3 className="text-lg font-bold mb-4 text-foreground">
					User Growth Analytics
				</h3>
				<div style={{ height: 350 }}>
					<ResponsiveLine
						data={lineData}
						margin={{ top: 20, right: 110, bottom: 50, left: 70 }}
						xScale={{ type: "point" }}
						yScale={{
							type: "linear",
							min: "auto",
							max: "auto",
							stacked: false,
							reverse: false,
						}}
						yFormat=" >-.0f"
						curve="catmullRom"
						axisTop={null}
						axisRight={null}
						axisBottom={{
							tickSize: 5,
							tickPadding: 5,
							tickRotation: 0,
							legend: "Month",
							legendOffset: 40,
							legendPosition: "middle",
						}}
						axisLeft={{
							tickSize: 5,
							tickPadding: 5,
							tickRotation: 0,
							legend: "Users",
							legendOffset: -50,
							legendPosition: "middle",
						}}
						pointSize={10}
						pointColor={{ theme: "background" }}
						pointBorderWidth={3}
						pointBorderColor={{ from: "serieColor" }}
						pointLabelYOffset={-12}
						useMesh={true}
						enableArea={true}
						areaOpacity={0.15}
						theme={chartTheme}
						legends={[
							{
								anchor: "bottom-right",
								direction: "column",
								justify: false,
								translateX: 100,
								translateY: 0,
								itemsSpacing: 8,
								itemDirection: "left-to-right",
								itemWidth: 80,
								itemHeight: 20,
								symbolSize: 12,
								symbolShape: "circle",
							},
						]}
						animate={true}
						motionConfig="molasses"
					/>
				</div>
			</Card>

			<Card className="p-6">
				<h3 className="text-lg font-bold mb-4 text-foreground">
					Engagement Heatmap
				</h3>
				<div style={{ height: 300 }}>
					<ResponsiveHeatMap
						data={heatmapData}
						margin={{ top: 20, right: 90, bottom: 60, left: 90 }}
						valueFormat=">-.2s"
						axisTop={{
							tickSize: 5,
							tickPadding: 5,
							tickRotation: -90,
							legend: "",
							legendOffset: 46,
						}}
						axisLeft={{
							tickSize: 5,
							tickPadding: 5,
							tickRotation: 0,
							legend: "Day",
							legendPosition: "middle",
							legendOffset: -70,
						}}
						colors={{ type: "sequential", scheme: "blues" }}
						emptyColor={gridColor}
						theme={chartTheme}
						legends={[
							{
								anchor: "bottom",
								translateX: 0,
								translateY: 30,
								length: 400,
								thickness: 8,
								direction: "row",
								tickPosition: "after",
								tickSize: 3,
								tickSpacing: 4,
								tickOverlap: false,
								tickFormat: ">-.2s",
								title: "Activity Level →",
								titleAlign: "start",
								titleOffset: 4,
							},
						]}
						animate={true}
						motionConfig="molasses"
					/>
				</div>
			</Card>
		</div>
	);
}
