"use client";

import { Fragment, useEffect, useRef, useState } from "react";

import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { Node as PMNode } from "@tiptap/pm/model";
import {
  type Editor,
  EditorContent,
  type JSONContent,
  getSchema,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  type LucideIcon,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

import { cn } from "@/app/_libs/utils/cn";

/*
 * Static page content is a Tiptap (ProseMirror) JSON document (spec-08 §2.1).
 * The extension list below defines what a document may contain, so it must match the
 * backend's list, which rebuilds and sanitises the HTML on publish.
 */

export const MAX_CHARS = 50_000;

/** Web, email, phone or a site path like /terms-of-service. Blocks javascript:, //host, etc. */
const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/(?!\/))/i;

/** Turns what the admin typed into a link target, or returns null if it isn't allowed. */
export function normaliseUrl(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;
  if (/^[^\s@/:]+@[^\s@]+\.[^\s@]+$/.test(url)) return `mailto:${url}`;
  if (/^\+?[\d\s-]{6,}$/.test(url)) return `tel:${url.replace(/[\s-]/g, "")}`;
  if (/^www\./i.test(url)) return `https://${url}`;
  return SAFE_URL.test(url) ? url : null;
}

/** Extensions that shape the document schema (shared by editor, preview and normalisation). */
export const STATIC_PAGE_EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    code: false,
    codeBlock: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      isAllowedUri: (url) => SAFE_URL.test(url),
      HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
    },
  }),
];

const schema = getSchema(STATIC_PAGE_EXTENSIONS);

export const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

/** Round-trips a doc through the schema so it matches `editor.getJSON()` exactly. */
export const normalizeDoc = (doc: JSONContent): JSONContent =>
  PMNode.fromJSON(schema, doc).toJSON();

/** Plain text of a doc, e.g. to check that it isn't empty. */
export const docText = (doc: JSONContent) => PMNode.fromJSON(schema, doc).textContent;

const sameDoc = (a: JSONContent, b: JSONContent) => JSON.stringify(a) === JSON.stringify(b);

export const PROSE_CLASS =
  "prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-a:text-primary prose-blockquote:border-primary/60 prose-blockquote:not-italic [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none";

// ─── Toolbar ────────────────────────────────────────────────────────────────

type ToolKey =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "h2"
  | "h3"
  | "bulletList"
  | "orderedList"
  | "blockquote";

const TOOLS: { key: ToolKey; icon: LucideIcon; label: string; run: (e: Editor) => void }[][] = [
  [
    {
      key: "bold",
      icon: Bold,
      label: "Bold (Ctrl/⌘+B)",
      run: (e) => e.chain().focus().toggleBold().run(),
    },
    {
      key: "italic",
      icon: Italic,
      label: "Italic (Ctrl/⌘+I)",
      run: (e) => e.chain().focus().toggleItalic().run(),
    },
    {
      key: "underline",
      icon: Underline,
      label: "Underline (Ctrl/⌘+U)",
      run: (e) => e.chain().focus().toggleUnderline().run(),
    },
    {
      key: "strike",
      icon: Strikethrough,
      label: "Strikethrough",
      run: (e) => e.chain().focus().toggleStrike().run(),
    },
  ],
  [
    {
      key: "h2",
      icon: Heading2,
      label: "Heading",
      run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      key: "h3",
      icon: Heading3,
      label: "Sub-heading",
      run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    },
  ],
  [
    {
      key: "bulletList",
      icon: List,
      label: "Bullet list",
      run: (e) => e.chain().focus().toggleBulletList().run(),
    },
    {
      key: "orderedList",
      icon: ListOrdered,
      label: "Numbered list",
      run: (e) => e.chain().focus().toggleOrderedList().run(),
    },
    {
      key: "blockquote",
      icon: Quote,
      label: "Highlighted note",
      run: (e) => e.chain().focus().toggleBlockquote().run(),
    },
  ],
];

function ToolButton({
  icon: Icon,
  label,
  active,
  ...props
}: { icon: LucideIcon; label: string; active?: boolean } & React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={cn(
        "h-7 w-7 cursor-pointer",
        active && "bg-primary/15 text-primary hover:bg-primary/20",
      )}
      title={label}
      aria-label={label}
      aria-pressed={active}
      // keep focus (and pending marks like bold) in the editor
      onMouseDown={(e) => e.preventDefault()}
      {...props}>
      <Icon className="h-3.5 w-3.5" />
    </Button>
  );
}

// ─── Editor ─────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  id?: string;
  value: JSONContent;
  onChange: (doc: JSONContent) => void;
  placeholder?: string;
  invalid?: boolean;
}

export function RichTextEditor({ id, value, onChange, placeholder, invalid }: RichTextEditorProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkIsEdit, setLinkIsEdit] = useState(false);
  // selection is captured when the link popover opens, since focus moves into it
  const linkRange = useRef({ from: 0, to: 0, text: "" });
  const openLinkRef = useRef<() => void>(() => {});
  const onChangeRef = useRef(onChange);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      ...STATIC_PAGE_EXTENSIONS,
      Placeholder.configure({ placeholder: placeholder ?? "Start writing…" }),
      CharacterCount.configure({ limit: MAX_CHARS }),
    ],
    content: value,
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        class: cn(PROSE_CLASS, "min-h-[360px] px-4 py-3 focus:outline-none"),
      },
      handleKeyDown: (_view, event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
          event.preventDefault();
          openLinkRef.current();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => onChangeRef.current(e.getJSON()),
  });

  // keep the editor in sync when the parent swaps content (page switch, discard)
  useEffect(() => {
    if (editor && !sameDoc(editor.getJSON(), value)) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) return null;
      return {
        bold: e.isActive("bold"),
        italic: e.isActive("italic"),
        underline: e.isActive("underline"),
        strike: e.isActive("strike"),
        h2: e.isActive("heading", { level: 2 }),
        h3: e.isActive("heading", { level: 3 }),
        bulletList: e.isActive("bulletList"),
        orderedList: e.isActive("orderedList"),
        blockquote: e.isActive("blockquote"),
        link: e.isActive("link"),
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
        // re-renders on every doc change so the counter below stays current
        docSize: e.state.doc.content.size,
      };
    },
  });

  const openLink = () => {
    if (!editor) return;
    if (editor.isActive("link")) editor.chain().extendMarkRange("link").run();
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, " ");
    linkRange.current = { from, to, text };
    setLinkIsEdit(editor.isActive("link"));
    setLinkText(text);
    setLinkUrl((editor.getAttributes("link").href as string | undefined) ?? "");
    setLinkOpen(true);
  };

  // latest callbacks for the editor's handlers, which are bound once at creation
  useEffect(() => {
    onChangeRef.current = onChange;
    openLinkRef.current = openLink;
  });

  const applyLink = () => {
    if (!editor) return;
    const href = normaliseUrl(linkUrl);
    if (!href) {
      toast.error("Enter a web address (https://…), an email, a phone number or a /page path");
      return;
    }
    const { from, to, text: selected } = linkRange.current;
    const text = linkText.trim() || linkUrl.trim();
    const chain = editor.chain().focus();
    if (from !== to && text === selected) {
      // same text: keep its other formatting and just (re)apply the link
      chain.setTextSelection({ from, to }).extendMarkRange("link").setLink({ href }).run();
    } else {
      chain
        .insertContentAt(
          { from, to },
          { type: "text", text, marks: [{ type: "link", attrs: { href } }] },
        )
        .unsetMark("link")
        .run();
    }
    setLinkOpen(false);
  };

  const removeLink = () => {
    const { from, to } = linkRange.current;
    editor
      ?.chain()
      .focus()
      .setTextSelection({ from, to })
      .extendMarkRange("link")
      .unsetLink()
      .run();
    setLinkOpen(false);
  };

  // read from the editor, not `state`: the state hook returns a stale snapshot until the first edit
  const doc = editor?.state.doc;
  const chars = doc?.textContent.length ?? 0;
  const words = doc
    ? doc.textBetween(0, doc.content.size, " ").split(/\s+/).filter(Boolean).length
    : 0;
  const nearLimit = chars > MAX_CHARS * 0.9;

  return (
    <div
      className={cn(
        "border-input bg-background/50 focus-within:ring-ring/50 overflow-hidden rounded-md border focus-within:ring-[3px]",
        invalid && "border-destructive focus-within:ring-destructive/40",
      )}>
      {/* Toolbar */}
      {/* Toolbar stays put; the content below scrolls on its own */}
      <div className="border-border/50 bg-muted/40 flex flex-wrap items-center gap-0.5 border-b px-1.5 py-1">
        {TOOLS.map((group, gi) => (
          <Fragment key={gi}>
            {gi > 0 && <span className="bg-border mx-1 h-4 w-px" />}
            {group.map((t) => (
              <ToolButton
                key={t.key}
                icon={t.icon}
                label={t.label}
                active={state?.[t.key]}
                disabled={!editor}
                onClick={() => editor && t.run(editor)}
              />
            ))}
          </Fragment>
        ))}
        <span className="bg-border mx-1 h-4 w-px" />

        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverAnchor asChild>
            <ToolButton
              icon={LinkIcon}
              label="Link (Ctrl/⌘+K)"
              active={state?.link}
              disabled={!editor}
              onClick={openLink}
            />
          </PopoverAnchor>
          <PopoverContent
            align="start"
            className="w-80 space-y-3"
            onCloseAutoFocus={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <Label className="text-xs">Text to show</Label>
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="e.g. contact our support team"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Link to</Label>
              <Input
                value={linkUrl}
                autoFocus
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyLink();
                  }
                }}
                placeholder="https://…, email, phone or /terms-of-service"
              />
            </div>
            <div className="flex items-center gap-2">
              {linkIsEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive mr-auto cursor-pointer"
                  onClick={removeLink}>
                  Remove link
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto cursor-pointer"
                onClick={() => setLinkOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" className="cursor-pointer" onClick={applyLink}>
                {linkIsEdit ? "Update link" : "Insert link"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <ToolButton
          icon={Minus}
          label="Divider"
          disabled={!editor}
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        />
        <ToolButton
          icon={RemoveFormatting}
          label="Clear formatting"
          disabled={!editor}
          onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
        />

        <div className="ml-auto flex items-center gap-0.5">
          <ToolButton
            icon={Undo2}
            label="Undo (Ctrl/⌘+Z)"
            disabled={!state?.canUndo}
            onClick={() => editor?.chain().focus().undo().run()}
          />
          <ToolButton
            icon={Redo2}
            label="Redo (Ctrl/⌘+Shift+Z)"
            disabled={!state?.canRedo}
            onClick={() => editor?.chain().focus().redo().run()}
          />
        </div>
      </div>

      {/* capped height so long pages scroll here, keeping the toolbar and counter in view
          (a sticky toolbar can't work: the layout's <main> never scrolls, the window does) */}
      <div className="max-h-[70vh] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      <div
        className={cn(
          "text-muted-foreground flex justify-end gap-3 px-3 pb-1.5 text-[11px] tabular-nums",
          nearLimit && "text-warning",
        )}>
        <span>{words.toLocaleString()} words</span>
        <span>
          {chars.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
        </span>
      </div>
    </div>
  );
}

// ─── Read-only renderer ─────────────────────────────────────────────────────

/** Renders a doc with the same schema and styles as the editor (preview, past versions). */
export function RichTextView({ doc, className }: { doc: JSONContent; className?: string }) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: STATIC_PAGE_EXTENSIONS,
    content: doc,
    editorProps: { attributes: { class: cn(PROSE_CLASS, className) } },
  });

  useEffect(() => {
    if (editor && !sameDoc(editor.getJSON(), doc)) {
      editor.commands.setContent(doc, { emitUpdate: false });
    }
  }, [editor, doc]);

  return <EditorContent editor={editor} />;
}
