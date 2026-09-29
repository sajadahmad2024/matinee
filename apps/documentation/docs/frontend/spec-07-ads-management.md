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
| Ads Management (`/ads`) | Video ads between reels: upload, frequency, regions, schedule, basic stats |

---

## 2. Screens

| Route | Purpose |
| --- | --- |
| `/ads` | Ad list, 3 summary tiles, feed rules dialog |
| `/ads/new` | Create an ad (one-page form) |
| `/ads/[id]` | Ad detail: 3 stats + 1 chart, and actions |
| `/ads/[id]/edit` | Edit an ad (same form, prefilled) |

Sidebar item: **Ads Management** (`/ads`), placed after User Management.

### 2.1 `/ads`: list

- **Header:** "Ads Management", with the buttons **Feed rules** and **+ New Ad**.
- **3 tiles.** Each has a bold heading with a one-line description underneath:

| Tile | Description |
| --- | --- |
| Live ads | Ads showing in the feed right now |
| Total impressions | Times ads were shown to users |
| Avg completion | Share of plays watched to the end |

- **Search** (by ad name or advertiser), with the status **tabs** right beside it: All · Live · Scheduled · Paused · Ended.
- **Table columns:** Ad (name, advertiser, "every N reels") · Dates · Status · Impressions · Completion · ⋯ menu.
- **Row menu:** Edit, Pause/Resume, End now (asks for confirmation).
- Clicking a row opens the ad detail page.

### 2.2 Feed rules dialog

Opened from the **Feed rules** button. These two global limits apply to every ad:

| Field | Default |
| --- | --- |
| Minimum reels between ads | 5 |
| Max ads per user per day | 15 |

Both must be whole numbers of 1 or more.

### 2.3 `/ads/new` and `/ads/[id]/edit`: one-page form

Three cards and a Save button. There are no steps and no drafts.

| Card | Fields |
| --- | --- |
| **Ad** | Name, advertiser, video, button label (Learn more / Shop now / Install / Watch now), button link |
| **Delivery** | Show after every **N** reels; regions ("All regions" or pick macro-regions) |
| **Schedule** | Start, end |

**Video upload** checks the real file before accepting it:
- It must be vertical **9:16**, MP4 or MOV, **60 seconds or shorter**.
- It shows a progress bar, then a playable preview with the detected length. The upload itself is mocked.

**Validation (checked on Save):**
- Name, advertiser, video, and a valid link are required. The link must be `https://` or an app link.
- Frequency must be 1 or more.
- At least one region must be picked.
- The end must be after the start.

**After saving:**
- If the start date is in the future, the ad becomes **Scheduled**; otherwise it goes **Live**.
- A new ad goes back to `/ads`; an edited ad goes to its detail page.

### 2.4 `/ads/[id]`: detail

- **Header:** name, status badge, and one line with advertiser · dates · frequency · regions. Actions: **Edit**, **Pause/Resume**, **End** (asks for confirmation).
- **3 tiles**, each with a description:

| Tile | Description | Meaning |
| --- | --- | --- |
| Impressions | Times the ad was shown | Every time the ad appeared on screen. The same person seeing it twice counts twice. |
| Completion rate | Plays watched to the end | Completed plays ÷ plays started. A swipe-away adds to plays started but not to completed. |
| CTR | Views that tapped the button | Button taps ÷ impressions |

- **One chart:** impressions per day, over the flight so far (at most 30 days).
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

- Calendar view, recommended actions, combined analytics charts, export, time range picker
- Multi-step wizard, drafts, phone preview
- Headline, thumbnail, swipe lock, per-user caps, priority, impression goals
- Audience / platform / category / country targeting, dayparting, timezone picker
- Unique viewers (hard to track reliably), skip rate, quartiles, breakdowns, revenue, change history

---

## 5. Files

```
src/app/(public)/ads/
  page.tsx                       — list page: header, 3 tiles, AdList
  constants.ts                   — AdItem type, mock ads, feed-rule defaults, formatters
  _components/
    ad-list.tsx                  — search, tabs, table, row menu
    ad-status-badge.tsx
    feed-rules-dialog.tsx
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
