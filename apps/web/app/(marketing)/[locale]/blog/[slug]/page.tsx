import { db } from "@repo/database";
import { notFound } from "next/navigation";
import { formatDate } from "@repo/utils";
import type { JSONContent } from "@tiptap/core";
import { renderTiptapContent } from "./render-tiptap";
import Link from "next/link";
import { Button } from "@ui/components/button";
import { ArrowLeft } from "lucide-react";

interface BlogDetailPageProps {
	params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps) {
	const { slug } = await params;

	const post = await db.blogPost.findUnique({
		where: { slug },
	});

	if (!post?.published) {
		return {
			title: "Not Found",
		};
	}

	return {
		title: post.title,
		description: post.excerpt || post.title,
		openGraph: {
			title: post.title,
			description: post.excerpt || post.title,
			images: post.image ? [{ url: post.image }] : [],
		},
	};
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
	const { locale, slug } = await params;

	const post = await db.blogPost.findUnique({
		where: { slug },
		include: {
			author: {
				select: {
					name: true,
					image: true,
				},
			},
		},
	});

	if (!post?.published) {
		notFound();
	}

	return (
		<div className="min-h-screen bg-background">
			<article className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
				<div className="mb-12 flex items-start justify-between gap-4">
					<header className="flex-1 space-y-4">
						<h1 className="text-4xl font-bold tracking-tight">
							{post.title}
						</h1>
					</header>
					<Link
						href={`/${locale}/blog`}
						className="mt-1 flex-shrink-0"
					>
						<Button variant="outline" size="sm">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to All Blogs
						</Button>
					</Link>
				</div>
				<header className="mb-8 space-y-4">
					<div className="flex items-center gap-4">
						{post.author.image && (
							<img
								src={post.author.image}
								alt={post.author.name}
								className="h-10 w-10 rounded-full"
							/>
						)}
						<div className="text-sm">
							<p className="font-medium">{post.author.name}</p>
							<time
								dateTime={post.createdAt.toISOString()}
								className="text-muted-foreground"
							>
								{formatDate(post.createdAt)}
							</time>
						</div>
					</div>

					{post.tags.length > 0 && (
						<div className="flex flex-wrap gap-2 pt-4">
							{post.tags.map((tag) => (
								<span
									key={tag}
									className="inline-block rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
								>
									{tag}
								</span>
							))}
						</div>
					)}
				</header>

				{post.image && (
					<div className="mb-8 overflow-hidden rounded-lg">
						<img
							src={post.image}
							alt={post.title}
							className="h-96 w-full object-cover"
						/>
					</div>
				)}

				{post.excerpt && (
					<p className="mb-8 text-lg text-muted-foreground">
						{post.excerpt}
					</p>
				)}

				<div className="prose prose-sm dark:prose-invert max-w-none">
					{renderTiptapContent(post.content as JSONContent)}
				</div>
			</article>
		</div>
	);
}
