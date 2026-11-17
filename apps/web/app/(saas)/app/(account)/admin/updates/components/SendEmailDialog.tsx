"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { Button } from "@ui/components/button";
import { Loader2 } from "lucide-react";

interface SendEmailDialogProps {
	id: string;
	onClose: () => void;
}

export function SendEmailDialog({ id, onClose }: SendEmailDialogProps) {
	const [isLoading, setIsLoading] = useState(false);

	async function handleSend() {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/updates/${id}/send-email`, {
				method: "POST",
			});

			if (!response.ok) {
				throw new Error("Failed to send emails");
			}

			toast.success("Emails sent to all users");
			onClose();
		} catch (_error) {
			toast.error("Failed to send emails");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Dialog open onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Send Update Email</DialogTitle>
					<DialogDescription>
						This will send the update to all registered users via
						email.
					</DialogDescription>
				</DialogHeader>

				<div className="flex gap-2 justify-end">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSend} disabled={isLoading}>
						{isLoading && (
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						)}
						Send Emails
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
