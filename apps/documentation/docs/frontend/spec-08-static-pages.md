# Implementation Spec 08 — Admin Panel: Static Pages

**App:** `apps/web` (Next.js admin panel) · **Scope:** UI only, mock data (no API or DB yet)
**Status:** ✅ Implemented (UI) · Backend: planned (§4)
**Branch:** `web/feat/static-page-editor`
**Goal:** let admins write, publish and keep a record of legal pages (Privacy Policy, Terms of Service) with a rich-text editor. Users on web and in the Flutter app see the published version.

---

## 1. Where it lives

Settings → **Static Pages** tab (`/settings?tab=pages`, lucide `FileText` icon). It is the last tab, after Growth.

Seeded pages (mock):

| Slug | Consent type | Title | State |
| --- | --- | --- | --- |
| `privacy-policy` | `privacy` | Privacy Policy | Published (2 versions) |
| `terms-of-service` | `terms` | Terms of Service | Not published yet |

Pages are fixed by slug. Admins edit them but do not create or delete them; new slugs are added in seed data. Each page maps to a `user_consents.consent_type`.

---

## 2. Layout

Two columns on desktop, stacked on mobile:

- **Left: page list.** Each row shows the title and a status badge. The selected row is highlighted.
- **Right, top: editor card.**
  - Header: page title, status badge, public path (`/legal/privacy-policy`), and "Last published {date} by {name} · Version {label}", or "Not published yet — users can't see this page".
  - **Edit / Preview** toggle. Preview renders the page title and content with the same styles users will see.
  - Edit mode fields:
    - **Page title** (required, max 120)
    - **Content**: one Tiptap editor for the whole page (§2.1). Headings inside the content split it into sections.
  - Footer: "● Unpublished changes" or "No changes", **Discard**, **Publish**.
- **Right, bottom: Published versions card.** It lists every publish, newest first: version label, **Live** badge on the current one, and the published date and admin. **View** opens the version read-only in a dialog. If the page was never published, it shows "Not published yet. Users can't see this page until you publish it."

### 2.1 Content editor (Tiptap)

The editor is built on **Tiptap v3** (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extensions`). Content is stored as **Tiptap JSON** (a ProseMirror document), never as HTML typed by the admin.

**Allowed content.** This list is the schema. The backend must use the same list (§4):

| Toolbar button | Shortcut | Node / mark |
| --- | --- | --- |
| Bold · Italic · Underline · Strikethrough | ⌘/Ctrl+B · I · U · ⌘/Ctrl+Shift+S | `bold`, `italic`, `underline`, `strike` |
| Heading · Sub-heading | ⌘/Ctrl+Alt+2 · 3 | `heading` (levels 2 and 3 only; the page title is the H1) |
| Bullet list · Numbered list | ⌘/Ctrl+Shift+8 · 7 | `bulletList`, `orderedList`, `listItem` |
| Highlighted note | ⌘/Ctrl+Shift+B | `blockquote`, shown as a callout without quote marks |
| Link | ⌘/Ctrl+K | `link` mark |
| Divider | — | `horizontalRule` |
| Clear formatting | — | removes marks and resets blocks to paragraphs |
| Undo · Redo | ⌘/Ctrl+Z · ⌘/Ctrl+Shift+Z | — |

Also always present: `doc`, `paragraph`, `text`, `hardBreak`. Code and code blocks are turned off.

**Links.** The link popover has "Text to show" (prefilled from the selection) and "Link to". Placing the cursor on an existing link opens it for editing, with a **Remove link** button. Accepted targets:

- `https://` and `http://` web addresses. A bare `www.` address gets `https://` added.
- An email address, turned into `mailto:`.
- A phone number, turned into `tel:`.
- A site path such as `/legal/terms-of-service`, for linking between pages.

Anything else (`javascript:`, `//host`, …) is rejected with a toast. Pasted or auto-detected links go through the same check. Links render with `target="_blank" rel="noopener noreferrer"`.

**Limits.** 50,000 characters of text, enforced by the CharacterCount extension. A counter under the editor shows words and characters and turns amber above 90%.

**Toolbar behaviour.** Buttons show their active state for the current selection. Pressing a toolbar button keeps focus in the editor, so a mark like Bold applies to the next typed text.

### 2.2 Status

There are **no drafts**. Each page has a list of immutable **published versions**, and the newest one is live. The editor opens with the live content, or with starting content if the page was never published. Edits exist only in the editor until the admin publishes them.

| Status badge | When |
| --- | --- |
| **Published** (green) | at least one version exists |
| **Not published** (grey) | never published |

The footer shows **● Unpublished changes** when the editor differs from what it opened with (compared on title and the document JSON).

### 2.3 Versions

- Label format: `{consentType}-{YYYY-MM-DD}` of the publish day, e.g. `privacy-2026-09-30`. A second publish on the same day gets `-2`, then `-3`, and so on.
- The label is what the apps store in `user_consents.document_version` when a user accepts the page, so every consent points to the exact text the user saw.
- Versions are never edited or deleted.

### 2.4 Actions

| Action | Behaviour |
| --- | --- |
| Publish | Validates (§2.5), then opens a confirmation dialog: "This publishes version {label} for all users on web and app". On confirm it adds a new version, which becomes live. Disabled when a published page has no changes. Always enabled for a page that was never published. |
| Discard | Resets the editor to the live content (or the starting content). Only enabled when there are unpublished changes. |
| Switch page with unpublished changes | Confirmation dialog: "Discard unsaved changes? Your changes to {title} haven't been published." Discard or cancel. |
| Close or reload the browser tab with unsaved changes | Browser `beforeunload` warning. |

### 2.5 Publish validation

- Title is required.
- Content must contain some text.

Errors show as a toast, and the fields with problems get a red border.

---

## 3. Data shape

```ts
import type { JSONContent } from "@tiptap/react";

interface StaticPageContent {
  title: string;
  doc: JSONContent; // Tiptap document
}

interface StaticPageVersion extends StaticPageContent {
  id: string;
  label: string;       // 'privacy-2026-09-30'
  publishedAt: string; // ISO
  publishedBy: string;
}

interface StaticPage {
  slug: string;                     // 'privacy-policy'
  consentType: "privacy" | "terms";
  content: StaticPageContent;       // live content, or starting content if never published
  versions: StaticPageVersion[];    // newest first; versions[0] is live
}
```

Mock docs are built with small helpers and passed through `normalizeDoc`, which round-trips JSON through the editor schema. It then equals `editor.getJSON()` exactly, so opening a page never shows it as changed.

---

## 4. Backend contract (next step, not built yet)

**Tables:**

`static_pages`: one row per page. There are no drafts.

| Column | Type |
| --- | --- |
| `slug` | `VARCHAR(80)` PK |
| `consent_type` | `VARCHAR(20)` (`privacy`, `terms`) |
| `default_title` | `VARCHAR(120)`, the title the editor starts with before the first publish |
| `published_version_id` | `UUID NULL` FK to `static_page_versions` |

`static_page_versions`: one immutable row per publish (the legal record).

| Column | Type |
| --- | --- |
| `id` | `UUID` PK |
| `slug` | FK to `static_pages` |
| `version_label` | `VARCHAR(40)` UNIQUE |
| `title` | `VARCHAR(120) NOT NULL` |
| `doc` | `JSONB NOT NULL` |
| `html` | `TEXT NOT NULL`, generated and sanitised at publish |
| `published_by` | `UUID` FK to `users` |
| `published_at` | `TIMESTAMPTZ` |

Every publish also writes an `admin_audit_log` row with action `static_page.published`.

**Endpoints** (NestJS `PlatformModule`):

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| GET | `/v1/admin/settings/static-pages` | `compliance:read` | List pages with status |
| GET | `/v1/admin/settings/static-pages/:slug` | `compliance:read` | Live version (or `default_title` + empty doc if never published) |
| POST | `/v1/admin/settings/static-pages/:slug/publish` | `compliance:write` | Publish `{ title, doc, baseVersionId }` as a new version. 409 if the live version is no longer `baseVersionId`, i.e. another admin published since this editor loaded |
| GET | `/v1/admin/settings/static-pages/:slug/versions` | `compliance:read` | Version history |
| GET | `/v1/pages/:slug` | Public | `{ title, versionLabel, publishedAt, html }` for the apps |
| GET | `/legal/:slug` | Public, not versioned | Rendered HTML page; the Flutter app opens this URL |

**Rules:**

- **Clients never send HTML.** On publish the server builds HTML from `doc` with `@tiptap/html/server`, using the same extension list as §2.1. Unknown node or mark types are rejected with 400.
- The HTML then goes through `sanitize-html` (already a backend dependency). The allowlist is `p h2 h3 strong em u s ul ol li blockquote a hr br`, plus `a[href]` limited to `https`, `http`, `mailto`, `tel` and paths starting with `/`.
- Limits: title 120 characters, document JSON 200 KB, text 50,000 characters.
- Public endpoints send `Cache-Control: public, max-age=300`, and the cache is cleared on publish.

**Flutter:** point `AppLegalLinks.terms` / `.privacy` (`lib/core/config/legal_links.dart`) at `/legal/terms-of-service` and `/legal/privacy-policy`. When recording consent, store the `versionLabel` from `/v1/pages/:slug` as `document_version`.

---

## 5. Files

| File | Purpose |
| --- | --- |
| `apps/web/src/app/(public)/settings/_components/static-page-editor/static-pages-settings.tsx` | Tab: page list, editor card, preview, versions card, dialogs |
| `apps/web/src/app/(public)/settings/_components/static-page-editor/rich-text-editor.tsx` | Tiptap schema (`STATIC_PAGE_EXTENSIONS`), `RichTextEditor` (toolbar, link popover, counter), `RichTextView` (read-only), `normalizeDoc`, `normaliseUrl` |
| `apps/web/src/app/(public)/settings/_components/static-page-editor/static-pages-data.ts` | Types, status and version-label helpers, mock pages |
| `apps/web/src/app/(public)/settings/_components/settings-view.tsx` | Registers the `pages` tab |
| `apps/web/src/app/globals.css` | Tiptap placeholder style |

---

## 6. Out of scope

- Tables, images and embeds inside page content.
- Drafts and effective dates (removed to keep publishing simple).
- Comparing two versions, or restoring an old version into the editor.
- Notifying users or asking them to accept again when a policy changes.
- Creating or deleting pages from the UI.
- Translations of pages.
