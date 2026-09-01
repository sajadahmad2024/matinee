# Implementation Spec 02 — Admin Panel: Game Management Revamp

**App:** `apps/web` (Next.js admin panel) · **Scope: UI only, mock data** (no API/DB work; module stays on mocks in `src/app/(public)/games/_config/game-types.ts` and `games/format/constants.ts`, extended where needed)
**Sources of truth:** client review call (Aug 28, 2026), client deck "Matinee APP (17.07.26).pptx" slides 12 & 14 + S4/game notes, `claude/matinee-product-context.md` (project doc), BA doc "Matinee_Admin Panel Changes"
**Repo conventions:** kebab-case files, `@/` aliases, colocated `_components`, reuse existing kit (`GlassCard`, `StatTile` from content, `Tabs`, `MACRO_REGIONS` from `@/app/_libs/regions`). Related: Spec 01 (content management) already unwires `GameAssociationCard` from the video Ad Sales step.

---

## 0. Why this change (context for the implementer)

Client verdicts on the current Game Center: the **per-format structure is right** (fixed game types with configurable rules; per-format Settings/Gamification/Analytics), but four things are wrong:

1. **Top-level tab navigation must go** — same rejection as the content module. The master page must be ONE scrollable surface: 3–4 master analytics boxes on top, then the game formats listed **horizontally as full-width rows like the content-management layout** ("first row Daily Streak, second row Weekly Quests…"), instead of the current card grid hidden behind a "Game Formats" tab.
2. **Bidding is not a game** — it moves to the net-new Rewards module (separate spec). Remove it from this module entirely.
3. **XP stays.** ⚠️ DECISION UPDATE (Sep 1, GeekyAnts/Manu — overrides the call): on the call the client parked XP ("keep it to the points for now"), but XP is retained as a required platform concept; **Manu is informing the client that it is required.** The rule the UI must make legible everywhere: **Points are the spendable currency** (rewards, bidding, unlocks — what the client's operators think in), **XP is the non-spendable progression currency** (levels, leaderboards, badges). The client's objection was *confusion*, not the mechanic — so the deliverable here is clear labeling, not removal (§6).
4. **"Settings" and "Gamification" merge into one section** per format — the split was redundant to the client.

Plus one addition: **per-region analytics inside each game format** (a territory filter) — games and leaderboards differ by region; nothing in the module is region-aware today (verified: no `region`/`territory` reference under `games/`).

What the client explicitly decided on the call and this spec now deviates from, in one place only: points-only. Everything else from the call stands unchanged.

What the client explicitly likes and we keep: fixed types with per-instance creation (quests/predictions prepared in advance as drafts/scheduled — "we plug in 20 quests but they don't go live"), the app-widget single-banner concept, locked-until-X-points progression, milestone bonuses (7-day streak → +50 pts), the prediction entry-cost × multiplier model with resolution flow, and the Daily Streak minimum-watch threshold (already defaults to 300s = the agreed 5 minutes, admin-configurable).

---

## 1. Master page restructure — `src/app/(public)/games/page.tsx`

### 1.1 Kill the top-level tabs

- Remove `GameTabs` usage (and delete `_components/game-tabs.tsx` once unreferenced). Drop the `tab` search param.
- New single-scroll page order:
  1. Header: title ("Game Management" — rename from "Game Center" to match client vocabulary), `TimeRangeSelector` (keep), plus three header buttons (same pattern as content's Library button): **Badges** → `/games/badges`, **Leaderboards** → `/games/leaderboards`, **Leveling** → `/games/leveling` (§5).
  2. **Master analytics — 3–4 boxes** (§1.2).
  3. **Game format rows** (§2).
  4. **Trends section** (§1.3).

### 1.2 Master analytics boxes — adapt `_components/game-analytics.tsx` `healthStats`

The client asked for "3–4 boxes — master on all games" and left the metrics to GeekyAnts to propose. The existing health stats are already a sound proposal — keep them as the four boxes, restyled to the content module's `StatTile` (import from `../content/_components/stat-tile` or lift `StatTile` to `@/components/custom/` — prefer the lift, it's used cross-module now):

1. **Active Players (7d)** — count + trend (Ryan explicitly suggested "number of active people participating").
2. **Participation by Format** — sub-stats: % of active users in ≥1 game, and per-format participant counts (repurposes the existing format-split pie data).
3. **Points Economy** — points minted vs. points spent in period (client cares about earn-vs-spend balance; extend mock with `pointsSpent`).
4. **Completion Rate** — overall + trend.

Extract these to a new `_components/master-analytics.tsx` rendering the four tiles. ⚠️ Flag in PR: metric choice is a GeekyAnts proposal pending client sign-off (product-context §4.1).

### 1.3 Trends section

The remaining overview charts in `game-analytics.tsx` (gameplay velocity started/completed, win/loss by format, economy card) move into a `_components/game-trends.tsx` section rendered below the format rows under a `SectionHeading` "Trends & Economy" — scroll-reachable, no tab. Changes while moving:
- Economy card: keep the "Total XP" stat and ADD **Points Spent** (mock), so the card shows both currencies with their roles labeled (points = spendable, XP = progression).
- Remove the format-split pie if its data now lives in the Participation tile (avoid duplication) — implementer's judgment, keep the section lean.

---

## 2. Game format rows — rework `_components/game-formats-library.tsx`

- Replace the `md:grid-cols-2 lg:grid-cols-3` card grid with a **vertical stack of full-width horizontal row cards** (one per format), visually consistent with the content module's `VideoListItem` rows: left icon block, name + tagline, description, right-aligned stats (`{activeInstances}` active, `{totalPlays}` plays), chevron → `/games/format/{slug}`.
- Row order fixed: **Daily Streak, Weekly Quests, Shared Content, Predictive** (client's stated order).
- **Remove Bidding** (§4).
- Keep the "Autonomous" badge on Daily Streak; keep the `dbMapping` code hint (client-facing transparency) but tuck it into a tooltip or the row's footer, not a full card section.
- Keep an "option to add games" affordance: a trailing ghost row/button "+ New game format" → existing `/games/format/new` page (client: "as we continue… if you want to add a new analytic/game we'll ask and you add it as another box/row"). The `format/new` page itself only needs the XP cleanup (§6); its legacy `FORMAT_CONFIGS` ("1"/"2"/"3") in `format/constants.ts` should be deleted if unreferenced (verify with grep — they look orphaned).

---

## 3. Per-format detail page — `games/format/[id]/`

### 3.1 Merge Settings + Gamification → one "Settings" tab

`format-details-client.tsx` + `format-tabs.tsx`:
- Tabs become **Settings | Analytics** (two, not three). The client: "consolidate gamification and settings — call it settings… to make it easier."
- Each type's `Settings` view now renders its existing settings content **followed by** its `Gamification` content (`GamificationExtras`: milestone badges + locked progression) on the same scrolling tab. Mechanical merge: in `TYPE_VIEWS`, compose `<Settings /> <Gamification />` under one tab node; then inline/simplify per type file (`types/daily-streak.tsx`, `types/quests.tsx`, `types/shared-content.tsx`, `types/predictive.tsx`) by exporting one `XSettings` component that includes the extras. Delete the now-unused `XGamification` exports.
- `?tab=gamification` deep links should fall back to `settings`.

### 3.2 Analytics tab: add the region filter

- New `_components/region-filter.tsx` under `games/format/_components/` (or reuse/adapt `@/components/custom/country-filter` if it fits): a select of **All regions + the 5 `MACRO_REGIONS`** writing `?region=` (URL param, `scroll: false` pattern).
- `GameStatsCards`, `DailyActivityChart`, `PlayerRetentionChart`, `RewardDistributionCard`, `PeakHoursChart`, `PerformanceSummaryCard` accept a `region` prop. Mock strategy: extend each component's mock into `Record<"all" | MacroRegion, Data>` with plausible variation (APAC largest, MEA smallest — mirrors the dashboard's regional table). Keep it simple; a deterministic scaling factor per region on the existing mock is acceptable.
- Filter renders at the top of the Analytics tab content, right-aligned beside a small caption ("Territory-specific analytics").

### 3.3 Daily Streak specifics — `types/daily-streak.tsx`

- `minWatchSeconds` stays (default 300 = the agreed 5 minutes; not necessarily continuous). Improve the label: "Minimum watch to qualify (seconds)" + helper text "≈ {n} min per day — time on app, not per video; need not be continuous."
- Add an **"Eligibility notification" toggle row** (default on) with hint "Notify the user in-app when they've hit the threshold and their streak day counts" — the client-required UX (the app must tell users they can kickstart/keep the streak). Mock state only.
- Add a **"Progress display" select**: `Popup on icon tap` (default) / `Persistent bar` — captures the call decision that a popup beats a crowded persistent load bar. Mock state only.
- Behaviors: the 5 starter behaviors stay (client: "start with 5 options", placeholders admins keep defining); milestone bonuses stay (7-day → 50 pts example already present).

### 3.4 Prediction resolution & instance flows

No structural change — `CreateInstanceModal` (question, answer options ≥2, visual banner, entry cost, correct multiplier, cadence, unlock threshold), `InstanceResolveModal`, `InstanceResultModal`, and the draft/scheduled/active/ended/archived `InstancesList` already match the client's model (prepare-in-advance included). Only the XP sweep (§6) touches them.

---

## 4. Remove Bidding from this module

- `_config/game-types.ts`: delete the `bidding` entry from `GAME_TYPES` and the slug from `GameTypeSlug`.
- `format-details-client.tsx`: drop the bidding import/entry in `TYPE_VIEWS`.
- Delete `format/_components/types/bidding.tsx` after verifying no other imports (`grep -r "types/bidding"`).
- Leave a one-line code comment where the entry was: `// Bidding lives in the Rewards module (see spec-03), not in games.` Do NOT add any placeholder UI.
- If any mock instance data represents auctions, remove it.

## 5. Badges, Leaderboards & Leveling become routes (out of the tab bar)

- New thin pages `games/badges/page.tsx`, `games/leaderboards/page.tsx`, and `games/leveling/page.tsx` rendering the existing `BadgeManagement`, `GlobalLeaderboards`, and `LevelingConfiguration` components with a back-to-games header. Header buttons from §1.1 link here. (Client rejected tabs as the master layout, not these features. Keeping them off the master scroll keeps it to the client's "boxes → formats" shape.)
- `GlobalLeaderboards`: keep **Total XP** as the ranking basis (XP retained per §0.3); add a **Points** column beside it so operators see both currencies (mock `totalPoints` field added to the leaderboard mock). Leaderboard config per MVP scope (timeframes, displayed metrics) is untouched.
- `LevelingConfiguration`: kept as-is — this is XP's home (level curve, progression health). Its page header carries the one-line explainer from §6.
- `BadgeManagement`: keep; badge thresholds may be XP-denominated (consistent with the MVP scope's "Total XP Point thresholds") or behavior-based — leave as found.
- Update any `"/games?tab=badges"` / `"?tab=leveling"` style links (e.g., in `GamificationExtras`) to the new routes.

## 6. XP retention — make the Points/XP split legible (no removals)

⚠️ This section replaces the earlier "XP sweep" — XP is RETAINED (decision update, §0.3). Since the client's actual complaint was confusion between the two currencies, the work here is labeling, not surgery:

- Adopt one canonical explainer line and reuse it verbatim wherever both currencies appear: **"Points are spent on rewards & bidding; XP is permanent progression that levels users up."** Render it as helper/caption text in: `behavior-rewards-editor.tsx` (below the column headers), `create-instance-modal.tsx` (beside the Reward Points / Reward XP fields), the Leveling page header, and the Trends economy card (§1.3).
- `shared/behavior-rewards-editor.tsx`: keep the `points` + `xp` columns; retitle headers to "Points (spendable)" / "XP (progression)".
- `shared/instances-list.tsx` + type mocks: reward summaries keep both, e.g. "100 pts · 50 XP".
- `instances/create-instance-modal.tsx`, `games/create-game-modal.tsx`: keep "Reward XP" fields (with the explainer caption).
- Content module's `GameInstance.experiencePoints` in `game-association-card.tsx`: keep (do not delete the field even though Spec 01 unwires the card).
- No renames in `game-analytics.tsx` / `global-leaderboards.tsx` beyond §1.3/§5 additions.

## 7. Explicitly KEEP (do not "clean up")

- Fixed game types with dynamic rules; per-instance create/schedule/resolve flows; draft & scheduled instance states (prepare-in-advance is a client requirement).
- `AppWidgetCard` single-banner concept (client: one static image per format; behaviors/instructions scroll in-app).
- Locked-progression editor and milestone-bonus editor.
- `TimeRangeSelector` on the master page.
- Badge management, global leaderboards, and leveling configuration (relocated, not removed).
- All XP fields, columns, and reward values (§0.3 / §6).
- Daily Streak `minWatchSeconds` config with 300s default.

## 8. Open items / assumptions (flag in PR, do not block)

0. **XP retention deviates from the client's call decision** ("keep it to the points… take out XP"). Manu (GeekyAnts) is informing the client that XP is required. Until the client confirms, keep all XP-related changes labeled per §6 and easily strippable — if the client insists on removal, the fallback is the original sweep: drop `xp` from `BehaviorReward`, XP fields from both create modals, XP from reward strings, delete `LevelingConfiguration` + its route, and re-rank leaderboards by points. Do NOT present XP to the client as their idea; it's ours, flagged under their "tell us before adding things" rule.
1. **Master analytics metric choice** (§1.2) is GeekyAnts' proposal — client asked us to propose; needs their sign-off via Shivani.
2. **Badges/Leaderboards moved to sub-routes** rather than master-page sections or deletion — assumption consistent with the "boxes → format rows" master layout; confirm with client.
3. Deck slide 14 lists per-game tabs as "Settings-Gamification-Analytics", but the call + deck note "SETTINGS X GAMIFICATION — consolidate" is the later decision → two tabs. If the client objects, the merge is trivially reversible (components are composed, not rewritten).
4. Per-region analytics = macro-region filter (NA/EU/APAC/LATAM/MEA) matching `MACRO_REGIONS`, not per-country — mirrors how the client talks about territories (UK legal aside, which is a Rewards concern). Country drill-down can come with API wiring.
5. Adi & Ryan still owe final notes on game-format internals ("clarify Predictive") — this spec implements what's confirmed; expect a small follow-up delta.
6. The eligibility-notification and progress-display controls (§3.3) are admin-side mock config for a customer-app behavior — harmless now, wired in the app/API phase.

## 9. Acceptance criteria

1. `/games` is a single scrollable page: header (with Badges/Leaderboards buttons + time range) → 4 master stat tiles → format rows (Daily Streak, Weekly Quests, Shared Content, Predictive — full-width, in order) → Trends & Economy section. No top-level tabs.
2. Bidding appears nowhere under `/games` (row, route, type, mock).
3. `/games/format/daily-streak` (and every format) shows exactly two tabs: Settings (including former Gamification content) and Analytics; `?tab=gamification` falls back gracefully.
4. Every format's Analytics tab has an All-regions/NA/EU/APAC/LATAM/MEA filter that visibly changes all charts/tiles.
5. Daily Streak settings show the 300s threshold with the minutes helper, an eligibility-notification toggle, and the progress-display select.
6. XP is present and consistently labeled: the behaviors editor shows "Points (spendable)" and "XP (progression)" columns; instance rewards read "N pts · M XP"; leaderboards show Total XP + a Points column; the canonical Points-vs-XP explainer line appears in the behaviors editor, both create modals, the Leveling page header, and the economy card.
7. `/games/badges`, `/games/leaderboards`, and `/games/leveling` render the existing management UIs; old `?tab=` links land correctly.
8. `pnpm lint`, `pnpm type:check`, and existing test suites pass; kebab-case + alias conventions hold.
9. Nothing added beyond this spec (client rule: new ideas require asking them first).

## 10. Suggested implementation order (each step leaves the app working)

1. Points/XP labeling pass in shared editors/modals (§6, safe and mechanical) → 2. Remove Bidding (§4) → 3. Per-format tab merge (§3.1) → 4. Region filter + regional mocks (§3.2) → 5. Daily Streak additions (§3.3) → 6. Master page: routes for badges/leaderboards/leveling (§5), then de-tab and assemble boxes → rows → trends (§1, §2) → 7. Sweep: links, lint, type-check, acceptance pass.
