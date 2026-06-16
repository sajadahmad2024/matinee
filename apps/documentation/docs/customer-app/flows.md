# Customer App — Flows & DB Mapping (living doc)

> Built up screen-by-screen from the customer (mobile) wireframes. Each flow maps its steps to
> the existing DB schema and flags anything missing. **DB gap log** at the bottom tracks
> candidate schema additions (status: resolved / candidate / confirmed).
>
> Backend modules already in place: users + auth (RBAC, OTP, OAuth, referral, devices), content
> (catalog/engagement/analytics), tokenomics + games, leveling, leaderboard, badges,
> subscriptions, moderation, platform/notifications/analytics. Migrations `0001`–`0014`.

---

## Flow A — Onboarding / Sign-In (first-time user)

`Splash → Intro (×3) → Enter mobile → Enter OTP → OTP confirmation → User details`

| Screen | What it does | DB mapping |
|--------|--------------|------------|
| Splash 5 | Brand splash | static (none) |
| Intro 1–3 | "Watch Trailers Instantly", "Play Interactive Games", "Win Real Rewards" + Next/Get Started | static marketing (none) — only needs a table if the slides become CMS-managed |
| Login 1 — phone | "What's your phone number?" + Get OTP; **OR** Google / Apple | `otp_codes` (issue, channel=`sms`); `oauth_accounts` for Google/Apple; `users.phone`, `users.primary_auth_method` (`phone`/`google`/`apple`) |
| Login 2/3 — OTP | "Did you get your code?" 4-digit + Continue; "Resend code in XXs" | `otp_codes` (verify code, expiry, attempts; resend = new code); sets `users.is_phone_verified` |
| Create account | "Username", "Referral code? (Optional)", Create Account | `users.username`; `account_type` guest→`customer`; referral via `referral_codes` (lookup) + `referral_redemptions` (credit through ledger `source_type='referral'`) |
| (on login) | register push device | `device_tokens` (FCM) |

**Covered** by `0002` (users/auth/referral/devices). Guest→account merge already supported
(`users.merged_into_user_id`).

**Gap:** the "I accept Terms & Conditions and Privacy Policy" consent isn't recorded anywhere —
no way to prove which T&C/privacy *version* a user accepted and when. → candidate `user_consents`.

---

## Flow B — Subscription (Before Subscription): P2P & Rewards

`Home → P2P (Subscribe-Now page)` and `Home → Rewards (Subscribe-Now page)` — free user sees the
gamification locked behind a subscription.

| Element | What it shows | DB mapping |
|---------|---------------|------------|
| **Home feed** | vertical trailer swipe; like / comment / share / save / details; points badge (123); 🔥 streak | `contents`, `content_views` + `content_watch_events`, `content_reactions` (like), `comments`, `content_shares`, `content_watchlist` (save), `wallets` (points), `user_streaks` (🔥) |
| **P2P** — "Premium Access / Level Up / Subscribe Now" | locked: Daily Streaks, Weekly Quests, Predictive Games; "Why Subscribe?": Exclusive Content, Live Auction | gamification = `reward_rules` + `quests` / `predictions` / `auctions`; locked state = no active `subscriptions` row (+ `geo_policies.subscription_required`); Exclusive Content = `contents.access_tier='exclusive'` / `content_unlocks` |
| **Rewards** — "Join Pro / Start Earning / Subscribe" | Exclusive Rewards & Auctions: Exclusive Content, Live Auction, **Premium Experiences**; "Predict the Oscar Winners — correct guesses double your points" | Live Auction = `auctions`/`bids`; Predict = `predictions` (`payout_multiplier`); subscribe = `subscription_plans` → `subscriptions` → `subscription_invoices` |

**Mostly covered.** Two things to watch:
- **Premium Experiences — "redeem your points for one-in-a-lifetime experiences."** This is a
  *fixed-price points redemption catalog* (premieres, meet-and-greets, perks) — distinct from
  `auctions` (bidding) and `content_unlocks` (content). Not modeled yet. → candidate
  `reward_catalog_items` + `reward_redemptions`. Confirm against the post-subscribe Rewards screen.
- Paywall feature list (Daily Streaks / Quests / …) can be static marketing or read from
  `subscription_plans.features` (JSONB) — no new table needed.

---

## Flow C — Home feed & engagement (read from Figma)

`Home (vertical trailer) → Details / Comments / Share`

| Element | What it shows | DB mapping |
|---------|---------------|------------|
| Home feed | vertical trailer player; right rail: 🔥 streak, 👍 like, 👎 dislike, 💬 comments, Details, share; bottom nav Home/Rewards/Profile | `contents`, `content_views`/`content_watch_events`, `content_reactions` (like **+ dislike** — `contents.dislike_count` exists), `user_streaks` |
| Details | title, studio · genre, synopsis, **Cast** (photos) | `contents`, `content_cast` ⋈ `people` (photo_media_id) |
| Comments | threaded list, time, like + **Reply**, "view N more replies", input box | `comments` (`parent_comment_id` for replies), `comment_reactions` (like) |
| Comment → More → Report | reasons: nudity/sexual, **violence/gore**, hate speech, harassment, other (+ description) | `comment_reports` (reason enum already `nudity_sexual`/`violence_gore`/…); rolls up to `moderation_tickets` |
| Share | social targets + Share | `content_shares` (channel) |

**Covered.** Only mismatch: `moderation_tickets.category` / `moderation_reports.reason` lacked
**`violence`** (comment reports already had `violence_gore`) → **fixed** (added `violence`).

## Flow D — Profile (read from Figma)

`Profile → Edit profile / My Earns & Rewards / Refer a friend / Notifications`

| Screen | What it shows | DB mapping |
|--------|---------------|------------|
| Profile page | name, **Total Points / Streaks / Coins**, "Upgrade your Subscribe", menu (My Earns & Rewards, Refer a friend, T&C, Privacy, Logout) | `users`, `wallets` (points/coins), `user_streaks`, `subscriptions` |
| Edit profile | Full name, **About You**, User ID, Email | `users` (+ **`bio`** for About You → **added**) |
| My Earns & Rewards | "Total Earnings 2500" + recent activity (daily streak +10, weekly quest +100, prediction +500…) | `wallets.points_earned_lifetime` + `ledger_transactions` (direction `earn`) |
| Refer a friend | referral code + copy + share | `referral_codes` |
| **Notifications** | in-app feed: "New trailer added", "Game updates", sort by category | **no table → added `user_notifications`** (in-app inbox) |

**Terminology note (confirm with product):** the app shows **Coins** (spendable, earned from games)
and **Points / Total Earnings**. Map: **Coins = `wallets.points`** (spendable), and Points/Earnings =
lifetime earned (`points_earned_lifetime`) — *unless* "Points" is meant as XP/level (`xp_total`).
No schema change either way (two-currency model exists); just naming to lock down.

## Flow E — Games & Rewards (read from Figma)

| Screen | What it shows | DB mapping |
|--------|---------------|------------|
| Rewards | earning hub — daily streak, weekly quest, prediction game (with point values) | `reward_rules` + `quests`/`predictions` |
| Prediction game (×3) | watch trailer → "Take the questions"; "answer to unlock the video"; "Last prediction?" | `predictions`, `prediction_options`, `prediction_entries`; gating = answer-to-unlock |
| Prediction questions | "What will happen…" + MCQ options + Submit | `prediction_options` (text/media), `prediction_entries` (+ `points_staked`, `payout_multiplier`) |
| Streaks | "2691 Total Streaks" 🔥 + calendar of qualifying days | `user_streaks` + `user_daily_activity` |
| Coins | "80 Total coins" + recent activity (earn/spend) | `wallets` + `ledger_transactions` |
| Badges | badge grid, "All badges" | `badges`, `user_badges` |

**Covered** by tokenomics/games + leveling/leaderboard/badges.

---

## Currency model (working mapping — confirm on final flow)

The app uses **Coins** + **Points/Earnings** + **Streaks**. Mapped to the existing two-currency
wallet (no schema change):

| App label | DB | Meaning |
|-----------|----|---------|
| **Coins** ("80 total", +/- activity) | `wallets.points_balance` | spendable currency — earned from games, spent on unlocks / bids / **reward redemptions** |
| **Total Points / Total Earnings** ("2000" / "2500") | `wallets.points_earned_lifetime` | cumulative coins earned (lifetime) |
| **Level / XP** | `wallets.xp_total` → `level_definitions` | progression / leaderboard (surfaced as level) |
| **Streaks** | `user_streaks` | current/longest qualifying-day streak |

So **Coins = `points`** in the schema; the DB keeps the neutral name `points`, the app brands it
"Coins". (To revisit only if "Points" is meant as a *separate spendable* currency from Coins — then
it'd be a real second wallet currency. Current read: it's lifetime-earned, not separate.)

## DB gap log

| # | Gap | Trigger | Status |
|---|-----|---------|--------|
| 1 | `content_regions` (publish/availability M2M) | admin "Publish to regions" | **resolved — `0014`** |
| 2 | `user_notifications` (in-app feed inbox) | Profile → Notifications | **resolved — `0015`** |
| 3 | `users.bio` ("About You") | Edit profile | **resolved — `users` (0002)** |
| 4 | moderation `category`/`reason` missing `violence` | comment Report reasons | **resolved — `0009`** |
| 5 | `user_consents` (T&C / privacy / marketing acceptance, versioned) | onboarding consent | **resolved — `0016`** |
| 6 | `reward_catalog_items` + `reward_redemptions` (fixed-price redemption store) | Rewards "Premium Experiences" | **resolved — `0016`** (+ ledger `source_type='reward_redemption'`) |
| 7 | Coins vs Points/XP terminology | Profile + Coins screens | **resolved (mapping above; no schema change)** |

> All gaps from the 5 customer flows are now covered in the schema (migrations `0001`–`0016`).
> Next: lock the flow on the updated Figma link, then write the API doc against this DB design and
> start building module-by-module.
