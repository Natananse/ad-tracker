import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({
	datasourceUrl: process.env.DIRECT_URL || process.env.DATABASE_URL,
});
const createdAt = new Date("2026-01-01T00:00:00.000Z");
const userId = "demo-northstar-owner";
const organizationId = "demo-northstar";

try {
	await db.$transaction(async (transaction) => {
		await transaction.user.upsert({
			where: { id: userId },
			update: {},
			create: {
				id: userId,
				name: "Avery Bennett",
				email: "avery@northstar.example",
				emailVerified: false,
				onboardingComplete: true,
				createdAt,
				updatedAt: createdAt,
			},
		});
		await transaction.organization.upsert({
			where: { id: organizationId },
			update: {},
			create: {
				id: organizationId,
				slug: "northstar-demo",
				name: "Northstar Studio",
				createdAt,
			},
		});
		await transaction.member.upsert({
			where: { organizationId_userId: { organizationId, userId } },
			update: {},
			create: { organizationId, userId, role: "owner", createdAt },
		});
		await transaction.blogPost.upsert({
			where: { id: "demo-northstar-review" },
			update: {},
			create: {
				id: "demo-northstar-review",
				slug: "northstar-weekly-review",
				title: "Northstar’s weekly campaign review",
				excerpt: "How the team reviews sales, refunds, and campaign spend.",
				content: {
					type: "doc",
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "The team reviews the previous week’s orders and refunds before adjusting its advertising budget.",
								},
							],
						},
					],
				},
				tags: ["operations"],
				authorId: userId,
			},
		});
	});
} finally {
	await db.$disconnect();
}
