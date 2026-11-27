import { ORPCError } from "@orpc/server";
import type { CampaignReportScope, Prisma } from "@repo/database";

export async function workspaceAccess(
	tx: Prisma.TransactionClient,
	userId: string,
	organizationId: string | undefined,
	forWrite: boolean,
): Promise<{ scope: CampaignReportScope; canEdit: boolean }> {
	if (!organizationId) {
		return { scope: { userId }, canEdit: true };
	}
	// Hold the membership during a workspace update so access cannot be revoked mid-write.
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
