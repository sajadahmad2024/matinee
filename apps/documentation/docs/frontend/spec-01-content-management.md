# Implementation Spec 01 — Admin Panel: Content Management Revamp

**App:** `apps/web` (Next.js admin panel) · **Scope: UI only, mock data** (no API/DB work in this phase; the module stays wired to `src/app/(public)/content/constants.ts` mocks, extended where needed)
**Sources of truth:** client review call (Aug 28, 2026), client deck "Matinee APP (17.07.26).pptx" slides 9–11 + S3/S4 notes, `claude/matinee-product-context.md` (project doc), BA doc "Matinee_Admin Panel Changes"
**Follow repo conventions:** kebab-case files, `@/` path aliases, colocated `_components`, existing UI kit (`@/components/ui/*`, `GlassCard`, `StatTile`, `SectionHeading`). Reuse before creating.

---

## 0. Why this change (context for the implementer)

The client (Adi & Ryan) operates the platform through this panel in real time and wants one replicable mental model across modules. Their verdict on the current content module: the tile content is right, but the **structure** is wrong. The required master-page model is: **three clickable summary cards on top (Content Inventory / Licensing & Rights / Content Performance) whose detail data appears only on click, with the video timeline always visible below them.** The current top-level **Library / Analytics view tabs must go** — the client explicitly rejected tab-switching as the primary navigation ("we want to scroll, not click between tabs"), and the analytics view currently hides the licensing/performance data behind a second tab, which is exactly what they don't want.

Everything below is a delta on the existing code — most tile-level components (`content-inventory.tsx`, `licensing-rights.tsx`, `content-performance.tsx`, `licensing-table-modal.tsx`, `stat-tile.tsx`) already match the deck's tile specs and are **kept, not rebuilt**.

---

## 1. Master page restructure — `src/app/(public)/content/page.tsx`

### 1.1 Remove the Library/Analytics split

- Delete usage of `ContentViewTabs` (`_components/content-view-tabs.tsx`) and the `view` search param. The component file can be removed once unreferenced.
- The page becomes ONE surface, top to bottom:
  1. Header (title, CountryFilter, Library/taxonomy button, Add Video button) — unchanged.
  2. **Three summary cards** (new — §1.2).
  3. **Expanded section area** (new — §1.3): renders the detail of whichever card is active, or nothing.
  4. **Recommended Actions** — KEEP (see §6 note).
  5. **Request & Review area**: tabs + filters + video list / calendar view (§3, §4).

### 1.2 New component: `_components/content-summary-cards.tsx`

Three equal cards in a responsive `grid sm:grid-cols-3`, replacing nothing visually (net-new). Each card is a compact headline card, NOT the full tile grid:

| Card | Headline value | Sub-line | Source |
|---|---|---|---|
| Content Inventory | `CONTENT_INVENTORY.activeLibrary` (e.g., 1,847 live videos) | `+{addedThisMonth} this month` | existing constant |
| Licensing & Rights | `LICENSING_SUMMARY.expiring30` expiring ≤30d (color-coded: red when >5, else amber) | `{licensed} licensed / {original} original` | existing constant |
| Content Performance | `PERFORMANCE_SUMMARY.avgWatchTime` avg watch | `{hitRatePct}% hit rate` | existing constant |

Behavior:
- Clicking a card toggles it active (URL param `?section=inventory|licensing|performance` via `router.push` with `scroll: false`, same pattern as `content-tabs.tsx`). Clicking the active card again collapses (`section` param removed). Default: **no section expanded** — master page shows cards + timeline only, per the client's "data appears only after clicking".
- Active card gets the `border-primary` / glow treatment used elsewhere (`hover:border-primary/50`, `shadow-glow-sm`).
- Card is keyboard-activatable (button semantics), with a chevron indicating expanded state.

### 1.3 Expanded section area

Rendered directly below the cards when `section` is set:

- `section=inventory` → existing `<ContentInventory />` (unchanged: Active Library, Uploaded This Month w/ progress bar, Pipeline, Freshness tiles).
- `section=licensing` → existing `<LicensingRights />` (tiles + "Licensing table" button opening `LicensingTableModal`). The licensing table stays INSIDE this section per client ("the table should be inside the Licensing & Rights section").
- `section=performance` → existing `<ContentPerformance />` **plus** the existing `<ContentAnalytics />` (funnel + share velocity charts) moved here — performance is its natural home now that the Analytics view is gone.

No other placement changes to these components. Wrap the expanded area in a subtle container (e.g., border-top or indent) so it reads as "belonging to" the active card.

---

## 2. Video timeline (list) — always visible on master

The existing `VideoList` remains the primary working surface below the cards. Client verdict: rows are good ("you did a good job on the timeline"). Changes:

### 2.1 Remove the game leaderboard icon — `_components/video-list-item.tsx`

- Delete the Trophy hover-action button ("Game Leaderboards") and its `onLeaderboards` prop; delete `leaderboardModal` state and `<LeaderboardModal />` usage from `_components/video-list.tsx`. Gaming is a separate module; the video row must not surface game leaderboards. `leaderboard-modal.tsx` can be deleted if nothing else imports it (verify — `grep -r "leaderboard-modal"`).
- KEEP the "{n} Games" linked-games badge on the row (informational metadata was not objected to; only the leaderboard entry point was).

### 2.2 Sort/filter upgrades — `_components/content-filters.tsx`

The two decorative icon buttons (Filter, SlidersHorizontal) become functional:
- Add a **sort select**: Newest (default) / **Most viewed** / **Least viewed** — writes `?sort=most-viewed|least-viewed` etc.; `VideoList` applies it to the filtered array before pagination. This is an explicit client ask (sponsor packages are sold against "top 10 most-viewed videos", so the team must find them instantly).
- Add a **date filter** (upload date range or "last 30 days / 90 days / all time" select — simple select is enough for this phase), per the BA doc "filters by date".
- Keep debounced search as is.

### 2.3 Tabs — `constants.ts` `CONTENT_TABS_CONFIG` + `_components/content-tabs.tsx`

Reshape to the client's flow: **Requests → Master → Scheduled → Live → Rejected → Archive** (+ keep Drafts and Priority — see Open items §7):

- Add new tab `master` (label "Master", calendar-range icon) positioned after Requests. **Default tab becomes `master`** (replace `tab = "all"` default in `page.tsx`).
- `master` tab contents: all videos that are **live OR scheduled**, in one scrolling list — implement in `VideoList.getFilteredVideos()` as `status === "published" || status === "boosted" || isLive || status === "scheduled"`. Sort: scheduled first by `scheduledAt` ascending, then live by upload date descending (so "what's coming up" leads).
- **Color-coding on the master tab:** each row shows its status distinctly — reuse `StatusBadge`, and add a left border accent on the row card: `border-l-success` for live/published, `border-l-primary` for scheduled (only on the master tab; pass a `variant="master"` prop or similar to `VideoListItem`).
- Rename tab `all` → label **"Live"** (only live/published, not drafts).
- Existing `requests`, `drafts`, `scheduled`, `boosted`, `rejected`, `archived` tabs keep their current filtering.

---

## 3. Calendar view — NEW `_components/content-calendar.tsx`

An icon/button on the Master tab row (next to `ContentFilters`) toggles the master list between **list view** and **calendar view** (`?viewMode=calendar`). Client intent: "like opening the Mac calendar" — see across months what is live and what is scheduled, without walking each list.

- **Month grid** (build on `react-day-picker` already in deps, or a simple custom CSS grid — implementer's choice; custom grid is likely easier for multi-day spans) with prev/next month navigation, defaulting to the current month.
- Renders BOTH:
  - **Scheduled videos** — a pill on their `scheduledAt` date, colored `primary` (matches list color-coding).
  - **Live videos** — a spanning bar (or pill on each day) across their live date range, colored `success`. Mock data needs `liveFrom` / `liveUntil` fields added to `VideoItem` + populated on the published `MOCK_VIDEOS` entries (client stated every live video has dates associated — e.g., live for 2–3 months).
- Clicking a pill opens the video details route (`/content/details/{id}`).
- Overflow: >3 items on a day collapses to "+n more" with a popover listing them.
- Keep it dumb and readable — this is an operational monitoring view, not a drag-and-drop scheduler. No editing from the calendar in this phase.

---

## 4. Video details / edit screen — `content/new/_components/*` + `content/details/[id]/*`

Steps remain **Details → Rights → Media → Distribution → Ad Sales** (rename below). Client approved the step structure; the fixes are content-level.

### 4.1 Remove comment sections from the edit flow

- `content/details/[id]/page.tsx`: remove `<VideoComments />` from the sidebar (currently renders under every step — this is the "why is the comment section there?" complaint on Rights/Media/Ad Sales). Keep `<ChangeHistoryCard />`.
- Comment moderation remains in the **Moderation** module (`(public)/moderation`) — do not delete `video-comments.tsx` yet; move nothing in this phase. If a per-video comments surface is wanted later it belongs on the video **analytics** page, not the edit form. (Flagged as an assumption in §7.)

### 4.2 Distribution step — `content-classification-card.tsx`

The "Publish to regions" control changes from horizontal toggle-pills to the client's sketched **vertical region list with live/off state**:

- Keep the multi-select mechanism (all 5 `MACRO_REGIONS`, select-all/clear-all).
- Selected regions render as a **vertical stacked list** (one row per region), each row showing:
  - Region label
  - **Live/Off toggle** with status dot — green dot + "Live" when on, red dot + "Off" when off (`Switch` + colored indicator). This is *distinct from selection*: a region can be selected for publish but toggled Off (the client's use case — launch in 5 regions, later pause 2 without unselecting them).
  - **Remove icon** (X) that unselects the region entirely.
- Unselected regions remain available in a compact "+ Add region" row of pills or a select beneath the list.
- State shape: `publishRegions: { code: MacroRegion; live: boolean }[]` (replaces `string[]`).
- Helper text updates accordingly ("Live in 3 of 5 selected regions").
- Rights region select, language, content type, recommendation, exclusive-content toggle + unlock points: **unchanged** (client approved exclusivity as built).

### 4.3 Monetisation step → **"Ad Sales"**

- `video-form.tsx` `STEPS`: rename key/label `monetisation` → `ad-sales` / "Ad Sales" (icon can stay `DollarSign` or switch to `Megaphone`).
- **Remove `GameAssociationCard` from this step** (client: game association does not belong in a video's monetization; games are configured in the Game Management module). Do not delete the component file — the Games phase decides its fate; just unwire it here (and remove now-unused form state `gameInstances`/`selectedFormat` from `video-form.tsx`).
- `sponsorship-card.tsx` changes:
  - Format select: keep `organic` and `sponsored`; **remove `commercial`** ("Ad-Sales commercial inserted in feed") — platform-level commercials belong elsewhere per client ("that's linked to the overall platform"); the feed-frequency field goes with it. Leave a code comment pointing to the platform-level Ad Sales home (future Dashboard/Monetization phase).
  - Placement select: **only two options — "Pre-roll (before video)" and "Icon Overlay (on video)"**. Remove mid-roll, post-roll, banner.
  - **Duration field is placement-dependent:** Pre-roll → "Ad duration (seconds)" (existing behavior); Icon Overlay → **"Overlay duration (days)"** — the length of the sponsorship deal, not per-play seconds. Swap label, unit hint, and sensible default (e.g., 30 days).
  - Sponsor logo upload (BannerUpload) stays — this is the "keep only sponsor logo on video" requirement.
- `VideoItem` mock additions to represent this: `adPlacement?: "pre-roll" | "icon-overlay"`, `adOverlayDays?: number` (keep `adDurationSecs` for pre-roll). Update the Sponsored badge in `video-list-item.tsx` to show `· {n}d overlay` for icon-overlay sponsors.

### 4.4 Rights & Media steps

No changes beyond §4.1 (their comment-section complaint is the details-page sidebar; `licensing-card.tsx` and `media-upload-card.tsx` contain no comment UI — verified).

---

## 5. Constants / mock-data changes — `content/constants.ts`

- `VideoItem`: add `liveFrom?: string; liveUntil?: string;` (ISO dates), `adPlacement?`, `adOverlayDays?` as above.
- Populate `liveFrom`/`liveUntil` on all published/live/boosted mock videos and 1–2 more scheduled videos (varied months) so the calendar demos well across a 3-month window.
- Add `master` to `TabValue` and `CONTENT_TABS_CONFIG` (count = live + scheduled count).
- No other mock reshaping.

---

## 6. Explicitly KEEP (do not "clean up")

- **Recommended Actions** section on the master page. The client's deck says verbatim "Don't take out recommended actions" and the call's final word was keep (Adi reversed his initial removal when he realized it's AI-driven real-time guidance). ⚠️ The BA doc says "remove" — that captured Adi's *initial* statement; deck + call transcript override it. If Shivani pushes back, resolve with her before deleting.
- All existing tile components and the licensing table modal (they match the deck's tile specs).
- StatusBadge, workflow history collapsible, approval flow on Requests, PreviewAsUser, boost/schedule modals, taxonomy page, per-video analytics page.
- Country filter in the header.

## 7. Open items / assumptions (do NOT block on these; flag in PR)

1. **Drafts & Priority tabs kept** — the client's flow names only Requests/Master/Scheduled/Live/Rejected/Archive; drafts and boosted weren't mentioned. Keeping them (pipeline needs drafts; boost is an existing feature). Confirm with client via Shivani.
2. **Comments fully removed from the edit page** (not just from specific steps) — assumption; the moderation module is the comments home.
3. **AI search bar** (Gemini-style) — feasibility still pending with Pushkar. NOT in this spec.
4. **"Publish ads only on top-10 videos" automation** — deferred by client ("maybe easier for us to do it on our own"); the most/least-viewed sort covers the manual workflow.
5. Calendar shows live ranges AND scheduled dates (per call); BA doc suggested scheduled-only — call wins.
6. `?section=` expansion pattern chosen over separate routes to keep the timeline visible below at all times (the client's core ask). If deep-linking per section is wanted later, params already support it.

## 8. Acceptance criteria

1. `/content` shows: header → 3 summary cards (none expanded) → Recommended Actions → Master tab active with combined live+scheduled color-coded list. No Library/Analytics tabs anywhere.
2. Clicking each summary card expands exactly its section beneath the cards; clicking again collapses; timeline never disappears; `?section=` deep-links work.
3. Licensing table opens only from within the Licensing & Rights section.
4. Master tab list: scheduled rows carry primary accent + badge, live rows success accent; sort select offers Most/Least viewed and applies across tabs; date filter works.
5. Calendar toggle on Master tab renders month grid with scheduled pills and live-range bars from mock data; items click through to details; "+n more" overflow works.
6. Video rows show no leaderboard/trophy action anywhere; Games-count badge still present.
7. Edit screen: no comments UI on any step; Distribution shows the vertical region list with live/off toggles + remove icons; step 5 is named "Ad Sales" with no game association, formats organic/sponsored only, placements pre-roll (seconds) / icon overlay (days).
8. `pnpm lint`, `pnpm type:check`, and existing vitest suites pass; new components follow kebab-case + alias conventions.
9. Nothing added beyond this spec (client rule: extra ideas require asking them first).

## 9. Suggested implementation order (each step leaves the app working)

1. Constants/mocks (§5) → 2. Summary cards + section expansion, remove view tabs (§1) → 3. Tabs + master tab + color coding (§2.3) → 4. Sort/date filters (§2.2) → 5. Leaderboard icon removal (§2.1) → 6. Calendar view (§3) → 7. Edit-screen changes (§4) → 8. Sweep: lint, type-check, acceptance pass.
