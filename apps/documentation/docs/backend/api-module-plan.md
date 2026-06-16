# Backend API Module Plan

> The full API surface for the customer app + admin web, designed against the DB (migrations
> `0001`–`0017`) and the documented flows. Every module follows the established patterns so code is
> generated **under design patterns + file segregation**, not ad hoc. Build order is dependency-first.

## Conventions (every module follows these)

```
src/<module>/
  <module>.module.ts                 # wires controllers + services; added to V1_MODULES (main.ts)
  <area>.controller.ts               # HTTP only — @Controller({ path: RouteNames.X, version: '1' })
                                     #   customer + admin controllers split (e.g. content.controller + admin-content.controller)
  <area>.service.ts                  # business logic / facade — orchestrates repos + providers
  providers/  <abstract>.provider.ts + <impl>.provider.ts   # external integrations, env-selected
  dto/        *.dto.ts               # class-validator + class-transformer + @nestjs/swagger
  mappers/    *.mapper.ts            # entity → response DTO
  interfaces/ *.interface.ts
src/db/repositories/<module>/<name>.repository.ts   # ONLY place importing @db/* (Drizzle queries)
src/background/<module>/<name>.handler.ts           # @QueueHandler workers (async jobs)
```

- **Authz:** `@Public()`, `@Roles()`, `@Permissions()`, `@AccountType()`, `@CurrentUser()` (from auth).
- **Pagination/response:** reuse `common/dto` (page/limit) + a standard envelope; errors via `HttpExceptionFilter`.
- **Award pattern (tokens):** any points/XP change = a `ledger_transactions` insert with an
  `idempotency_key` (the wallet trigger keeps `wallets` exact). Never write `wallets` directly.
- **Events (coarse, PG-for-now):** raw engagement → partitioned `content_watch_events`; aggregates via
  rollup cron into `content_daily_stats` / `user_daily_activity`. (Firehose seam deferred — see data-architecture.)
- **Swagger:** one tag per module; customer vs admin endpoints grouped; DTOs fully annotated.

## Existing modules — review & gaps to fix

| Module | State | Fixes needed |
|--------|-------|--------------|
| `auth` (customer + admin) | mature | onboarding: persist **`user_consents`** (T&C/privacy) + apply **referral** redemption on signup; emit "welcome" notification; admin-invite accept → `admin_invites` |
| `media` | mature | none (already S3 + MediaConvert HLS) — content module reuses it |
| infra (queue/cache/cron/health/…) | mature | add new `QueueName`/`JobName` entries as modules land |
| `users` (repo only) | partial | needs a **customer profile module** (see below); admin-users already in `auth/admin` |

## New modules (dependency-ordered build phases)

### Phase 1 — Core content & profile
1. **`content`** — catalog CRUD + publish workflow.
   - Repos: `content`, `content-media`, `taxonomy` (studios/genres/tags/people), `content-license`, `content-sponsorship`, `content-region`.
   - Customer: feed (`GET /feed`, region/availability-filtered), content detail (+ cast), watch-progress.
   - Admin: CRUD, approve/reject/publish (status + `content_change_history`), licensing, sponsorship/ad-commercial, publish-to-regions, taxonomy CRUD, boost/recommendation.
   - Providers: reuse `media`. Jobs: scheduled→published cron, license-expiry reminder cron.
2. **`profile`** (customer self) — ✅ **built.** Profile screen (`GET /profile` = identity + wallet + streak + subscription + unread count), edit (`PATCH /profile`: name/about-you/avatar/locale), wallet (`GET /profile/wallet`, level-derived), my-earns (`GET /profile/earns`, paginated ledger, filter currency/direction), referral (`GET /profile/referral`, lazily-minted code + completed count), notification inbox (list/unread-count/read/read-all), device list. Admin read-views under `/admin/users/{id}/{wallet,earns,notifications}`. Repos (per-domain, shared): `users/profile`, `tokenomics/wallet`, `tokenomics/ledger`, `notifications/notification`, `subscriptions/subscription`, `auth/referral`.

#### Cross-module seams (how later modules plug in without rework)
Repositories are centralized per **domain** under `src/db/repositories/<domain>/` and exported by the global `DBModule`, so a module can read data another module will later own/write — same repo, single source of truth, no duplication. Profile establishes these seams:

| Seam | Profile (now) | Owning module (later) |
|------|---------------|------------------------|
| `tokenomics/wallet` + `tokenomics/ledger` | **reads** balances/level + earn history | **`tokenomics`** writes (games credit points, ledger trigger maintains wallet) |
| `notifications/notification` | **reads** the inbox + unread count | **`notifications`** writes (authoring, campaigns, fan-out, push) |
| `subscriptions/subscription` | **reads** active-subscription summary | **`subscriptions`** writes (billing, plan changes, invoices) |
| `auth/referral` | **reads** my code + completed count | **`auth`/growth** writes (redemption, qualification) |

> Admin point-adjustments and notification authoring are intentionally **not** in `profile` — they belong to the tokenomics/notifications admin modules and will reuse these same repos.

### Phase 2 — Engagement
3. **`engagement`** — reactions (like/dislike), comments (+ replies, comment reactions), shares, watchlist, views/watch-events, progress.
   - Repos: `reaction`, `comment`, `share`, `watchlist`, `watch-event`, `progress`.
   - Each action emits a coarse event + (where it earns) an award via tokenomics.
   - Comment report → creates/【rolls up】a `moderation_ticket`.

### Phase 3 — Tokenomics (foundation for games)
4. **`tokenomics`** — wallet + ledger + reward-rule config.
   - Repos: `wallet`, `ledger`, `reward-rule` (+ versions).
   - Customer: `GET /wallet` (coins balance + lifetime), ledger history.
   - Admin: reward-rule editor (versioned config), manual adjust (admin ledger entry).
   - **Award service** (shared): `award(userId, source, amount, xp, idempotencyKey)` → ledger insert.

### Phase 4 — Games & progression (depend on content + tokenomics)
5. **`games`** — quests, predictions, auctions, streaks.
   - Repos: `quest`, `prediction`, `auction`, `bid`, `streak`.
   - Customer: list/play quests, submit prediction (entry cost via ledger spend), place bid, streak status.
   - Admin: create/edit/resolve/settle instances, app-widget config, per-instance unlock/banner.
   - Jobs/cron: daily-streak award, quest completion award, prediction resolve→payout, auction settle→charge+refund, instance status transitions.
6. **`leveling`** — `level_definitions` curve + `level_for_xp`; admin curve editor (regenerate).
7. **`leaderboard`** — `leaderboard_monthly` read + recompute cron.
8. **`badges`** — badges catalog, `user_badges`, `user_metrics`; evaluation job on relevant events.

### Phase 5 — Monetization
9. **`subscriptions`** — plans (+ region prices), subscriptions, invoices.
   - Provider: **Stripe** (abstract `BillingProvider`). Webhook controller (raw body).
   - Customer: plans, subscribe, manage, billing history. Admin: plan CRUD, subscribers, transactions, regional analytics.
   - Jobs: webhook processing, renewal/expiry, dunning.
10. **`rewards`** — `reward_catalog_items` + `reward_redemptions` (points redemption store).
    - Customer: catalog, redeem (ledger spend `reward_redemption`). Admin: catalog CRUD, fulfillment.

### Phase 6 — Trust, comms, growth
11. **`moderation`** — tickets + reports queue, assignment, resolution → enforcement (`user_enforcement_actions`). Admin only.
12. **`notifications`** — campaigns + deliveries (push via FCM/`device_tokens`) + in-app `user_notifications` feed.
    - Provider: **PushProvider** (FCM/SNS). Customer: inbox (read/unread). Admin: compose/schedule/cancel campaigns. Jobs: send fanout, schedule.
13. **`referral`** — codes + redemptions (promote out of `auth`); customer "refer a friend", admin reward-rule.
14. **`geo`** — `geo_policies` (admin) + availability resolution; `consents` (record/read).

### Phase 7 — Events, platform & analytics
15. **`events`** — *its own module* for app-emitted telemetry (watch/swipe/impression/session/gamification events).
    - **Customer**: `POST /events` (batched ingest from the app) — coarse events only (no per-second firehose).
    - Repos: `watch-event` (partitioned `content_watch_events`), `session` (`user_sessions`), future swipe/impression.
    - Jobs/cron: daily **rollups** → `content_daily_stats` / `user_daily_activity`; session summarize.
    - **This is the single seam**: today writes land in Postgres (coarse + rollups); flipping the writer to
      Kinesis Firehose → S3 later is a config change in this module only (per data-architecture decision).
16. **`platform`** — `app_settings` (feature flags + security), `app_versions` (force-update), `admin_audit_log` (write via an interceptor on admin mutations), `marketing_spend`, `social_mentions` (ingest). Admin.
17. **`analytics`** — *read-side* dashboard endpoints (inventory, licensing, performance, gamification, monetization, community, regional) reading the rollups + aggregates produced by `events`. Admin. (Separate from `events`: ingestion/storage vs. reporting.)

## New SQS queues / jobs (added incrementally)

| Queue | Jobs |
|-------|------|
| `tokenomics` | award-batch, ledger-reconcile |
| `games` | streak-award (cron), quest-complete, prediction-resolve, auction-settle, leaderboard-recompute (cron), badge-evaluate |
| `subscriptions` | stripe-webhook, renewal-check (cron), dunning |
| `notifications` | campaign-send, push-fanout, schedule-fire (cron) |
| `content` | publish-scheduled (cron), license-expiry-reminder (cron) |
| `analytics` | daily-rollup (cron), session-summarize |

(Reuses the existing `QueueService` + `@QueueHandler` + cron infra; DLQ per queue.)

## Build order summary
`content` + `profile` → `engagement` → `tokenomics` → `games`/`leveling`/`leaderboard`/`badges` →
`subscriptions` + `rewards` → `moderation`/`notifications`/`referral`/`geo` → `platform`/`analytics`.
Each phase: repositories → service(+award/provider) → controllers (customer then admin) → DTOs/mappers →
queue jobs → register in `DBModule` + `V1_MODULES` → Swagger verified → e2e smoke.
