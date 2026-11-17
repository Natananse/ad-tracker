import { db, type Prisma } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { productUpdateSchema } from "../schema";

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const session = await getSession();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 },
			);
		}

		const user = await db.user.findUnique({
			where: { id: session.user.id },
		});

		if (user?.role !== "admin") {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		const { title, type, published, content } = productUpdateSchema.parse(
			await request.json(),
		);

		const update = await db.productUpdate.update({
			where: { id },
			data: {
				title,
				type,
				published,
				content: content as Prisma.InputJsonValue,
			},
		});

		return NextResponse.json(update);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ message: "Invalid request data", errors: error.issues },
				{ status: 400 },
			);
		}

		console.error("Error updating update:", error);
		return NextResponse.json(
			{ message: "Failed to update" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const session = await getSession();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 },
			);
		}

		const user = await db.user.findUnique({
			where: { id: session.user.id },
		});

		if (user?.role !== "admin") {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		await db.productUpdate.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting update:", error);
		return NextResponse.json(
			{ message: "Failed to delete" },
			{ status: 500 },
		);
	}
}
