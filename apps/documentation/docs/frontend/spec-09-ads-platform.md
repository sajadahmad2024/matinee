# Implementation Spec 09 — Admin Panel: Platform Ads (Global Settings & Analytics)

**App:** `apps/web` (Next.js admin panel) + `apps/backend` (`src/ads`) · **Scope:** UI first with mock data, then API
**Status:** ✅ Implemented (UI, mock data) · Backend (§5): not started
**Builds on:** [Spec 07 — Ads Management](./spec-07-ads-management.md), [Ad Sales management](../backend/ads/ad-sales-management.md), [Ad configuration](../backend/ads/ad-configuration.md)
**Goal:** one place to configure the rules that apply to **every** feed ad, and one place to see how feed ads perform across the platform. Only what the current backend can support is included.

---

## 1. What this module is

Spec 07 manages ads **one at a time**. This spec adds the **platform level**:

| Tab | Purpose |
| --- | --- |
| **Configuration** | Rules that apply to every feed ad: on/off, placement, per-user limits |
| **Statistics** | Totals across all feed ads: delivery, trend, top ads, regions |

Scope is **feed ads only**, which are Ad Sales `commercial` campaigns. Per-video sponsorship overlays (the video form's Ad Sales step) are not included.

---

## 2. Screens

| Route | Purpose |
| --- | --- |
| `/ads/platform?tab=config` | Configuration tab (default) |
| `/ads/platform?tab=stats` | Statistics tab |

- The tab is kept in the URL with the existing `useTabParam` hook.
- **`/ads` header:** the **Feed rules** button and dialog are removed and replaced by two buttons:
  - **Global settings** → `/ads/platform?tab=config`
  - **Global analytics** → `/ads/platform?tab=stats`
- The page header is "Platform Ads" with a back button to `/ads`.

---

## 3. Configuration tab

Two cards and a **Save changes** button. Saving opens a confirmation dialog ("These settings affect every user"). **Cancel** resets the form to the last saved values.

### 3.1 Master controls

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| Ads enabled | switch | on | When off, no feed ads are shown anywhere in the app. Turning it off asks for confirmation straight away. Same flag as Settings → Feature Flags → "Ad-Sales commercials". |

### 3.2 Placement and frequency

| Field | Unit | Default | Rule |
| --- | --- | --- | --- |
| Show first ad after | videos | 3 | Whole number ≥ 0 |
| Show an ad every | videos | 5 | Whole number ≥ 2, so ads are never back to back |
| Max ads per user per day | ads | 15 | Whole number ≥ 1 |
| No ads for new users | days | 2 | Whole number ≥ 0; 0 turns it off |

A summary line under the card shows the current pattern, for example: *"First ad after video 3, then an ad after every 5 videos. Up to 15 ads per user per day."*

The first two fields replace the Spec 07 feed rules ("Minimum reels between ads" becomes "Show an ad every").

### 3.3 Validation

- All number fields are required whole numbers within the rules above. Errors are shown under the field, and Save stays disabled until they are fixed.
- Save is disabled when nothing has changed.

---

## 4. Statistics tab

### 4.1 Header

- Date filter: reuse `AnalyticsDateFilter` (presets plus custom range, URL-driven, default **Last 30 days**).
- **Export** button next to the date filter: downloads a CSV, `ads-platform-<range>.csv` with one row per date and the columns `Date, Impressions, Unique reach, Clicks, CTR %, Completion rate %`. Uses the shared `app/_libs/download-csv.ts` helper (moved from the dashboard).

### 4.2 Sections

| # | Section | Contents |
| --- | --- | --- |
| 1 | **KPI row** | Impressions · Unique reach · Clicks · CTR · Completion rate · Active ads |
| 2 | **Impressions over time** | Daily bar chart for the selected range |
| 3 | **Top ads** | Top 5 by impressions: ad (name + advertiser), impressions, CTR, completion rate. A row opens `/ads/[id]`. |
| 4 | **Needs review** | Ads with **CTR < 1%**, counting only ads with ≥ 1,000 impressions. Same columns as Top ads. Empty state: "All ads are performing normally." |
| 5 | **By region** | One bar per macro-region (NA, EU, APAC, LATAM, MEA): share of impressions % and CTR |

### 4.3 Metric definitions

| Metric | Formula |
| --- | --- |
| Impressions | Count of `impression` events |
| Unique reach | Distinct users with at least one impression |
| CTR | clicks ÷ impressions |
| Completion rate | completes ÷ impressions |
| Active ads | Commercial campaigns with status `active` right now (not windowed) |

All ratios are shown as percentages with one decimal place; 0 impressions shows "—".

---

## 5. Backend changes

### 5.1 Settings storage

One new `app_settings` row, category `ads`:

```json
// key: ads.platform_settings
{
  "firstAdAfter": 3,
  "adEvery": 5,
  "maxAdsPerUserDay": 15,
  "newUserGraceDays": 2
}
```

"Ads enabled" keeps using the existing `feature.ad_commercials_enabled` key.

### 5.2 Endpoints (`/v1/admin/ads`)

| Endpoint | Permission | Purpose |
| --- | --- | --- |
| `GET /settings` | `ads:read` | `{ adsEnabled, ...platformSettings }` |
| `PUT /settings` | `ads:write` | Validates (same rules as §3) and saves both keys; clears the feed cache (`content` tag) |

### 5.3 Serving changes

| Rule | Where it's enforced |
| --- | --- |
| Show first ad after / Show an ad every | `content.service.ts` `feed()`: `interleaveCommercials` uses `firstAdAfter` and `adEvery` from settings instead of the smallest campaign `feedFrequency` |
| Max ads per user per day | `GET /v1/ads/commercials/:id`: counts the user's commercial impressions today across **all** campaigns. When the cap is reached it returns `skip: true, skipReason: "frequency_cap"`. The per-campaign `frequencyCapPerUserDay` still applies on top. |
| No ads for new users | Same endpoint: if `users.created_at` is within `newUserGraceDays`, it returns `skipReason: "new_user"` (new reason) |
| Fill rate | `FILL_RATE_FREQUENCY` is replaced by the `adEvery` setting |

The per-campaign `feedFrequency` column stays but is no longer used for placement. The Spec 07 ad form drops its "every N reels" field.

### 5.4 Statistics endpoints

Extend `GET /v1/admin/ads/summary` (already `from`/`to`/`region`) with a `type=commercial` filter and these fields:

```json
{
  "delivery": {
    "impressions": 128400, "uniqueReach": 41200, "clicks": 3590, "ctr": 0.028,
    "completes": 59060, "completionRate": 0.46
  },
  "counts": { "activeCommercials": 6 },
  "daily": [{ "day": "2026-09-25", "impressions": 18200 }],
  "byRegion": [{ "region": "NA", "impressions": 48800, "share": 0.38, "ctr": 0.03 }]
}
```

- **Top ads / Needs review:** use the existing `GET /v1/admin/ads/campaigns` performance data (sorted by impressions), filtered by the page.
- All new queries read `ad_events` with the existing `(campaign_id, occurred_at)` index.

---

## 6. Deliberately left out

These BA items are not included, because they need mobile-app work or concepts the backend does not have:

| Item | Reason |
| --- | --- |
| Test mode, Exclude test accounts | No test-account concept |
| Ads for logged-out users | All customer endpoints require login |
| Max ads per session, Minimum time between ads | Session/timing state lives in the mobile app; the feed is cached per region, not per user |
| Autoplay muted, Likes/comments/shares on ads, Sponsored label toggle | Mobile-app behaviour; the Sponsored label is always on |
| Skip settings and skip rate (skippable-after default, skip-rate KPI and review rule) | Skips are not being considered for now |
| Defaults for new ads (button label, skip time) | Not needed; the ad form has its own defaults |
| Rotation method, Block same ad twice in a row | Rotation by `weight` already exists |
| When no ad is eligible | The slot is already skipped |
| Creative requirements (ratio, length, size, formats) | Already fixed in the upload step (Spec 07: 9:16, ≤ 60 s, MP4/MOV) |
| Impression / view definitions, Reporting timezone, Raw data retention | Defined by the mobile app; reports use UTC days |
| Alert thresholds, Require approval before going live | Attention items were dropped (below); approval would be a new workflow |
| Ads per session, Sessions with ads | Ad events are not linked to app sessions |
| Feed health (fill rate, ad load, avg ads per user), Attention items | Removed to keep the Statistics tab simple |

### Follow-up: By platform

Possible later with a small change: a nullable `platform` column (`ios` / `android`) on `ad_events`, and the mobile app sending `platform` in `POST /v1/ads/events`. Then add a "By platform" card next to "By region".

---

## 7. Files (web)

```
src/app/(public)/ads/
  page.tsx                          — header: "Global settings" + "Global analytics" (Feed rules removed)
  constants.ts                      — PlatformAdSettings + defaults; AdItem: `frequency` removed; mock platform stats
  _components/feed-rules-dialog.tsx — deleted
  new/_components/ad-form.tsx       — "every N reels" removed
  platform/
    page.tsx                        — header + tabs (config | stats)
    _components/
      platform-ads-view.tsx         — header + tabs
      platform-config.tsx           — §3 cards, validation, confirm dialog
      platform-stats.tsx            — §4 sections
```

`AnalyticsDateFilter` moves from `content/analytics/[id]/_components/` to `components/custom/analytics-date-filter.tsx`, since three pages now use it (video analytics, referral analytics, platform ads).

---

## 8. Order of work

1. This spec (approval)
2. Web UI with mock data (§2–§4, §7)
3. Backend: settings endpoints + serving rules (§5.1–§5.3)
4. Backend: summary additions (§5.4)
5. Connect the UI to the API
