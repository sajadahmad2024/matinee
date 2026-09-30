const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

/**
 * Makes text safe to put inside hand-built HTML, so it shows exactly as written:
 * `Terms & Conditions` → `Terms &amp; Conditions`, `<b>` → `&lt;b&gt;` (not a real tag).
 */
export const escapeHtml = (text: string) => text.replace(/[&<>"]/g, (c) => HTML_ESCAPES[c]);
