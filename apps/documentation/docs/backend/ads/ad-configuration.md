# Ad Configuration, Serving and Tracking (TTLE-233)

> Status: **implemented** (branch `feat/content-management`). Migration `0025_content_metadata_ads.sql`.
> Module: `src/ads/` + `src/db/repositories/ads/ad-event.repository.ts`.

Ads are configured per content through the **sponsorship** record
(`PUT /v1/admin/content/:id/sponsorship`, see admin-content-management-api.md §4). Two formats:

| `adFormat` | Meaning | Where it shows |
|---|---|---|
| `sponsored` | A normal title carrying a sponsor: "Sponsored by" logo + a pre/mid/post-roll or overlay ad | On that content (`GET /v1/content/:id/ads`) |
| `commercial` | The content **is** an ad spot | Inserted into the feed every `feedFrequency` items (only when `feature.ad_commercials_enabled` is on); never ranked as normal content |

A sponsorship is **live** when `is_active` and now ∈ [`startsAt` ?? −∞, `endsAt` ?? +∞).

---

## 1. Sponsorship configuration — new fields

`PUT /v1/admin/content/:id/sponsorship` accepts (in addition to the existing
`adFormat, sponsorName, bannerMediaId, adDurationSeconds, placement, feedFrequency,
skippableAfterSeconds, revenueCents, currency, startsAt, endsAt, overlayDays`):

| Field | Type | Notes |
|---|---|---|
| `creativeMediaId` | uuid | Optional **video** creative for a roll ad (must be a video media). Without it the client shows the banner for `adDurationSeconds`. |
| `clickUrl` | https URL | Sponsor CTA destination |
| `ctaLabel` | string ≤ 40 | e.g. "Shop now" |
| `midRollAtSeconds` | int ≥ 0 | Required when `placement = mid-roll` |
| `overlayStartSeconds` | int ≥ 0 | Overlay window start inside the video (default 0) |
| `overlayDurationSeconds` | int ≥ 1 | Overlay window length (default: whole video) |
| `cpmCents` | int ≥ 0 | Variable revenue per 1 000 impressions |
| `cpcCents` | int ≥ 0 | Variable revenue per click |

Validation: `skippableAfterSeconds ≤ adDurationSeconds` when both set; `bannerMediaId` must be an
image and `creativeMediaId` a video (400 otherwise); `mid-roll` needs `midRollAtSeconds`.
Responses (`SponsorshipResponseDto`) include all new fields.

### Revenue model

`revenueCents` stays the flat booked amount. Reported revenue =
`revenueCents + impressions × cpmCents / 1000 + clicks × cpcCents` (integer cents, rounded).

---

## 2. Serving — `GET /v1/content/:id/ads`

Any authenticated account. `404` when the content is not published.

```json
{
  "contentId": "…",
  "adFree": false,
  "ads": [
    {
      "sponsorshipId": "…",
      "adFormat": "sponsored",
      "placement": "pre-roll",
      "sponsorName": "Nike",
      "bannerUrl": "https://cdn/…/nike.png",
      "clickUrl": "https://nike.com/…",
      "ctaLabel": "Shop now",
      "adDurationSeconds": 15,
      "skippableAfterSeconds": 5,
      "midRollAtSeconds": null,
      "overlay": null,
      "creative": { "kind": "hls", "url": "…", "cookies": {}, "expiresInSeconds": 900 },
      "startsAt": "…",
      "endsAt": "…"
    }
  ]
}
```

- `ads` is empty unless the content has a **live** `sponsored` sponsorship. (Commercial spots
  are served through the feed, not here.)
- `overlay` = `{ startSeconds, durationSeconds }` for `placement = overlay`, else `null`.
- `creative` is a signed playback descriptor for `creativeMediaId` (ready media only), else `null`.
- **Ad-free subscribers**: users with an active subscription (`active` / `trialing` / `past_due`)
  get `adFree: true` and no roll ads (pre/mid/post). The sponsor **overlay** is still returned —
  it's part of the sponsored title, not an interruption.
- The ad descriptor (without the per-user `adFree` filter) is cached 60 s per content under the
  `content` tag.

---

## 3. Feed commercial insertion — `GET /v1/content/feed`

**Superseded by Ad Sales campaigns** — see [ad-sales-management.md](./ad-sales-management.md) §3/§7.
Commercial slots now come from live `commercial` campaigns (not from content items with a
`commercial` sponsorship), still behind `feature.ad_commercials_enabled` and every
`feedFrequency` organic items.

## 4. Event tracking — `POST /v1/ads/events`

Any authenticated account. Batched (1–50 events).

```json
{
  "events": [
    { "sponsorshipId": "…", "type": "impression", "viewId": "…", "positionSeconds": 0 },
    { "sponsorshipId": "…", "type": "click", "viewId": "…", "occurredAt": "2026-09-25T10:00:03Z" }
  ]
}
```

| Field | Rules |
|---|---|
| `sponsorshipId` | uuid of an existing sponsorship (active or past — late-arriving events still count) |
| `type` | `impression` \| `click` \| `skip` \| `complete` |
| `viewId` | 1–64 chars — the view session id from `POST /v1/content/:id/views` (or any client playback-session id) |
| `positionSeconds` | optional int ≥ 0 |
| `occurredAt` | optional ISO; default now; must be within the last 7 days and ≤ 5 min in the future |

Response:

```json
{ "accepted": 2, "duplicates": 0, "rejected": 0, "rejectedSponsorshipIds": [] }
```

- **Deduped per view**: unique `(sponsorship_id, user_id, view_key, event_type)` — a replayed
  batch or a double-tap counts once. Duplicates inside a batch are collapsed.
- Unknown sponsorship ids are rejected (counted, not an error for the whole batch).
- `content_id` is taken from the sponsorship, never from the client.
- The viewer's region (`users.region`) is snapshotted on the event.

---

## 5. Reporting

### `GET /v1/admin/ads/performance` (`content:read`)

Query: `from`, `to` (ISO, `[from, to)`; default: the 30 days ending at the next full minute, so just-recorded events are included; ≤ 366 days), `contentId`,
`adFormat` (`sponsored` \| `commercial`), `active` (bool), `q` (sponsor or title),
`sort` (`impressions_desc` default, `clicks_desc`, `ctr_desc`, `revenue_desc`, `newest`),
`page`, `limit` (≤ 100).

```json
{
  "from": "…", "to": "…",
  "totals": { "impressions": 1200, "uniqueViewers": 900, "clicks": 36, "ctr": 0.03, "skips": 300,
              "skipRate": 0.25, "completes": 700, "completionRate": 0.5833, "revenueCents": 54000 },
  "items": [
    { "sponsorshipId": "…", "contentId": "…", "contentTitle": "…", "sponsorName": "Nike",
      "adFormat": "sponsored", "placement": "pre-roll", "isActive": true, "isLive": true,
      "startsAt": "…", "endsAt": "…", "currency": "USD",
      "impressions": 1200, "uniqueViewers": 900, "clicks": 36, "ctr": 0.03, "skips": 300,
      "skipRate": 0.25, "completes": 700, "completionRate": 0.5833,
      "revenueCents": 54000, "ecpmCents": 45000 }
  ],
  "pagination": { "pageNo": 1, "pageSize": 20, "totalCount": 1, "totalPages": 1 }
}
```

Ratios are 0..1 (4 dp): `ctr = clicks / impressions`, `skipRate = skips / impressions`,
`completionRate = completes / impressions`, `ecpmCents = revenue / impressions × 1000`.
Event counts are windowed; `revenueCents` = flat booked revenue (not windowed) + CPM/CPC on the
windowed events. Every sponsorship (active or past) matching the filters is listed, so it also
serves as the Ad-Sales inventory list.

### `GET /v1/admin/ads/sponsorships/:id/performance` (`content:read`)

Same metrics for one sponsorship + `daily: [{ day, impressions, clicks, skips, completes }]`
(UTC days, zero-filled, oldest first) for `from`/`to`.

### Admin content UI

- Admin content rows (`GET /v1/admin/content`, detail) add lifetime `adImpressions`, `adClicks`,
  `adCtr` (0..1) and `adRevenuePer1kImpressionsCents` for the active sponsorship
  ("$ per 1K impressions" chip). The existing `revenuePer1kCents` (per 1K views) is unchanged.
- `GET /v1/admin/content/:id/full` adds `adPerformance` (lifetime metrics of the active
  sponsorship, or `null`).

---

## 6. Expiry

The content maintenance cron (every minute, see admin-content-management-api.md §11.3) deactivates
sponsorships past `endsAt` and clears `contents.is_sponsored` / `is_ad_commercial`.

---

## 7. Schema (migration 0025, ads part)

| Object | Change |
|---|---|
| `content_sponsorships` | `creative_media_id uuid` (FK media, set null), `click_url varchar(500)`, `cta_label varchar(40)`, `mid_roll_at_seconds int`, `overlay_start_seconds int`, `overlay_duration_seconds int`, `cpm_cents int`, `cpc_cents int` (checks ≥ 0) |
| `ad_events` (new) | `id, sponsorship_id (FK cascade), content_id (FK cascade), user_id (FK set null), view_key varchar(64), event_type (check), position_seconds, region, occurred_at, created_at`; unique `(sponsorship_id, user_id, view_key, event_type)`; indexes `(sponsorship_id, occurred_at)`, `(content_id, occurred_at)` |
| `app_settings` | seed `feature.ad_commercials_enabled = false` (if absent) |

## 8. Not covered

- Frequency capping per user / per day, and ad decisioning across multiple sponsors per title
  (one active sponsorship per content by design).
- Billing / invoicing of sponsors ("settled by the Ad-Sales ledger" in the UI) — reporting only.
- Third-party ad servers (VAST/VMAP) — the descriptor is first-party.
