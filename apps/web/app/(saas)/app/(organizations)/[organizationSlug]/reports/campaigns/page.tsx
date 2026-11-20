import { CampaignReport } from "@saas/tracking/components/CampaignReport";

export const metadata = { title: "Campaign report" };

export default async function OrganizationCampaignReportPage({
	params,
}: {
	params: Promise<{ organizationSlug: string }>;
}) {
	const { organizationSlug } = await params;
	return <CampaignReport key={organizationSlug} />;
}
