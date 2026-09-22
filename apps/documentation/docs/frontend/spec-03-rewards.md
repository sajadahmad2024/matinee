# Implementation Spec 03 — Admin Panel: Rewards Module (NET NEW)

**App:** `apps/web` (Next.js admin panel) · **Scope: UI only, mock data** (new module ships with its own mock constants; no API/DB work)
**Sources of truth:** client review call (Aug 28, 2026), client deck slide 13 notes ("+REWARDS"), `claude/matinee-product-context.md` §5, BA doc "Matinee_Admin Panel Changes" §4, MVP scope "Module 4: Rewards & Subscriptions"
**Repo conventions:** kebab-case, `@/` aliases, colocated `_components`, reuse existing kit.
**Coordination with Spec 02:** Spec 02 removes Bidding from the games module (deletes `games/format/_components/types/bidding.tsx` and the `bidding` game type). This module is Bidding's new home. The shared games components it relied on (`InstancesList`, `CreateInstanceModal` kind="auction", `InstanceResolveModal`, `InstanceResultModal`, `BannerUpload`) stay in `games/` and are the reference implementations to adapt — the auction create/settle/result flows there already model min-bid, bid leaderboards, and winner settlement. If Spec 02 has already landed, recover any deleted reference code from git history; do NOT re-add bidding to games.

---

## 0. What this module is (context for the implementer)

A **net-new top-level admin section** the client asked for on the call: "we'll need a new page that is tracking just rewards… what rewards are active, what we've done, the popularity, the number of points that won the auction." It follows the client's one replicable layout pattern: **master analytics on top → regional lens → list of rewards**, as a single scrollable page (no tab-first navigation — same rejection as content/games).

Two reward types, deliberately different in depth:

1. **Unlock Content** — points-gated content. Configuration ALREADY lives in Content Management (the exclusive-content toggle + unlock points on a video, built in `content-classification-card.tsx`). This module only **tracks and links** — the client was explicit: "this is something we already do in content management; this one just has to track and link so we can see what's live on the app." Do not build a second place to configure exclusivity.
2. **Bidding for Experiences** — users bid points to win real-world experiences (premiere tickets, meet-the-cast, a day with a director). Fully configured HERE, per-reward, with a content-management-style detail page. **Geofenced per country because gambling/sweepstakes law differs by market — first launch: UK.** Quarterly cadence; scheduled in advance like content.

## 1. Module registration

- New route group folder: `src/app/(public)/rewards/` with `page.tsx`, `constants.ts`, `_components/`, and `experience/[id]/page.tsx` (+ `experience/new/page.tsx`).
- Sidebar (`src/components/custom/app-sidebar.tsx`): insert `{ title: "Rewards", href: "/rewards", icon: LuGift }` between Game Center and User Management.
- Lift `StatTile` and `SectionHeading` from `content/_components/` to `@/components/custom/` if Spec 02's lift hasn't happened yet (three modules now use them); update existing imports.

## 2. Master page — `rewards/page.tsx` (single scroll, top to bottom)

### 2.1 Header

Title "Rewards", subtitle "Points-gated content and bidding for experiences." Right side: **region filter** (§2.3) + primary button "New Experience" → `/rewards/experience/new`.

### 2.2 Master analytics — 4 `StatTile` boxes (`_components/rewards-analytics.tsx`)

Client asked for the same master-analytics treatment as other modules; Ryan's stated needs: active rewards, history, popularity, winning bid amounts. Proposed tiles (⚠️ flag in PR: metrics are a GeekyAnts proposal pending client sign-off, same as gaming's):

1. **Active Rewards** — big number: live experiences + live unlock-content items; sub-stats: `{n}` bidding live, `{n}` unlock content live, `{n}` scheduled next quarter.
2. **Points Redeemed (period)** — points spent on unlocks + points settled in won auctions; trend vs. last period.
3. **Active Bidders** — unique users with a standing bid; sub-stat: total bids this period (popularity signal).
4. **Top Winning Bid** — highest settled bid this period ("the number of points that won the auction"); sub-stat: average winning bid.

### 2.3 Regional lens

- A `?region=` select (All regions + 5 `MACRO_REGIONS` from `@/app/_libs/regions`) scoping the analytics tiles and both lists below — same URL-param pattern as content/games filters. Mock data varies by region (deterministic scaling is fine).
- Every experience row/card additionally shows its **geofence badge** (e.g., "🇬🇧 UK only") — geofencing is per-country (§4.4), independent of the analytics lens.

### 2.4 Section 1 — Unlock Content (`_components/unlock-content-section.tsx`)

`SectionHeading` "Unlock Content" (subtitle: "Points-gated content — configured in Content Management, tracked here"), then a table/row list of all exclusive-flagged content:

- Columns/row content: content title · unlock cost (pts) · status (Live/Scheduled/Off — reuse content's `StatusBadge` semantics) · unlocks count · points spent total · trend.
- Row click → `/content/details/{id}` (the video's edit page — the client's "track & link"). An external-link icon makes the hand-off explicit.
- Section footer: "Manage exclusivity in Content Management →" link to `/content`.
- Mock: new `MOCK_UNLOCK_CONTENT` in `rewards/constants.ts` referencing real ids from `content/constants.ts` `MOCK_VIDEOS` (import the type, reference ids `"1"`, `"3"`, etc.) so the linkage is honest even in mock form.

### 2.5 Section 2 — Bidding for Experiences (`_components/experiences-section.tsx`)

`SectionHeading` "Bidding for Experiences" (subtitle: "Points-based auctions for real-world experiences — geofenced per market"), then:

- **Status filter chips** (All / Live / Scheduled / Ended / Archived) — reuse the `FILTERS` pattern from games' `instances-list.tsx`. Live & Scheduled visibility is the client's explicit ask ("similar to content management — live and scheduled, schedule in advance, every quarter").
- **Experience row cards** (`_components/experience-list-item.tsx`), one per reward: image thumb · title · geofence badge · status badge · bidding window ("Bids: May 1 → May 30" with a "closes in {n}d" accent when live) · experience timeframe ("Experience: Jan 2027") · current top bid + bidder count (live rows) or winning bid + winner (ended rows) · min-bid threshold. Row click → `/rewards/experience/{id}`.
- Color-code live vs. scheduled rows (left border accent) — consistent with content's master list treatment.

## 3. Mock data — `rewards/constants.ts`

```ts
export type ExperienceStatus = "draft" | "scheduled" | "live" | "ended" | "archived";

export interface ExperienceReward {
  id: string;
  title: string;                 // e.g. "A Day on Set with the Director"
  description: string;
  image: string;                 // banner
  geofence: string[];            // ISO country codes, e.g. ["GB"] — first launch UK
  status: ExperienceStatus;
  minBid: number;                // starting/threshold bid (pts)
  minIncrement: number;          // pts
  winners: number;               // 1..n (multi-winner rewards need the threshold)
  bidOpenAt: string;             // ISO — bidding window (time limit, adjustable per reward)
  bidCloseAt: string;            // ISO
  experienceAt: string;          // when the experience happens — independent of bidCloseAt
  bidders: number;
  totalBids: number;
  topBid?: number;
  leaderboard: { user: string; bid: number; at: string }[];  // top bids only (user-facing shows leading points, not ranks-for-everyone)
  notifications: {
    outbid: boolean;             // notify user when outbid
    closingReminders: number[];  // hours before close, e.g. [36, 24]
    winnerEmailSubject: string;  // automated winner communication
    winnerEmailBody: string;
  };
  winner?: { user: string; bid: number };
  region: MacroRegion;           // analytics rollup region
}
```

Seed 5–6 experiences: 2 live (UK, different closing dates — one closing <24h to demo urgency), 2 scheduled next quarter, 1 ended with winner + winning bid, 1 draft. Plus `MOCK_UNLOCK_CONTENT` (4–5 rows) and per-region analytics mocks.

## 4. Experience detail page — `rewards/experience/[id]/page.tsx` (+ `new`)

Model it on the content video-form pattern (the client: "reference the content management layout… like video details, in this case reward details"): header with back button + status badge + save actions, then **sectioned cards on one scrolling page** (no steps needed — fewer fields than a video; a single scroll matches the module's ethos). `experience/new` renders the same form empty; "Create" saves as draft (toast, mock).

Cards in order (`experience/_components/`, shared by new/edit):

1. **Details** (`experience-details-card.tsx`) — title, description ("clarify what they're getting"), banner image (reuse `BannerUpload` from `games/format/_components/shared/`).
2. **Bidding rules** (`bidding-rules-card.tsx`) — min bid threshold (pts), min increment (pts), number of winners (with helper: "multi-winner rewards need a starting threshold"), and the **bidding window**: open date + close date pickers (adjustable per reward — "could be a week, could be 30 days"; show computed duration "{n} days").
3. **Schedule** (`experience-schedule-card.tsx`) — the experience timeframe (date or month granularity) with the explicit helper text: "Independent of the bidding window — bidding can close in Nov 2026 for a Jan 2027 experience." Status control: Draft / Scheduled / Live (mock).
4. **Region & compliance** (`geofence-card.tsx`) — country multi-select for the geofence rendered as a **vertical list with per-country on/off state and remove icon** (same interaction pattern as content's distribution region list; reuse `COUNTRIES` from `@/app/_libs/regions`). Default `["GB"]`. Fixed helper note: "Bidding legality varies by country — confirm legal clearance before enabling a market. First launch: UK." (Maps to the MVP scope's Regional Compliance Toggles.)
5. **Notifications** (`notifications-card.tsx`) — toggle "Notify bidder when outbid"; **closing reminders** editable list of hours-before-close (defaults 36 and 24, add/remove — client wanted a customizable notification experience); **winner communication**: subject + body textarea for the automated winner email.
6. **Live bid leaderboard** (`bid-leaderboard-card.tsx`) — read-only, shown for live/ended experiences: top bids (user, points, time) with a "real-time in production" caption; ended state shows winner(s) highlighted. Per the call, the customer app shows **top/leading bid points** — mirror that framing here.
7. **Settle** — for a live experience past its close date (or ended), a "Settle & award" action opening a settle confirmation (adapt games' `InstanceResolveModal` auction branch): confirms winner(s) = top bid(s), triggers the (mock) winner email, moves status to ended. Toast on confirm.

## 5. Explicitly KEEP / DO NOT build

- Do NOT build exclusivity configuration here (unlock points are set on the video in Content Management — this module links out).
- Do NOT build a calendar view here — the client asked for live/scheduled lists ("like content management"), not a calendar, for rewards. Scope discipline.
- Do NOT add reward types beyond the two (no generic "storefront" yet — MVP's "Prestige Content" IS the unlock-content tracking above).
- Rewards are denominated in **Points only** (bids, unlock costs, settlements). XP exists platform-wide (retained per Spec 02 §0.3 decision update) but plays no role in this module — do not add XP fields here.
- Subscriptions remain their own module (`/subscriptions`) — MVP groups them with rewards on paper, but the client called subscriptions "not that complicated" and the panel already separates them.

## 6. Open items / assumptions (flag in PR, do not block)

1. **Master analytics metrics** (§2.2) are a GeekyAnts proposal — needs client sign-off via Shivani (same status as gaming's boxes).
2. **Geofence granularity = country** (UK first) while the analytics lens uses macro-regions — inferred from the call ("Country UK users") + the app's region model. Confirm the launch-market list.
3. **Winner communication = automated email** per deck note ("winner communication (email automated)"); push notification on winning could be added when the notification engine is wired — not specced now.
4. Client owes legal/geofencing detail per market — the compliance card ships with the UK-first note and no legal logic.
5. Detail page is single-scroll cards rather than the video form's stepper — fewer fields; revisit if the client wants stepper parity.
6. "Popularity" metric interpretation = bidders + total bids (§2.2 tile 3). Confirm.

## 7. Acceptance criteria

1. Sidebar shows Rewards; `/rewards` renders: header + region filter + "New Experience" → 4 stat tiles → Unlock Content section → Bidding for Experiences section. Single scroll, no tabs.
2. Region filter visibly rescales analytics and filters both lists; every experience shows its geofence badge regardless of filter.
3. Unlock Content rows link to `/content/details/{id}`; costs/statuses match the referenced content mocks; section links back to `/content`. No exclusivity editing on this page.
4. Experiences list: status chips work; live rows show closing countdown + top bid; scheduled rows show upcoming window; ended rows show winner + winning bid; color accents distinguish live vs. scheduled.
5. `/rewards/experience/{id}`: all six cards render with mock state; bidding window and experience date are separate controls with the independence helper text; geofence is a vertical country list with on/off + remove, defaulting to UK; notifications card has outbid toggle, editable 36/24h reminders, winner email fields.
6. Settle flow: a closeable live/ended experience can be settled — winner confirmed from top bid, status → ended, toast fired.
7. `/rewards/experience/new` creates (mock) a draft via the same form.
8. `pnpm lint`, `pnpm type:check`, existing suites pass; kebab-case + alias conventions hold; no games-module regressions (bidding stays out of `/games`).
9. Nothing added beyond this spec (client rule: extra ideas require asking first).

## 8. Suggested implementation order

1. `constants.ts` mocks + types → 2. Sidebar + route scaffold with header → 3. Stat tiles + region filter (§2.2–2.3) → 4. Unlock Content section (§2.4) → 5. Experiences list (§2.5) → 6. Detail/new form cards (§4.1–4.5) → 7. Leaderboard + settle flow (§4.6–4.7) → 8. Sweep: lint, type-check, acceptance pass.
