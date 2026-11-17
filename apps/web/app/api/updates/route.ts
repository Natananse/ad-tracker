import { db, type Prisma } from "@repo/database";
import { getSession } from "@saas/auth/lib/server";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { productUpdateSchema } from "./schema";

export async function POST(request: NextRequest) {
	try {
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

		const update = await db.productUpdate.create({
			data: {
				title,
				type,
				published,
				content: content as Prisma.InputJsonValue,
				authorId: session.user.id,
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

		console.error("Error creating update:", error);
		return NextResponse.json(
			{ message: "Failed to create update" },
			{ status: 500 },
		);
	}
}
