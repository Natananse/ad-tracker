import { ORPCError } from "@orpc/server";
import {
	db,
	readCampaignReport,
	readWorkspaceCostSettings,
	replaceCampaignReport,
	writeWorkspaceCostSettings,
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
import { workspaceCostDefaults } from "./cost-settings";
import { workspaceAccess } from "./workspace-access";
import { applyWorkspaceCosts } from "./workspace-costs";

const reportScope = z.strictObject({
	organizationId: z.string().min(1).max(200).optional(),
});
const revisionInput = reportScope.extend({
	expectedRevision: z.uuid().nullable(),
});

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
				const { scope, canEdit } = await workspaceAccess(
					tx,
					context.user.id,
					input.organizationId,
					false,
				);
				const report = await readCampaignReport(tx, scope);
				const costSettings = await readWorkspaceCostSettings(tx, scope);
				return { ...report, costSettings, canEdit };
			},
			{ isolationLevel: "RepeatableRead", timeout: 30_000 },
		);
		const source =
			saved.attributionSource === null
				? null
				: attributionInput.parse(saved.attributionSource);
		const attribution = source === null ? null : computeAttribution(source);
		return {
			...saved,
			rows: applyWorkspaceCosts(
				saved.rows,
				saved.costSettings,
				source && attribution
					? { source, result: attribution }
					: undefined,
			),
			attributionSource: source,
			attribution,
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
				const { scope } = await workspaceAccess(
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

const getCostSettings = protectedProcedure
	.route({
		method: "GET",
		path: "/tracking/cost-settings",
		tags: ["Tracking"],
		summary: "Read default variable costs for this workspace",
	})
	.input(reportScope)
	.handler(({ input, context }) =>
		db.$transaction(
			async (tx) => {
				const { scope, canEdit } = await workspaceAccess(
					tx,
					context.user.id,
					input.organizationId,
					false,
				);
				return {
					settings: await readWorkspaceCostSettings(tx, scope),
					canEdit,
				};
			},
			{ isolationLevel: "RepeatableRead" },
		),
	);

const saveCostSettings = protectedProcedure
	.route({
		method: "POST",
		path: "/tracking/cost-settings",
		tags: ["Tracking"],
		summary: "Save or clear default variable costs for this workspace",
	})
	.input(reportScope.extend({ settings: workspaceCostDefaults.nullable() }))
	.handler(({ input, context }) =>
		db.$transaction(async (tx) => {
			const { scope, canEdit } = await workspaceAccess(
				tx,
				context.user.id,
				input.organizationId,
				true,
			);
			await writeWorkspaceCostSettings(tx, scope, input.settings);
			return { settings: input.settings, canEdit };
		}),
	);

export const trackingRouter = {
	attributeOrders,
	getReport,
	saveReport,
	getCostSettings,
	saveCostSettings,
};
