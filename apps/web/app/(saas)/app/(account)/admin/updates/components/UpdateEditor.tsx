"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { TiptapEditor } from "../../blog/components/TiptapEditor";

interface ProductUpdate {
	id: string;
	title: string;
	content: Record<string, unknown>;
	type: string;
	published: boolean;
}

interface UpdateEditorProps {
	userId: string;
	initialUpdate?: ProductUpdate;
}

export function UpdateEditor({
	userId,
	initialUpdate,
}: UpdateEditorProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [title, setTitle] = useState(initialUpdate?.title || "");
	const [type, setType] = useState(initialUpdate?.type || "product");
	const [published, setPublished] = useState(
		initialUpdate?.published || false,
	);
	const [content, setContent] = useState(initialUpdate?.content || {});

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!title.trim()) {
			toast.error("Title is required");
			return;
		}

		setIsLoading(true);

		try {
			const method = initialUpdate ? "PUT" : "POST";
			const url = initialUpdate
				? `/api/updates/${initialUpdate.id}`
				: "/api/updates";

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title,
					type,
					published,
					content,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to save update");
			}

			toast.success(
				initialUpdate
					? "Update updated successfully"
					: "Update created successfully",
			);
			router.push("/app/admin/updates");
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to save update",
			);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="grid gap-6 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="title">Email Subject</Label>
					<Input
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Email subject line"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="type">Type</Label>
					<Select value={type} onValueChange={setType}>
						<SelectTrigger id="type">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="product">
								🚀 Product Update
							</SelectItem>
							<SelectItem value="stats">
								📊 Monthly Stats
							</SelectItem>
							<SelectItem value="announcement">
								📢 Announcement
							</SelectItem>
						</SelectContent>
					</Select>
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
					Publish this update
				</Label>
			</div>

			<div className="flex gap-2">
				<Button type="submit" disabled={isLoading}>
					{isLoading
						? "Saving..."
						: initialUpdate
							? "Update"
							: "Create"}
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
