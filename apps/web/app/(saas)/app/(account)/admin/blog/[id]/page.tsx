import { redirect } from "next/navigation";
import { getSession } from "@saas/auth/lib/server";
import { db } from "@repo/database";
import { BlogEditor } from "../components/BlogEditor";

export const metadata = {
	title: "Edit Blog Post",
};

interface EditBlogPostPageProps {
	params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({
	params,
}: EditBlogPostPageProps) {
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

	const post = await db.blogPost.findUnique({
		where: { id },
		include: { author: { select: { name: true, image: true } } },
	});

	if (!post) {
		redirect("/app/admin/blog");
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Edit Blog Post</h1>
				<p className="text-muted-foreground">Update your blog post</p>
			</div>

			<BlogEditor
				userId={session.user.id}
				initialPost={{
					...post,
					content: (post.content || {}) as Record<string, unknown>,
				}}
			/>
		</div>
	);
}
