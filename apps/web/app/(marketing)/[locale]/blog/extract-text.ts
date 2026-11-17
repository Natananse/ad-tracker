import type { JSONContent } from "@tiptap/core";

interface TiptapNode extends JSONContent {
	type?: string;
	content?: TiptapNode[];
	text?: string;
}

export function extractTextFromTiptap(
	content: JSONContent,
	maxLength = 300,
): string {
	if (!content?.content) {
		return "";
	}

	let text = "";

	function traverse(nodes: TiptapNode[]): void {
		for (const node of nodes) {
			if (text.length >= maxLength) {
				break;
			}

			if (node.type === "text" && node.text) {
				text += node.text;
			} else if (node.type === "paragraph" && node.content) {
				traverse(node.content);
				if (text.length < maxLength) {
					text += " ";
				}
			} else if (node.content) {
				traverse(node.content);
			}
		}
	}

	traverse(content.content);

	return (
		text.slice(0, maxLength).trim() + (text.length > maxLength ? "..." : "")
	);
}
