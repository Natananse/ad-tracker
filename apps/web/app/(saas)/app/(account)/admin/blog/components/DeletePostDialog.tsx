"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from "@ui/components/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeletePostDialogProps {
	postId: string;
	onClose: () => void;
}

export function DeletePostDialog({ postId, onClose }: DeletePostDialogProps) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	async function handleDelete() {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/blog/${postId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete post");
			}

			toast.success("Post deleted successfully");
			router.refresh();
			onClose();
		} catch (_error) {
			toast.error("Failed to delete post");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<AlertDialog open onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogTitle>Delete Post</AlertDialogTitle>
				<AlertDialogDescription>
					Are you sure you want to delete this post? This action
					cannot be undone.
				</AlertDialogDescription>
				<div className="flex justify-end gap-2">
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={isLoading}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isLoading ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
}
