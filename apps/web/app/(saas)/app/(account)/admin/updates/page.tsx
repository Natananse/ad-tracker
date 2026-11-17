import { redirect } from "next/navigation";
import { getSession } from "@saas/auth/lib/server";
import { db } from "@repo/database";
import { Button } from "@ui/components/button";
import Link from "next/link";
import { UpdatesTable } from "./components/UpdatesTable";

export const metadata = {
	title: "Updates Management",
};

export default async function UpdatesManagementPage() {
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

	const updates = await db.productUpdate.findMany({
		include: { author: { select: { name: true, image: true } } },
		orderBy: { createdAt: "desc" },
	});

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Product Updates</h1>
					<p className="text-muted-foreground">
						Manage updates and notify all users
					</p>
				</div>
				<Link href="/app/admin/updates/new">
					<Button>Create Update</Button>
				</Link>
			</div>

			<UpdatesTable updates={updates} />
		</div>
	);
}
