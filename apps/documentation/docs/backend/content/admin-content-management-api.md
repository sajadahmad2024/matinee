# Admin Content Management API — integration pass

> Status: **implemented** (branch `feat/video-pipeline`). Migration `0020_admin_content_management`.
> Gap-closing pass (TTLE-227): branch `feat/content-management`, migration
> `0025_content_metadata_ads` — see §11. Related: [video-metadata.md](./video-metadata.md),
> [../ads/ad-configuration.md](../ads/ad-configuration.md).
>
> Scope: everything the admin panel (`apps/web/src/app/(public)/content/**`, the dashboard, and
> admin login) needs from the backend that was missing or mismatched after the gap analysis.
> All routes are URI-versioned (`/v1/...`), `@AdminOnly()`, and wrapped in the standard envelope
> `{ statusCode, status, message, data, error }`. Paginated lists return
> `data: { items, pagination: { pageNo, pageSize, totalCount, totalPages } }`.

## Contents

1. [Integration blockers (auth, CORS, cookies)](#1-integration-blockers)
2. [Content list query + enriched rows](#2-content-list)
3. [Create / edit content](#3-create--edit-content)
4. [Workflow, boost, licensing, sponsorship, regions](#4-workflow-boost-licensing-sponsorship-regions)
5. [New content endpoints](#5-new-content-endpoints)
6. [Taxonomy](#6-taxonomy)
7. [Analytics](#7-analytics)
8. [Schema changes](#8-schema-changes)
9. [Frontend mapping notes](#9-frontend-mapping-notes)
10. [Not covered / follow-ups](#10-not-covered--follow-ups)
11. [TTLE-227 gap-closing pass](#11-ttle-227-gap-closing-pass)

---

## 1. Integration blockers

### CORS

`allowedHeaders` now also includes `x-csrf-token` and `x-client-platform`. Add the admin panel
origin (e.g. `https://matinee-web.vercel.app`) to `CORS_ORIGINS`.

### Cookies

New env var **`COOKIE_SAMESITE`** = `lax` (default) | `strict` | `none`.

| Setting | When to use |
|---|---|
| `lax` | Admin panel and API are **same-site** (e.g. `admin.matinee.com` + `api.matinee.com`, `COOKIE_DOMAIN=.matinee.com`) or the panel proxies `/api/*` through Next.js rewrites. |
| `none` | Admin panel and API are on **different sites** (e.g. `*.vercel.app` → API domain). Forces `Secure` on every auth cookie, so HTTPS is required. |

The access, refresh and `csrf` cookies all honour `COOKIE_SAMESITE` and `COOKIE_DOMAIN`
(the refresh cookie stays `strict` unless `none` is configured). Logout clears all three with the
exact same attributes (browsers ignore a clear whose `domain`/`sameSite`/`secure` differ).
`COOKIE_DOMAIN=localhost` (the default) is fine for local development.

Only the admin auth controller uses cookies; customer auth is bearer-only (mobile) and is unchanged.

### CSRF token in the response body

Web (cookie) logins and refreshes now return `csrfToken` in the body. A cross-site frontend
cannot read the API's `csrf` cookie from JavaScript, so it must keep this value in memory and
send it as `x-csrf-token` on every mutation (only enforced when `CSRF_ENABLED=true`).

```http
POST /v1/admin/auth/login
→ 200 { data: { user: {...}, csrfToken: "7c1e…" } }   // + Set-Cookie: access, refresh, csrf

POST /v1/admin/auth/refresh          (web)
→ 200 { data: { accessToken: "", csrfToken: "91ab…" } }   // + Set-Cookie: access, csrf
```

`reset-password` (web) returns `csrfToken` too, since it also starts a session. Refresh **rotates**
the CSRF token — replace the in-memory value with the new one. Mobile (`x-client-platform: mobile`)
responses never include `csrfToken`.

### Permission fix

`GET /v1/admin/analytics/content/:id` now requires `content:read` (was `users:read`).

---

## 2. Content list

`GET /v1/admin/content` — permission `content:read`.

### Query parameters

| Param | Type | Notes |
|---|---|---|
| `page`, `limit` | int | Defaults 1 / 20, max 100. |
| `status` | CSV | Any of `draft,pending_approval,scheduled,published,rejected,archived`. E.g. `status=published,scheduled` for the "Master" tab. |
| `contentType` | enum | `trailer` \| `bts` \| `clip`. |
| `studioId` | uuid | |
| `parentContentId` | uuid | Children (BTS/clips) of a primary title. |
| `hasParent` | bool | `false` → only primary titles (parent-title picker). |
| `q` | string | Case-insensitive match on **title or studio name**. |
| `region` | `NA,EU,APAC,LATAM,MEA` | Available in region: `rightsRegion=global` **or** a *live* publish region. |
| `isBoosted`, `isSponsored` | bool | |
| `licenseStatus` | CSV | `original,licensed,expiring,expired`. |
| `createdFrom`, `createdTo` | ISO | Upload-date range (e.g. last 30/90 days). |
| `scheduledFrom`, `scheduledTo` | ISO | Calendar: scheduled go-lives. |
| `licenseExpiresFrom`, `licenseExpiresTo` | ISO | Calendar: licence expiries. |
| `sort` | enum | `newest` (default), `oldest`, `most_viewed`, `least_viewed`, `recently_updated`, `scheduled_asc`, `license_expiry_asc`, `title_asc`. |

### Row shape (admin)

Every admin row (list **and** detail) includes the existing `ContentResponseDto` fields plus:

| Field | Type | Source |
|---|---|---|
| `studioName` | string \| null | `studios.name` |
| `thumbnailUrl` | string \| null | Public URL of the ready thumbnail media |
| `genres` | `{ id, name, slug, isPrimary }[]` | `content_genres` |
| `tags` | `{ id, name, slug }[]` | `content_tags` |
| `publishRegions` | `{ region, live }[]` | `content_regions` |
| `licensorName`, `licenseTerms` | string \| null | denormalized on `contents` |
| `linkedGamesCount` | number | predictions + auctions + quests referencing the content |
| `boostPriority` | number | |
| `boostStartsAt`, `boostedUntil` | ISO \| null | |
| `boostChannels` | `('homepage'\|'notifications'\|'regional'\|'subscribers')[]` | |
| `isBoostActive` | boolean | boosted **and** now within the boost window |
| `availableUntil` | ISO \| null | End of the live window (feed hides after this) |
| `watchLinks` | `{ platform, label?, url? }[]` | "Where to watch" CTAs |
| `sponsorName`, `adPlacement` | string \| null | Active sponsorship |
| `completionRate` | number | Avg completion % across view sessions |
| `viewsTrend` | `'up'\|'flat'\|'down'` | Last 7 days vs previous 7 days (±10 % = flat) |
| `revenuePer1kCents` | number | (licence + sponsorship revenue) / views × 1000 |
| `unresolvedFlags` | number | Open moderation tickets on the content |
| `createdBy`, `updatedBy` | `{ id, name } \| null` | Actor names for "last modified by" |

---

## 3. Create / edit content

`POST /v1/admin/content` (create, draft) and `PATCH /v1/admin/content/:id` accept the existing
fields plus:

| Field | Type | Rules |
|---|---|---|
| `genreIds` | uuid[] | ≤ 10, replaces the full set when present |
| `primaryGenreId` | uuid | Must be one of `genreIds` |
| `tagIds` | uuid[] | ≤ 30, replaces the full set when present |
| `cast` | `CastMemberInput[]` | Same shape as `PUT /:id/cast`, replaces when present |
| `watchLinks` | `{ platform, label?, url? }[]` | ≤ 3. `platform` ∈ `Netflix, Prime Video, Disney+, Apple TV, In cinemas, Other`; `label` required when `Other`; `url` must be `https://` |
| `availableUntil` | ISO \| null | Must be in the future when set |
| `recommendation` | enum | Now accepted on **create** too (`promoted`, `normal`, `deprioritized`) |

Unknown fields are still rejected (`forbidNonWhitelisted`). Cast must be sent as IDs —
use `GET /v1/admin/content/taxonomy/{studios,people}` for pickers. Studio and tags may also be
sent as free text (`studioName`, `tagNames[]`) — see §11.1.

Every create/update/workflow action now writes a `content_change_history` entry.

---

## 4. Workflow, boost, licensing, sponsorship, regions

### Unschedule

`POST /v1/admin/content/:id/unschedule` (`content:publish`) — only when `status=scheduled`.
Clears `scheduledAt` and returns the content to `pending_approval` (needs re-approval).

### Boost

`POST /v1/admin/content/:id/boost` (`content:write`)

```json
{
  "boosted": true,
  "priority": 100,
  "startsAt": "2026-10-01T00:00:00Z",
  "until": "2026-10-08T00:00:00Z",
  "channels": ["homepage", "regional"]
}
```

- `until` must be after `startsAt` (when both set). `boosted: false` clears every boost field.
- The feed only ranks a boost while it's **active** (now ≥ `startsAt`, now < `until`) and when
  `channels` is empty, contains `homepage`, or contains `regional` and the viewer's region is a
  live publish region.
- `notifications` / `subscribers` fan out an in-app notification campaign once the boost becomes
  active (see §11.2).

### Licensing

- `PUT /v1/admin/content/:id/license` — unchanged; `licenseType` (`exclusive` \| `non_exclusive`)
  is the exclusivity field.
- **New** `DELETE /v1/admin/content/:id/license` — deactivates the active licence and marks the
  content `original` (clears licensor / expiry / terms).

### Sponsorship

`PUT /v1/admin/content/:id/sponsorship` additions:

| Field | Notes |
|---|---|
| `placement` | Accepts `icon-overlay` as an alias; stored and returned as `overlay`. |
| `startsAt`, `endsAt` | ISO; `endsAt` > `startsAt`. |
| `overlayDays` | Convenience: sets `endsAt = (startsAt ?? now) + N days`. Ignored if `endsAt` is sent. |

**New** `DELETE /v1/admin/content/:id/sponsorship` — back to organic (clears `isSponsored` /
`isAdCommercial`).

### Publish regions with Live / Off

`PUT /v1/admin/content/:id/regions`

```json
{ "regions": ["NA", "EU", "APAC"], "offRegions": ["APAC"] }
```

`offRegions` must be a subset of `regions`. Response (also `GET`):

```json
{ "regions": ["NA", "EU", "APAC"], "liveRegions": ["NA", "EU"], "items": [{ "region": "NA", "live": true }, …] }
```

**Availability rule (feed + `region` filter + stats):** content is available in region R when it
has a publish-region row for R with `live=true`. Content with **no** publish-region rows falls back
to its rights region: `global` means available everywhere. (Before this change, `global` content
ignored publish regions.)

**Feed ordering:** active boost priority, then `recommendation`
(`promoted` > `normal` > `deprioritized`), then newest `publishedAt`. The feed also hides content
after `availableUntil`.

### Validation added

- `genreIds` / `tagIds` / `studioId` / cast `personId` must exist → 400 listing unknown ids.
- `parentContentId` must exist, not be the content itself, and be a primary title (one level).
- `scheduledAt`, `availableUntil` and boost `until` must be in the future.
- Licence `expiresAt` > `startsAt`; sponsorship `endsAt` > `startsAt`.
- `overlayDays` without `startsAt` starts the deal now.

### Change history with actor

`GET /v1/admin/content/:id/history` entries now include `changedByName` and `changedByRole`.

---

## 5. New content endpoints

All under `/v1/admin/content`, permission `content:read` unless noted.

### `GET /stats?region=`

Tab counts + summary cards + inventory tiles.

```json
{
  "total": 120,
  "byStatus": { "draft": 5, "pending_approval": 3, "scheduled": 4, "published": 100, "rejected": 2, "archived": 6 },
  "boosted": 7,
  "sponsored": 9,
  "activeLibrary": 100,
  "addedThisMonth": 12,
  "addedLast30d": 15,
  "addedPrev30d": 10,
  "addedLast30dChangePct": 50,
  "pipeline": { "draft": 5, "inReview": 3, "scheduled": 4 },
  "avgTimeToPublishHours": 26.4,
  "expiringThisMonth": 2,
  "expiringNextMonth": 3,
  "licensed": 40,
  "original": 80
}
```

### `GET /licenses`

Paginated licence agreements. Query: `page`, `limit`, `q` (title / licensor), `expiresWithinDays`
(e.g. 30/60/90), `renewalStatus`, `licenseType`, `sort` = `expires_asc` (default) \|
`revenue_desc` \| `cost_desc` \| `roi_desc`.

Row: `licenseId, contentId, title, thumbnailUrl, licensorName, licenseType, startsAt, expiresAt,
daysLeft, renewalStatus, licenseCostCents, revenueGeneratedCents, revenueSource, currency, roi,
views, terms`.

### `GET /licenses/summary`

```json
{
  "licensedCount": 40, "originalCount": 80, "activeAgreements": 40,
  "totalCostCents": 1200000, "totalRevenueCents": 3400000,
  "monthlyCostCents": 95000, "costPerStreamCents": 12.5,
  "expiringIn30": 2, "expiringIn60": 4, "expiringIn90": 7,
  "monthlyCostTrend": [{ "month": "2026-05", "costCents": 90000 }, …]
}
```

`monthlyCostCents` spreads each active agreement's cost evenly over its term (min 1 month;
open-ended terms count as 12 months). The trend covers the last 6 months.

### `GET /:id/full`

One call to hydrate the editor/detail page:
`{ content (enriched + cast), license, sponsorship, regions, history, linkedGames }`.

### `GET /:id/games`

`{ total, predictions: [{ id, title, status }], auctions: [...], quests: [...] }`.

### `GET /:id/thumbnail-candidates`

Candidate thumbnails: the current thumbnail, the video's transcoder poster, and any
`content_media` stills/posters/thumbnails. Each: `{ mediaId, url, source, isCurrent }`.

- Stored candidates: select with `PATCH /:id { thumbnailMediaId }`.
- The transcoder poster has `mediaId: null` and a short-lived signed preview `url`. Select it with
  **`POST /:id/thumbnail/from-poster`** (`content:write`), which registers the poster as a public
  image media row and sets it as the thumbnail.

### Comments per content

`GET /v1/admin/comments?contentId=&status=&page=&limit=` (`content:read`) — admin comment list
(any status), newest first, with author name. Lives on the comment-moderation controller (alongside
`GET /v1/admin/comments/reports`), not under `/v1/admin/content`.

| Query | Notes |
|---|---|
| `contentId` | uuid, optional — omit for every content |
| `status` | `visible` \| `hidden` \| `deleted`, optional — omit for every status |
| `page`, `limit` | Defaults 1 / 20, max 100 |

Row: `id, contentId, contentTitle, parentCommentId, body, status, likeCount, dislikeCount,
replyCount, flagCount, isFlagged, createdAt, author: { id, name, username, avatarUrl }`.
`author.name` = "first last" → `username` → `"Unknown user"`. Replies are included (use
`parentCommentId` to tell them apart). Moderate with `PATCH /v1/admin/comments/:id/status`.

---

## 6. Taxonomy

- Studio, genre, tag and person responses now include **`contentCount`** (non-deleted content
  using it) — drives "used by", "most used" and "unused".
- Studios gain **`countryCode`** (ISO-3166 alpha-2) on create/update/response.
- People gain **`knownFor`** (`actor` \| `director` \| `writer` \| `producer` \| `other`) on
  create/update/response — the person-level role shown in the manager (credit-level roles stay on
  `content_cast`).

Details:

- `contentCount` is on the **admin** endpoints (`/v1/admin/content/taxonomy/{studios,genres,tags,people}`
  list, create — always `0` — and update). Counting: studios → `contents.studio_id`; genres →
  `content_genres`; tags → `content_tags`; people → **distinct** contents in `content_cast` (a person
  with two credits on one title counts once). Soft-deleted contents are excluded. Lists use one
  grouped-count subquery each (no N+1).
- Admin taxonomy lists are **not cached** (counts change on content writes). The public
  `/v1/content/taxonomy/{genres,tags}` endpoints stay cached and do **not** expose `contentCount`.
- `countryCode` is trimmed + uppercased before validation (`kr` → `KR`), must match `^[A-Z]{2}$`.
  On `PATCH`, `countryCode: null` / `knownFor: null` clears the value.

---

## 7. Analytics

All under `/v1/admin/analytics`. Windowed endpoints take `from` / `to` (ISO-8601, `[from, to)`):
default is the last 30 days ending now (floored to the minute), `from` must be before `to`, and
the span may not exceed 366 days (`400` otherwise). All metrics are computed from the raw tables
(`content_views`, reactions, comments, shares, unlocks, games) — `content_daily_stats` has no
rollup job yet and is not read. Percentages (`*Pct`, `percent`, `engagementRate`) are 0..100 with
1 dp; ratios (`ratio`, `ctr`, `positiveRatio`) are 0..1 with 4 dp.

### `GET /content-library?region=&from=&to=&hitThreshold=` (`content:read`)

Region filters on the viewer's region (`users.region`). Cached 60 s per
`region/from/to/hitThreshold`.

| Block | Fields |
|---|---|
| `from`, `to`, `region` | Resolved window + region (`null` = all) |
| `totals` | `views, uniqueViewers, watchSeconds, avgWatchSeconds, avgCompletion, likes, comments, shares, engagementRate` — views = sessions started in the window; likes/comments/shares created in the window; `engagementRate = (likes + comments + shares) / views × 100` |
| `byRegion` | `[{ region, views, watchSeconds, avgWatchSeconds }]` (`region = 'unknown'` when unset) |
| `hitRate` | `{ threshold, publishedTitles, hits, percent }` — published titles with ≥ `hitThreshold` views in the window (default 1000) |
| `gameConversion` | `{ viewers, players, percent }` — viewers who have a prediction entry / bid / quest participation on a game linked to a content they viewed in the window |
| `funnel` | `{ viewers, engaged, gamePlayers, unlockers }` — engaged = viewers who reacted/commented/shared in the window; unlockers = viewers with a `content_unlocks` row in the window |
| `revenueAttribution` | `{ licenseRevenueCents, sponsorshipRevenueCents, unlockPointsSpent }` — licence/sponsorship = booked revenue of **active** agreements (not windowed, not region-filtered); unlock points = `content_unlocks.points_spent` in the window |
| `btsUpsell` | `{ parentViewers, btsViewers, ctr }` — viewers of primary titles that have children → those who also viewed a child of the same title |
| `sentiment` | `{ likes, dislikes, positiveRatio }` |
| `shareVelocity` | `{ last24h, prev24h, changePct }` — relative to `to` |
| `topContent` | top 10 by views in window: `[{ id, title, contentType, views, uniqueViewers, watchSeconds, avgCompletion }]` |

### `GET /content/:id?from=&to=` (`content:read`) — extended

Existing lifetime fields (`viewCount … totalWatchSeconds`) are unchanged. `daily` is now derived
from `content_views` for the window (UTC days, zero-filled, newest first). Added:

| Field | Notes |
|---|---|
| `from`, `to` | Resolved window |
| `periodChange` | `{ views, prevViews, viewsPct, watchSeconds, prevWatchSeconds, watchSecondsPct }` — window vs the previous window of equal length (`prev = 0` → 100 if any growth, else 0) |
| `retention` | `[{ percent: 0..100 step 10, viewers, ratio }]` — distinct viewers whose max `max_position_seconds` ≥ bucket % of `duration_seconds` (falls back to `completion_percent` when duration is unknown); `ratio` vs the 0 % bucket |
| `trafficSources` | `[{ source, views }]` from `content_views.source` (`null` → `unknown`) |
| `demographics` | `{ gender: [{ gender, views, viewers }], device: [{ device, views, viewers }] }` (`unknown` when unset) |
| `geo` | `[{ countryCode, views, watchSeconds }]` by viewer `users.country_code`, top 100 |
| `games` | `{ predictions, predictionEntries, auctions, bids, quests, questParticipants, questCompletions }` — **lifetime** (quest participations have no timestamp); participants/completions are distinct users |
| `bts` | `{ children: [{ id, title, contentType, views }], parentViewers, childViewers, ctr }` — children = non-deleted contents with `parent_content_id = id`; `ctr = childViewers / parentViewers` |

Clients should send `source` on `POST /v1/content/:id/views` (`feed`, `search`, `share`,
`notification`, `profile`, `deeplink`, `other`) so traffic sources fill in. It is optional and
persisted to `content_views.source`.

### `GET /trends?metrics=&from=&to=&interval=&region=` (`users:read`)

Dashboard time series. `metrics` CSV of `signups, active_users, views, watch_seconds,
points_earned, points_spent, revenue` (default: all; unknown values → `400`). `interval` = `day`
(default) \| `week` \| `month`. `region` filters on `users.region` for every metric. Buckets are UTC
`date_trunc(interval)` starting at the bucket containing `from`, zero-filled; `bucket` is the
bucket start date. Cached 60 s per parameter set.

| Metric | Source |
|---|---|
| `signups` | `users` with `account_type='customer'` by `created_at` |
| `active_users` | distinct `content_views.user_id` per bucket (by `started_at`) |
| `views` / `watch_seconds` | `content_views` count / `sum(watched_seconds)` by `started_at` |
| `points_earned` / `points_spent` | `ledger_transactions` (`currency='points'`, `direction` `earn` / `spend`) |
| `revenue` | `subscription_invoices` `status='paid'` `sum(amount_cents)` by `coalesce(paid_at, billed_at)` |

```json
{ "interval": "day", "from": "…", "to": "…", "region": null, "series": { "views": [{ "bucket": "2026-09-01", "value": 120 }], … } }
```

Only requested metrics appear in `series`.

---

## 8. Schema changes

Migration `0020_admin_content_management.sql`:

| Table | Change |
|---|---|
| `contents` | `watch_links jsonb default '[]'`, `available_until timestamptz`, `boost_starts_at timestamptz`, `boost_channels varchar(20)[] default '{}'` |
| `content_regions` | `is_live boolean default true` |
| `studios` | `country_code varchar(2)` |
| `people` | `known_for varchar(20)` (check: actor/director/writer/producer/other) |
| `content_views` | `source varchar(20)` (check), index on `started_at` |
| `content_change_history` | action check adds `unscheduled`, `deleted` |

---

## 9. Frontend mapping notes

Timestamps in responses use Postgres text form (`2026-11-15 00:00:00+00`), the same as every
other endpoint. `new Date(...)` parses it.


| UI | Backend |
|---|---|
| status `pending` | `pending_approval` |
| status `boosted` | not a status — use `isBoosted` / `isBoostActive` (filter `isBoosted=true`) |
| status `ready` | not a status — a draft whose `videoMediaId` media is `ready` |
| "Master" tab | `status=published,scheduled` |
| `adPlacement: icon-overlay` | send `icon-overlay` or `overlay`; responses use `overlay` |
| `adOverlayDays` | `overlayDays` |
| `liveFrom` / `liveUntil` | `publishedAt ?? scheduledAt` / `availableUntil` |
| `lastModifiedBy` | `updatedBy.name` |
| `licenseExpiresInDays` | derive from `licenseExpiresAt` |
| money | always integer cents |

---

## 10. Not covered / follow-ups

- ~~Push delivery for boost `notifications` / `subscribers` channels~~ — done in §11.2 (inbox
  campaign; FCM push for campaigns is still the notifications module's follow-up).
- **Multi-frame auto-thumbnails** — the dummy transcoder only writes one poster; real frame
  extraction belongs in the production transcoder. The candidates endpoint picks them up once
  they're stored as `content_media` stills.
- **Age demographics** — `users` has no birth date.
- **Revenue by geo** — revenue isn't attributed per view/country.
- **Dashboard cohorts, K-factor, CAC/LTV, session heatmaps** — outside content management; the
  `trends` endpoint is the base for them.

---

## 11. TTLE-227 gap-closing pass

Migration `0025_content_metadata_ads.sql` (idempotent). Metadata/playback changes are in
[video-metadata.md](./video-metadata.md); ads in [../ads/ad-configuration.md](../ads/ad-configuration.md).

### 11.1 Free-text studio and tags

`POST /v1/admin/content` and `PATCH /v1/admin/content/:id` also accept:

| Field | Type | Rules |
|---|---|---|
| `studioName` | string 1..200 | Trimmed; find-or-create a studio by **case-insensitive** name (non-deleted). Can't be combined with `studioId` (400). `studioName: ""` is rejected; to clear the studio use `studioId: null`. |
| `tagNames` | string[] ≤ 30, each ≤ 80 | Trimmed; blank entries dropped; de-duplicated case-insensitively; find-or-create each tag by case-insensitive name. Merged with `tagIds` when both are sent; the union replaces the tag set (≤ 30). |
| `durationSeconds` | int \| null | Manual duration override (see video-metadata.md §1). |

`studioId: null` on `PATCH` now clears the studio.

The comma-separated "Tags" input maps to `tagNames: value.split(',')`.

### 11.2 Boost notifications (`notifications` / `subscribers` channels)

When a boost with the `notifications` and/or `subscribers` channel is **active** (now ≥
`boostStartsAt`, before `boostedUntil`) and the content is published, a notification campaign is
created and fanned out through the existing campaign pipeline
(`NOTIFY_CAMPAIGN_FANOUT` → `user_notifications` inbox rows):

| Channels | Audience |
|---|---|
| contains `notifications` | every active customer (`targetType: all`) |
| only `subscribers` | active customers with an `active` / `trialing` / `past_due` subscription (`targetType: segment`, `targetFilter: { subscribers: true }`) |

- Title `Trending now: <title>`, message = first 200 chars of the description (or a default),
  category `new_content`, deep link `matinee://content/<id>`.
- **Idempotent per boost**: an atomic claim sets `contents.boost_notified_at` (and
  `boost_campaign_id`) — only one sender per boost. Re-saving a boost with the same `startsAt`
  keeps the claim; a new boost (previously un-boosted, or a different `startsAt`) resets it.
  Clearing the boost resets it.
- Triggered immediately by `POST /:id/boost` when the boost is already active, and by the
  content maintenance cron (every minute) for boosts that start later or content published later.
- Admin rows expose `boostNotifiedAt`.
- `segment` campaigns now honour `targetFilter.subscribers = true` (alongside `region`).

### 11.3 Content maintenance cron

`CronName.CONTENT_MAINTENANCE` — every minute, single-flight lock, enqueued to
`QueueName.CONTENT` / `JobName.CONTENT_MAINTENANCE` (worker). One run:

1. **Boost notifications** (§11.2).
2. **Expired boosts** — `boosted_until <= now` → `is_boosted = false`, priority 0, window and
   channels cleared (history entry `boosted`, note "Boost expired").
3. **Expired sponsorships** — active sponsorships with `ends_at <= now` → `is_active = false`;
   the content's `is_sponsored` / `is_ad_commercial` are cleared (history entry `updated`).
4. **Licences** — for the active licence of each content:
   - `expires_at <= now` → `contents.license_status = 'expired'`; the licence's `renewal_status`
     becomes `lapsed` unless it is `auto_renew`.
   - `now < expires_at <= now + 30 days` → `contents.license_status = 'expiring'`.
   - `expires_at > now + 30 days` (e.g. extended) → back to `licensed`.
   `PUT /:id/license` computes the same status immediately instead of always writing `licensed`.
5. Busts the `content` cache when anything changed.

The daily licence reminder now also covers `expiring` content. The feed hides
`license_status = 'expired'` content; `availableUntil` hiding is unchanged.

### 11.4 New admin row fields

| Field | Notes |
|---|---|
| `durationSource` | `media` \| `manual` |
| `boostNotifiedAt` | ISO \| null |
| `adImpressions`, `adClicks`, `adCtr`, `adRevenuePer1kImpressionsCents` | Lifetime, active sponsorship — see ads doc §5 |
| `videoWidth`, `videoHeight` | From the video media |

### 11.5 Content media and playback

- `GET/POST/PUT/DELETE /v1/admin/content/:id/media…` — stills/posters/thumbnails management
  (video-metadata.md §2).
- `GET /v1/content/:id/playback` — entitlement-checked playback; customers can no longer fetch
  content-video playback via `/v1/media/:id/playback` (video-metadata.md §4).

### 11.6 Schema (content part of 0025)

| Table | Change |
|---|---|
| `contents` | `boost_notified_at timestamptz`, `boost_campaign_id uuid` (FK `notification_campaigns`, set null), `duration_manual boolean default false` |
