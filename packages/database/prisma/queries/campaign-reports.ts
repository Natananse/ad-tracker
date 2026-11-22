import { Prisma } from "@prisma/client";

export type CampaignReportScope =
	| { userId: string }
	| { organizationId: string };

export async function readCampaignReport(
	tx: Prisma.TransactionClient,
	scope: CampaignReportScope,
) {
	const report = await tx.campaignReport.findUnique({
		where: scope,
		select: {
			revision: true,
			attributionSource: true,
			days: {
				select: {
					date: true,
					channel: true,
					campaign: true,
					currency: true,
					sales: true,
					refunds: true,
					spend: true,
					costs: true,
				},
				orderBy: [
					{ date: "asc" },
					{ channel: "asc" },
					{ campaign: "asc" },
					{ currency: "asc" },
				],
			},
		},
	});
	return {
		revision: report?.revision ?? null,
		attributionSource: report?.attributionSource ?? null,
		rows: (report?.days ?? []).map((day) => ({
			...day,
			sales: Number(day.sales),
			refunds: Number(day.refunds),
			spend: day.spend === null ? null : Number(day.spend),
			costs: day.costs === null ? null : Number(day.costs),
		})),
	};
}

export async function replaceCampaignReport(
	tx: Prisma.TransactionClient,
	scope: CampaignReportScope,
	expectedRevision: string | null,
	rows: Omit<Prisma.CampaignDailyFactCreateManyInput, "reportId">[],
	source: Prisma.InputJsonObject | null,
) {
	const revision = crypto.randomUUID();
	const data = { revision, attributionSource: source ?? Prisma.DbNull };
	let reportId: string;
	if (expectedRevision === null) {
		const id = crypto.randomUUID();
		// A concurrent first save cannot insert a second report for this scope.
		const inserted = await tx.campaignReport.createMany({
			data: [{ ...scope, ...data, id }],
			skipDuplicates: true,
		});
		if (!inserted.count) {
			return null;
		}
		reportId = id;
	} else {
		// This compare-and-swap locks the parent row before replacing its facts.
		const [updated] = await tx.campaignReport.updateManyAndReturn({
			where: { ...scope, revision: expectedRevision },
			data,
			select: { id: true },
		});
		if (!updated) {
			return null;
		}
		reportId = updated.id;
		await tx.campaignDailyFact.deleteMany({ where: { reportId } });
	}

	await tx.campaignDailyFact.createMany({
		data: rows.map((row) => ({ ...row, reportId })),
	});
	return revision;
}
