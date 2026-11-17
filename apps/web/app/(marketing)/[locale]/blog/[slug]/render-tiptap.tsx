import type { JSONContent } from "@tiptap/core";
import React from "react";

interface TiptapNode extends JSONContent {
	type?: string;
	content?: TiptapNode[];
	marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
	text?: string;
	attrs?: Record<string, unknown>;
}

export function renderTiptapContent(content: JSONContent): React.ReactNode {
	if (!content?.content) {
		return null;
	}

	return content.content.map((node, index) =>
		renderNode(node as TiptapNode, index),
	);
}

function renderNode(node: TiptapNode, index: number): React.ReactNode {
	if (!node.type) {
		return null;
	}

	const key = `${node.type}-${index}`;

	switch (node.type) {
		case "paragraph":
			return (
				<p key={key}>
					{node.content?.map((child, i) =>
						renderNode(child as TiptapNode, i),
					)}
				</p>
			);

		case "heading": {
			const requestedLevel = Number(node.attrs?.level);
			const level = Number.isInteger(requestedLevel)
				? Math.min(6, Math.max(1, requestedLevel))
				: 1;
			const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
			return React.createElement(
				HeadingTag,
				{ key },
				node.content?.map((child, i) =>
					renderNode(child as TiptapNode, i),
				),
			);
		}

		case "bulletList":
			return (
				<ul key={key}>
					{node.content?.map((child, i) =>
						renderNode(child as TiptapNode, i),
					)}
				</ul>
			);

		case "orderedList":
			return (
				<ol key={key}>
					{node.content?.map((child, i) =>
						renderNode(child as TiptapNode, i),
					)}
				</ol>
			);

		case "listItem":
			return (
				<li key={key}>
					{node.content?.map((child, i) =>
						renderNode(child as TiptapNode, i),
					)}
				</li>
			);

		case "blockquote":
			return (
				<blockquote key={key}>
					{node.content?.map((child, i) =>
						renderNode(child as TiptapNode, i),
					)}
				</blockquote>
			);

		case "codeBlock": {
			const requestedLanguage = String(node.attrs?.language ?? "text");
			const language = /^[a-z0-9-]+$/i.test(requestedLanguage)
				? requestedLanguage
				: "text";
			return (
				<pre key={key}>
					<code className={`language-${language}`}>
						{node.content?.map((child, i) =>
							renderNode(child as TiptapNode, i),
						)}
					</code>
				</pre>
			);
		}

		case "image": {
			const imageUrl = getSafeUrl(node.attrs?.src, ["http:", "https:"]);
			if (!imageUrl) {
				return null;
			}

			return (
				// biome-ignore lint/performance/noImgElement: rich-text images can use arbitrary validated URLs and dimensions are unknown
				<img
					key={key}
					src={imageUrl}
					alt={node.attrs?.alt as string}
					title={node.attrs?.title as string}
				/>
			);
		}

		case "hardBreak":
			return <br key={key} />;

		case "text": {
			let text: React.ReactNode = node.text || "";

			if (node.marks) {
				for (const mark of node.marks) {
					switch (mark.type) {
						case "bold":
							text = <strong key={`${key}-bold`}>{text}</strong>;
							break;
						case "italic":
							text = <em key={`${key}-italic`}>{text}</em>;
							break;
						case "underline":
							text = <u key={`${key}-underline`}>{text}</u>;
							break;
						case "strike":
							text = <s key={`${key}-strike`}>{text}</s>;
							break;
						case "code":
							text = <code key={`${key}-code`}>{text}</code>;
							break;
						case "link": {
							const href = getSafeUrl(mark.attrs?.href, [
								"http:",
								"https:",
								"mailto:",
							]);
							if (href) {
								text = (
									<a
										key={`${key}-link`}
										href={href}
										target="_blank"
										rel="noopener noreferrer"
									>
										{text}
									</a>
								);
							}
							break;
						}
					}
				}
			}

			return text;
		}

		default:
			return null;
	}
}

function getSafeUrl(
	value: unknown,
	allowedProtocols: string[],
): string | undefined {
	if (typeof value !== "string") {
		return undefined;
	}

	if (value.startsWith("/") && !value.startsWith("//")) {
		return value;
	}

	try {
		const url = new URL(value);
		return allowedProtocols.includes(url.protocol)
			? url.toString()
			: undefined;
	} catch {
		return undefined;
	}
}
