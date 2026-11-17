import { db } from "@repo/database";
import Link from "next/link";
import { formatDate } from "@repo/utils";
import { Button } from "@ui/components/button";
import type { JSONContent } from "@tiptap/core";
import { extractTextFromTiptap } from "./extract-text";

interface BlogListPageProps {
	params: Promise<{ locale: string }>;
}

export const metadata = {
	title: "Blog",
	description: "Read our latest blog posts and articles",
};

export default async function BlogListPage({ params }: BlogListPageProps) {
	const { locale } = await params;

	const posts = await db.blogPost.findMany({
		where: {
			published: true,
			locale,
		},
		include: {
			author: {
				select: {
					name: true,
					image: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-4xl px-4 py-30 sm:px-6 lg:px-8">
				<div className="mb-12">
					<h1 className="text-4xl font-bold tracking-tight">Blog</h1>
					<p className="mt-4 text-lg text-muted-foreground">
						Read our latest articles and insights
					</p>
				</div>

				{posts.length === 0 ? (
					<div className="rounded-lg border border-dashed p-8 text-center">
						<p className="text-muted-foreground">
							No blog posts yet
						</p>
					</div>
				) : (
					<div className="space-y-8">
						{posts.map((post) => {
							const preview = extractTextFromTiptap(
								post.content as JSONContent,
								300,
							);

							return (
								<article
									key={post.id}
									className="border-b pb-8 last:border-b-0"
								>
									<div className="space-y-3">
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<span>{post.author.name}</span>
											<span>•</span>
											<time
												dateTime={post.createdAt.toISOString()}
											>
												{formatDate(post.createdAt)}
											</time>
										</div>

										<Link
											href={`/${locale}/blog/${post.slug}`}
											className="group"
										>
											<h2 className="text-2xl font-bold transition-colors group-hover:text-primary">
												{post.title}
											</h2>
										</Link>

										{post.excerpt && (
											<p className="text-muted-foreground">
												{post.excerpt}
											</p>
										)}

										{preview && (
											<p className="text-foreground/80 line-clamp-3">
												{preview}
											</p>
										)}

										{post.tags.length > 0 && (
											<div className="flex flex-wrap gap-2 pt-2">
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

										<div className="pt-2">
											<Link
												href={`/${locale}/blog/${post.slug}`}
											>
												<Button variant="outline">
													Read More
												</Button>
											</Link>
										</div>
									</div>
								</article>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
