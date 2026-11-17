import { db } from "@repo/database";
import { sendEmail } from "@repo/mail";
import { getBaseUrl } from "@repo/utils";
import { getSession } from "@saas/auth/lib/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
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

		const update = await db.productUpdate.findUnique({
			where: { id },
		});

		if (!update) {
			return NextResponse.json(
				{ message: "Update not found" },
				{ status: 404 },
			);
		}

		const users = await db.user.findMany({
			where: { emailVerified: true },
			select: { email: true },
		});

		const contentHtml = convertJsonToHtml(
			update.content as Record<string, unknown>,
		);
		const escapedTitle = escapeHtml(update.title);
		const logoUrl = escapeHtml(
			new URL(
				"/images/supastarter-logo-light.svg",
				getBaseUrl(),
			).toString(),
		);

		const typeLabel =
			{
				product: "🚀 Product Update",
				stats: "📊 Monthly Stats",
				announcement: "📢 Announcement",
			}[update.type] || "Update";

		const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .logo { margin-bottom: 20px; }
    .logo img { max-width: 150px; height: auto; }
    .header { margin-bottom: 20px; }
    .badge { display: inline-block; padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-size: 12px; margin-bottom: 10px; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
    h1 { margin: 0 0 10px 0; }
    h2 { margin: 16px 0 8px 0; }
    h3 { margin: 12px 0 6px 0; }
    p { margin: 8px 0; }
    ul, ol { margin: 8px 0; padding-left: 20px; }
    li { margin: 4px 0; }
    code { background: #f0f0f0; padding: 2px 4px; border-radius: 2px; }
    pre { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; padding-left: 16px; margin: 16px 0; }
    img { max-width: 100%; height: auto; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="${logoUrl}" alt="Logo" />
    </div>
    <div class="header">
      <div class="badge">${typeLabel}</div>
      <h1>${escapedTitle}</h1>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
  </div>
</body>
</html>
		`;

		for (const recipient of users) {
			await sendEmail({
				to: recipient.email,
				subject: update.title.replace(/[\r\n]+/g, " "),
				html: emailHtml,
			});
		}

		return NextResponse.json({
			success: true,
			sent: users.length,
		});
	} catch {
		return NextResponse.json(
			{ message: "Failed to send emails" },
			{ status: 500 },
		);
	}
}

function convertJsonToHtml(json: Record<string, unknown>): string {
	if (!json || typeof json !== "object") {
		return "";
	}

	const content = json as TiptapNode;

	if (content.type === "doc" && Array.isArray(content.content)) {
		return content.content.map((node) => nodeToHtml(node, 0)).join("");
	}

	return "";
}

interface TiptapNode {
	type?: string;
	text?: string;
	content?: TiptapNode[];
	attrs?: Record<string, unknown>;
	marks?: Array<{ type?: string }>;
}

function escapeHtml(value: unknown): string {
	return String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function getSafeImageUrl(value: unknown): string | null {
	if (typeof value !== "string") {
		return null;
	}

	try {
		const url = new URL(value);
		return url.protocol === "https:" ? escapeHtml(url.toString()) : null;
	} catch {
		return null;
	}
}

function nodeToHtml(node: TiptapNode, depth: number): string {
	if (!node || depth > 25) {
		return "";
	}

	const { type, content, attrs, marks } = node;
	const renderChildren = () =>
		Array.isArray(content)
			? content.map((child) => nodeToHtml(child, depth + 1)).join("")
			: "";

	let html = "";

	switch (type) {
		case "paragraph":
			html = `<p>${renderChildren()}</p>`;
			break;
		case "heading": {
			const requestedLevel = Number(attrs?.level);
			const level = Number.isInteger(requestedLevel)
				? Math.min(6, Math.max(1, requestedLevel))
				: 1;
			html = `<h${level}>${renderChildren()}</h${level}>`;
			break;
		}
		case "bulletList":
			html = `<ul>${renderChildren()}</ul>`;
			break;
		case "orderedList":
			html = `<ol>${renderChildren()}</ol>`;
			break;
		case "listItem":
			html = `<li>${renderChildren()}</li>`;
			break;
		case "blockquote":
			html = `<blockquote>${renderChildren()}</blockquote>`;
			break;
		case "codeBlock":
			html = `<pre><code>${renderChildren()}</code></pre>`;
			break;
		case "text":
			html = escapeHtml(node.text);
			if (Array.isArray(marks)) {
				for (const mark of marks) {
					if (mark.type === "bold") {
						html = `<strong>${html}</strong>`;
					}
					if (mark.type === "italic") {
						html = `<em>${html}</em>`;
					}
					if (mark.type === "underline") {
						html = `<u>${html}</u>`;
					}
					if (mark.type === "strike") {
						html = `<s>${html}</s>`;
					}
					if (mark.type === "code") {
						html = `<code>${html}</code>`;
					}
				}
			}
			break;
		case "hardBreak":
			html = "<br />";
			break;
		case "image": {
			const imageUrl = getSafeImageUrl(attrs?.src);
			if (imageUrl) {
				html = `<img src="${imageUrl}" alt="${escapeHtml(attrs?.alt)}" />`;
			}
			break;
		}
	}

	return html;
}
