import { config } from "@repo/config";
import { Dashboard } from "@saas/dashboard/components/Dashboard";
import { OrganizationsGrid } from "@saas/organizations/components/OrganizationsGrid";

export default function UserStart() {
	return (
		<div className="space-y-6">
			{config.organizations.enable && <OrganizationsGrid />}
			<Dashboard />
		</div>
	);
}
