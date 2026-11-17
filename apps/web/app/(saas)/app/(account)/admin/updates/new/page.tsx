import { redirect } from "next/navigation";
import { getSession } from "@saas/auth/lib/server";
import { db } from "@repo/database";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { UpdateEditor } from "../components/UpdateEditor";

export const metadata = {
	title: "Create Update",
};

export default async function NewUpdatePage() {
	const session = await getSession();

	if (!session) {
		redirect("/auth/login");
	}

	const user = await db.user.findUnique({
		where: { id: session.user.id },
	});

	if (user?.role !== "admin") {
		redirect("/app");
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title="Create Update"
				subtitle="Create a new product update or announcement"
			/>
			<UpdateEditor userId={session.user.id} />
		</div>
	);
}
