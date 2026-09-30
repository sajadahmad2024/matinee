import type { JSONContent } from "@tiptap/react";

import { normalizeDoc } from "./rich-text-editor";

// Mirrors the planned static_pages + static_page_versions tables (spec-08 §4).

export interface StaticPageContent {
  title: string;
  doc: JSONContent; // Tiptap document
}

export interface StaticPageVersion extends StaticPageContent {
  id: string;
  label: string; // e.g. 'privacy-2026-09-12' — stored in user_consents.document_version
  publishedAt: string; // ISO
  publishedBy: string;
}

export interface StaticPage {
  slug: string;
  consentType: "privacy" | "terms";
  /** What the editor opens with: the live content, or starting content if never published. */
  content: StaticPageContent;
  versions: StaticPageVersion[]; // newest first; versions[0] is live
}

export type PageStatus = "published" | "unpublished";

export const livePath = (slug: string) => `/legal/${slug}`;

export const sameContent = (a: StaticPageContent, b: StaticPageContent) =>
  a.title === b.title && JSON.stringify(a.doc) === JSON.stringify(b.doc);

export const pageStatus = (page: StaticPage): PageStatus =>
  page.versions.length ? "published" : "unpublished";

/** Next version label: `{consentType}-{YYYY-MM-DD}`, suffixed `-2`, `-3`… if published again that day. */
export function nextVersionLabel(page: StaticPage, now = new Date()): string {
  const base = `${page.consentType}-${now.toISOString().slice(0, 10)}`;
  const taken = new Set(page.versions.map((v) => v.label));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

// ─── Mock content ───────────────────────────────────────────────────────────

type Mark = "bold" | "italic" | { type: "link"; attrs: { href: string } };

const t = (text: string, ...marks: Mark[]): JSONContent => ({
  type: "text",
  text,
  ...(marks.length ? { marks: marks.map((m) => (typeof m === "string" ? { type: m } : m)) } : {}),
});
const link = (text: string, href: string) => t(text, { type: "link", attrs: { href } });
const p = (...content: JSONContent[]): JSONContent => ({ type: "paragraph", content });
const h = (level: 2 | 3, text: string): JSONContent => ({
  type: "heading",
  attrs: { level },
  content: [t(text)],
});
const list = (type: "bulletList" | "orderedList", items: JSONContent[][]): JSONContent => ({
  type,
  content: items.map((c) => ({ type: "listItem", content: [p(...c)] })),
});
const note = (...content: JSONContent[]): JSONContent => ({
  type: "blockquote",
  content: [p(...content)],
});
const doc = (...content: JSONContent[]) => normalizeDoc({ type: "doc", content });

const PRIVACY_V1: StaticPageContent = {
  title: "Privacy Policy",
  doc: doc(
    p(t("This policy explains what information we collect and how we use it.")),
    h(2, "Information we collect"),
    p(t("We collect the information you give us when you create an account.")),
    h(2, "Contact us"),
    p(t("Email "), link("privacy@example.com", "mailto:privacy@example.com"), t(".")),
  ),
};

const PRIVACY_V2: StaticPageContent = {
  title: "Privacy Policy",
  doc: doc(
    p(
      t(
        "This policy explains what information we collect, how we use it, and the choices you have.",
      ),
    ),
    h(2, "Information we collect"),
    p(
      t(
        "We collect information you give us when you create an account, such as your name, email and phone number.",
      ),
    ),
    h(3, "Collected automatically"),
    list("bulletList", [
      [t("Device information", "bold"), t(" (model, OS version)")],
      [t("Usage data", "bold"), t(" (videos watched, games played)")],
      [t("Approximate location based on your IP address")],
    ]),
    note(t("We never sell your personal information to third parties.")),
    h(2, "How we use your information"),
    p(t("We use your information to:")),
    list("orderedList", [
      [t("Run and improve the app")],
      [t("Personalise your feed")],
      [t("Award points and rewards")],
      [t("Keep the platform safe")],
    ]),
    p(
      t("See our "),
      link("Terms of Service", "/legal/terms-of-service"),
      t(" for the rules that apply when you use the app."),
    ),
    h(2, "Contact us"),
    p(
      t("If you have questions about this policy, email "),
      link("privacy@example.com", "mailto:privacy@example.com"),
      t("."),
    ),
  ),
};

export const INITIAL_PAGES: StaticPage[] = [
  {
    slug: "privacy-policy",
    consentType: "privacy",
    content: PRIVACY_V2,
    versions: [
      {
        ...PRIVACY_V2,
        id: "v2",
        label: "privacy-2026-09-12",
        publishedAt: "2026-09-12T10:30:00Z",
        publishedBy: "Sajad Ahmad",
      },
      {
        ...PRIVACY_V1,
        id: "v1",
        label: "privacy-2026-05-28",
        publishedAt: "2026-05-28T09:00:00Z",
        publishedBy: "Sajad Ahmad",
      },
    ],
  },
  {
    slug: "terms-of-service",
    consentType: "terms",
    content: { title: "Terms of Service", doc: doc(h(2, "Acceptance of terms"), p()) },
    versions: [],
  },
];
