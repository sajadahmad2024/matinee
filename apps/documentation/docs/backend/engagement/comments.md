# Comments APIs — fixes & admin moderation

> Status: **implemented, uncommitted** (branch `feat/video-pipeline`). Migration `0022_comment_fixes`.
>
> Jira: TTLE-230 (Comments APIs). Spec: Figma "Home (Video comments)" + wireframe comment states
> (list, ⋮ → Flag, sort sheet Newest / Oldest / Alphabetically) and the admin panel moderation
> pages (`moderation/**`, ticket "View in context") and `content/details/[id]/_components/video-comments.tsx`.

## Customer endpoints (all `@CustomerOnly`)

| Endpoint | Change |
|---|---|
| `GET /v1/content/:id/comments?page&limit&sort` | **New `sort`** = `newest` (default) \| `oldest` \| `alphabetical` (comment text, case-insensitive) |
| `POST /v1/content/:id/comments` | Body is **trimmed**; whitespace-only → 400 |
| `GET /v1/comments/:id/replies?page&limit&sort` | **New `sort`**, default `oldest` (thread reading order) |
| `POST /v1/comments/:id/replies` | **One reply level**: replying to a reply attaches to its top-level comment. Hidden parent → 404 |
| `PUT/DELETE /v1/comments/:id/reaction` | Hidden comment → 404 |
| `POST /v1/comments/:id/report` | See below |

### Reporting

- Reasons: `nudity_sexual`, `violence_gore`, `hate_speech`, `harassment_bullying`, **`spam`** (new), `other`.
- The comment report and the moderation ticket/report are written in **one transaction**. The
  customer reason is mapped to the moderation reason/category
  (`nudity_sexual→nudity`, `violence_gore→violence`, `harassment_bullying→harassment`, others 1:1).
  Previously 3 of 5 reasons failed on the `moderation_reports.reason` check and left an orphan
  report behind.
- Reporting the same comment twice → **409** (was a 500). Reporting your own comment → **400**.
  Hidden/deleted comment → **404**.

### Counts

`contents.comment_count` and `comments.reply_count` now count **visible** comments only. Hiding
or deleting decrements; restoring increments (was: only `deleted` changed counts, so hidden
comments still showed in "View N more replies"). Migration backfills both counters.

## Admin endpoints (`/v1/admin/comments`)

| Endpoint | Permission | Behaviour |
|---|---|---|
| `GET /?contentId&status&parentId&flagged&sort&page&limit` | `content:read` | Adds filters `parentId` (replies of one comment; `top` = top-level only), `flagged=true` (has pending reports), `sort` (`newest`/`oldest`/`most_flagged`). Rows add **`flagReasons`** (distinct pending report reasons) and **`pendingReports`** |
| `GET /:id` | `content:read` | **Thread / "View in context"**: `{ comment, parent, replies (any status, oldest first), reports, openTicket }` |
| `POST /:id/enforce` | `users:moderate` | **Warn / suspend / ban the author from the comment**. Body `{ action: 'warn'\|'suspend'\|'ban', reason, suspendUntil?, hideComment? }`. `hideComment` defaults to `true` for suspend/ban, `false` for warn; `suspendUntil` defaults to now + 7 days. Warn sends an in-app notification and records a `warn` enforcement action. Resolves the comment's open ticket and marks its pending reports `actioned` |
| `PATCH /:id/status` | `content:write` | Unchanged (hide / restore / delete) |
| `GET /reports` | `content:write` | Unchanged |
| `PATCH /reports/:id/resolve` | `content:write` | Now **syncs**: `actioned` hides the comment; when no pending reports remain, the open moderation ticket closes (`content_removed` if any report was actioned, else `dismissed`) |

### Moderation tickets ↔ comment reports

`POST /v1/admin/moderation/tickets/:id/resolve` for a **comment** ticket now marks that comment's
pending reports `dismissed` (`no_action`) or `actioned` (any other resolution), and the whole
resolve runs in one transaction. `user_warned` now notifies the user and records a `warn`
enforcement action (previously a no-op).

## Schema (`0022_comment_fixes.sql`)

| Change | Why |
|---|---|
| `comment_reports.reason` check adds `spam` | new reason |
| `user_enforcement_actions.action` check adds `warn` | warnings in enforcement history |
| `trg_comment_counts` counts `visible` only + backfill | hidden comments no longer counted |

## Not covered

- Comment domain events for quests/badges ("Leave 2 Comments", "Comment Connoisseur").
- Dashboard community metrics (comments per user per week, reply rate).
- Admin panel wiring (frontend).
