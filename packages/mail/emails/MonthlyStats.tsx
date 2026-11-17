import { Text, Container } from "@react-email/components";
import React from "react";
import Wrapper from "../src/components/Wrapper";
import PrimaryButton from "../src/components/PrimaryButton";

interface MonthlyStatsProps {
	month: string;
	content: React.ReactNode;
	appUrl: string;
}

export function MonthlyStats({ month, content, appUrl }: MonthlyStatsProps) {
	return (
		<Wrapper>
			<Text className="text-lg font-bold mb-4">📊 Monthly Stats</Text>
			<Text className="text-2xl font-bold mb-6">
				{month} Performance Report
			</Text>

			<Container className="bg-muted p-6 rounded-lg mb-6">
				<div className="prose prose-sm dark:prose-invert max-w-none">
					{content}
				</div>
			</Container>

			<PrimaryButton href={appUrl}>
				View Detailed Analytics &rarr;
			</PrimaryButton>

			<Text className="text-muted-foreground text-sm mt-6">
				Check out your complete performance metrics and insights.
			</Text>
		</Wrapper>
	);
}

MonthlyStats.PreviewProps = {
	month: "December 2024",
	content: (
		<>
			<p>
				<strong>Total Users:</strong> 1,234
			</p>
			<p>
				<strong>Revenue:</strong> $45,678
			</p>
		</>
	),
	appUrl: "https://example.com",
};

export default MonthlyStats;
