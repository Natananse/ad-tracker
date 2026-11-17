import { Text, Container } from "@react-email/components";
import React from "react";
import Wrapper from "../src/components/Wrapper";
import PrimaryButton from "../src/components/PrimaryButton";

interface ProductUpdateProps {
	title: string;
	content: React.ReactNode;
	type: "product" | "stats" | "announcement";
	appUrl: string;
}

export function ProductUpdate({
	title,
	content,
	type,
	appUrl,
}: ProductUpdateProps) {
	const typeLabel = {
		product: "🚀 Product Update",
		stats: "📊 Monthly Stats",
		announcement: "📢 Announcement",
	}[type];

	return (
		<Wrapper>
			<Text className="text-lg font-bold mb-4">{typeLabel}</Text>
			<Text className="text-2xl font-bold mb-6">{title}</Text>

			<Container className="bg-muted p-6 rounded-lg mb-6">
				<div className="prose prose-sm dark:prose-invert max-w-none">
					{content}
				</div>
			</Container>

			<PrimaryButton href={appUrl}>View Full Update &rarr;</PrimaryButton>

			<Text className="text-muted-foreground text-sm mt-6">
				Stay updated with our latest product improvements and features.
			</Text>
		</Wrapper>
	);
}

ProductUpdate.PreviewProps = {
	title: "New Dashboard Features",
	content: <p>We've added powerful new analytics to your dashboard.</p>,
	type: "product" as const,
	appUrl: "https://example.com",
};

export default ProductUpdate;
