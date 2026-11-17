"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@ui/components/table";
import { Button } from "@ui/components/button";
import { Badge } from "@ui/components/badge";
import { Trash2, Edit, Send } from "lucide-react";
import { DeleteUpdateDialog } from "./DeleteUpdateDialog";
import { SendEmailDialog } from "./SendEmailDialog";

interface Update {
	id: string;
	title: string;
	type: string;
	published: boolean;
	author: { name: string; image: string | null };
	createdAt: Date;
}

interface UpdatesTableProps {
	updates: Update[];
}

export function UpdatesTable({ updates }: UpdatesTableProps) {
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [sendId, setSendId] = useState<string | null>(null);

	async function handleDelete(id: string) {
		try {
			const response = await fetch(`/api/updates/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete");
			}

			toast.success("Update deleted successfully");
			window.location.reload();
		} catch (_error) {
			toast.error("Failed to delete update");
		}
	}

	return (
		<>
			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Title</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Author</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className="text-center">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{updates.map((update) => (
							<TableRow key={update.id}>
								<TableCell className="font-medium">
									{update.title}
								</TableCell>
								<TableCell>
									<Badge>{update.type}</Badge>
								</TableCell>
								<TableCell>{update.author.name}</TableCell>
								<TableCell>
									<Badge>
										{update.published
											? "Published"
											: "Draft"}
									</Badge>
								</TableCell>
								<TableCell>
									{new Date(
										update.createdAt,
									).toLocaleDateString()}
								</TableCell>
								<TableCell>
									<div className="flex justify-center gap-2">
										<Link
											href={`/app/admin/updates/${update.id}`}
										>
											<Button
												size="sm"
												variant="outline"
												title="Edit"
											>
												<Edit className="h-4 w-4" />
											</Button>
										</Link>
										{update.published && (
											<Button
												size="sm"
												variant="outline"
												onClick={() =>
													setSendId(update.id)
												}
												title="Send Email"
											>
												<Send className="h-4 w-4" />
											</Button>
										)}
										<Button
											size="sm"
											variant="outline"
											onClick={() =>
												setDeleteId(update.id)
											}
											title="Delete"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{deleteId && (
				<DeleteUpdateDialog
					id={deleteId}
					onConfirm={() => {
						handleDelete(deleteId);
						setDeleteId(null);
					}}
					onCancel={() => setDeleteId(null)}
				/>
			)}

			{sendId && (
				<SendEmailDialog id={sendId} onClose={() => setSendId(null)} />
			)}
		</>
	);
}
