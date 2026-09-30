# Engagement Analytics Tracking (TTLE-229)

Backend for the admin dashboard (master + `/dashboard/region/[code]`), the report builder,
per-content daily trends, and the engagement-tracking fixes (share dedupe, batch reactions,
comment metrics). Migration: `0023_engagement_analytics.sql`.

## 1. Data capture

### 1.1 Sessions derived from app events (`user_sessions`)

There is **no new session endpoint**. Clients already post telemetry to `POST /v1/events`
with a client-generated `sessionId` (≤ 64 chars, one per app foreground lifetime or per cold
start — the client decides). On every ingest batch from an authenticated user the backend
folds that batch's events into one `user_sessions` row per `(user_id, client_session_id)`:

| Column | Derivation |
|---|---|
| `started_at` | `least(existing, min(occurredAt))` |
| `last_event_at` | `greatest(existing, max(occurredAt))` |
| `duration_seconds` | `last_event_at − started_at` (so open sessions have a running length), capped at 6 h against skewed client clocks |
| `ended_at` | set to `last_event_at` when the batch contains `app_background` or `logout` |
| `foreground_count` | `1 + count(app_foreground)` (the opening `app_open` is the 1st foreground) |
| `background_count` | `+ count(app_background)` |
| `videos_viewed` | `+ count(video_play)` — "doomscroll depth" |
| `engagement_actions` | `+ count(content_liked, content_disliked, content_commented, content_shared, watchlist_added)` |
| `is_gamified` | `true` once any `game`-category event arrives |
| `platform` | the batch `platform` |
| `country_code` / `region` | copied from `users.country_code` and its macro-region (see §4) at creation |

A new catalog event **`app_foreground`** (lifecycle) was added so BG↔FG re-entries are
measurable. Events without `sessionId`, and anonymous batches, are stored in `app_events` but
don't create sessions. Session upsert failures are logged and never fail ingestion.

Client contract (Flutter): generate a session id on `app_open`; emit `app_background` when the
app is backgrounded; on resume within 30 min emit `app_foreground` with the **same** id,
otherwise start a new id with `app_open`.

### 1.2 Daily content rollup (`content_daily_stats`)

`AnalyticsRollupService.rollupContentDaily(from, to)` recomputes every
`(content_id, stat_date)` for the UTC days in `[from, to]` inside one transaction
(delete-then-insert for those days → idempotent, and stale rows vanish when e.g. a like is
removed):

| Column | Source |
|---|---|
| `views` | counted `content_views` sessions started that day |
| `unique_viewers` | distinct users among those counted sessions |
| `watch_seconds` | `sum(watched_seconds)` of those counted sessions |
| `avg_completion` | `avg(completion_percent)` of those counted sessions |
| `likes` | `content_reactions` with `reaction='like'` created that day |
| `comments` | visible, non-deleted `comments` created that day |
| `shares` | `content_shares` with `share_date` = that day |

Scheduling: worker cron `analytics-content-rollup` every 10 minutes rolls **yesterday + today**
(inline, single-flight via the cron lock). Backfill: `POST /v1/admin/analytics/rollup/content-daily`
`{ from, to }` (max 92 days).

Coverage watermark: table `analytics_rollup_state (job_key PK, covered_from, covered_through,
last_run_at)`. A run over `[a, b]` marks the *closed* days (`≤ yesterday`) as covered, merging
with the existing range when contiguous. `GET /v1/admin/analytics/content/:id` builds its
`daily` series from `content_daily_stats` for covered days and from raw `content_views` for the
rest (today, or never-rolled days), so the series is always complete. The response carries
`dailySource: { rollupFrom, rollupThrough }` (null when nothing is covered).

### 1.3 Share dedupe

`content_shares` gets `share_date DATE` (UTC day of `created_at`) and a unique index on
`(content_id, user_id, coalesce(channel,''), share_date)`. `POST /v1/content/:id/share` inserts
with `ON CONFLICT DO NOTHING`; a repeat share of the same content to the same channel on the
same day returns the **existing** `shareId` with `deduped: true`, does **not** bump
`share_count`, and does **not** emit `ContentShared` (so no extra points). The tokenomics
earning listener and its daily cap are untouched. The migration removes pre-existing
duplicates (keeps the earliest per key; the `share_counts` trigger decrements the counter).

### 1.4 Batch "my reactions"

`GET /v1/content/me/reactions?ids=<uuid,uuid,…>` (customer; ≤ 100 ids) →
`{ reactions: { "<contentId>": "like" | "dislike" | null } }` — every requested id is present.
The path is `me/reactions` (not `reactions`) because `GET /v1/content/:id` is registered first
by ContentModule and would swallow `/content/reactions`.

### 1.5 Comment metrics

`CommentMetricsListener` subscribes to `EngagementEvent.CommentCreated` and increments
`user_metrics('comments_posted')` (+ `replies_posted` for replies). The `user_metrics` trigger
awards any active badge whose trigger key is `comments_posted`. Migration seeds the
`comments_posted` and `replies_posted` `badge_triggers` rows and backfills both metrics from
existing comments. Quests have no action-type criteria (they are watch-content quests), so no
quest hook applies.

## 2. Admin dashboard endpoints

All under `/v1/admin/analytics`, `@AdminOnly`, permission `users:read`, cached 60 s.
Common query: `from`, `to` (ISO; default last 30 days, ≤ 366 days), `region` (see §4; default
`global`). The default `to` is the **end of the current minute** (was: floored to the minute,
which hid the latest minute's activity); this applies to all `/admin/analytics/*` windows.
Extra fields beyond the UI shape: `sessionsTracked`, `hitThreshold`, `points`/`weekStart`,
`cohortSize`, `weekday`, `key`/`spend`/`newUsers` on channels.

| Endpoint | Returns (UI shape from `dashboard/constants.ts`) |
|---|---|
| `GET dashboard/strip` | `{ users, subscribers, onlineNow, playingNow }` |
| `GET dashboard/user-analytics` | `UserAnalyticsData` |
| `GET dashboard/gamification` | `GamificationData` |
| `GET dashboard/screen-time` | `ScreenTimeData` |
| `GET dashboard/monetization` | `MonetizationData` |
| `GET dashboard/community` | `CommunityData` |
| `GET dashboard/graphs` | `GraphsData` (`retention`, `kFactor`, `velocity`) |
| `GET dashboard/regions` | master map + viewership split: `{ regions: [...], countries: [...] }` |
| `GET region/:code` | full `RegionAnalytics` (`code,name,macro,factor,strip,userAnalytics,gamification,screenTime,monetization,community,graphs`) |

### 2.1 Metric definitions

Window = `[from, to)`; "scope users" = customers whose `country_code` is in the scope.

**User analytics**
- `starts` = all `content_views` sessions started in window; `completes` = those with `is_completed`.
- `avgWatchPct` = avg `completion_percent`; `avgWatchSecs` = avg `watched_seconds`; `avgClipSecs` = avg `contents.duration_seconds` of the sessions.
- `swipeThroughPct` = % of sessions with `watched_seconds < 3` (abandoned/swiped).
- `rewatchLoops` = avg `watched_seconds / duration_seconds` (sessions with a known duration).
- `engagementPerSession` = avg `user_sessions.engagement_actions`; `videosPerSession` = avg `videos_viewed`. When no sessions exist yet, both fall back to (actions or starts) ÷ active user-days.
- `videosPerDay` = starts ÷ distinct (user, day) pairs with a session.
- `completionLivePct` = completed ÷ counted views of currently published content.
- `hitRatePct` = % of content published in the window whose counted views within 30 days of publish ≥ `hitThreshold` (query, default 10 000).

**Gamification**
- `earnedPerUserDay` = points earned ÷ distinct (earner, day). `redemptionPct` = points spent ÷ earned (window).
- `pointsOutstanding` = Σ wallet balance of scope users. `streakAvgDays` = avg `current_streak` (>0); `streakLongestDays` = max `longest_streak`.
- `leaderboardChecksPerWeek` = `leaderboard_viewed` events ÷ distinct active users ÷ weeks.
- `rankChangeAvgWeek` = avg |rank(this month) − rank(last month)| on `leaderboard_monthly` ÷ 4.35.
- `challengeParticipationPct` = % of viewers who entered a prediction, bid, or joined a quest overlapping the window; `challengeCompletionPct` = completed ÷ quest participations (quests overlapping window).
- `earnedBySource` = % of earned points by `ledger_transactions.source_type` → Streaks / Sharing / Referrals / Challenges (quest, prediction, bid) / Badges / Other, with the UI colour.
- `balanceBuckets` = % of scope wallets in `0–500`, `500–2K`, `2K–10K`, `10K+`.
- `economyTrend` = weekly `{ period: "Week n", weekStart, distributed, redeemed }`; `redemptionTrend` = weekly `{ week: "Wn", weekStart, rate }`.

**Screen time** (from `user_sessions` started in window)
- `viewers` = distinct users with counted views; `gamified` = those viewers who also had a game event, prediction entry or bid in the window.
- `sessionAvgSecs`, `sessionMedianSecs`, `sessionBuckets` (`<5m`, `5–15m`, `15–30m`, `30–60m`, `>60m` as %).
- `heatmap` = 7 rows (Mon..Sun, UTC) × 24 hours of session starts, normalised to 0–1 by the max cell (falls back to view starts when there are no sessions).
- `bgFgPerSession` = avg `foreground_count − 1` (re-entries). `doomscrollVideos` = avg `videos_viewed`. `doomscrollMinutes` = session minutes ÷ distinct (user, day).

**Monetization** (money in dollars, 2 dp)
- `arpu` = paid invoice revenue in window ÷ scope customers. `arpdau` = revenue ÷ Σ daily active users.
- `trialToPaidPct` = trials ending in window that are now `active`/`past_due` ÷ all trials ending in window.
- `channels` = per `users.acquisition_channel`: `ltv` = lifetime paid revenue per user, `cac` = `marketing_spend` for the months overlapping the window ÷ attributed new users (`marketing_spend.new_users`, else signups in those months with that channel). `ltvCacRatio` = blended LTV ÷ blended CAC (0 when no spend). `marketing_spend` has no region, so for a non-global scope spend (and attributed users) are apportioned by `factor`. `ltv` = lifetime paid revenue ÷ paying users; `mrr`, `revenue` also returned.
- `funnel` = signups in window → had a first session/view → engaged (reaction/comment/share/game) → subscribed → `referred` (signed up via a referral code).
- `subsTrend` = weekly `{ date, newSubs, cancellations }`; `revenueTrend` = monthly `{ month: "YYYY-MM", subscriptions }` paid revenue.

**Community**
- `inApp.commentsPerUserWeek` = comments ÷ viewers ÷ weeks; `replyRatePct` = % of top-level comments in window with ≥ 1 reply; `reactionToViewPct` = reactions ÷ counted views × 100; `sharesPerVideo` = shares ÷ distinct viewed contents.
- `external` from `social_mentions` (by `coalesce(mentioned_at, ingested_at)`; filtered by `country_code` when the scope is not global): `mentionsPerWeek`, `sentiment` [% pos, neu, neg], `viralMoments`, `organicImpressions`, `earnedMediaValue` (dollars), `topAdvocates` (authors with ≥ 2 positive mentions).

**Graphs**
- `retention`: cohort = scope customers signed up in window; `dN` = % of eligible cohort members (signup + N ≤ today) active on day N (activity = `user_daily_activity` row or a session that day). `series` D0/D1/D3/D7/D14/D30, `current` vs the previous window's cohort.
- `kFactor` monthly `{ month: "YYYY-MM", k, referred, organic }`, k = referred signups that month (non-reverted `referral_redemptions` as referee) ÷ non-referred signups that month.
- `velocity` daily `{ day: "YYYY-MM-DD", weekday, players }` distinct game players (game events, prediction entries, bids).

**Strip**: `users` scope customers, `subscribers` active/trialing, `onlineNow` distinct users with a view heartbeat or session event in the last 5 min, `playingNow` distinct users with a game event in the last 5 min.

**Regions** (`dashboard/regions`): `regions[]` per macro `{ code, name, users, subscribers, revenue, points, viewers, gamified }` and `countries[]` `{ code, name, macro, users, revenue, points, intensity }` (intensity = users ÷ max users). Revenue = paid invoices in window (dollars), points = earned in window.

## 3. Marketing spend & social mentions (admin CRUD)

Permission `users:read` for reads, `users:write` for writes.

| Endpoint | Body / result |
|---|---|
| `GET marketing-spend?from&to` | rows `{ id, channel, periodMonth, spendCents, currency, newUsers }` |
| `PUT marketing-spend` | upsert by `(channel, periodMonth)` `{ channel, periodMonth: "YYYY-MM"\|"YYYY-MM-DD", spendCents, currency?, newUsers? }` |
| `DELETE marketing-spend/:id` | `{ deleted: true }` |
| `GET social-mentions?platform&sentiment&from&to&page&limit` | paged `{ items, total, page, limit }` |
| `POST social-mentions` | batch ingest `{ mentions: [...] }` (≤ 500), upsert on `(platform, external_id)` → `{ ingested }` |
| `PATCH social-mentions/:id` | edit sentiment / viral flag / metrics |
| `DELETE social-mentions/:id` | `{ deleted: true }` |
| `GET social-mentions/summary?from&to&region` | the `community.external` block + `byPlatform[]` |

## 4. Region scopes

`region` query / `:code` path accepts `global`, a macro-region (`NA`, `EU`, `APAC`, `LATAM`,
`MEA`) or an ISO-3166 alpha-2 country (`US`, `IN`, …). Filtering is by `users.country_code`
(`users.region` is a state/province, not a macro-region). The country → macro map lives in
`src/analytics/dashboard/regions.ts` (mirrors `apps/web/src/app/_libs/regions.ts`, extended).
`factor` = scope customers ÷ all customers.

## 5. Reports builder

- `GET /v1/admin/analytics/reports/catalog` → `{ groups: [{ group, metrics: [{ key, label, unit }] }], presets: { executive: [...keys], … } }` — matches `report-builder.tsx` (`METRIC_GROUPS` / `PRESETS`).
- `GET /v1/admin/analytics/reports/export?metrics=total_users,mrr,…&range=7d|30d|90d|ytd|custom&from&to&region&format=csv|json`
  - `json` → `{ generatedAt, from, to, region, rows: [{ group, key, label, value, unit }] }`
  - `csv` → `text/csv` attachment, header `Group,Metric,Key,Value,Unit` (+ `# Report/Range/Region` preamble rows). Values are CSV-escaped.
  - Multi-value metrics expand to several rows (`retention` → D1/D7/D30, `revenue_by_platform`, `violations_by_category`, `licensing_status`).
  - PDF/XLSX are client-side concerns (the UI can render the JSON); not generated server-side.

Metric keys: users (`total_users`, `signed_up`, `active_users`, `churn_rate`, `retention`),
engagement (`watch_rate`, `completion_rate`, `avg_session_length`, `dau_mau`), monetization
(`mrr`, `arpu`, `ltv`, `conversion_rate`, `revenue_by_platform`), gamification
(`points_issued`, `points_redeemed`, `redemption_rate`, `leaderboard_participation`),
moderation (`reports_volume`, `resolution_time`, `safety_score`, `violations_by_category`),
content (`videos_published`, `views`, `watch_time`, `licensing_status`). Definitions are in
`src/analytics/reports/report-catalog.ts`.

## 6. Migration 0023 summary

- `user_sessions`: `client_session_id`, `last_event_at`, `background_count`, `engagement_actions`; unique `(user_id, client_session_id)`.
- `content_shares`: `share_date` + backfill, duplicate cleanup, unique daily index.
- `social_mentions`: `country_code`; unique `(platform, external_id)`.
- `analytics_rollup_state` table; `content_daily_stats(stat_date)` index.
- `badge_triggers` `comments_posted`, `replies_posted` + `user_metrics` backfill.
- Supporting indexes: `content_reactions(created_at)`, `comments(created_at)`, `app_events_default(session_id)`.

## 7. Deliberately out of scope

- Server-side PDF/XLSX rendering (UI converts JSON/CSV).
- Saved report templates (UI-local state; no table requested).
- Automated social-listening API connectors — ingest is via the admin batch endpoint.
- Rank-change history beyond month-over-month (no weekly rank snapshots exist).
