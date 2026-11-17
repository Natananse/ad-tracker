import { redirect } from "next/navigation";
import { getSession } from "@saas/auth/lib/server";
import { db } from "@repo/database";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { UpdateEditor } from "../components/UpdateEditor";

export const metadata = {
	title: "Edit Update",
};

export default async function EditUpdatePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
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

	const update = await db.productUpdate.findUnique({
		where: { id },
	});

	if (!update) {
		redirect("/app/admin/updates");
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title="Edit Update"
				subtitle="Update the product update details"
			/>
			<UpdateEditor
				userId={session.user.id}
				initialUpdate={{
					...update,
					content: (update.content || {}) as Record<string, unknown>,
				}}
			/>
		</div>
	);
}
