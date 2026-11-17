"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { TiptapEditor } from "./TiptapEditor";

interface BlogPost {
	id: string;
	title: string;
	slug: string;
	excerpt: string | null;
	content: Record<string, unknown>;
	image: string | null;
	author: { name: string; image: string | null };
	published: boolean;
	locale: string;
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
}

interface BlogEditorProps {
	userId: string;
	initialPost?: BlogPost;
}

export function BlogEditor({ userId, initialPost }: BlogEditorProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [title, setTitle] = useState(initialPost?.title || "");
	const [slug, setSlug] = useState(initialPost?.slug || "");
	const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
	const [image, setImage] = useState(initialPost?.image || "");
	const [tags, setTags] = useState(initialPost?.tags.join(", ") || "");
	const [published, setPublished] = useState(initialPost?.published || false);
	const [content, setContent] = useState(initialPost?.content || {});

	function generateSlug(text: string) {
		return text
			.toLowerCase()
			.replace(/[^\w\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-");
	}

	function handleTitleChange(value: string) {
		setTitle(value);
		if (!initialPost) {
			setSlug(generateSlug(value));
		}
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!title.trim()) {
			toast.error("Title is required");
			return;
		}

		if (!slug.trim()) {
			toast.error("Slug is required");
			return;
		}

		setIsLoading(true);

		try {
			const method = initialPost ? "PUT" : "POST";
			const url = initialPost
				? `/api/blog/${initialPost.id}`
				: "/api/blog";

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title,
					slug,
					excerpt,
					image,
					locale: "en",
					tags: tags
						.split(",")
						.map((t: string) => t.trim())
						.filter(Boolean),
					published,
					content,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to save post");
			}

			toast.success(
				initialPost
					? "Post updated successfully"
					: "Post created successfully",
			);
			router.push("/app/admin/blog");
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to save post",
			);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="grid gap-6 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="title">Title</Label>
					<Input
						id="title"
						value={title}
						onChange={(e) => handleTitleChange(e.target.value)}
						placeholder="Blog post title"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="slug">Slug</Label>
					<Input
						id="slug"
						value={slug}
						onChange={(e) => setSlug(e.target.value)}
						placeholder="blog-post-slug"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="image">Featured Image URL</Label>
					<Input
						id="image"
						value={image}
						onChange={(e) => setImage(e.target.value)}
						placeholder="https://example.com/image.jpg"
						type="url"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="excerpt">Excerpt</Label>
					<Input
						id="excerpt"
						value={excerpt}
						onChange={(e) => setExcerpt(e.target.value)}
						placeholder="Brief summary of the post"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="tags">Tags</Label>
					<Input
						id="tags"
						value={tags}
						onChange={(e) => setTags(e.target.value)}
						placeholder="tag1, tag2, tag3"
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label>Content</Label>
				<TiptapEditor
					content={content}
					onChange={setContent}
				/>
			</div>

			<div className="flex items-center space-x-2">
				<input
					type="checkbox"
					id="published"
					checked={published}
					onChange={(e) => setPublished(e.target.checked)}
					className="h-4 w-4 rounded border-gray-300"
				/>
				<Label htmlFor="published" className="font-normal">
					Publish this post
				</Label>
			</div>

			<div className="flex gap-2">
				<Button
					type="submit"
					disabled={isLoading}
				>
					{isLoading
						? "Saving..."
						: initialPost
							? "Update Post"
							: "Create Post"}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					disabled={isLoading}
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}
