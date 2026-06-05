# UI-Driven Schema Accommodations — Content & Game Centre

> Status: implemented (migrations `0003`, `0004` edited in place).
> Source of the requirements: the admin-portal refactor of `/content` and `/games`
> (Next.js `apps/web`). This doc records the DB changes that back the new admin controls
> so the API/repository layer can be built against them.

The web portal refactor surfaced six capabilities the admin UI now exposes. Three were
already representable in the schema; three needed new columns/tables. This doc covers all
six and is the authoritative reference for the follow-up repository/service work.

| # | UI capability | DB status before | Change |
|---|---------------|------------------|--------|
| 1 | Content **licensing** signals (status, expiry, licensor, terms) | missing | new columns on `contents` (+ index) |
| 2 | Content **sponsorship / ad-sales** (sponsor, banner, ad timer, placement, revenue) | missing | new `content_sponsorships` table + `is_sponsored` flag |
| 3 | Content **workflow history** timeline | **already existed** (`content_change_history`) | none |
| 4 | **Shared-Content** game type (earn for sharing) | partial (`content_shares` events existed; no earning rule) | new `content_share` ledger `source_type` + `shared_content` reward rule |
| 5 | Per-**instance** unlock threshold + app banner (quests/predictions/auctions) | missing | `unlock_threshold_points` + `banner_media_id` on the 3 instance tables |
| 6 | **App-widget** config per game type (banner, CTA, style, accent, visibility) | missing | new `game_widget_configs` table (5 seeded rows) |

The five game **types are fixed** (daily_streak, quest, shared_content, prediction, bidding);
their **rules are dynamic**. Type-level rows hold defaults/policy + the app-widget config;
per-instance rows (a single quest / prediction / auction) hold the concrete rule, plus their
own optional unlock threshold and banner override.

---

## 1. Content licensing (`contents`)

New columns on `contents` (after `language`):

| Column | Type | Notes |
|--------|------|-------|
| `license_status` | `VARCHAR(20)` `original \| licensed \| expiring \| expired` (default `original`) | drives the row's License chip; `expiring`/`expired` may be set by a cron from `license_expires_at` |
| `license_expires_at` | `TIMESTAMPTZ` | NULL for `original` |
| `licensor_name` | `VARCHAR(200)` | rights holder when `licensed` |
| `license_terms` | `VARCHAR(500)` | short terms summary (shown in the chip tooltip) |
| `recommendation` | `VARCHAR(20)` `promoted \| normal \| deprioritized` (default `normal`) | complements `is_boosted`; `deprioritized` was previously unrepresentable |

Index: `idx_contents_license_expiry` on `(license_expires_at)` `WHERE license_status IN ('licensed','expiring')`
— powers the "expiring soon" admin view and the renewal reminder cron.

## 2. Content sponsorship / ad-sales

`is_sponsored BOOLEAN NOT NULL DEFAULT false` denormalized flag on `contents` (fast row badge
+ filter, mirrors the existing `is_boosted` pattern). The detail lives in a child table so a
content item can carry sponsor history:

```
content_sponsorships
  id, content_id → contents
  sponsor_name           VARCHAR(200) NOT NULL
  banner_media_id        → media_metadata        -- brand banner shown in-app
  ad_duration_seconds    INTEGER  DEFAULT 0       -- ad timer
  placement              pre-roll | mid-roll | post-roll | overlay
  revenue_cents          BIGINT   DEFAULT 0       -- settled by billing/ad-sales
  currency               VARCHAR(3) DEFAULT 'USD'
  starts_at, ends_at     TIMESTAMPTZ
  is_active              BOOLEAN  DEFAULT true
  created_by → users, created_at, updated_at
```

Index `idx_content_sponsorships_content` on `(content_id) WHERE is_active`.

## 3. Workflow history — no change

The "Workflow history" timeline in the row is served by the existing
`content_change_history` table (`action` ∈ created/updated/submitted/approved/rejected/
scheduled/published/boosted/archived, `changes` JSONB, `note`, `changed_by`). Add
`licensed`/`sponsored` actions here later only if we want those events on the same timeline.

## 4. Shared-Content game type

The fifth game type rewards users for sharing content (autonomous/global, like daily streak).
Share **events** already exist (`content_shares` from `0003`). What was missing is the earning
path:

- `ledger_transactions.source_type` CHECK now includes **`content_share`** (award references
  `content_shares.id` via `source_id`, idempotency key `share:<user>:<content>`).
- New seeded reward rule **`shared_content`**:
  `{"points_per_share":15,"daily_share_cap":3,"xp_per_share":5}` (amounts editable; the
  versioned `reward_rule_versions` snapshot is written by the same seed step).

No new instance table — shared-content is autonomous, configured only by its reward rule +
app-widget row.

## 5. Per-instance unlock threshold + banner

Added to **`quests`**, **`predictions`**, **`auctions`**:

| Column | Type | Notes |
|--------|------|-------|
| `unlock_threshold_points` | `INTEGER` | instance is locked until the user holds ≥ N points; NULL = always available ("Locked Progression" / "Unlock requirement" in the create modal) |
| `banner_media_id` | `→ media_metadata` | per-instance app banner override (BannerUpload in the create modal); falls back to the type-level widget banner |

## 6. App-widget config per game type

```
game_widget_configs
  game_key  PK  daily_streak | quest | shared_content | prediction | bidding
  is_visible        BOOLEAN DEFAULT true
  widget_style      card | hero | carousel   (default card)
  cta_label         VARCHAR(80)
  accent_color      VARCHAR(9)   -- hex
  banner_media_id   → media_metadata
  updated_by → users, updated_at
```

Seeded with one row per type (visible, `card`, default CTA). The customer app reads this to
render each game's widget; per-instance overrides (banner) take precedence where present.

---

## 7. Content typing & exclusivity (model clarification)

BTS is **not** a child of a video — it is first-class content. The schema already encodes this;
the web create flow was the thing that wrongly nested it. Confirmed model:

- **Every type is content** — `contents.content_type ∈ trailer | bts | clip`. A BTS is created
  through the same content flow as a trailer (type selector in the create form).
- **Exclusivity is content-level** — `access_tier ∈ free | exclusive` + `unlock_points` apply to
  **any** type, not just BTS. The create form exposes an "Exclusive content" toggle + unlock cost
  at the content level.
- **Optional parent title** — new nullable self-FK `contents.parent_content_id → contents(id)
  ON DELETE SET NULL` (+ `idx_contents_parent`, + CHECK `parent_content_id <> id`). A BTS/clip
  MAY belong to one primary title; a title can have many extras; `NULL` = standalone. **No content
  requires a BTS.**

Web changes (in `apps/web`): `content-classification-card.tsx` (type + exclusivity + optional
primary-title picker for bts/clip); the embedded BTS authoring was removed from
`media-upload-card.tsx` and `video-form.tsx`; `bts-modal.tsx` deleted.

## 8. Operational content dashboard + Ad-Sales commercials

The content-management page gained a command-centre dashboard (Inventory / Licensing & Rights /
Performance tiles) and the Ad-Sales spec distinguishes **sponsored content** from **feed
commercials**. DB backing:

### Ad-Sales (extends `content_sponsorships`)
The unified create-form "format" (organic / sponsored / commercial) maps to one table:

- `ad_format` `sponsored | commercial` (default `sponsored`).
- `feed_frequency` INTEGER — commercial only: insert every N videos in the swipe feed.
- `skippable_after_seconds` INTEGER — commercial skip countdown (NULL = not skippable).
- `ad_duration_seconds` is the timer (ad length / commercial length); `placement` applies to
  sponsored only.
- `contents.is_ad_commercial` denormalized flag (mirrors `is_sponsored`) for fast feed queries;
  partial index `idx_content_sponsorships_commercial`.

### Licensing agreements — new `content_licenses` table
Powers the **Licensing table** (Content · Licensor · Expires · Days Left · Renewal · Revenue ·
Source · License Cost · ROI). The denormalized `contents.license_status`/`license_expires_at`
chip stays for the row; this table is the operational record:

```
content_licenses
  id, content_id → contents
  licensor_name           VARCHAR(200) NOT NULL
  license_type            exclusive | non_exclusive
  starts_at, expires_at   TIMESTAMPTZ          -- days-left + expiry alerts derive from expires_at
  renewal_status          renewing | in_negotiation | expiring | lapsed | auto_renew
  license_cost_cents      BIGINT
  revenue_generated_cents BIGINT               -- ROI = revenue / cost (derived)
  revenue_source          VARCHAR(100)         -- 'Ads + Subs'
  terms                   VARCHAR(500)
  is_active               BOOLEAN
  created_by → users, created_at, updated_at
```
Indexes: `idx_content_licenses_content` (active), `idx_content_licenses_expiry` (active).

### Dashboard tiles — mostly derived (no new tables)
- **Inventory** (active library, uploaded-this-month vs target, pipeline draft/review/scheduled,
  avg time to publish, freshness %): counts/aggregates over `contents` + `content_change_history`.
- **Licensing tiles** (licensed vs original split, monthly cost, cost-per-stream, expiring 30/60/90):
  aggregates over `content_licenses` (+ `contents.view_count` for cost-per-stream).
- **Performance** (avg watch time per region, game conversion, hit rate, engagement rate): from the
  existing analytics tables (`content_daily_stats`, `content_watch_events`, quest/prediction joins).
- **Real-time** (live library count, pipeline transitions, concurrent viewers): served by
  counters/streams at the API layer; license countdown is pure date math on `expires_at`.

Web components (`apps/web/.../content/_components/`): `stat-tile`, `section-heading`,
`content-inventory`, `licensing-rights` + `licensing-table-modal`, `content-performance`; plus the
Ad-Sales format selector in `new/_components/sponsorship-card`.

## Follow-up (repository / service layer)

1. `ContentRepository`: select/update the license + `is_sponsored` columns; `SponsorshipRepository`
   for `content_sponsorships`.
2. Renewal-reminder cron driven by `idx_contents_license_expiry`.
3. Shared-content award flow: on `content_shares` insert (within cap) → ledger `content_share`.
4. Instance create/update: persist `unlock_threshold_points` + `banner_media_id`; enforce the
   unlock gate at play time.
5. `GameWidgetConfigRepository` for the type-level widget rows; merge with per-instance banner.
