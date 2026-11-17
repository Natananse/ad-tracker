import { redirect } from "next/navigation";
import { getSession } from "@saas/auth/lib/server";
import { db } from "@repo/database";
import { Button } from "@ui/components/button";
import Link from "next/link";
import { BlogPostsTable } from "./components/BlogPostsTable";

export const metadata = {
	title: "Blog Management",
};

export default async function BlogManagementPage() {
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

	const posts = await db.blogPost.findMany({
		include: { author: { select: { name: true, image: true } } },
		orderBy: { createdAt: "desc" },
	});

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Blog Posts</h1>
					<p className="text-muted-foreground">
						Manage your blog posts and create new ones
					</p>
				</div>
				<Link href="/app/admin/blog/new">
					<Button>Create Post</Button>
				</Link>
			</div>

			<BlogPostsTable
				posts={posts.map((post) => ({
					...post,
					content: (post.content || {}) as Record<string, unknown>,
				}))}
			/>
		</div>
	);
}
