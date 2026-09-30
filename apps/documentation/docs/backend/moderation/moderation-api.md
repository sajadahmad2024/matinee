# Moderation APIs (TTLE-231)

> Status: **implemented, uncommitted**. Migration `0024_moderation`.
>
> Spec: admin panel `apps/web/src/app/(public)/moderation/**` (queue + filters + bulk bar,
> analytics KPIs/charts, ticket resolution modal: evidence panel + action panel + internal note)
> and the mobile "Flag" affordance for videos / users.

## Model

One **ticket** per offending subject (`moderation_tickets`, `subject_type` = `comment` | `content`
| `user`). Every customer report is a `moderation_reports` row rolled up into the subject's
**open** ticket (`open` / `in_review` / `escalated`); `report_count` is bumped and the ticket's
severity is raised if the new report is more severe. Once a ticket is closed (`resolved` /
`dismissed`) the next report opens a new ticket.

- **Open-ticket uniqueness** — a partial unique index guarantees one open ticket per subject;
  `createOrBumpTicket` is a single `INSERT … ON CONFLICT DO UPDATE` (race-safe).
- **Repeat offender** — on ticket creation `is_repeat_offender` is set when the offender has a
  prior *actioned* ticket (resolved with anything other than `no_action`) or a prior
  warn/suspend/ban enforcement. After a ticket is actioned against a user, that user's other open
  tickets are flagged too. Migration backfills existing tickets.
- **One report per reporter per open ticket** — unique `(ticket_id, reporter_user_id)`; repeat →
  **409**.
- **Audit trail** — every admin moderation action writes an `admin_audit_log` row
  (`target_type = 'moderation_ticket'`, actor, actor label snapshot, IP, user agent, metadata).
- **Internal notes** — `moderation_ticket_notes` (moderator-only comments on a ticket).

UI type `video` ≡ backend `content` (the list filter accepts both).

## Customer endpoints (`@CustomerOnly`)

Throttle: 10 / minute and 50 / 30 minutes per route.

| Endpoint | Body | Result |
|---|---|---|
| `POST /v1/content/:id/report` | `{ reason, note? }` | 201 `{ ticketId, status: "received" }` |
| `POST /v1/users/:id/report` | `{ reason, note? }` | 201 `{ ticketId, status: "received" }` |

- `reason`: `hate_speech`, `spam`, `nudity`, `violence`, `harassment`, `other`. The comment-report
  aliases `nudity_sexual`, `violence_gore`, `harassment_bullying` are also accepted and mapped.
  `note` ≤ 500 chars.
- Severity: `hate_speech` / `nudity` / `violence` → `high`, `harassment` → `medium`,
  `spam` / `other` → `low`. Category = reason.
- Content: must exist, be `published` and not deleted, else 404. Snapshot = title. No offender (studio
  content).
- User: must be an existing, non-deleted **customer**, else 404. Reporting yourself → 400.
  Offender = the reported user; snapshot = `@username` / display name.
- Already reported (you have a report on the subject's open ticket) → 409.

## Admin endpoints (`/v1/admin/moderation`, `@AdminOnly`, permission `users:moderate`)

### `GET /tickets` — queue

Query: `page`, `limit` (≤ 100), `status` (`open|in_review|resolved|dismissed|escalated|pending`,
`pending` = the three open statuses), `severity`, `category`, `type` (`comment|content|video|user`),
`assignee` (`me|unassigned|<uuid>`), `offenderId`, `repeatOffender` (bool), `q` (search: offender
username / name, offender or subject id, snapshot text; ≤ 100 chars), `from` / `to` (ISO date on
`createdAt`), `sort` (`newest` default | `oldest` | `severity` | `reports`).

Item: `id, subjectType, subjectId, offenderUserId, offenderUsername, severity, category,
contentSnapshot, reportCount, isRepeatOffender, status, assignedTo, assigneeName, resolution,
createdAt, updatedAt`. Paginated envelope.

### `GET /stats` — analytics (moderation-analytics.tsx)

```jsonc
{
  "backlog": { "total": 12, "health": "healthy",          // <50 healthy, <100 elevated, else critical
               "byStatus": { "open": 9, "in_review": 2, "escalated": 1 },
               "bySeverity": { "high": 4, "medium": 5, "low": 3 },
               "byType": { "comment": 8, "content": 2, "user": 2 } },
  "byStatus": { "open": 9, "in_review": 2, "resolved": 30, "dismissed": 4, "escalated": 1 },
  "avgResolutionMinutes": { "current": 4.2, "previous": 4.8, "changePct": -12.5 }, // closed in last 7d vs the 7d before; null when none
  "resolvedToday": { "today": 127, "yesterday": 104, "delta": 23 },                // resolved+dismissed, UTC days
  "safetyScore": { "score": 94.2, "windowDays": 30, "totalItems": 1200, "flaggedItems": 70 },
  "reportVolume24h": { "total": 184, "previous24h": 150,
                       "buckets": [{ "hour": "2026-09-25T10:00:00.000Z", "reports": 12 } /* 24 hourly buckets */] },
  "violationBreakdown": [{ "category": "hate_speech", "count": 40, "percentage": 40.0 } /* all 6 categories, last 30d */]
}
```

**Safety score** = `100 × (1 − flaggedItems / totalItems)`, rounded to 0.1, clamped to [0, 100]
(100 when there are no items). `totalItems` = comments + contents created in the last 30 days;
`flaggedItems` = distinct comment/content subjects with a ticket created in that window that is
still open or was actioned (`resolution ≠ no_action`).

### `GET /tickets/:id` — detail (evidence panel)

Ticket fields (as list + `resolutionNote`, `resolvedAt`, `resolvedBy`) plus:

- `reports[]` — `id, reporterUserId, reporterUsername, reason, note, createdAt`
- `subject` — comment: `{ type, id, body, status, contentId, contentTitle, author, contextPath }`
  (`contextPath` = `/v1/admin/comments/:id` for "View in context"); content:
  `{ type, id, title, status, removed }`; user: `{ type, id }`. `null` if the subject is gone.
- `offender` — `{ id, username, name, avatarUrl, status, suspendedUntil, joinedAt }` or null
- `offenderHistory` — `{ totals: { tickets, actioned, dismissed, open }, priorTickets[] (last 20,
  excluding this one: id, subjectType, category, severity, status, resolution, createdAt),
  enforcements[] (id, action, reason, expiresAt, performedBy, createdAt) }` or null
- `notes[]` — `{ id, body, authorId, authorName, createdAt }` (newest first)
- `activity[]` — audit timeline `{ id, action, actorId, actorLabel, metadata, createdAt }` (newest first)

### Ticket workflow

| Endpoint | Body | Notes |
|---|---|---|
| `POST /tickets/:id/assign` | `{ assigneeId? }` | Default: me. Assignee must be an active admin (else 400). Sets `in_review`. Closed ticket → 409 |
| `PATCH /tickets/:id/status` | `{ status: open\|in_review\|escalated, note? }` | Escalate = `escalated`. `open` returns it to the queue (unassigns). `note` is stored as an internal note. Closed → 409 |
| `POST /tickets/:id/notes` | `{ body }` (1–1000) | 201 note. Allowed on any ticket |
| `POST /tickets/:id/resolve` | see below | Closed → 409 (was 400) |
| `POST /tickets/bulk` | see below | Per-item results |
| `GET /audit?page&limit&ticketId&actorId` | — | Moderation audit feed (paginated) |

**Resolve** body: `{ resolution, note?, suspendDuration?, suspendUntil? }`

- `resolution`: `content_removed` | `user_warned` | `user_suspended` | `user_banned` | `no_action`
  (`no_action` → status `dismissed`, else `resolved`).
- `user_suspended`: `suspendDuration` = `24h` | `7d` | `30d` (default `7d`) **or** `suspendUntil`
  (ISO, future, ≤ 1 year) — not both. Duration/until on any other resolution → 400. A permanent
  block is `user_banned` (the UI's "Permanent" option); UI "ban 24h / 7d" → `user_suspended`.
- `content_removed` only on comment/content tickets (comment → hidden, content → soft-deleted);
  `user_*` require an offender (400 otherwise).
- If the offender is already banned, suspend/ban is not re-applied (`enforcement: null`).
- One transaction: action + ticket close (conditional on still being open → 409 on a race) + pending
  comment reports closed (comment tickets) + repeat-offender propagation + audit row.

Result: `{ id, resolution, status, reportsClosed, enforcement: { action, expiresAt } | null }`.

**Bulk** body: `{ ticketIds: uuid[1..100], action: dismiss|resolve|assign|escalate, resolution?,
suspendDuration?, suspendUntil?, note?, assigneeId? }` — `resolve` needs `resolution`.
UI mapping: "Ignore All" → `dismiss`, "Delete Content" → `resolve` + `content_removed`,
"Ban Users" → `resolve` + `user_banned`. Each ticket is processed in its own transaction; one
failure does not abort the rest. A `moderation.bulk` summary audit row is written.

Result: `{ processed, succeeded, failed, results: [{ id, ok, status?, resolution?, error? }] }`.

## Audit actions

`moderation.ticket.assigned`, `moderation.ticket.status_changed`, `moderation.ticket.note_added`,
`moderation.ticket.resolved`, `moderation.ticket.dismissed`, `moderation.bulk`.

## Migration `0024_moderation.sql` (idempotent)

- `moderation_ticket_notes` table.
- Partial unique index: one open ticket per `(subject_type, subject_id)`.
- Unique `(ticket_id, reporter_user_id)` on `moderation_reports`.
- Indexes: tickets `(created_at DESC)`, `(resolved_at DESC)`, `(assigned_to)` open, `(offender_user_id,
  created_at DESC)`; reports `(created_at DESC)`, `(reporter_user_id)`; audit `(target_type,
  target_id, created_at DESC)`.
- Pre-index cleanup: duplicate open tickets per subject are merged (reports moved to the oldest,
  the rest dismissed as "Merged duplicate open ticket"); duplicate reporter rows per ticket removed.
- Backfill `is_repeat_offender`.

## Not implemented

- XP fine / level-down ("Gamified Penalty") — needs a tokenomics debit contract; out of scope.
- "Hide content" vs "delete content" distinction for videos — both map to `content_removed`
  (soft delete); content module owns archive/restore.
