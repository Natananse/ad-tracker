import { config } from "@repo/config";
import { getOrganizationList, getSession } from "@saas/auth/lib/server";
import { redirect } from "next/navigation";

export default async function AppStartPage() {
	const session = await getSession();
	if (!session) {
		redirect("/auth/login");
	}

	if (
		config.organizations.enable &&
		config.organizations.requireOrganization
	) {
		const organizations = await getOrganizationList();
		const organization =
			organizations.find(
				(org) => org.id === session.session.activeOrganizationId,
			) ?? organizations[0];
		if (!organization) {
			redirect("/new-organization");
		}
		redirect(`/app/${organization.slug}/reports/campaigns`);
	}

	redirect("/app/reports/campaigns");
}
