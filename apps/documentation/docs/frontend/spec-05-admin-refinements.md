# Implementation Spec 05 — Admin Panel: Refinements from the Sep 2 Client Sync (Ryan)

**App:** `apps/web` (Next.js admin panel) · **Scope: UI only, mock data** — same constraints as specs 01–04
**Sources of truth:** Sep 2, 2026 sync (Ryan ↔ Shivani/Manu/Harsh/Nuthan — Gemini notes + full transcript), current codebase state (specs 01–04 are implemented as of commits `9ee534b`/`fcd3ae5`/`6cd8ca6`)
**Status caveat:** Ryan reviewed the four modules alone; **Adi confirms on the Friday call** (Ryan owes him a walkthrough). Everything here is Ryan-aligned; items Ryan explicitly deferred to Adi are marked ⏸ HOLD and must not ship past a feature toggle until Friday.

---

## 0. What this round is

Ryan's review verdict on the implemented panel: dashboard "great," game management "nice and clean," content management approved with refinements. This spec is a delta on the CURRENT code (post specs 01–04) — five changes, one reversal, and one already-satisfied confirmation:

1. Content Inventory tiles: **Freshness is out; "Expiring This Month" is in**; tile order changes.
2. **The dashboard's regional heat-grid gets replicated on Content Management and Game Management** master pages ("global view of our big pillars on top, regional view below" — uniformity so new staff can operate every module the same way). The shared `RegionBoxFilter` component already built for games-analytics/rewards is the vehicle.
3. **Calendar view** ⏸ HOLD: Ryan agrees it's "way too busy" as built; pending Adi, the concept pivots from "everything live" to **"what's coming and what's going away."**
4. **XP: final resolution (reverses the spec-02 Sep 1 revision).** Ryan rejected XP as a displayed concept; Manu agreed on the call. Lifetime-earned points exist ONLY as a backend trigger for badges; no XP anywhere in any UI. Leaderboards rank by **current spendable points** (rank drops when you spend — that's intended). Badges, once earned, are permanent and independent of balance.
5. **"Where to watch" CTA** — a consumer-app feature whose data entry is an admin concern: admins configure the watch destination(s) when publishing a video.
6. Launch content is **horizontal 16:9** (licensing reality) — admin thumbnails/upload hints currently assume vertical 9:16.
7. Already satisfied, verify only: most/least-viewed sort exists and Ryan approved it ("that'll work"); Requests tab = internal admin-approval queue only (no external submissions) — confirmed, no change.

---

## 1. Content Management (`app/(public)/content/`)

### 1.1 Inventory tiles — `_components/content-inventory.tsx` + `constants.ts`

- **Remove the Freshness tile** entirely (`freshnessPct`, `freshnessHealthyAbove` from `CONTENT_INVENTORY`). Ryan, verbatim: "freshness doesn't really make any sense for us… I don't care about the fresh content, I care about the user traction on each piece."
- **Add an "Expiring This Month" tile** in its place: big number = count of videos whose license/live window ends this calendar month (mock: `expiringThisMonth: 30`); sub-stats: next-month count, and "of {activeLibrary} live" context; accent `danger` when the count exceeds uploads this month (net-shrinking library), else `warning`. Source the number consistently with the licensing mocks (LICENSING_SUMMARY.expiring30 is a 30-day rolling count — this tile is calendar-month; keep them plausibly related).
- **Tile order (Ryan's exact spec): Active Library → Uploaded This Month → Expiring This Month → Pipeline** ("pipeline would be in the last position").

### 1.2 Regional grid on the content master page — NEW section

Placement per the on-call agreement: the three summary cards stay **global** at the top; the **regional heat grid renders below them** (above/beside the expanded section area), and selecting a region scopes everything below it — inventory tiles, recommended actions, tabs, and the video list ("as long as this library list is for each country, we can understand what's performing based on which country").

- Reuse `@/components/custom/region-box-filter` (`RegionBoxFilter`) — it already reproduces the dashboard map treatment (heat cells, metric toggle, Low→High legend, hover tooltip) and filters in place via `?region=`. Do NOT build a second grid.
- Options: All Regions sentinel + the 5 macro-regions; **metrics toggle** for the grid: "Live videos", "Views", "Uploads this month" (extend content mocks with per-region values for the grid + a region-scoped variant of `CONTENT_INVENTORY` and the video list — deterministic scaling like the dashboard/rewards mocks).
- Interaction detail Ryan confirmed: cards at top remain global regardless of grid selection; the grid selection scopes the **section area below** (tiles show "Content Inventory — Asia-Pacific" style suffix in the `SectionHeading` when scoped).
- Relationship to the existing header `CountryFilter`: keep it — grid = macro-region lens, dropdown = country drill within it (mirrors dashboard map's master/regional levels). If both are set, country wins and the grid shows it as active-parent; keep the logic simple and document it in a code comment.

### 1.3 Calendar view ⏸ HOLD — `_components/content-calendar.tsx` + `view-mode-toggle.tsx`

- **Hide the calendar toggle now**: remove `ViewModeToggle` from the master tab UI (keep both component files and the `viewMode` param handling — dead-simple to re-enable). One code comment: `// Calendar view on hold pending Adi (Sep 2 call) — see spec-05 §1.3.`
- **The agreed replacement concept, to build only after Friday's confirmation:** a "Coming & Going" timeline that shows ONLY (a) content scheduled to publish (green, appearing the week(s) leading up to its publish date) and (b) content in its final week before expiry/coming off (red), and **nothing that is simply active**. If Adi confirms, implement as a `mode` of the existing `ContentCalendar` (`upcoming-expiring` vs `all`), defaulting to the new mode. Do not build ahead of confirmation.

### 1.4 "Where to watch" CTA fields — `content/new/_components/video-details-card.tsx`

Consumer app will show a call-to-action on video details linking to where the film can be watched (Netflix etc.); Shivani's stated mechanism: **the admin configures it while publishing.** Add to the Details step:

- A repeatable **"Where to watch"** list (0–3 entries): each row = platform (select: Netflix, Prime Video, Disney+, Apple TV, In cinemas, Other + free-text when Other) + URL (optional — Ryan wasn't sure deep links are always possible; platform name alone must be renderable as "Find it on Netflix").
- Mock only; add `watchLinks?: { platform: string; url?: string }[]` to `VideoItem`, seed 2–3 mock videos, and show a small "Watch CTA ✓" badge in the video row's metadata signals so operators can see which videos have it configured.

### 1.5 Verify-only (no build)

- Most/least-viewed sort in `ContentFilters` — exists; Ryan approved. Confirm it also composes with the new region scoping.
- Requests tab semantics — internal admin approvals only; approval modal flow already matches. No external-intake UI is to be added (supersedes any earlier reading of the MVP scope's "external review workflow" as third-party submissions).

## 2. Game Management (`app/(public)/games/`)

### 2.1 Regional grid on the games master page — NEW section

Same rationale and component as §1.2: render `RegionBoxFilter` between `MasterAnalytics` and `GameFormatsLibrary`. Metrics toggle: **"Playing now"** (Ryan: "where we have playing games on the dashboard, that's what would show in each region"), "Active players (7d)", "Points minted". Selecting a region scopes the master analytics tiles AND the per-format row stats below (`?region=` — format rows show region-scoped activeInstances/plays from the regional mocks added in spec-02 §3.2). Ryan's use case: "maybe there's a region that's just not engaging with games at all — then we drill down and find out why."

### 2.2 XP removal — final (supersedes spec-02 §0.3/§6 "keep XP with labels")

Resolution from the call (Ryan + Manu aligned): **points = the only currency anywhere in the UI.** Backend later tracks lifetime-earned points to trigger badges/levels; that is not an admin-panel concept beyond badge thresholds. Concretely — this is the original sweep, now with the badge nuance:

- `shared/behavior-rewards-editor.tsx`: drop the `xp` field/column (grid: behaviour + points + delete).
- Type files & instance mocks: reward strings become points-only ("100 pts"); remove `defaultXp` and XP fields from `create-instance-modal.tsx` / `create-game-modal.tsx`.
- `GlobalLeaderboards`: rank by **current spendable points** (`totalPoints`); remove Total XP column and any XP stat labels. A caption states the semantics Ryan chose: "Ranked by current points balance — spending points moves you down."
- **Badges**: keep `BadgeManagement` and `GamificationExtras` badges; thresholds are re-labeled **"points earned (lifetime)"** — earned once, kept forever, independent of balance (Manu's summary Ryan confirmed twice). Locked-progression items use the same lifetime-earned framing.
- **Leveling page (`/games/leveling`) is removed** — header button, route, and `LevelingConfiguration` component ("we are not really leveling up in this platform"; levels, if they ever return, are a backend badge-trigger concern). Comment at the removal site pointing here.
- Economy/trends cards: XP stats out; points-only.
- Acceptance grep (case-sensitive, word-boundary): no `XP`/`\bxp\b` in `app/(public)/games` or `app/(public)/content`.

### 2.3 Format detail pages

No changes — Ryan approved the two-tab (Settings | Analytics) layout and confirmed the region filter in Analytics is what he wanted there.

## 3. Dashboard & Rewards

- **Dashboard: no changes.** Ryan approved it as the reference pattern ("we have kept the dashboard very simple" — "Okay, great"), including filters, time range, and CSV export.
- **Rewards: no changes** beyond the XP sweep having no effect there (already points-only). Its existing `RegionBoxFilter` usage is now the panel-wide standard. Ryan has not yet reviewed Rewards with Adi — expect a future delta.

## 4. Cross-cutting: 16:9 launch orientation

Launch content is standardized **horizontal 16:9** (older licensed content; vertical grows later). Admin panel touch-points that assume vertical 9:16:

- `content/_components/video-list-item.tsx`: thumbnail block (`h-28 w-[63px]`, comment "vertical 9:16") → 16:9 (e.g., `h-20 w-[142px]`), comment updated.
- `content/new/_components/video-upload-zone.tsx` / `thumbnail-upload.tsx`: any 9:16 hints/aspect classes → 16:9 with hint text "16:9 horizontal (launch standard); vertical supported later."
- `preview-as-user-modal.tsx`: preview frame to 16:9.
- Do NOT remove vertical support from data models — this is a presentation default, not a schema change ("vertical support will grow as the library expands").

## 5. Explicitly KEEP (Ryan re-approved on this call)

Three global summary cards + click-to-expand sections; Recommended Actions; Requests/Master/Scheduled/Live/Rejected/Archive tabs; most/least-viewed + date filters; licensing table inside Licensing & Rights ("very simple" — approved); Ad Sales two-option model (sponsor logo, pre-roll/icon-overlay); game master analytics boxes + horizontal format rows; dashboard in full.

## 6. Open items / assumptions (flag in PR; do not block)

1. ⏸ **Friday Adi call gates two things**: the calendar "Coming & Going" variant (§1.3) and overall module sign-off ("1–2 remaining changes" then email the build to stakeholders). Keep both §1.3 re-enable paths trivial.
2. **Genre filter on the app home screen** (agreed, shipped disabled until content volume suffices): the on/off control's home is undecided — likely an admin Settings toggle. NOT built here; confirm with Shivani whether admin needs the toggle or it's a remote config.
3. **In-app point purchases & Stripe-vs-IAP analysis** (Shivani action): future admin implications (point-package config, revenue tracking) — out of scope, expect a spec when the payment path is chosen.
4. **Content grid metrics** (§1.2) and **games grid metrics** (§2.1) are our proposals within Ryan's "playing games / performance per region" framing — sanity-check on the Friday call.
5. Ryan's momentary confusion over the header "Library" (taxonomy) button suggests a rename ("Taxonomy" or "Studios & Genres") — NOT done (client rule: ask first); raise with Shivani.
6. XP removal is the third swing on this topic (call: remove → Manu: keep → this call: remove, badges-via-backend). The transcript is unambiguous and Manu was in the room, so this spec treats it as final; the fallback labeling approach lives in spec-02's history if it ever swings back.

## 7. Acceptance criteria

1. Content Inventory shows exactly four tiles in order: Active Library, Uploaded This Month, Expiring This Month, Pipeline — no Freshness anywhere.
2. Content master page: global summary cards on top; `RegionBoxFilter` grid below; selecting APAC visibly rescopes inventory tiles, recommended actions, and the video list (heading suffixes confirm scope); All Regions restores global; country dropdown still composes.
3. Calendar toggle is gone from the UI; `?viewMode=calendar` no longer reachable; components retained in tree.
4. Video Details step offers up to three Where-to-watch entries (platform + optional URL); configured videos show the indicator in their list row.
5. Games master page: grid between master analytics and format rows; selecting a region rescopes tiles + format-row stats; "Playing now" is the default grid metric.
6. Zero XP in the admin UI: behavior editor is points-only; leaderboards rank by current points with the spend-drops-rank caption; badge thresholds read "points earned (lifetime)"; `/games/leveling` and its header button are gone.
7. Video list thumbnails, upload zone, thumbnail upload, and preview modal are 16:9.
8. Dashboard and Rewards render unchanged (snapshot/e2e sanity).
9. `pnpm lint`, `pnpm type:check`, suites pass; kebab-case + alias conventions hold; nothing beyond this spec.

## 8. Suggested implementation order

1. Inventory tiles (§1.1 — small, high-visibility for the Friday demo) → 2. XP sweep + leveling removal (§2.2) → 3. Content regional grid + region-scoped mocks (§1.2) → 4. Games regional grid (§2.1) → 5. Where-to-watch fields (§1.4) → 6. 16:9 pass (§4) → 7. Hide calendar toggle (§1.3) → 8. Sweep: lint, type-check, acceptance pass.
