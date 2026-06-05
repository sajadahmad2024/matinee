# Tokenomics + Game Centre — DB Design (proposal, for iterative review)

> **Status:** **APPLIED** — `0004_create_tokenomics_games.sql` migrated + introspected; the ledger
> trigger (balance sync), idempotency-key (no double-pay) and overspend guards verified; type-check
> green. Next: award flows (cron/handlers/triggers) in the module-code step.
> This pass designs the **shared tokenomics ledger** (the hub everything merges through) and
> the **4 games** on top of it + the events→rewards bridge. UUIDv7 PKs; rules/amounts live in
> the versioned `reward_rules` config; assets (prediction options, prizes) are `media_id` FKs.
>
> **Money vs points (confirmed):** Subscription (App Store/Play IAP — separate module) buys
> access to the **regular feed** (removes the free-video quota). It does **not** unlock exclusive
> content or games — **exclusive content always costs points**, earned by playing. So points are
> the *earned* engagement currency; subscription is *paid* access. The ledger still distinguishes
> **earned vs purchased** points so a future "subscription grants bonus points" is additive.

---

## 1. How content, games and money merge

```
   CONTENT EVENTS                 TOKENOMICS (hub)                 GAMES
   ──────────────                 ────────────────                 ─────
 content_watch_events ─┐        ┌───────────────┐        daily_streak  (autonomous)
 content_views         ├──────▶ │ ledger_txns   │ ◀──────  quests        (interactive)
 user_daily_activity ──┘ earn   │  + wallets    │  earn    predictions   (interactive)
                                │  + reward_rules│  spend   auctions/bids (interactive)
 content_unlocks ──────spend──▶ └───────────────┘
 referral_redemptions ─earn──────────┘     ▲
                                            │ money→access (NOT points)
   SUBSCRIPTION (separate module) ──────────┘  regular-feed access; exclusive still costs points
```

Two convergence points: **events** (watch/engagement → autonomous awards) and the **ledger**
(every earn/spend across referral, games, unlocks, bidding hits one balance).

---

## 2. Tokenomics

### `wallets` — one per user (balances)
`user_id pk fk → users, points_balance bigint, points_earned_lifetime bigint, points_spent_lifetime bigint, points_purchased_lifetime bigint, xp_total bigint, updated_at`. Maintained by a **trigger on the ledger** (insert → adjust balances), so balances are always the exact sum of the ledger (the "points via DB trigger" approach). `points_purchased_lifetime` is the earned-vs-purchased split hook (0 today).

### `ledger_transactions` — append-only, the source of truth
| Column | Type | Notes |
|--------|------|-------|
| id | uuid pk | |
| user_id | uuid fk → users | |
| currency | varchar(10) | `points` \| `xp` |
| amount | bigint | signed: `+` credit, `-` debit |
| balance_after | bigint | snapshot for audit/statements |
| direction | varchar(10) | `earn` \| `spend` \| `refund` \| `purchase` \| `adjust` |
| source_kind | varchar(10) | `earned` \| `purchased` (the future money→points split) |
| source_type | varchar(30) | `referral` \| `daily_streak` \| `quest` \| `prediction` \| `bid` \| `bid_refund` \| `content_unlock` \| `admin` |
| source_id | uuid | polymorphic ref to the originating row (quest/prediction/auction/unlock…) |
| reward_rule_version_id | uuid fk → reward_rule_versions | which rule version computed this (audit) |
| **idempotency_key** | varchar(120) **UNIQUE** | **prevents double-credit** (e.g. `streak:<user>:<date>`, `quest:<quest>:<user>`) |
| note | varchar(300) | |
| created_at | timestamptz | |

**Atomicity/idempotency (the no-loophole core):** every award/spend is one INSERT guarded by a deterministic `idempotency_key` (UNIQUE) — retries, concurrent events, and replayed cron ticks can't double-pay. A debit is rejected (CHECK / app guard) if it would drive `points_balance` negative. The ledger is never updated/deleted; corrections are `refund`/`adjust` rows.

### `reward_rules` (exists) + `reward_rule_versions` (new) — versioned config
`reward_rules` already holds one row per `rule_key` (`referral`, `daily_login`, …) with a `config` jsonb. We extend the model so **all** game/points rules live here, **versioned**:
- `reward_rules`: add `version int` (current) — the live config per rule.
- `reward_rule_versions` (new, append-only): `id, rule_key, version, config jsonb, changed_by fk, created_at`. Every edit snapshots a new version; the ledger row references the exact version that paid out (so changing "streak = 10pts → 15pts" never rewrites history).

New `rule_key`s: `daily_streak`, `quest`, `prediction`, `bidding` (+ existing `referral`). `config` examples in §5.

---

## 3. The award / spend pipeline

- **Autonomous (daily streak):** a daily Cron (worker, lock-guarded — our existing pattern) reads `user_daily_activity`, applies the `daily_streak` rule, and writes an idempotent `earn` ledger row per qualifying user-day.
- **Interactive (quest/prediction/bidding):** a user action or a resolution event (quest completed, prediction resolved, auction closed) writes the ledger row.
- **Spends (unlock/bid):** debit the ledger atomically (balance guard).
- **Where the logic lives:** the *mechanical* balance trigger (ledger → wallet) is ours. The *business award* triggers/handlers (when + how much, reading `reward_rules`) are the tokenomics rules — written as DB triggers (your stated approach) or worker handlers; the schema here gives them everything they need (rule versions, idempotency, source refs).

---

## 4. Game Centre

Common shape per game: **definition/config** (admin) → **participation/progress** (per user) → **resolution** → **ledger** (idempotent payout). Rewards (points + xp) come from `reward_rules` / the game row.

### 4.1 Daily Streak — autonomous, no admin "instance"
- Rule in `reward_rules['daily_streak'].config` (e.g. `{min_watch_seconds: 300, points_per_day: 10, xp_per_day: 5, bonus: {"7": 50, "30": 300}}`).
- `user_streaks` — `user_id pk, current_streak, longest_streak, last_qualified_date, total_qualified_days, updated_at`. Advanced by the daily cron from `user_daily_activity`; payout → ledger (`idempotency_key = streak:<user>:<date>`).

### 4.2 Quest — "watch these videos by the deadline" (the Weekly Contest screen)
- `quests` — `id, name, description, reward_points, reward_xp, start_at, end_at, status (draft|active|ended|cancelled), require_all bool, created_by, created_at/updated_at`.
- `quest_contents` — `quest_id, content_id`, pk both (the "Videos to Watch" set).
- `quest_participations` — `quest_id, user_id, completed_count, is_completed, completed_at, rewarded_at`, pk `(quest_id, user_id)`. Real-time progress for the UI.
- `quest_content_progress` — `quest_id, user_id, content_id, completed_at`, pk `(quest_id, user_id, content_id)`. Marks each required video done within the window (fed by a `content_views` completion within `[start_at, end_at]`). When `completed_count = |quest_contents|` → mark complete + payout (`idempotency_key = quest:<quest>:<user>`).

### 4.3 Predictive — Q&A (options can be text / image / video)
- `predictions` — `id, question, description, content_id fk NULL (optional attach), start_at, end_at, status (open|locked|resolved|cancelled), reward_points, reward_xp, correct_option_id, resolved_by, resolved_at, created_by, created_at`.
- `prediction_options` — `id, prediction_id fk, label, option_media_id fk → media_metadata NULL (text/image/video option), sort_order, is_correct`.
- `prediction_entries` — `id, prediction_id fk, user_id, option_id fk, is_correct, points_awarded, created_at`, **unique `(prediction_id, user_id)`** (one entry per user, before `locked`). On resolve → award correct entries (`idempotency_key = prediction:<prediction>:<user>`).

### 4.4 Bidding — spend points to win a prize (premiere / meet-a-star)
- `auctions` — `id, title, description, prize, content_id fk NULL, start_at, end_at, status (scheduled|open|closed|settled|cancelled), min_bid_points, winner_user_id, winning_amount, created_by, created_at`.
- `bids` — `id, auction_id fk, user_id, amount_points, status (active|outbid|won|refunded), created_at`. **Points-hold model:** placing a bid **debits (holds)** points via the ledger; being outbid / auction loss → **refund** ledger row; the winner's hold becomes the final spend. (Hold-on-bid prevents bidding more than you hold — see Q4.)

> Every game's payout/charge is **one idempotent ledger row** referencing its `source_type`/`source_id`, so the full economy is auditable and double-safe.

---

## 4.5 Leveling & leaderboard (XP → levels) — migration `0005`

The "Leveling Configuration" screen: XP earned drives a **level** via an admin-editable curve.
- **Config** in `reward_rules['leveling']` (versioned): `{ base_xp, growth_multiplier, max_level_cap }`
  (defaults 20 / 1.5 / 100). Curve: `xp_to_advance(level) = round(base_xp · multiplier^(level-1))`.
- **`level_definitions`** (`level, xp_to_advance, cumulative_to_reach`, NUMERIC) — the precomputed
  curve; powers the admin "Level Requirements Table" and fast level lookup. Rebuilt by
  `regenerate_level_definitions()` whenever the admin saves the config. (Verified vs the screenshot:
  req 20/30/45/68/101…, total-to-L20 = 132,972, 100 levels.)
- **No stored `level` column** — a user's level is `level_for_xp(wallets.xp_total)` (level is monotonic
  with XP). The `level_for_xp()` SQL function does the lookup.
- **Leaderboards** (rank by XP/level — migration `0006`):
  - **All-time global** = `idx_wallets_xp` + `ORDER BY wallets.xp_total DESC`, joined to `level_for_xp`.
  - **Monthly** = `leaderboard_monthly (period_month, user_id, xp_earned)` — per-user XP earned in the
    month, kept current by a trigger on the ledger (XP earns only); rank = `WHERE period_month=:m
    ORDER BY xp_earned DESC`. Resets each month. (Verified: aggregates + ranks correctly.)

## 4.6 Badges (dynamic-rule milestones) — migration `0007`

Admin-defined milestones ("Create New Badge" / "Badge Management"). A user earns many badges
"as and when they overcome a rule". Each badge has a **single dynamic criterion** `trigger ·
operator · value` that tests a **per-user metric**; an **autonomous trigger** awards the badge +
its points the instant the metric crosses the threshold.
- **`badge_triggers`** — catalog for the "Select trigger…" dropdown (metric keys: `quizzes_completed`,
  `watch_streak_days`, `total_watch_minutes`, `fast_completions`, `first_place_wins`,
  `referrals_completed`). Data-driven so new triggers don't need code.
- **`badges`** — `name, slug, description, active_icon_media_id, inactive_icon_media_id` (the
  active/inactive icon states), `trigger_key`, `operator (gt|gte|eq|lt|lte)`, `threshold`,
  `reward_points`, `reward_xp`, `is_active` (the "Inactive" badge), `earned_count` (denormalized
  "X earned", trigger-maintained).
- **`user_metrics`** — generic per-user key/value (`user_id, metric_key, value`) the triggers test;
  bumped by feature handlers (watch → `total_watch_minutes`, referral → `referrals_completed`,
  streak → `watch_streak_days`, …).
- **`user_badges`** — earned badges (a user has many).
- **Engine:** `trg_evaluate_badges` (AFTER UPDATE OF value on `user_metrics`) → `award_badge()`
  inserts `user_badges` once + credits `reward_points`/`reward_xp` to the ledger
  (`idempotency_key = badge:<badge>:<user>`). **Verified:** 50→no badge, 51→badge+500pts+count=1,
  52→idempotent (no double-award/credit). Seeded the 6 sample badges (Quiz Master … Social Butterfly).

## 5. `reward_rules.config` shapes (admin-editable, versioned)

```jsonc
"daily_streak": { "min_watch_seconds": 300, "points_per_day": 10, "xp_per_day": 5,
                  "bonus_thresholds": { "7": 50, "30": 300 } }
"quest":        { "default_points": 100, "default_xp": 50 }          // per-quest overrides on the row
"prediction":   { "default_points": 100, "default_xp": 25 }
"bidding":      { "min_increment_points": 10 }
"referral":     { "xp_per_invite": 500, "max_invites_per_month": 10 } // existing
"leveling":     { "base_xp": 20, "growth_multiplier": 1.5, "max_level_cap": 100 }
```

---

## 6. Subscription touchpoint (separate module, designed next)

Out of scope for this migration; noted so the access check is coherent. Subscription (Apple/Google IAP)
gates **regular-feed access** only: subscribed ⇒ no free-video quota; not subscribed ⇒ 8 guest / 20
customer then subscribe. **Exclusive content and games are unaffected** (exclusive always via points).
The subscription module owns receipt validation + store S2S notifications (via SQS) + state; it never
mints points today (future: a `purchase`/`earned`-tagged credit, which the ledger already supports).

---

## 7. Decisions & remaining

**Confirmed:**
1. **Award authorship** → **I build the business award logic** (triggers + worker handlers reading `reward_rules`) alongside the schema — fully working, testable.
2. **Bidding** → **hold-on-bid + refund losers** (ledger debit on bid; refund on outbid/loss; winner's hold = spend). Prevents over-bidding.
3. **`reward_rules` versioning** → **extend `reward_rules` with `version`** (touches `0002`, greenfield recreate) **+** append-only `reward_rule_versions`.
4. **Quest cadence** → **single window `[start_at, end_at]`** ("Number of Weeks" just sets the end date).
5. **XP** → cumulative (levels/leaderboard), never spent (default — say if XP should be spendable).
6. **Leaderboards / levels** → phase-2 (XP accrues now; ranking/levels later).

**Implementation note (from #1):** the migration (`0004`) delivers schema + the mechanical
balance trigger + idempotency/balance-guard constraints + new `reward_rules` rows/versions. The
award *flows* (streak daily-cron, quest-completion, prediction-resolve, auction-settle, unlock/
referral) are then built as triggers + worker handlers in the module-code step.
