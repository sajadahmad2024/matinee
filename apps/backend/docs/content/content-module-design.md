# Content Management — DB Design (proposal, for iterative review)

> **Status:** **APPLIED** — `0003_create_content.sql` migrated + introspected; counter triggers
> and the partitioned `content_watch_events` verified; type-check green. Next: content module
> code (controllers/services/repos) on approval. *(Introspect note: the partition catch-all
> `content_watch_events_default` appears as a table in `schema.ts` — ignore it; the app always
> writes to the parent `content_watch_events`, which routes to partitions automatically.)*
> Scope here = **Content catalog + Engagement (like/comment/share/report/
> moderate) + deep per-video Analytics** (which the gamification layer consumes). The 4 games
> (daily streak, quest, predictive, bidding) are **deferred** to the Game module; their
> reference points into content are noted (§7). UUIDv7 PKs throughout; assets are `media_id`
> FKs into `media_metadata` (association by id, per the media module).

---

## 1. Module map

```
 Taxonomy            Catalog                 Engagement                Analytics (feeds games)
 ─────────           ───────                 ──────────                ───────────────────────
 studios ─┐                                  content_reactions         content_watch_events (heartbeat, raw)
 genres ──┤      ┌─▶ contents ◀──┐           comments ──┐              content_views (session)
 tags ────┼──▶   │ (standalone   │           comment_reactions        content_progress (resume)
 people ──┘      │  vertical vid) │           comment_reports          user_daily_activity (rollup)
                 │  content_cast │           content_shares           content_daily_stats (rollup)
                 │  content_tags │           content_watchlist        + denormalized counters on contents
                 │  content_media│           content_moderation_log
                 └─ content_change_history    Access: content_unlocks (exclusive → points)
```

---

## 2. Catalog

### `contents` — the core video entity
| Column | Type | Notes |
|--------|------|-------|
| id | uuid pk (uuidv7) | |
| title | varchar(300) | |
| slug | varchar(320) unique | URL/share key (generated from title) |
| description | text | |
| content_type | varchar(20) | `trailer` \| `bts` \| `clip` (short vertical-video kind) |
| access_tier | varchar(20) | `free` \| `exclusive` (exclusive ⇒ unlock with points, §6) |
| unlock_points | integer | cost to unlock when `access_tier='exclusive'` (else null) |
| studio_id | uuid fk → studios | the producing film studio (the "Studio Name" field); nullable |
| _(genres)_ | — | many-per-content via `content_genres` (M2M), like tags |
| video_media_id | uuid fk → media_metadata | the main HLS video |
| thumbnail_media_id | uuid fk → media_metadata | primary thumbnail (extra images via `content_media`) |
| duration_seconds | integer | denormalized from media for fast listing/sort |
| status | varchar(20) | `draft` \| `pending_approval` \| `scheduled` \| `published` \| `rejected` \| `archived` |
| scheduled_at | timestamptz | when `status='scheduled'` |
| published_at | timestamptz | first publish time |
| is_boosted | boolean | "Boost Content" action |
| boost_priority | integer | higher = ranked first while boosted |
| boosted_until | timestamptz | boost expiry |
| language | varchar(10) | ISO; nullable |
| created_by | uuid fk → users | admin owner ("John Owner") |
| updated_by | uuid fk → users | last editor |
| requested_by / approved_by | uuid fk → users | approval workflow actors |
| approved_at | timestamptz | |
| rejection_reason | varchar(500) | |
| **counters** | | denormalized, trigger-maintained (§5): `view_count`, `unique_viewer_count`, `like_count`, `dislike_count`, `comment_count`, `share_count`, `total_watch_seconds` |
| created_at / updated_at / deleted_at | timestamptz | soft delete |

**Lifecycle (maps to the admin Actions):** Save Draft → `draft`; Request Approval → `pending_approval`; Schedule → `scheduled` (+`scheduled_at`); Publish Now → `published` (+`published_at`); admin reject → `rejected`. A scheduled-publish cron flips `scheduled → published` at `scheduled_at` (reuses the Cron module pattern).

Indexes: `(status, published_at desc)` partial `WHERE deleted_at IS NULL`; `genre_id`; `studio_id`; `slug` unique; `(is_boosted, boost_priority desc)`; trigram/GIN on `title` for search (phase-2).

### `content_media` — extra images/gallery (beyond the primary video + thumbnail)
`id, content_id fk, media_id fk → media_metadata, kind (thumbnail|poster|still|banner), sort_order, created_at`. The "4 thumbnail slots" in the editor live here; the primary thumbnail also stays on `contents.thumbnail_media_id` for convenience.

### `content_change_history` — the "Change History" panel
`id, content_id fk, changed_by fk → users, action (created|updated|submitted|approved|rejected|scheduled|published|boosted|archived), changes jsonb (field-level before/after diff), note varchar(500), created_at`. One row per meaningful edit/transition (who + what changed). App-layer product feature (separate from the disabled generic DB audit). *See Q5 for diff vs full-snapshot.*

---

> **No series/season/episode** — this is a TikTok-style feed of **standalone vertical videos**;
> each content is individual (not a Netflix-style films-in-a-series catalog).

---

## 3. Taxonomy (normalized, admin-managed)

- **`studios`** — `id, name, slug, logo_media_id fk, description, created_at` (unique slug). Films come from studios (with logos); the "Studio Name" field autocompletes/creates one.
- **`genres`** — `id, name, slug, is_active, sort_order` + **`content_genres`** (`content_id, genre_id, is_primary`, pk `(content_id, genre_id)`). **Multi-genre** per content; one may be flagged `is_primary` for display.
- **`tags`** — `id, name, slug` + **`content_tags`** (`content_id, tag_id`, pk both). **Multi-tag** (the comma-separated tags).
- **`people`** — cast/crew: `id, name, slug, photo_media_id fk, bio, created_at`. (Avatars in the Details screen.)
- **`content_cast`** — `content_id, person_id, role (actor|director|writer|producer), character_name, billing_order`, pk `(content_id, person_id, role)`. Ordered cast list.

> *Open question:* keep `studio`/`genre` as entities (recommended for a film catalog — reusable, logos, filtering) or denormalize to text on `contents`? I recommend entities.

---

## 4. Engagement (social)

### `content_reactions` — like / dislike on a video
`id, content_id fk, user_id fk, reaction (like|dislike), created_at`, **unique `(content_id, user_id)`** (one stance per user; toggling updates/deletes). Counts roll up to `contents.like_count/dislike_count`.

### `comments` — threaded
| Column | Type | Notes |
|--------|------|-------|
| id | uuid pk | |
| content_id | uuid fk | |
| user_id | uuid fk | author (guest or customer) |
| parent_comment_id | uuid fk → comments | null = top-level; set = reply (1-level threads per the UI, but self-FK supports deeper) |
| body | text | |
| status | varchar(20) | `visible` \| `hidden` \| `deleted` (admin moderation) |
| like_count / dislike_count / reply_count | integer | denormalized |
| flag_count | integer | number of open reports (drives the "3 flagged" badge) |
| is_flagged | boolean | any open report |
| created_at / updated_at / deleted_at | timestamptz | |

Indexes: `(content_id, created_at desc) WHERE status='visible'`; `parent_comment_id`; `(is_flagged) WHERE is_flagged`.

### `comment_reactions` — like/dislike on a comment
`comment_id, user_id, reaction, created_at`, unique `(comment_id, user_id)`.

### `comment_reports` — flagging (the Report flow)
`id, comment_id fk, reported_by fk → users, reason (nudity_sexual|violence_gore|hate_speech|harassment_bullying|other), description, status (pending|actioned|dismissed), reviewed_by fk → users, reviewed_at, created_at`. Unique `(comment_id, reported_by)` (one report per user per comment). The admin "Comments (11) · 3 flagged" view filters comments with open reports.

### `content_shares` — share events (counts + analytics, referral hook)
`id, content_id fk, user_id fk, channel (whatsapp|x|copy_link|...), created_at`. Feeds `share_count` and the referral attribution (sharing earns points).

### `content_watchlist` — save-for-later / bookmark
`user_id fk, content_id fk, created_at`, pk `(user_id, content_id)`. The user's "watch later" list.

### `content_moderation_log` — admin actions on comments
`id, comment_id fk, action (hide|unhide|delete|warn_user), performed_by fk → users, reason, created_at`. Hide/Delete change `comments.status`; **"Warn User" reuses the existing `user_enforcement_actions`** (add `action='warn'`) so all user sanctions live in one place.

---

## 5. Counters strategy

Hot lists (home feed, admin grid) must not `COUNT(*)` over reactions/comments/views every read. So each volatile total is a **denormalized counter** on `contents` / `comments`, maintained by **DB triggers** on insert/delete of the child rows (consistent with the trigger-based points approach). Source-of-truth rows stay in their tables; counters are a fast cache. A nightly reconcile cron can re-derive counters to correct any drift.

---

## 6. Access & exclusivity

- **Free quota:** guests = 8 distinct videos, customers = 20, then subscribe. "Distinct videos watched" is derived from `content_views` (first view per `(user, content)`); a cheap counter `user.free_videos_used` can be trigger-maintained if we want O(1) gating.
- **`content_unlocks`** — `id, content_id fk, user_id fk, points_spent, unlocked_at`, unique `(content_id, user_id)`. The "Unlock for 500 points" grant. **Points balance + deduction are the tokenomics layer (DB trigger / Rewards module), not here** — this table records the unlock; a trigger enforces/deducts balance. Watching exclusive content requires a row here (or an active subscription).
- **Subscription** = future module; the access check is `access_tier='free' AND within quota` OR `unlock exists` OR `active subscription`.

---

## 7. Deep analytics (the data the games run on)

Three layers — raw events → session summaries → daily rollups:

### `content_watch_events` — raw, high-volume (minute-level engagement)
`id, content_id fk, user_id fk, view_id fk → content_views, event_type (play|pause|seek|heartbeat|complete), position_seconds, occurred_at`. Heartbeats every ~10–30s carry the playhead → exact watch-time, drop-off curves, re-watches. **This is the one high-cardinality table** → designed for **time-partitioning** (monthly) from day one; raw rows age out after aggregation.

### `content_views` — one row per viewing session (summary)
`id, content_id fk, user_id fk, session_id, device, started_at, last_heartbeat_at, watched_seconds, max_position_seconds, completion_percent, is_completed, created_at`. Drives `view_count`, `unique_viewer_count`, average completion, and the free-quota count.

### `content_progress` — per-user-per-content resume state ("continue watching")
`user_id fk, content_id fk, last_position_seconds, is_completed, updated_at`, pk `(user_id, content_id)`. Upserted from heartbeats; powers resume + the "continue watching" rail and contributes to completion. Cheap O(1) lookup (vs scanning events).

### `user_daily_activity` — per-user-per-day rollup (the streak engine's input)
`user_id, activity_date, watch_seconds, videos_started, videos_completed, contents_watched (int), first_seen_at, last_seen_at`, pk `(user_id, activity_date)`. A trigger/cron rolls events into this nightly (and incrementally). **Daily-streak game** reads only this — cheap. (Game state itself = Game module.)

### `content_daily_stats` — per-content-per-day rollup (admin analytics/dashboards)
`content_id, stat_date, views, unique_viewers, watch_seconds, avg_completion, likes, comments, shares`, pk `(content_id, stat_date)`.

> *Open question:* is full raw `content_watch_events` (heartbeat-level) the right depth now, or start with **session summaries only** (`content_views`) + add the raw event log when a game needs sub-video granularity? Raw events are the most flexible but the heaviest.

---

## 8. Game hooks (deferred — Game module owns these)

Not built now; listed so we keep content clean and the FKs land later:
- **Daily streak** (autonomous): reads `user_daily_activity`; no content FK.
- **Quest** (weekly contest, start/end + "watch these videos"): `quests` + `quest_contents (quest_id, content_id)` + `quest_progress (quest_id, user_id, …)`.
- **Predictive** (Q&A, optionally attached to a content; option media can be text/image/video): `predictions (… content_id NULL)` + `prediction_options (… option_media_id)` + `prediction_entries (user_id, …)`.
- **Bidding** (start/end + winner, spends points): `auctions` + `bids (auction_id, user_id, amount_points)`.
- All earn the **same points/tokens** as referral — one tokenomics ledger (Rewards module) is the shared sink.

---

## 9. Decisions & remaining questions

**Confirmed (baked into the tables above):**
1. **Analytics depth** → **full heartbeat events now** — raw `content_watch_events` (second-level) + `content_views` summaries + daily rollups; raw table time-partitioned.
2. **Taxonomy** → **normalized entity tables** (studios/genres/people + joins).
3. **Genre** → **multi-genre M2M** (`content_genres`, like tags; optional `is_primary` for display) — a clip can span action+thriller, etc.
4. **Counters** → **denormalized columns maintained by DB triggers** + nightly reconcile.

5. **Change history** → **field-level diff in `changes jsonb`** (who + action + before/after per field).
6. **Geo availability** → **phase-2** (no `content_geo_rules` now; `geo_policies` still gates tokenomics/subscription).

7. **Scope additions** → **resume** (`content_progress`) and **watchlist** (`content_watchlist`) included. **Series/episodes dropped** — TikTok-style standalone vertical videos, not a Netflix-style series catalog.

**~22 tables, migrated (`0003_create_content.sql`).**
Deferred by design: per-content geo rules, notifications, full-text search index, and the 4 game tables (Game module).
