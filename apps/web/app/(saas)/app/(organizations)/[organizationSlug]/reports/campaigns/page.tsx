import { getActiveOrganization, getSession } from "@saas/auth/lib/server";
import { CampaignReport } from "@saas/tracking/components/CampaignReport";
import { notFound, redirect } from "next/navigation";

export const metadata = { title: "Campaign report" };

export default async function OrganizationCampaignReportPage({
	params,
}: {
	params: Promise<{ organizationSlug: string }>;
}) {
	const { organizationSlug } = await params;
	const [session, organization] = await Promise.all([
		getSession(),
		getActiveOrganization(organizationSlug),
	]);
	if (!session) {
		redirect("/auth/login");
	}
	if (!organization) {
		notFound();
	}
	return (
		<CampaignReport
			key={`${session.user.id}/${organization.id}`}
			viewerId={session.user.id}
			organizationId={organization.id}
			organizationName={organization.name}
		/>
	);
}
