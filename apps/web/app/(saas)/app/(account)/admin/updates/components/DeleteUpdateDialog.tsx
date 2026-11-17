"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from "@ui/components/alert-dialog";

interface DeleteUpdateDialogProps {
	id: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export function DeleteUpdateDialog({
	onConfirm,
	onCancel,
}: DeleteUpdateDialogProps) {
	return (
		<AlertDialog open onOpenChange={onCancel}>
			<AlertDialogContent>
				<AlertDialogTitle>Delete Update</AlertDialogTitle>
				<AlertDialogDescription>
					Are you sure you want to delete this update? This action
					cannot be undone.
				</AlertDialogDescription>
				<div className="flex gap-2 justify-end">
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm}>
						Delete
					</AlertDialogAction>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
}
