# Watch tracking & watch-based daily streaks

> Status: **implemented** (branch `feat/video-pipeline`). Migration `0021_watch_tracking_and_streak_levels`.
>
> Jira: TTLE-228 (Watch history tracking), TTLE-123 (Daily Streak Engine), TTLE-143 (watch
> history & analytics verification). Cards have no description — scope comes from the Figma
> "Daily Streaks" screens (`Profile / My Earns / daily streaks`, `Start a Daily Streak`,
> `Daily streak start and completion`) and the admin panel (`users/…/user-watch-tab.tsx`,
> `games/format/…/daily-streak.tsx`).

## Contents

1. [View counting (anti-inflation)](#1-view-counting)
2. [Heartbeats, resume point, daily watch time](#2-heartbeats-resume-point-daily-watch-time)
3. [Watch-based daily streak with levels](#3-watch-based-daily-streak-with-levels)
4. [Streak APIs](#4-streak-apis)
5. [Admin watch stats](#5-admin-watch-stats)
6. [Badges & metrics](#6-badges--metrics)
7. [Schema changes](#7-schema-changes)
8. [Not covered / follow-ups](#8-not-covered--follow-ups)

---

## 1. View counting

**Problem:** every `POST /v1/content/:id/views` inserted a session and a trigger added +1 to
`view_count`. Calling it N times added N views, even with 0 seconds watched. `sessionId` was
documented as dedupe but never used.

**Now:**

| Rule | Behaviour |
|---|---|
| Session reuse | `POST /v1/content/:id/views` returns the **existing** session (`resumed: true`) when the same user has a session for that content with the same `sessionId`, or an unfinished session started in the last **30 minutes**. |
| Count on real watching | A session starts `counted = false`. It becomes a view the first time a heartbeat reports **≥ 3 seconds** watched **and** ≥ 3 seconds have really passed since the session started. |
| Once per 30 min | A session is only counted if the user has no other counted view of that content in the last **30 minutes** — rewatch spam can't inflate views. |
| Unique viewers | `contents.unique_viewer_count` +1 on a user's first counted view of that content. |
| Watch time | `contents.total_watch_seconds` grows by each credited heartbeat delta (§2). |

Analytics (`/admin/analytics/*`, list signals) count only `counted` sessions as views.

Response of `POST /v1/content/:id/views`: `{ viewId, resumed }`.

## 2. Heartbeats, resume point, daily watch time

`PATCH /v1/content/:id/views/:viewId` (unchanged request: `watchedSeconds`, `positionSeconds`,
`completionPercent?`, `completed?`).

- **Credited watch time is capped by wall-clock time**, so a client can't claim more than it
  could have watched:
  - per session: `watchedSeconds ≤ seconds since session start + 5`
  - per user per day: a credit can't exceed the seconds since the user's last credited
    heartbeat (+2) — parallel sessions don't double-count.
- The credited delta is added to `user_daily_activity.watch_seconds` for **today (UTC)** and
  `contents.total_watch_seconds`. `videos_started` / `videos_completed` / `contents_watched`
  and `first_seen_at` / `last_seen_at` are maintained too.
- **Resume point = latest position** (was: furthest ever). Rewinding or rewatching resumes
  where the user actually is. `is_completed` stays sticky ("has finished it once").
- After crediting, the streak engine evaluates today (§3).

Response adds `today: { watchSeconds, requiredSeconds, remainingSeconds, qualified }` so the app
can update the streak bar without another call.

## 3. Watch-based daily streak with levels

Replaces the manual daily check-in (`daily_open`). A day **qualifies automatically** when the
user's watch time today reaches their current level's requirement (time in app, not per video,
need not be continuous).

### Levels (Figma "Level Track")

| Level | Minutes / day | Days to complete | Points / day | Completion bonus | Badge (seed) |
|---|---|---|---|---|---|
| 1 | 30 | 7 | 40 | 500 | First Flame |
| 2 | 45 | 7 | 100 | 500 | Consistent Star |
| 3 | 60 | 7 | 150 | 500 | Streak Legend |
| 4 | 90 | 7 | 200 | 1000 | Cinematic Icon |

Configurable in `reward_rules['daily_streak'].config.levels` (admin `PATCH` of the rule); the
table above is the default when `levels` is absent:

```json
{
  "levels": [
    { "level": 1, "min_watch_seconds": 1800, "days": 7, "points_per_day": 40, "xp_per_day": 5, "completion_bonus": 500 },
    { "level": 2, "min_watch_seconds": 2700, "days": 7, "points_per_day": 100, "xp_per_day": 8, "completion_bonus": 500 }
  ],
  "bonus_thresholds": { "7": 50, "30": 300 }
}
```

### Rules

- **Qualify:** today's credited watch seconds ≥ current level's `min_watch_seconds` → the day is
  recorded once (`user_streak_days`), `points_per_day` + `xp_per_day` credited to the ledger
  (idempotent per day), and any `bonus_thresholds[streak length]` milestone bonus paid.
- **Streak:** yesterday qualified → `current_streak + 1`, else it restarts at 1.
- **Level progress:** each qualifying day in an unbroken streak is +1 toward the level's `days`.
  At `days` → level complete: `completion_bonus` paid ("7-Day Ritual Complete!"), the
  `streak_level_completed` metric increments (badges), and the user moves to the next level
  (capped at the top level, where completing again pays the bonus again).
- **Missed day:** streak restarts at 1 and level progress resets to 0. **The level is kept.**
- **Day boundary:** UTC.

## 4. Streak APIs

All under `/v1/games/streak` (customer).

### `GET /?month=YYYY-MM` — status (extended)

Existing fields stay (`currentStreak`, `longestStreak`, `totalQualifiedDays`,
`lastQualifiedDate`, `qualifiedToday`, `milestones`, `month`, `history`). `currentStreak` now
reads **0 when the streak is broken** (last qualified day before yesterday). New:

```json
{
  "level": { "current": 2, "minWatchSeconds": 2700, "days": 7, "progressDays": 2, "remainingDays": 5,
             "next": { "level": 3, "minWatchSeconds": 3600 } },
  "levels": [{ "level": 1, "minWatchSeconds": 1800, "days": 7, "pointsPerDay": 40, "completionBonus": 500, "status": "completed" }],
  "today": { "date": "2026-09-25", "watchSeconds": 1320, "requiredSeconds": 2700, "remainingSeconds": 1380, "qualified": false },
  "activeDays": 47,
  "calendar": [{ "date": "2026-09-01", "level": 1 }],
  "badges": [{ "id": "…", "name": "First Flame", "earned": true, "earnedAt": "…",
               "progress": { "current": 1, "target": 1, "percent": 100 } }]
}
```

`levels[].status` = `completed` | `current` | `locked`. Badge `progress` for the level currently
being played shows days done (e.g. `2 / 7 · 29%`).

### `GET /activity?page=&limit=` — activity log

Newest first: `{ date, level, watchSeconds, requiredSeconds, streakDay, pointsAwarded,
levelCompleted, completionBonus, badges: [name] }`.

### `POST /check-in` — evaluate today (changed)

No longer awards for opening the app. It re-evaluates today's watch time (same as a heartbeat)
and returns `{ qualified, alreadyCheckedIn, currentStreak, awardedPoints, awardedXp,
milestoneBonus, levelCompleted, completionBonus, level, today }`. Existing fields keep their
names.

## 5. Admin watch stats

`GET /v1/admin/users/:id/watch-stats` (`users:read`) — the user detail "Watch" tab:

```json
{
  "videosWatched": 234, "sessions": 310, "totalWatchSeconds": 540000, "avgSessionSeconds": 2520,
  "completionRate": 78.2, "lastWatchedAt": "…",
  "favoriteGenres": [{ "genreId": "…", "name": "Action", "watchSeconds": 32000, "percent": 60 }],
  "streak": { "currentStreak": 14, "longestStreak": 21, "level": 2, "activeDays": 47 }
}
```

`completionRate` = % of counted views completed. Genres are weighted by watch seconds (all of a
content's genres share its time). `GET /v1/admin/users/:id/watch-history` is unchanged
("Recently Watched").

## 6. Badges & metrics

Badges are awarded by the existing `user_metrics` trigger. Nothing wrote metrics before; now:

| Metric | Updated when |
|---|---|
| `total_watch_minutes` | every credited heartbeat |
| `watch_streak_days` | each qualifying day (current streak) |
| `streak_level_completed` | each completed level (new badge trigger) |

Seed `004_badges.sql` adds First Flame / Consistent Star / Streak Legend / Cinematic Icon
(`streak_level_completed ≥ 1..4`) and Spark Keeper (`watch_streak_days ≥ 14`).

## 7. Schema changes

Migration `0021_watch_tracking_and_streak_levels.sql`:

| Table | Change |
|---|---|
| `content_views` | `counted boolean default false` (existing rows backfilled `true`), `counted_at`, index `(user_id, content_id, started_at desc)` |
| `contents` | backfill `unique_viewer_count`, `total_watch_seconds` from `content_views` |
| trigger `view_counts` | now fires when a session becomes `counted` (not on insert) |
| `user_streaks` | `current_level`, `level_progress_days`, `levels_completed` |
| `user_streak_days` | new — one row per qualified day (activity log) |
| `badge_triggers` | `streak_level_completed` |

## 8. Not covered / follow-ups

- **User time zones** — days are UTC; `users.timezone` could drive local days later.
- **Admin streak builder UI** still edits a single `min_watch_seconds`; it needs a levels
  editor (TTLE-152) — the API already accepts `levels`.
- **Eligibility push notification** when a day qualifies (admin toggle) — not sent yet.
- **Customer watch-history / continue-watching lists** — not in the design, not built.
