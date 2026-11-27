import type { Prisma } from "@prisma/client";
import type { CampaignReportScope } from "./campaign-reports";

export async function readWorkspaceCostSettings(
	tx: Prisma.TransactionClient,
	scope: CampaignReportScope,
) {
	const settings = await tx.workspaceCostSettings.findUnique({
		where: scope,
		select: {
			currency: true,
			productCostBps: true,
			paymentFeeBps: true,
			fixedPaymentFeeMinor: true,
			fulfillmentCostMinor: true,
		},
	});
	if (!settings) {
		return null;
	}
	return {
		...settings,
		fixedPaymentFeeMinor: Number(settings.fixedPaymentFeeMinor),
		fulfillmentCostMinor: Number(settings.fulfillmentCostMinor),
	};
}

export async function writeWorkspaceCostSettings(
	tx: Prisma.TransactionClient,
	scope: CampaignReportScope,
	settings: Awaited<ReturnType<typeof readWorkspaceCostSettings>>,
) {
	if (settings === null) {
		await tx.workspaceCostSettings.deleteMany({ where: scope });
		return;
	}
	await tx.workspaceCostSettings.upsert({
		where: scope,
		create: { ...scope, ...settings },
		update: settings,
	});
}
