# Implementation Spec 04 — Admin Panel: Dashboard & Analytics Revamp

**App:** `apps/web` (Next.js admin panel) · **Scope: UI only, mock data** (no API/DB/Google-Analytics wiring; all data from mocks, region-scoped)
**Sources of truth:** client review call (Aug 28, 2026), client deck slides 6–8 + S1/S2 notes (the most detailed notes in the deck), `claude/matinee-product-context.md` §2, BA doc "Matinee_Admin Panel Changes" §1
**Repo conventions:** kebab-case, `@/` aliases, colocated `_components`, reuse `StatTile`/`MetricTile`/`SectionHeading`/`GlassCard`/`DashboardCard`, `MACRO_REGIONS`/`COUNTRIES`/`regionForCountry` from `@/app/_libs/regions`.
**This was the client's #1 pain point last round** — the module where "it was not done in the way I needed it to be" — so deviations from this spec require asking the client first (their standing rule).

---

## 0. The required mental model (read before coding)

The client's structure is a strict two-level hierarchy, and the current implementation violates it in one fundamental way: today `/dashboard` is ONE global page with five tabs (Overview / Engagement / Gamification / Monetization / Community). The client rejected tab-first navigation, and more importantly rejected a single flat dashboard: they want

1. **A master (global) page showing exactly three things** — stat row, global activity map, viewership-vs-gamification split. Quote: "that's all we want to have on the initial data analytics page." It must operate like a **snapshot** for management, with **export**.
2. **A per-region page** (click "US" on the map → US analytics) laid out as **seven boxed sections stacked on one scrollable page** — each box a header + its defined metrics — so an operator can scroll, scan, and "jump to User Analytics and see what's happening." Tabs were explicitly proposed by GeekyAnts on the call and explicitly rejected. New analytics get added over time **as new boxes** — that's the client's shared vocabulary.

The good news discovered in the code: **almost every metric the client listed already exists as a built component** (user-analytics tiles, points-economy section, session-quality regional split, monetization tiles + regional table, community in-app and external tiles, retention cohort, funnel, K-factor, redemption trend, gameplay velocity). This spec is therefore mostly *reorganization + region-scoping + a click-through*, not metric building. Gaps that must be net-new are marked **[NEW]**.

---

## 1. File plan

```
src/app/(public)/dashboard/
  page.tsx                          — REWRITE: master page, 3 sections, no tabs
  constants.ts                      — NEW: region-scoped mock data (see §5)
  _components/
    real-time-pulse.tsx             — keep (master stat row)
    global-activity-map.tsx         — modify: cells become links (§2.2)
    viewership-split.tsx            — NEW: master section 3 (extracted from session-quality-section)
    …all existing section/chart components — keep, moved into the region page (region-scoped)
  region/[code]/
    page.tsx                        — NEW: per-region drill-down (7 boxes)
    _components/
      region-header.tsx             — NEW
      section-jump-nav.tsx          — NEW (anchor chips, §3.2)
      box-user-analytics.tsx        — wraps user-analytics-section
      box-gamification-economy.tsx  — wraps points-economy-section + economy charts
      box-screen-time.tsx           — wraps session-quality content + [NEW] tiles/heatmap
      box-monetization-funnel.tsx   — wraps monetization-section + funnel + revenue charts
      box-community-in-app.tsx      — wraps community in-app tiles
      box-community-external.tsx    — wraps community external tiles
      box-graphs-trends.tsx         — wraps retention/redemption/k-factor/velocity charts
```

Existing `_components` files are NOT duplicated — the `box-*` wrappers import them and pass a `region` prop. Where a section file currently mixes concerns (e.g., `session-quality-section.tsx` contains the viewers-vs-gamified table needed on the master), split the pieces apart rather than copying.

---

## 2. Master page — `dashboard/page.tsx` (rewrite)

### 2.1 Header

- Title "Dashboard", subtitle "Global snapshot — click a region for detailed analytics".
- Right side: `TimeRangeSelector` (keep) + **Export** button (keep; see §4).
- **Remove `RegionFilter` and `CountryFilter` from the header** — the master is always global; regional analysis now happens by clicking through the map (the filters' job is replaced by navigation). ⚠️ Flag in PR (assumption; the client's model makes the filters redundant here, and per-region pages carry their own scope).
- Remove the Tabs entirely (`useTabParam`, `TabsList`, all five `TabsContent` blocks).

### 2.2 Section 1 — Master stat row (keep `RealTimePulse`)

Exactly the deck's slide-6 top row, already implemented: **Total Users · Signed Up · Subscribed · Online Now · Playing Games** with the live-updating simulation. No changes beyond keeping it first.

### 2.3 Section 2 — Global Activity Map (modify `global-activity-map.tsx`)

Immediately after the stat row (client: "right after this it should show the global activity map"). Keep everything it already does — Master (countries) / Regional (macro-regions) level toggle, the three metric modes (**Activity / Points Economy / Revenue** — the Points Economy mode satisfies the client's "track where most people are gamifying so we know which is an exciting region"), heat coloring, hover tooltip, snapshot timestamp. Changes:

- **Cells become click-through links** — the core missing behavior. Clicking a country cell navigates to `/dashboard/region/{iso}` (e.g., `/dashboard/region/US`); clicking a macro-region cell (Regional level) navigates to `/dashboard/region/{macro}` (e.g., `/dashboard/region/APAC`). Add a visible affordance: cursor-pointer already exists; add "Click a region for full analytics" to the legend line, and make cells keyboard-focusable links (`<Link>` wrapper, not onClick div).
- Keep the hover tooltip; append "View analytics →" to it.

### 2.4 Section 3 — Viewership vs Active Gamification (`viewership-split.tsx` [NEW — extracted])

The regional table that already lives inside `session-quality-section.tsx` (`NA/EU/APAC/LATAM/MEA × viewers/gamified`) becomes its own master-page section, matching slide 6's bottom table:

- Columns: Region · share % · Viewers · Gamified · gamified-rate bar (gamified ÷ viewers, visual bar).
- **Rows click through** to `/dashboard/region/{macro}` (same destination as the map).
- Header via `SectionHeading`: "Viewership vs Active Gamification" / "High-level split of passive viewers vs gamified users, by region".

### 2.5 Nothing else on the master page

The current Highlights, `CriticalKPIs`, retention/funnel cards, and all tab content come OFF the master page. They are not deleted — they live on in the region page's boxes (§3) at regional scope, and at global scope via §3.4. This is the exact simplification the client asked for; resist the urge to keep "just one more" card on master.

---

## 3. Per-region page — `dashboard/region/[code]/page.tsx` [NEW]

### 3.1 Routing & header

- `code` accepts an ISO country (`US`, `GB`, …, from `COUNTRIES`) **or** a macro-region (`NA`, `EU`, `APAC`, `LATAM`, `MEA`) **or** `global` (§3.4). Unknown code → friendly "Unknown region" card (pattern: games' unknown-type card).
- `region-header.tsx`: back link to `/dashboard`, region display name (from `COUNTRIES`/`MACRO_REGIONS` lookup), a "part of {macro-region}" chip for countries (via `regionForCountry`), `TimeRangeSelector`, and **"Export report"** button (§4).
- Below the header, a compact **"Main statistics for this region"** strip (deck slide 7's top box): region's users, subscribers, online now, playing now — 4 small tiles from the region mock.

### 3.2 Section jump navigation (`section-jump-nav.tsx` [NEW])

A slim, sticky (top of viewport on scroll) row of **anchor chips** — one per box, numbered 1–7. Clicking a chip smooth-scrolls to that box's anchor (`#user-analytics`, etc.). This is NOT tabs — all seven boxes are always rendered and scrollable; the chips only scroll. It implements Adi's exact operating gesture: "if I'm with the team I can just jump to User Analytics and see what's happening."

### 3.3 The seven boxes — order, anchors, and full metric contents

Every box: `SectionHeading` with number + title + one-line subtitle, wrapped in a bordered container (`GlassCard` or bordered section) so each box reads as a distinct unit — the client's complaint last round was everything bleeding together. All metrics scoped to the route's region via mock data (§5). Metric sources below map to Adi's S2 notes verbatim; components in parentheses are the existing ones to reuse.

**Box 1 — User Analytics** (`#user-analytics`, wraps `user-analytics-section.tsx`)
Existing 8 tiles already cover the S2 list: video starts → completes + completion ratio ("your single best content-quality signal" — keep that phrasing as the sub-label); avg watch time / % watched; swipe-through rate (abandonment — down is good); re-watches & loops; engagement per session (likes+shares+saves+comments); content velocity (videos per session & per day per user); plus the two bonus tiles (completion rate live library, hit rate new uploads) — keep them, they're content-quality signals the client will recognize from the content module. Change: accept `region` prop; values from mock.

**Box 2 — Gamification & Points Economy** (`#gamification`, wraps `points-economy-section.tsx` + `points-economy-chart.tsx` + `redemption-rate-trend.tsx`)
S2 list → tiles: points earned per user per day **broken down by source** (watching / sharing / streaks / referrals / challenges — the existing sources-breakdown block; this is the "which actions drive engagement vs. inflate balances" view); points spent/redeemed and on what; **points balance distribution** (who is holding points — existing distribution block); streak length current & longest; **leaderboard rank changes + how often users check the leaderboard** [NEW tile — mock e.g. "3.1 checks/user/wk"]; challenge participation rate + completion. Charts: Points Economy Trend (mint vs redeem) and Redemption Rate trend render inside this box at region scope. The Economy Status health row (Healthy / redemption % / outstanding / inflation risk) from the old Gamification tab tops the box.

**Box 3 — Screen Time & Session Quality** (`#screen-time`, wraps the non-table remainder of `session-quality-section.tsx` + [NEW] pieces)
S2 list: viewership (not active) for this region; viewership WITH active gamification (the region's own viewers/gamified split — small paired stat, since the cross-region table now lives on master); **session length distribution** [NEW — histogram bar chart: <5m / 5–15m / 15–30m / 30–60m / >60m buckets]; **time-of-day heatmap** [NEW — 24h × 7d grid of usage intensity, simple CSS-grid heat cells, same coloring approach as the activity map]; **background↔foreground transitions** [NEW tile — login/logout/drop-out proxy, e.g. "4.2 re-entries/session/day"]; **"doomscroll depth"** [NEW tile — videos per session and time per user, e.g. "23 videos · 26 min"].

**Box 4 — Monetization & Funnel** (`#monetization`, wraps `monetization-section.tsx` + `conversion-funnel-chart.tsx` + `subscription-trend-chart.tsx` + `revenue-composition-chart.tsx`)
S2 list: the **signup → first session → engaged → subscriber funnel with drop-off at each step** (existing funnel chart — region-scoped); trial-to-paid conversion for this region (viewers vs subscribers); ARPU and **ARPDAU** (existing tiles; add ARPDAU tile if missing [NEW]); **LTV by acquisition channel alongside CAC** [NEW — small table: channel · LTV · CAC · LTV:CAC ratio, 4 mock channels (organic, referral, paid social, influencer)]. Subscription Trend + Revenue Composition charts render here at region scope. The monetization section's cross-region comparison table can stay as a "vs other regions" footnote block — it helps the operator rank the region they're looking at.

**Box 5 — Community Analytics — In-App** (`#community-in-app`, wraps the in-app half of `community-section.tsx`)
Existing 4 tiles match S2 exactly: comments per user per week (passive vs active participants); reply rate (conversations vs monologues); reaction-to-view ratio (% of viewers who do anything); in-app shares per video (sent to friends inside Matinee). Region-scoped.

**Box 6 — Community Analytics — External** (`#community-external`, wraps the external half of `community-section.tsx`)
Existing 6 tiles match S2 exactly: brand mentions/week across X · TikTok · IG · Reddit · YT; sentiment % pos/neutral/neg; viral moments (spikes + trigger); organic impressions; estimated earned media value; top advocates. **Keep the existing "pending external" markers** — these come from Google-Analytics/social-listening integration later; the box must render with the caveat visible so the client knows it's plumbing-pending, not forgotten.

**Box 7 — Graphs & Trends** (`#graphs-trends`, wraps `retention-cohort-chart.tsx`, `k-factor-chart.tsx`, `gameplay-velocity-chart.tsx`)
The explicitly visual/graph-driven section: **D1/D7/D30 retention cohort curves** ("the single most important chart for any consumer app" — keep as the lead, full width); **points redemption rate trend** — already charted in Box 2; here show a compact sparkline linking (anchor) back to Box 2 rather than duplicating the full chart; **funnel** — same treatment, compact + anchor to Box 4; **K-factor / viral coefficient** (existing chart); **gameplay velocity** (existing chart — "keep Gameplay Velocity to track" is a verbatim deck note). Layout: retention full-width, then a 2-col grid of K-factor + velocity, then the two compact cross-links.

### 3.4 Global scope

`/dashboard/region/global` renders the same 7-box page with global (unscoped) mock data, titled "Global Analytics." Master's map section header gets a quiet "View global analytics →" link to it. ⚠️ Flag in PR: this page is our mechanism to keep the existing global charts reachable after stripping the master to 3 sections — it fits the client's pattern (master → drill-down) but wasn't explicitly requested; confirm via Shivani.

## 4. Exports (client S1 note: "option to download or export data" + "export analytic report per region")

- **Master Export** (exists): extend the current CSV to include all three master sections — stat row, per-cell map values for the active metric mode, and the viewership-split table. Keep the client-side blob download pattern.
- **Region "Export report"** [NEW]: CSV of every metric in all 7 boxes for that region (section-name, metric, value, trend rows), filename `analytics-{code}-{timeRange}.csv`. Same blob pattern; a shared `download-csv.ts` util in `dashboard/_libs/` (or `@/app/_libs/utils/`) replaces the inline duplication.

## 5. Mock data — `dashboard/constants.ts` [NEW]

- One typed record: `REGION_ANALYTICS: Record<string, RegionAnalytics>` keyed by `"global"`, the 5 macro codes, and the 12 map countries. `RegionAnalytics` carries every Box 1–7 value (tiles, chart series, tables).
- Generate country/region values by deterministic scaling of the global baseline (share factors consistent with `global-activity-map.tsx`'s `countryData` and the slide-6 table: APAC 56%, NA 29%, EU 24%, LATAM 10%, MEA 5%) with small per-metric jitter so pages don't look copy-pasted. A `scaleAnalytics(base, factor)` helper beats hand-writing 18 datasets.
- Existing hardcoded mocks inside section components move into this file (single source), imported by the wrappers; components become presentational with props.
- Numbers must stay internally consistent (users sum ≈ 248.5K signed up; viewers/gamified match the master table; the map, master row, and region strips agree) — the existing code already keeps this discipline (see its comments); preserve it.

## 6. Explicitly KEEP / REMOVE

KEEP: `RealTimePulse` live simulation; map level + metric modes + snapshot timestamp; all existing chart components; "pending external" markers; `TimeRangeSelector`; internal consistency comments.
REMOVE from master (relocated, not lost): the 5 tabs; Highlights; `CriticalKPIs`; `AdminHealthSummary` rows (Economy Status moves into Box 2; Engagement/Community health rows dissolve into their boxes' tiles); retention/funnel cards (→ boxes 7/4); `RegionFilter`/`CountryFilter` (→ navigation). Delete `use-tab-param` usage here only (other modules may use it).
DO NOT ADD: AI search bar (feasibility still pending with Pushkar); alerts/recommended-actions on the dashboard (client never asked for them here); any 8th box.

## 7. Open items / assumptions (flag in PR; do not block)

1. **`/dashboard/region/global`** (§3.4) — our addition to preserve global charts; confirm with client.
2. **Header Region/Country filters removed from master** (§2.1) — navigation replaces them; confirm.
3. **Country-level drill pages** get the same 7 boxes as macro-regions (the client clicked "US" — a country — so country pages are first-class; macro pages aggregate).
4. Box 3's new heatmap/histogram are simple CSS/recharts builds, not a new charting dependency.
5. "Leaderboard rank changes / how often users check the leaderboard" (Box 2) is mock-only until events exist.
6. Sticky jump-nav chips are anchors, not tabs — if the client reads them as tabs on review, drop stickiness before dropping the chips (the jump gesture is theirs).
7. Cross-links instead of duplicate charts for funnel/redemption in Box 7 — avoids the "same data twice" confusion the client complained about; confirm they're happy or duplicate deliberately.

## 8. Acceptance criteria

1. `/dashboard` shows exactly: header (time range + export) → live stat row → global activity map → viewership-vs-gamification table. No tabs, no other cards, no region/country dropdowns.
2. Map cells (both levels) and viewership-table rows are real links; clicking US lands on `/dashboard/region/US` with US-scoped data; clicking APAC (regional level) lands on `/dashboard/region/APAC`.
3. Region page renders the region strip + sticky jump chips + all seven boxes in order (User Analytics · Gamification & Points Economy · Screen Time & Session Quality · Monetization & Funnel · Community In-App · Community External · Graphs & Trends), each visually boxed with a numbered heading and anchor; chips smooth-scroll.
4. Every S2 metric named in §3.3 renders somewhere in its box with region-scoped mock values; Box 6 shows its "pending external" markers; Box 7 leads with the retention cohort.
5. Two different regions show visibly different (but internally consistent) numbers; `global` shows the baseline; unknown codes show the friendly fallback.
6. Master export CSV covers all three sections; region export CSV covers all 7 boxes with the region + time range in the filename.
7. Time-range changes update both pages' data scope labels (mock variation acceptable).
8. `pnpm lint`, `pnpm type:check`, existing suites pass; kebab-case + alias conventions hold; no dead imports from the dissolved tabs.
9. Nothing added beyond this spec (client rule; this module burned them once already).

## 9. Suggested implementation order (each step leaves the app working)

1. `constants.ts` + `scaleAnalytics` + move section mocks behind props → 2. Region route + header + strip + 7 boxes wrapping existing sections (global scope first) → 3. [NEW] metrics (Box 3 heatmap/histogram/tiles, Box 4 LTV/CAC + ARPDAU, Box 2 leaderboard tile) → 4. Jump nav + anchors → 5. Map click-through + viewership-split extraction → 6. Master page rewrite to 3 sections → 7. Exports → 8. Sweep: dead code from dissolved tabs, lint, type-check, acceptance pass.
