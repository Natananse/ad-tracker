import { ORPCError } from "@orpc/server";
import {
	type CampaignReportScope,
	db,
	type Prisma,
	readCampaignReport,
	replaceCampaignReport,
} from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../orpc/procedures";
import { attributeOrders } from "./attribution/attribute-orders";
import {
	AttributionInputError,
	computeAttribution,
} from "./attribution/compute";
import { type AttributionInput, attributionInput } from "./attribution/model";
import { campaignRows } from "./campaign-rows";

const reportScope = z.strictObject({
	organizationId: z.string().min(1).max(200).optional(),
});
const revisionInput = reportScope.extend({
	expectedRevision: z.uuid().nullable(),
});

async function reportAccess(
	tx: Prisma.TransactionClient,
	userId: string,
	organizationId: string | undefined,
	forWrite: boolean,
): Promise<{ scope: CampaignReportScope; canEdit: boolean }> {
	if (!organizationId) {
		return { scope: { userId }, canEdit: true };
	}
	// Hold the membership during an import so access cannot be revoked mid-write.
	const membership = forWrite
		? (
				await tx.$queryRaw<
					{ role: string }[]
				>`SELECT role FROM "member" WHERE "organizationId" = ${organizationId} AND "userId" = ${userId} FOR SHARE`
			)[0]
		: await tx.member.findUnique({
				where: { organizationId_userId: { organizationId, userId } },
				select: { role: true },
			});
	if (!membership) {
		throw new ORPCError("FORBIDDEN");
	}
	const canEdit = membership.role === "owner" || membership.role === "admin";
	if (forWrite && !canEdit) {
		throw new ORPCError("FORBIDDEN");
	}
	return { scope: { organizationId }, canEdit };
}

const getReport = protectedProcedure
	.route({
		method: "GET",
		path: "/tracking/report",
		tags: ["Tracking"],
		summary: "Read the workspace campaign report",
	})
	.input(reportScope)
	.handler(async ({ input, context }) => {
		const saved = await db.$transaction(
			async (tx) => {
				const { scope, canEdit } = await reportAccess(
					tx,
					context.user.id,
					input.organizationId,
					false,
				);
				return { ...(await readCampaignReport(tx, scope)), canEdit };
			},
			{ isolationLevel: "RepeatableRead", timeout: 30_000 },
		);
		const source =
			saved.attributionSource === null
				? null
				: attributionInput.parse(saved.attributionSource);
		return {
			...saved,
			attributionSource: source,
			attribution: source === null ? null : computeAttribution(source),
		};
	});

const saveReport = protectedProcedure
	.route({
		method: "POST",
		path: "/tracking/report",
		tags: ["Tracking"],
		summary: "Replace the workspace campaign report",
	})
	.input(
		z.union([
			revisionInput.extend({ rows: campaignRows }),
			revisionInput.extend({ attributionSource: attributionInput }),
		]),
	)
	.handler(async ({ input, context }) => {
		let source: AttributionInput | null = null;
		let rows: z.infer<typeof campaignRows>;
		if ("rows" in input) {
			rows = input.rows;
		} else {
			const { snapshot } = input.attributionSource;
			try {
				rows = campaignRows.parse(
					computeAttribution(input.attributionSource).rows,
				);
			} catch (error) {
				if (
					error instanceof AttributionInputError ||
					error instanceof z.ZodError
				) {
					throw new ORPCError("BAD_REQUEST", {
						message:
							"This snapshot cannot produce a valid campaign report.",
						cause: error,
					});
				}
				throw error;
			}
			source = {
				...input.attributionSource,
				snapshot: {
					...snapshot,
					orders: snapshot.orders.map((order) => ({
						...order,
						clicks: order.clicks.filter((click) => click.eligible),
					})),
				},
			};
		}
		const revision = await db.$transaction(
			async (tx) => {
				const { scope } = await reportAccess(
					tx,
					context.user.id,
					input.organizationId,
					true,
				);
				return replaceCampaignReport(
					tx,
					scope,
					input.expectedRevision,
					rows,
					source,
				);
			},
			{ timeout: 30_000 },
		);
		if (!revision) {
			throw new ORPCError("CONFLICT", {
				message:
					"The saved report has changed. Reload it before saving again.",
			});
		}
		return { revision };
	});

export const trackingRouter = { attributeOrders, getReport, saveReport };
