# Manual End-to-End Test Plan (Local)

A dependency-ordered manual test pass covering **every** admin-app and customer-app flow, with all
third-party dependencies mocked locally. Test via **Swagger** (`http://localhost:3000/api/v1`) or any
HTTP client.

**Logical order = three parts:**
- **Part A — Admin builds the world** (RBAC, content, economy, monetization, games, platform).
- **Part B — Customer lives in it** (onboarding → consume → engage → earn → play → progress → redeem → subscribe → notify → telemetry).
- **Part C — Admin operates the business** (resolve games, moderate, manage customers, fan-out, ops, analytics) — needs the customer activity from Part B to exist.

Coverage is mapped to the 44 API tag groups; each is called out as `[Group]`.

---

## 0. One-time setup (do this first)

> ⚠️ **Restart the dev server before testing** so the worker boots fresh with the mock providers:
> ```bash
> pnpm start:dev            # API + WORKER (watch the WORKER pane — OTP codes log there)
> ```

1. **Services up** (Docker): Postgres `:5435`, Redis `:6380`, ElasticMQ `:9326` (`docker ps`).
2. **DB ready**: `pnpm db:migrate && pnpm db:seed` (admin, roles/permissions, reward rules, plans, badges, settings).
3. **Health**: `GET /health` → 200; Swagger at `/api/v1`.

### Third-party mock status

| Dependency | Local behavior | How you test it |
|---|---|---|
| **SMS (Twilio)** | `SMS_PROVIDER=log` — code → WORKER console **+** Redis | `GET /dev-tools/otp?dest=<phone>` |
| **Email (SendGrid)** | `EMAIL_PROVIDER=log` — same | `GET /dev-tools/otp?dest=<email>&channel=email` |
| **Video transcode (MediaConvert)** | `MEDIA_TRANSCODER=local` — marks asset **ready instantly** | complete upload → ready |
| **Media storage/delivery (S3/CloudFront)** | `MEDIA_*=local` — **no real file PUT needed** | request → complete → ready |
| **Payments (Stripe/IAP)** | `PAYMENT_PROVIDER=manual` — activates immediately | subscribe → active |
| **Push (FCM)** | not implemented — **in-app inbox only** | check inbox, not device push |
| **Social login (Google/Apple)** | needs real OAuth creds — **not mockable** | **skip**; use phone-OTP |

### Helpers
- **Admin**: `admin@example.com` / `Admin@123456` (seeded).
- **OTP retrieval**: `GET /dev-tools/otp?dest=<phone-or-email>[&channel=email]` → `{ code }`.
- **Async steps** (OTP, notification fan-out) run in the worker — if not there yet, wait ~5s and retry.
- **Envelope**: payload is under `data`; lists are `data.{ items, pagination }`; errors carry `error` + `traceId`.

---

# PART A — Admin builds the world

## A1. Admin auth & account `[Admin Auth]`
1. `POST /v1/admin/auth/login` `{ email, password }` → tokens (bearer if header `X-Client-Platform: mobile`, else cookies + CSRF).
2. `GET /v1/admin/auth/me` → identity + **roles & permissions** (drives which admin UI is allowed).
3. `POST /v1/admin/auth/refresh` (rotates), `POST /v1/admin/auth/logout`.
4. **Password reset**: `POST /v1/admin/auth/forgot-password` → `GET /dev-tools/otp?dest=admin@example.com&channel=email` → `POST /v1/admin/auth/reset-password`.

## A2. RBAC — permissions, roles, admins `[Admin · Permissions] [Admin · Roles] [Admin · Admins]`
1. `GET /v1/admin/permissions` — the full permission catalog (assignable to roles).
2. **Roles**: `GET /v1/admin/roles` → `POST /v1/admin/roles` (create a role with a permission set) →
   `GET /.../{id}` → `PATCH /.../{id}` (edit perms) → `DELETE /.../{id}`.
3. **Admin users**: `GET /v1/admin/admins` → `POST /v1/admin/admins` (invite/create an admin with a role) →
   `GET /.../{id}` → `PATCH /.../{id}` (change role/status) → `DELETE /.../{id}` (deactivate).
4. Verify: log in as the new admin (or inspect its `/me`) → it has exactly the granted permissions; a
   missing permission returns **403** on the relevant endpoint.

✅ RBAC catalog visible; role + admin CRUD works; permissions actually gate endpoints.

## A3. Content authoring pipeline `[Admin · Content Library] [Admin · Content] [Media]`
**Taxonomy** — create + keep ids: `POST /v1/admin/content/taxonomy/{studios|genres|tags|people}`
(`people` = cast/crew). List/`PATCH`/`DELETE` each to confirm CRUD.

**Media upload (video + thumbnail):**
1. `POST /v1/media/uploads`
   ```jsonc
   { "mediaType": "video", "usageType": "content_video",
     "filename": "trailer.mp4", "mimeType": "video/mp4", "sizeBytes": 524288000 }
   ```
   → `{ mediaId, status, upload: { url, method, headers } }`. **Local: no real PUT needed.**
2. `POST /v1/media/{mediaId}/complete` `{ }` → transcode submitted → **ready instantly** (local stub).
   Poll `GET /v1/media/{mediaId}` (→ `ready`); `GET /v1/media/{mediaId}/events` (lifecycle log).
3. Repeat for a thumbnail: `{ "mediaType": "image", "usageType": "content_thumbnail", "filename": "thumb.jpg", "mimeType": "image/jpeg", "sizeBytes": 80000 }`.

**Create + enrich + publish:**
4. `POST /v1/admin/content` (draft):
   ```jsonc
   { "title": "Neon Nights — Trailer", "contentType": "trailer", "accessTier": "free",
     "studioId": "<id>", "videoMediaId": "<id>", "thumbnailMediaId": "<id>",
     "language": "en", "rightsRegion": "global" }
   ```
   Make at least one **`exclusive`** item too (`"accessTier": "exclusive", "unlockPoints": 50`).
5. **Enrich**: `PUT /v1/admin/content/{id}/cast` `{ cast:[{ personId, role, characterName, billingOrder }] }`;
   `PUT /.../license`; `PUT /.../sponsorship`; `PUT /.../regions` `{ regions:["NA","EU"] }`; `PATCH /v1/admin/content/{id}` (edit).
6. **Workflow**: `POST /.../submit` (draft→pending) → `POST /.../publish` (or `/schedule {scheduledAt}` / `/reject {reason}` / `/archive`).
   `POST /.../boost { boosted:true, priority:100 }`. Audit: `GET /.../history`.
7. **Directory**: `GET /v1/admin/content` (paginated; filter status/type/studio/search); `GET /v1/admin/content/{id}` (full + `cast[]`).
   Publish **several free + one exclusive** so the feed has data. `DELETE /v1/admin/content/{id}` (soft-delete) on a throwaway.

✅ Media reaches `ready`; draft → published; content visible with cast.

## A4. Economy config `[Admin · Tokenomics] [Admin · Badges]`
1. **Reward rules** (how earning works): `GET /v1/admin/rewards/rules` → `GET /.../{ruleKey}` →
   `PATCH /v1/admin/rewards/rules/{ruleKey}` (tune points/xp/caps) → `GET /.../{ruleKey}/versions` (version history).
2. **Leveling curve**: `GET /v1/admin/leveling` → `PUT /v1/admin/leveling` (adjust XP thresholds).
3. **Badges**: `GET /v1/admin/badges` + `GET /v1/admin/badges/triggers` → `POST /v1/admin/badges` (create) →
   `PATCH /.../{id}` → `DELETE /.../{id}`.

✅ Earning/leveling/badges are configurable; rule edits create new versions.

## A5. Monetization config `[Admin · Subscriptions] [Admin · Rewards Store]`
1. **Plans**: `GET /v1/admin/subscriptions/plans` → create/edit a plan → `PUT /v1/admin/subscriptions/plans/{id}/region-price`.
2. **Rewards store catalog**: `GET /v1/admin/rewards/catalog` → `POST` a redeemable item (points cost, stock, region) if empty → `PATCH` to edit.

✅ At least one plan (with region price) + one catalog item exist.

## A6. Games authoring `[Admin · Games]`
For **each** game type, create and open:
- **Quest**: `POST /v1/admin/quests` (link content + reward) → `POST /.../{id}/activate`. (`PATCH`, `/end`, `/cancel`, `DELETE` to exercise the rest.)
- **Prediction**: `POST /v1/admin/predictions` (question + ≥2 options + entry cost/payout). (Keep open for now.)
- **Auction**: `POST /v1/admin/auctions` → `POST /.../{id}/open`.
- **Overview**: `GET /v1/admin/games/instances` (union across types) + `GET /v1/admin/games/types`.

✅ One open quest, prediction, and auction exist for customers to play.

## A7. Platform config `[Admin · Settings] [Admin · Notifications]`
1. **Settings**: `GET/PATCH /v1/admin/settings/feature-flags`; `GET/PUT /v1/admin/settings/app-version` (force-update gates).
2. **Notification authoring** (send happens in Part C): `POST /v1/admin/notifications/campaigns` (draft) → `GET /v1/admin/notifications/campaigns`.

✅ Feature flags + version gates set; a draft campaign exists.

---

# PART B — Customer lives in it

## B1. Onboarding `[Customer Auth] [Me] [Profile] [Devices]`
1. **Guest**: `POST /v1/auth/guest` → guest tokens (save `guestToken`).
2. **Phone OTP**: `POST /v1/auth/phone/otp { phone }` → `otpToken`; fetch `GET /dev-tools/otp?dest=<phone>`;
   `POST /v1/auth/phone/verify { otpToken, code, guestToken }` → **customer** tokens (guest activity carries over).
   *(Social login `GET /v1/auth/social/{google|apple}` — skip locally; needs real OAuth.)*
3. **Complete profile**: `POST /v1/auth/profile` (username/name) — driven by `isNewUser`/`needsUsername`.
4. **Bootstrap**: `GET /v1/me` → profile, wallet (`coins`+level), streak, subscription, `unreadNotifications`, leaderboard rank, `access`.
5. **Profile**: `GET /v1/profile`; `PATCH /v1/profile` (edit incl. **email** — stored unverified); `GET /v1/profile/referral` (my code + count).
6. **Device registration** (push token): `POST /v1/devices { fcmToken, platform }` → `GET /v1/devices` → `DELETE /v1/devices/{fcmToken}`.

✅ Guest→customer upgrade works; `/me` hydrates; profile editable; device + referral available.

## B2. Content discovery & playback `[Content] [Content · Taxonomy] [Content · Access] [Engagement · Views] [Media]`
1. **Feed + filters**: `GET /v1/content` (feed); `GET /v1/content/taxonomy/genres` + `/tags` (filter chips).
2. **Detail**: `GET /v1/content/{id}` → includes **`cast[]`**.
3. **Access**: `GET /v1/content/{id}/entitlement`; for exclusive: `POST /v1/content/{id}/unlock` (spends points — revisit after B4 when you have points) → entitlement flips.
4. **Playback**: `GET /v1/media/{videoMediaId}/playback` → signed HLS descriptor.
5. **View session + progress**: `POST /v1/content/{id}/views` (start → `viewId`) → `PATCH /v1/content/{id}/views/{viewId}` (heartbeat: watchedSeconds/position) → `POST /v1/content/{id}/watch-events` (play/pause/seek/complete) → `GET /v1/content/{id}/progress` (resume point).

✅ Feed shows published content; detail has cast; watch tracking + resume work; exclusive unlock works.

## B3. Engagement `[Engagement · Reactions] [Engagement · Comments] [Engagement · Shares] [Engagement · Watchlist]`
1. **Reactions**: `GET /v1/content/{id}/reaction` → `PUT /v1/content/{id}/reaction { reaction:"like" }` (or dislike; switch) → `DELETE` to clear. Counts update.
2. **Comments**: `POST /v1/content/{id}/comments` → `GET /v1/content/{id}/comments` (paginated); reply `POST /v1/comments/{id}/replies` → `GET /v1/comments/{id}/replies`; react `PUT /v1/comments/{id}/reaction`; `DELETE /v1/comments/{id}`; **report** `POST /v1/comments/{id}/report` (→ ticketId, feeds Part C moderation).
3. **Shares**: `POST /v1/content/{id}/share` → share count increments.
4. **Watchlist**: `PUT /v1/watchlist/{contentId}` → `GET /v1/watchlist` (paginated) → `DELETE /v1/watchlist/{contentId}`.

✅ All engagement counters move; comment thread + replies + reactions + report work; watchlist add/remove.

## B4. Earning & daily streak `[Earn] [Profile] [Games · Daily Streak]`
1. **Earn**: `GET /v1/earn/rules` (what earns what); `POST /v1/earn/daily-login`. Engagement in B2/B3 also awards via reward rules.
2. **Wallet & ledger**: `GET /v1/profile/wallet` (`coins`, XP, level); `GET /v1/profile/earns` (paginated append-only ledger).
3. **Streak**: `POST /v1/games/streak/check-in` (extends + rewards) → `GET /v1/games/streak?month=YYYY-MM` → `currentStreak`, `milestones`, **`history[]` calendar** (today qualified).
4. Revisit **B2.3 unlock** now that you have points.

✅ Wallet reflects earnings; ledger append-only; streak calendar shows the check-in.

## B5. Games — play `[Games · Quests] [Games · Predictions] [Games · Bidding]`
1. **Quests**: `GET /v1/quests` → `GET /v1/quests/{id}` → `POST /v1/quests/{id}/contents/{contentId}/complete` (progress) → `POST /v1/quests/{id}/claim` (reward).
2. **Predictions**: `GET /v1/predictions` (+ `GET /v1/predictions/entitlement` → `viewsUsed/viewsAllowed`, free cap); `GET /v1/predictions/{id}`; `POST /v1/predictions/{id}/enter` (stakes points). *(Resolution = Part C1.)*
3. **Auctions**: `GET /v1/auctions` → `GET /v1/auctions/{id}` → `POST /v1/auctions/{id}/bid` (holds points). *(Settlement = Part C1.)*

✅ Quest claim pays out; prediction entry stakes + allowance enforced; bid holds points.

## B6. Progression `[Leveling] [Leaderboard] [Badges]`
1. `GET /v1/levels` (curve); after earning XP, `GET /v1/me` shows level progress.
2. `GET /v1/leaderboard?month=YYYY-MM` → ranked page (`{ items, pagination }`) + `myRank`.
3. `GET /v1/badges` (catalog with `earned` flag) + `GET /v1/badges/me` (my earned badges — triggers may have fired from B-activity).

✅ Level derived from XP; leaderboard lists the customer; badges reflect earned triggers.

## B7. Rewards redemption `[Rewards Store]`
1. `GET /v1/rewards/catalog` (paginated, region-filtered) → `POST /v1/rewards/catalog/{itemId}/redeem` (spends points) → `GET /v1/rewards/redemptions`. *(Fulfillment = Part C6.)*

✅ Redemption debits points and appears in my redemptions.

## B8. Subscriptions `[Subscriptions]`
1. **Overview**: `GET /v1/subscriptions/overview` (current plan + all options with upgrade/downgrade/cancel eligibility); `GET /v1/subscriptions/me`; `GET /v1/subscriptions/plans`.
2. **Subscribe**: `POST /v1/subscriptions/subscribe { planId }` → **manual provider activates immediately**; `GET /v1/me` → `access.tier` = **premium**; `GET /v1/subscriptions/invoices` (paginated).
3. **Change/cancel**: `POST /v1/subscriptions/change-plan`; `POST /v1/subscriptions/cancel`.

✅ Subscribing flips premium access; invoices recorded; change/cancel work.

## B9. Notifications inbox `[Profile · Notifications]`
`GET /v1/profile/notifications` (paginated) → `GET /v1/profile/notifications/unread-count` → `POST /v1/profile/notifications/{id}/read` → `POST /v1/profile/notifications/read-all`. *(Messages arrive after Part C4.)*

## B10. Telemetry `[Events]`
`GET /v1/events/catalog` (valid event names) → `POST /v1/events` (batch of `AppEventName` events: `screen_view`, `video_play`, `prediction_entered`…) → **202**; an unknown name → **400**.

✅ Events ingest; catalog enforced.

---

# PART C — Admin operates the business
*(Requires the customer activity created in Part B.)*

## C1. Resolve games `[Admin · Games]`
1. **Prediction**: `POST /v1/admin/predictions/{id}/lock` → `POST /.../{id}/resolve { correctOptionId }` → correct stakers paid (re-check customer wallet + `GET /v1/predictions/{id}` result). `/cancel` refunds.
2. **Auction**: `POST /v1/admin/auctions/{id}/settle` → winner charged, losers refunded. `/cancel` refunds all.
3. **Quest**: `POST /v1/admin/quests/{id}/end` (or `/cancel`).

✅ Resolution pays out/refunds correctly on the customer side.

## C2. Moderation `[Admin · Moderation] [Admin · Comment Moderation]`
1. **Ticket queue** (fed by B3 report): `GET /v1/admin/moderation/tickets` (paginated) → `GET /.../{id}` → `POST /.../{id}/assign` → `PATCH /.../{id}/status` → `POST /.../{id}/resolve`. `GET /v1/admin/moderation/stats`.
2. **Comment moderation**: `GET /v1/admin/comments/reports` → `PATCH /v1/admin/comments/reports/{id}/resolve` → `PATCH /v1/admin/comments/{id}/status` (hide/restore). Confirm hidden comment disappears from the customer thread.

✅ Report → ticket → resolve; comment hide/restore reflects to customers.

## C3. Customer management `[Admin · Customers] [Admin · Customer Profile] [Admin · Tokenomics]`
1. **Directory**: `GET /v1/admin/users` (paginated) → `GET /v1/admin/users/{id}` → `PATCH /v1/admin/users/{id}`.
2. **Customer-360**: `GET /v1/admin/users/{id}/{watch-history|referrals|games|reports}` (paginated); `PUT /v1/admin/users/{id}/roles`; `POST /v1/admin/users/{id}/warn`.
3. **Manual points**: `POST /v1/admin/users/{id}/points-adjust` (credit/debit points or XP) → reflects in the customer wallet/ledger.
4. **Enforcement**: `POST /v1/admin/users/{id}/suspend` → the customer's next request is rejected by the status guard; `POST /.../ban`; `POST /.../reinstate` restores access.

✅ Admin sees full customer activity; manual points adjust the ledger; suspend/ban/reinstate gate the customer.

## C4. Notification fan-out `[Admin · Notifications]`
`POST /v1/admin/notifications/campaigns/{id}/send` (or `POST /v1/admin/notifications/broadcast`) → status `sending` → worker fans out → `sent` (poll `GET /v1/admin/notifications/campaigns/{id}`). Confirm the message appears in the customer inbox (B9). `/cancel` a draft.

✅ Campaign → `sent`; message lands in the customer inbox (exercises the SQS fan-out).

## C5. Subscription ops `[Admin · Subscriptions]`
`GET /v1/admin/subscriptions/subscribers` (paginated) → `GET /.../subscribers/{id}` → `POST /.../subscribers/{id}/cancel`; `GET /.../transactions` (paginated); `POST /.../invoices/{id}/refund`.

✅ Admin sees the subscriber + transaction from B8; cancel/refund work.

## C6. Rewards fulfillment `[Admin · Rewards Store]`
`GET /v1/admin/rewards/redemptions` (paginated) → `PATCH /v1/admin/rewards/redemptions/{id}/fulfill` (or `/cancel` → refunds points to the customer).

✅ The B7 redemption transitions to fulfilled (or cancel refunds).

## C7. Analytics & telemetry `[Admin · Analytics] [Admin · Events]`
`GET /v1/admin/analytics/{users|subscriptions|games|realtime|licensing}` (dashboards reflect Part B activity);
`GET /v1/admin/events` (recent stream) + `GET /v1/admin/events/top` (volume from B10).
Also `GET /v1/admin/leaderboard` + `GET /v1/admin/leveling` (admin read views).

✅ Dashboards + event stream reflect the journey.

---

## Auth lifecycle to verify throughout
- **Refresh rotation**: `POST /v1/auth/refresh` → the old refresh token is invalidated.
- **Logout**: `POST /v1/auth/logout` and `POST /v1/auth/logout-all`.
- **Guest→customer carryover** (B1): wallet/streak/watchlist from the guest persist on the account.
- **Status enforcement** (C3): suspended/banned customers are blocked; reinstated customers regain access.

## What to watch
- **WORKER pane**: OTP (`📱 [DEV-SMS]`), email (`✉️ [DEV-EMAIL]`), job processing. Stuck? check ElasticMQ `:9326` is draining.
- **Envelope**: payload under `data`; lists `data.{ items, pagination }`; `403` = wrong account type / missing permission; `401` = refresh.

## Known local limitations
- **Social login (Google/Apple)** — real OAuth only; use phone-OTP.
- **Push notifications** — not implemented; verify the in-app inbox.
- Real SMS/email/transcode/payments are mocked — switch the `*_PROVIDER` / `MEDIA_*` envs to live values to test against real services in stage.

---

### Coverage map (all 44 API tag groups)
**Admin:** Auth (A1) · Permissions/Roles/Admins (A2) · Content Library/Content/Media (A3) · Tokenomics/Badges (A4, C3, C7) · Subscriptions (A5, C5) · Rewards Store (A5, C6) · Games (A6, C1) · Settings/Notifications (A7, C4) · Moderation/Comment Moderation (C2) · Customers/Customer Profile (C3) · Analytics/Events (C7).
**Customer:** Customer Auth/Me/Profile/Devices (B1) · Content/Content·Taxonomy/Content·Access/Engagement·Views/Media (B2) · Engagement Reactions/Comments/Shares/Watchlist (B3) · Earn/Daily Streak (B4) · Quests/Predictions/Bidding (B5) · Leveling/Leaderboard/Badges (B6) · Rewards Store (B7) · Subscriptions (B8) · Profile·Notifications (B9) · Events (B10).
