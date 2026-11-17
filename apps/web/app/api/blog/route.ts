import { auth } from "@repo/auth";
import { db } from "@repo/database";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";

const createBlogPostSchema = z.object({
	title: z.string().min(1),
	slug: z.string().min(1),
	excerpt: z.string().optional(),
	content: z.any(),
	image: z.string().optional(),
	locale: z.string(),
	tags: z.array(z.string()),
	published: z.boolean(),
});

export async function POST(request: Request) {
	try {
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
			return NextResponse.json(
				{ message: "Forbidden" },
				{ status: 403 },
			);
		}

		const body = await request.json();
		const data = createBlogPostSchema.parse(body);

		const existingPost = await db.blogPost.findUnique({
			where: { slug: data.slug },
		});

		if (existingPost) {
			return NextResponse.json(
				{ message: "Slug already exists" },
				{ status: 400 },
			);
		}

		const post = await db.blogPost.create({
			data: {
				title: data.title,
				slug: data.slug,
				excerpt: data.excerpt,
				content: data.content,
				image: data.image,
				locale: data.locale,
				tags: data.tags,
				published: data.published,
				authorId: session.user.id,
			},
			include: { author: { select: { name: true, image: true } } },
		});

		return NextResponse.json(post, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ message: "Invalid request data", errors: error.issues },
				{ status: 400 },
			);
		}

		console.error("Blog creation error:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
