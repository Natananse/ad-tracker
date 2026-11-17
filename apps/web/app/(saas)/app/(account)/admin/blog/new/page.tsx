import { redirect } from "next/navigation";
import { getSession } from "@saas/auth/lib/server";
import { db } from "@repo/database";
import { BlogEditor } from "../components/BlogEditor";

export const metadata = {
	title: "Create Blog Post",
};

export default async function NewBlogPostPage() {
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
			<div>
				<h1 className="text-3xl font-bold">Create Blog Post</h1>
				<p className="text-muted-foreground">
					Write and publish a new blog post
				</p>
			</div>

			<BlogEditor userId={session.user.id} />
		</div>
	);
}
