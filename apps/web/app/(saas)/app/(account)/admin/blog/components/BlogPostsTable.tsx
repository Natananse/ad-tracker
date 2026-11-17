"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@ui/components/table";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import Link from "next/link";
import { formatDate } from "@repo/utils";
import { MoreHorizontal } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { DeletePostDialog } from "./DeletePostDialog";
import { useState } from "react";

interface BlogPost {
	id: string;
	title: string;
	slug: string;
	excerpt: string | null;
	content: Record<string, unknown>;
	image: string | null;
	published: boolean;
	locale: string;
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
	authorId: string;
}

interface User {
	name: string;
	image: string | null;
}

interface BlogPostsTableProps {
	posts: (BlogPost & { author: User })[];
}

export function BlogPostsTable({ posts }: BlogPostsTableProps) {
	const [deleteId, setDeleteId] = useState<string | null>(null);

	return (
		<>
			<div className="rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Title</TableHead>
							<TableHead>Author</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Locale</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className="w-10" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{posts.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-center text-muted-foreground"
								>
									No blog posts yet
								</TableCell>
							</TableRow>
						) : (
							posts.map((post) => (
								<TableRow key={post.id}>
									<TableCell className="font-medium">
										{post.title}
									</TableCell>
									<TableCell>{post.author.name}</TableCell>
									<TableCell>
										<Badge
											status={
												post.published
													? "success"
													: "info"
											}
										>
											{post.published
												? "Published"
												: "Draft"}
										</Badge>
									</TableCell>
									<TableCell>{post.locale}</TableCell>
									<TableCell>
										{formatDate(post.createdAt)}
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem asChild>
													<Link
														href={`/app/admin/blog/${post.id}`}
													>
														Edit
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() =>
														setDeleteId(post.id)
													}
													className="text-destructive"
												>
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{deleteId && (
				<DeletePostDialog
					postId={deleteId}
					onClose={() => setDeleteId(null)}
				/>
			)}
		</>
	);
}
