import * as React from "react";

/** Plain text, or formatted HTML with a plain-text fallback for apps that don't take formatting. */
export type ClipboardContent = string | { text: string; html?: string };

async function writeToClipboard(content: ClipboardContent) {
  const { text, html } = typeof content === "string" ? { text: content, html: undefined } : content;
  if (html && typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      }),
    ]);
    return;
  }
  await navigator.clipboard.writeText(text);
}

/**
 * Copies to the clipboard and exposes a short-lived `copied` flag for "Copied ✓" feedback.
 *
 *   const { copied, copy } = useCopyToClipboard();
 *   const ok = await copy("some text");                  // plain text
 *   const ok = await copy({ text, html });                // keeps formatting when pasted
 *
 * `copy` resolves to false (never throws) when the browser blocks clipboard access, so the
 * caller can show its own error message.
 */
export function useCopyToClipboard({ resetAfterMs = 2000 }: { resetAfterMs?: number } = {}) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const copy = React.useCallback(
    async (content: ClipboardContent) => {
      try {
        await writeToClipboard(content);
      } catch {
        setCopied(false);
        return false;
      }
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), resetAfterMs);
      return true;
    },
    [resetAfterMs],
  );

  return { copied, copy };
}
