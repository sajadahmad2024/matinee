# Implementation Spec 07 — Admin Panel: Ads Management

**App:** `apps/web` (Next.js admin panel) · **Scope:** UI only, mock data (no API or DB yet)
**Status:** ✅ Implemented
**Branch:** `web/feat/ads-management-ui`
**Goal:** keep this module small. The admin panel is already heavy, so it has only what's needed to upload an ad, schedule it, and see whether it works.

---

## 1. What this module is

Video ads that are **shown between reels while the user scrolls**. An ad is its own asset. It is not attached to a single video.

This replaces the **pre-roll** option that used to be on the video form's Ad Sales step:

| Where | What it handles |
| --- | --- |
| Video form → Ad Sales step | Organic, or **sponsored**: a sponsor logo shown as an **icon overlay** for a number of days |
| Ads Management (`/ads`) | Video ads between reels: upload, regions, schedule, basic stats |

---

## 2. Screens

| Route | Purpose |
| --- | --- |
| `/ads` | Ad list, 3 summary tiles, links to Platform Ads ([Spec 09](./spec-09-ads-platform.md)) |
| `/ads/new` | Create an ad (one-page form) |
| `/ads/[id]` | Ad detail: 3 stats + 1 chart, and actions |
| `/ads/[id]/edit` | Edit an ad (same form, prefilled) |

Sidebar item: **Ads Management** (`/ads`), placed after User Management.

### 2.1 `/ads`: list

- **Header:** "Ads Management", with the buttons **Global settings**, **Global analytics** (both open Platform Ads, Spec 09) and **+ New Ad**.
- **3 tiles.** Each has a bold heading with a one-line description underneath:

| Tile | Description |
| --- | --- |
| Live ads | Ads showing in the feed right now |
| Total impressions | Times ads were shown to users |
| Avg completion | Share of plays watched to the end |

- **Search** (by ad name or advertiser), with the status **tabs** right beside it: All · Live · Scheduled · Paused · Ended.
- **Table columns:** Ad (name, advertiser) · Dates · Status · Impressions · Completion · ⋯ menu.
- **Row menu:** Edit, Pause/Resume, End now (asks for confirmation).
- Clicking a row opens the ad detail page.

### 2.2 Feed rules

Replaced by the Platform Ads **Configuration** tab (`/ads/platform?tab=config`, [Spec 09](./spec-09-ads-platform.md)), which holds the global placement and per-user limits.

### 2.3 `/ads/new` and `/ads/[id]/edit`: one-page form

Three cards and a Save button. There are no steps and no drafts.

| Card | Fields |
| --- | --- |
| **Ad** | Name, advertiser, caption (optional, up to 300 characters, shown under the ad in the feed), video, button label (Learn more / Shop now / Install / Watch now), button link |
| **Delivery** | Regions ("All regions" or pick macro-regions). How often ads appear is a platform setting (Spec 09), not per ad. |
| **Schedule** | Start, end |

**Video upload** checks the real file before accepting it:
- It must be vertical **9:16**, MP4 or MOV, **60 seconds or shorter**.
- It shows a progress bar, then a playable preview with the detected length. The upload itself is mocked.

**Validation (checked on Save):**
- Name, advertiser, video, and a valid link are required. The link must be `https://` or an app link.
- At least one region must be picked.
- The end must be after the start.

**After saving:**
- If the start date is in the future, the ad becomes **Scheduled**; otherwise it goes **Live**.
- A new ad goes back to `/ads`; an edited ad goes to its detail page.

### 2.4 `/ads/[id]`: detail

- **Header:** name, status badge, one line with advertiser · dates · regions, and the caption underneath (when set). Actions: **Edit**, **Pause/Resume**, **End** (asks for confirmation).
- **Date range filter** above the stats: the shared `AnalyticsDateFilter` (presets plus custom range, URL-driven, default Last 30 days). Hidden until the ad has stats.
- **Export** button next to the date filter: downloads a CSV, `ad-<id>-<range>.csv` with one row per date and the columns `Date, Impressions, Unique reach, Clicks, CTR %, Completion rate %`.
- **5 tiles** in one row (wraps on smaller screens), each with a description:

| Tile | Description | Meaning |
| --- | --- | --- |
| Impressions | Times the ad was shown | Every time the ad appeared on screen. The same person seeing it twice counts twice. |
| Unique reach | Different users who saw it | Distinct users with at least one impression |
| Clicks | Button taps | Count of button taps |
| CTR | Views that tapped the button | Button taps ÷ impressions |
| Completion rate | Plays watched to the end | Completed plays ÷ impressions (matches the backend's `completionRate`) |

- **One chart:** impressions per day, over the flight so far (at most 30 days).
- **How often users saw it:** share of reached users who saw the ad once, twice, 3 times and 4+ times, plus a line with the share who saw it 3+ times (a sign of ad fatigue).
- **By region:** table of region, impressions, share and CTR, for the regions the ad targets.
- **How these are counted:** a one-line note under the stats explaining impression, unique reach and completion rate.
- An ad that hasn't started shows: "Stats appear once the ad goes live."

---

## 3. Statuses

| Status | Meaning |
| --- | --- |
| Scheduled | Start date is in the future |
| Live | Currently showing |
| Paused | Switched off by an admin mid-flight; can be resumed |
| Ended | Past its end date, or ended manually |

---

## 4. Deliberately left out

To keep the panel simple, these are **not** included. Add them only when there's a clear need:

- Calendar view, recommended actions, combined analytics charts, PDF export, share links
- Multi-step wizard, drafts, phone preview
- Headline, thumbnail, swipe lock, per-user caps, priority, impression goals
- Audience / platform / category / country targeting, dayparting, timezone picker
- Skip rate, quartiles, watch time and retention, platform breakdown, delivery vs booked impressions, revenue and cost, change history

---

## 5. Files

```
src/app/(public)/ads/
  page.tsx                       — list page: header, 3 tiles, AdList
  constants.ts                   — AdItem type, mock ads, platform-settings defaults, formatters
  _components/
    ad-list.tsx                  — search, tabs, table, row menu
    ad-status-badge.tsx
  new/
    page.tsx
    _components/
      ad-form.tsx                — one-page form + validation
      ad-video-upload.tsx        — 9:16 / ≤ 60s checks, mocked upload
  [id]/
    page.tsx                     — detail: header, 3 tiles, chart
    edit/page.tsx
```

**Other files changed:**
- `components/custom/app-sidebar.tsx`: the Ads Management nav item.
- `components/custom/stat-tile.tsx`: a new optional `description` prop. Tiles that use it get a bold heading with the description underneath; other tiles are unchanged.
- `content/new/_components/sponsorship-card.tsx`: pre-roll removed; icon overlay (days) only; a link to Ads Management.
- `content/constants.ts` and `content/_components/video-list-item.tsx`: pre-roll removed from the mock videos and the Sponsored badge.

---

## 6. For later (API phase)

- Backend: ads are **not** content rows. They get their own `ads` table/module, with video through the existing media upload pipeline.
- The app needs to report ad events so the stats are real:
  - `ad_impression`: the ad is on screen.
  - `ad_start` / `ad_complete`: used for completion rate.
  - `ad_cta_click`: used for CTR.
- Ad views must not earn points or count toward watch time.
- Open questions: are premium subscribers ad-free? Should ads also play before specific videos, or only between reels?
