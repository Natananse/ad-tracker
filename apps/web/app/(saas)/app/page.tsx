import { AppWrapper } from "@saas/shared/components/AppWrapper";
import { Dashboard } from "@saas/dashboard/components/Dashboard";
import { PageHeader } from "@saas/shared/components/PageHeader";

export const metadata = {
	title: "Dashboard",
};

export default function DashboardPage() {
	return (
		<AppWrapper>
			<div>
				<PageHeader
					title="Dashboard"
					subtitle="Overview and analytics"
				/>

				<Dashboard />
			</div>
		</AppWrapper>
	);
}

