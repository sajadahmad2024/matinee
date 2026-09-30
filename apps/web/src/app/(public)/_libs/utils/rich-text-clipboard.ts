import { type Extensions, type JSONContent, generateHTML, generateText } from "@tiptap/react";

import { escapeHtml } from "./escape-html";

/**
 * Turns a Tiptap document into clipboard content for `useCopyToClipboard`:
 * - `html` keeps headings, lists and links when pasted into an editor, Word or Google Docs,
 * - `text` is the plain-text fallback (blocks separated by a blank line).
 * An optional `title` is added on top (as an `<h1>` in the HTML).
 *
 * Pass the same `extensions` the document was written with.
 */
export function richTextClipboardContent({
  doc,
  extensions,
  title,
}: {
  doc: JSONContent;
  extensions: Extensions;
  title?: string;
}) {
  const bodyHtml = generateHTML(doc, extensions);
  const bodyText = generateText(doc, extensions, { blockSeparator: "\n\n" });
  return {
    html: title ? `<h1>${escapeHtml(title)}</h1>${bodyHtml}` : bodyHtml,
    text: title ? `${title}\n\n${bodyText}` : bodyText,
  };
}
