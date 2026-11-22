import { getSession } from "@saas/auth/lib/server";
import { CampaignReport } from "@saas/tracking/components/CampaignReport";
import { redirect } from "next/navigation";

export const metadata = { title: "Campaign report" };

export default async function CampaignReportPage() {
	const session = await getSession();
	if (!session) {
		redirect("/auth/login");
	}
	return <CampaignReport key={session.user.id} viewerId={session.user.id} />;
}
