"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { Button } from "@ui/components/button";
import {
	Bold,
	Italic,
	Underline as UnderlineIcon,
	Strikethrough,
	Code,
	Heading1,
	Heading2,
	Heading3,
	List,
	ListOrdered,
	Quote,
	Link as LinkIcon,
	Image as ImageIcon,
	AlignLeft,
	AlignCenter,
	AlignRight,
	Undo2,
	Redo2,
} from "lucide-react";
import "./editor.css";

const lowlight = createLowlight(common);

interface TiptapEditorProps {
	content: Record<string, unknown>;
	onChange: (content: Record<string, unknown>) => void;
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				codeBlock: false,
			}),
			CodeBlockLowlight.configure({
				lowlight,
			}),
			Link.configure({
				openOnClick: false,
			}),
			Image,
			Underline,
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
		],
		content,
		onUpdate: ({ editor }) => {
			onChange(editor.getJSON());
		},
	});

	if (!editor) {
		return null;
	}

	function addImage() {
		const url = window.prompt("Enter image URL:");
		if (url && editor) {
			editor.chain().focus().setImage({ src: url }).run();
		}
	}

	function addLink() {
		const url = window.prompt("Enter URL:");
		if (url && editor) {
			editor
				.chain()
				.focus()
				.extendMarkRange("link")
				.setLink({ href: url })
				.run();
		}
	}

	const ToolbarButton = ({
		onClick,
		isActive,
		icon: Icon,
		title,
	}: {
		onClick: () => void;
		isActive?: boolean;
		icon: React.ComponentType<{ className?: string }>;
		title: string;
	}) => (
		<Button
			type="button"
			size="sm"
			variant={isActive ? "primary" : "outline"}
			onClick={onClick}
			title={title}
			className="h-8 w-8 p-0"
		>
			<Icon className="h-4 w-4" />
		</Button>
	);

	return (
		<div className="border rounded-lg overflow-hidden">
			<div className="bg-muted p-2 border-b flex flex-wrap gap-1">
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBold().run()}
					isActive={editor.isActive("bold")}
					icon={Bold}
					title="Bold"
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleItalic().run()}
					isActive={editor.isActive("italic")}
					icon={Italic}
					title="Italic"
				/>
				<ToolbarButton
					onClick={() =>
						editor.chain().focus().toggleUnderline().run()
					}
					isActive={editor.isActive("underline")}
					icon={UnderlineIcon}
					title="Underline"
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleStrike().run()}
					isActive={editor.isActive("strike")}
					icon={Strikethrough}
					title="Strikethrough"
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleCode().run()}
					isActive={editor.isActive("code")}
					icon={Code}
					title="Inline Code"
				/>

				<div className="w-px bg-border" />

				<ToolbarButton
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 1 }).run()
					}
					isActive={editor.isActive("heading", { level: 1 })}
					icon={Heading1}
					title="Heading 1"
				/>
				<ToolbarButton
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
					isActive={editor.isActive("heading", { level: 2 })}
					icon={Heading2}
					title="Heading 2"
				/>
				<ToolbarButton
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 3 }).run()
					}
					isActive={editor.isActive("heading", { level: 3 })}
					icon={Heading3}
					title="Heading 3"
				/>

				<div className="w-px bg-border" />

				<ToolbarButton
					onClick={() =>
						editor.chain().focus().toggleBulletList().run()
					}
					isActive={editor.isActive("bulletList")}
					icon={List}
					title="Bullet List"
				/>
				<ToolbarButton
					onClick={() =>
						editor.chain().focus().toggleOrderedList().run()
					}
					isActive={editor.isActive("orderedList")}
					icon={ListOrdered}
					title="Ordered List"
				/>
				<ToolbarButton
					onClick={() =>
						editor.chain().focus().toggleBlockquote().run()
					}
					isActive={editor.isActive("blockquote")}
					icon={Quote}
					title="Blockquote"
				/>

				<div className="w-px bg-border" />

				<ToolbarButton
					onClick={() =>
						editor.chain().focus().setTextAlign("left").run()
					}
					isActive={editor.isActive({ textAlign: "left" })}
					icon={AlignLeft}
					title="Align Left"
				/>
				<ToolbarButton
					onClick={() =>
						editor.chain().focus().setTextAlign("center").run()
					}
					isActive={editor.isActive({ textAlign: "center" })}
					icon={AlignCenter}
					title="Align Center"
				/>
				<ToolbarButton
					onClick={() =>
						editor.chain().focus().setTextAlign("right").run()
					}
					isActive={editor.isActive({ textAlign: "right" })}
					icon={AlignRight}
					title="Align Right"
				/>

				<div className="w-px bg-border" />

				<ToolbarButton
					onClick={addLink}
					isActive={editor.isActive("link")}
					icon={LinkIcon}
					title="Add Link"
				/>
				<ToolbarButton
					onClick={addImage}
					icon={ImageIcon}
					title="Add Image"
				/>

				<div className="w-px bg-border" />

				<ToolbarButton
					onClick={() => editor.chain().focus().undo().run()}
					icon={Undo2}
					title="Undo"
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().redo().run()}
					icon={Redo2}
					title="Redo"
				/>
			</div>

			<EditorContent
				editor={editor}
				className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-96 focus:outline-none"
			/>
		</div>
	);
}
