import { auth } from "@repo/auth";
import { db } from "@repo/database";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";

const updateBlogPostSchema = z.object({
	title: z.string().min(1).optional(),
	slug: z.string().min(1).optional(),
	excerpt: z.string().optional(),
	content: z.any().optional(),
	image: z.string().optional(),
	locale: z.string().optional(),
	tags: z.array(z.string()).optional(),
	published: z.boolean().optional(),
});

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const headersList = await headers();
		const session = await auth.api.getSession({
			headers: headersList,
		});

		if (!session) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 },
			);
		}

		const user = await db.user.findUnique({
			where: { id: session.user.id },
		});

		if (user?.role !== "admin") {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		const post = await db.blogPost.findUnique({
			where: { id },
		});

		if (!post) {
			return NextResponse.json(
				{ message: "Post not found" },
				{ status: 404 },
			);
		}

		const body = await request.json();
		const data = updateBlogPostSchema.parse(body);

		if (data.slug && data.slug !== post.slug) {
			const existingPost = await db.blogPost.findUnique({
				where: { slug: data.slug },
			});

			if (existingPost) {
				return NextResponse.json(
					{ message: "Slug already exists" },
					{ status: 400 },
				);
			}
		}

		const updateData: Record<string, unknown> = {};
		if (data.title !== undefined) {
			updateData.title = data.title;
		}
		if (data.slug !== undefined) {
			updateData.slug = data.slug;
		}
		if (data.excerpt !== undefined) {
			updateData.excerpt = data.excerpt;
		}
		if (data.content !== undefined) {
			updateData.content = data.content;
		}
		if (data.image !== undefined) {
			updateData.image = data.image;
		}
		if (data.locale !== undefined) {
			updateData.locale = data.locale;
		}
		if (data.tags !== undefined) {
			updateData.tags = data.tags;
		}
		if (data.published !== undefined) {
			updateData.published = data.published;
		}

		const updatedPost = await db.blogPost.update({
			where: { id },
			data: updateData,
			include: { author: { select: { name: true, image: true } } },
		});

		return NextResponse.json(updatedPost);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ message: "Invalid request data", errors: error.issues },
				{ status: 400 },
			);
		}

		console.error("Blog update error:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const headersList = await headers();
		const session = await auth.api.getSession({
			headers: headersList,
		});

		if (!session) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 },
			);
		}

		const user = await db.user.findUnique({
			where: { id: session.user.id },
		});

		if (user?.role !== "admin") {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		const post = await db.blogPost.findUnique({
			where: { id },
		});

		if (!post) {
			return NextResponse.json(
				{ message: "Post not found" },
				{ status: 404 },
			);
		}

		await db.blogPost.delete({
			where: { id },
		});

		return NextResponse.json({ message: "Post deleted" });
	} catch (error) {
		console.error("Blog deletion error:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
