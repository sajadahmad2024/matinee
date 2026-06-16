# Frontend Integration Guide (Admin Web + Mobile)

How the **admin web portal** (`apps/web`) and the **mobile app** (Flutter) integrate with the
Matinee backend API. This is the cross-cutting contract that Swagger alone doesn't explain:
SDK generation, the response envelope, auth/session handling, account-type gating, and the key
integration patterns. Endpoint-level detail lives in Swagger / the OpenAPI spec.

---

## 1. Base URLs & versioning

| Environment | API base |
|---|---|
| Local | `http://localhost:3000` |
| Stage / Prod | env-specific host |

- All business endpoints are **URI-versioned** under `/v1` (e.g. `POST /v1/auth/phone/otp`).
- Infrastructure endpoints (`/health`, `/metrics`) are version-neutral and **not** part of the app contract.
- Interactive docs: `GET /api/v1` (Swagger UI). Machine spec: `GET /api/v1-json`.

---

## 2. SDK generation — the primary integration mechanism

**Do not hand-write API clients.** Generate a typed SDK from the OpenAPI spec and regenerate on
every backend change. Every one of the ~238 operations has a typed request + response, and
key value sets (e.g. the telemetry event catalog) are emitted as **named enums**, so the SDK is
fully type-bound.

```bash
# Spec source of truth
curl http://localhost:3000/api/v1-json -o openapi.json
```

- **Admin web (TypeScript)** — generate a TS client (e.g. `openapi-typescript-codegen`,
  `orval`, or `openapi-generator` `typescript-fetch`/`typescript-axios`).
- **Mobile (Flutter/Dart)** — generate a Dart client (e.g. `openapi-generator` `dart-dio`).

Named enums you get for free (bind to these, never to raw strings):

- `AppEventName` / `AppEventType` — the canonical telemetry event catalog (see §8).
- Account types, statuses, content tiers, etc. are emitted as enum schemas where defined.

**Workflow:** backend merges → CI publishes `openapi.json` → frontend regenerates SDK → typed
compile errors surface any breaking change before runtime.

---

## 3. Response envelope

Every JSON response is wrapped by a global interceptor in a consistent envelope:

```jsonc
{
  "statusCode": 200,
  "status": "Success",            // "Success" | "Failure"
  "message": "Request successful",
  "data": { /* the typed payload — this is what your SDK binds */ },
  "error": null                    // populated object on failure
}
```

- **Always read `data`** for the payload. The generated SDK already maps `data` to the typed model.
- On error, `status` = `"Failure"`, `data` = `null`, `error` carries details, and a `traceId`
  is included for support/correlation.

### Pagination

List endpoints return a **paginated** payload inside `data`:

```jsonc
{
  "data": {
    "items": [ /* Dto[] */ ],
    "pagination": { "pageNo": 1, "pageSize": 20, "totalCount": 137, "totalPages": 7 }
  }
}
```

Drive list UI from `data.pagination`. Non-paginated list endpoints (small reference sets like
genres, badges, plans) return `data` as a **bare array** — the SDK types reflect which is which.

### Errors & status codes

| Code | Meaning | Frontend action |
|---|---|---|
| `400` | Validation / bad input | Show field errors from `error` |
| `401` | Missing/expired token | Refresh once, else send to login |
| `403` | Authenticated but not allowed (wrong account type or missing permission) | Hide/disable the action |
| `404` | Not found | Standard not-found UI |
| `409` | Conflict (e.g. duplicate email, already entered) | Surface the conflict message |
| `429` | Rate limited | Back off / retry-after |
| `5xx` | Server error | Generic error + `traceId` for support |

---

## 4. Auth & sessions (dual-channel)

The backend supports **two delivery channels** for the same JWT pair, chosen by client:

- **Web (cookie channel)** — tokens set as `httpOnly` cookies + a readable `csrf` cookie.
  Used by the **admin portal**. Requires CSRF handling (see §9).
- **Mobile (bearer channel)** — `accessToken` + `refreshToken` returned in the response **body**;
  client stores them and sends `Authorization: Bearer <accessToken>`. Used by the **mobile app**.

Admin defaults to the cookie channel; send header **`X-Client-Platform: mobile`** to opt an admin
client into the bearer channel. Customer endpoints return bearer tokens in the body by default.

- **Access token**: short-lived (~15 min). **Refresh token**: long-lived, **rotated** on refresh.
- **Sliding renewal**: an interceptor may issue a fresh access token mid-session on active use.
- Token claims are self-contained (account type, roles, permissions) so the API authorizes with
  crypto only — no per-request DB lookup.

---

## 5. Account types & authorization

Three account types gate every route:

| Type | Who | Typical surface |
|---|---|---|
| `guest` | Anonymous, pre-signup (bootstrapped) | Browse + limited customer endpoints |
| `customer` | Signed-up end user | Full mobile app |
| `admin` | Back-office user | Admin portal |

- Routes are tagged `@Public` (no auth), customer-only, guest-or-customer, or admin-only.
- Admin routes additionally require **fine-grained permissions** (e.g. `content:write`,
  `users:read`, `billing:read`). A `403` means the admin lacks that permission — reflect it by
  hiding the control. The admin `GET /v1/admin/auth/me` returns the admin's `roles` + `permissions`
  so the portal can render only the allowed UI.

---

## 6. App-open bootstrap (mobile)

On launch, call **one** endpoint instead of many:

```
GET /v1/me        # CustomerOrGuest
```

Returns `profile`, `wallet` (incl. `coins` + level), `streak`, current `subscription`,
`unreadNotifications`, monthly `leaderboard` rank, and an `access` block
(`{ isSubscribed, tier, planName }`) used to gate premium. Hydrate the whole shell from this.

---

## 7. Customer auth flows (mobile)

```
POST /v1/auth/guest              # bootstrap an anonymous guest → tokens
POST /v1/auth/phone/otp          # request OTP (SMS via Twilio; returns an otpToken)
POST /v1/auth/phone/verify       # verify { otpToken, code } → customer tokens
GET  /v1/auth/social/google      # OAuth redirect (browser)  ─┐ callbacks return/redirect
GET  /v1/auth/social/apple       # OAuth redirect (browser)  ─┘ with the session
POST /v1/auth/profile            # complete profile / set username (first-time customers)
POST /v1/auth/refresh            # rotate tokens
GET  /v1/auth/me                 # current customer/guest
POST /v1/auth/logout | logout-all
```

**Guest → customer upgrade:** bootstrap a guest first; when the user verifies a phone or completes
social login, pass the existing `guestToken` so their guest activity (wallet, streak, watchlist)
carries over to the customer account. Use `isNewUser` / `needsUsername` in the auth response to
route to the create-account screen.

---

## 8. Cross-cutting patterns

### Telemetry / analytics events
Post user interaction events to the single ingestion seam — analytics **and** several game signals
key off these:

```
POST /v1/events            # CustomerOrGuest; batch up to 200; fire-and-forget (202)
GET  /v1/events/catalog    # the canonical event list (name → category)
```

- Send only `eventName` (a value from the **`AppEventName`** enum your SDK binds) + optional
  `contentId` / `properties` / `occurredAt`. The backend derives the category — never send it.
- Unknown event names are **rejected (400)**; the enum makes that a compile-time guarantee in a
  typed SDK. To add an event, the backend extends the enum and you regenerate the SDK.

### Media: upload → playback
- **Admin upload:** `POST /v1/media/uploads` → presigned target → upload bytes →
  `POST /v1/media/{id}/complete`. Transcoding runs in the background; poll
  `GET /v1/media/{id}` (or `/{id}/events`) until status is ready.
- **Playback:** `GET /v1/media/{id}/playback` returns a signed HLS descriptor. Media reads require
  a valid token (any account type); content-tier gating happens at the content/access layer.

### Polling patterns (no websockets)
- **Notification campaign send** flips status `sending → sent`; poll the campaign.
- **Media transcode** is async; poll media status.
- **Leaderboard** is cached short-term; treat as near-real-time, not instantaneous.

### Content access / unlock (mobile)
- `GET /v1/content/:id/entitlement` tells you lock state; exclusive content unlocks via
  `POST /v1/content/:id/unlock` (spends points). Subscribers gate premium via the `/me` `access` block.

---

## 9. Admin Web portal — integration notes

- **Channel:** cookie-based. `POST /v1/admin/auth/login` sets `httpOnly` access/refresh cookies +
  a readable `csrf` cookie.
- **CSRF:** for mutating requests (`POST/PUT/PATCH/DELETE`), read the `csrf` cookie and send it back
  in the request header the CSRF guard expects. Send cookies with requests (`withCredentials`/
  `credentials: 'include'`).
- **Auth lifecycle:** `login` → `refresh` (rotates) → `logout` (clears cookies). `forgot-password`
  / `reset-password` use an emailed 6-digit code (SendGrid).
- **Authorization-driven UI:** read `GET /v1/admin/auth/me` → `permissions`; render only allowed
  actions. Expect `403` to be possible even on rendered controls (defense in depth).
- **Surface (admin tag groups):** `Admin Auth`, `Admin · Admins/Roles/Permissions`,
  `Admin · Content` / `Content Library`, `Admin · Customers` / `Customer Profile`,
  `Admin · Subscriptions`, `Admin · Rewards Store`, `Admin · Tokenomics`, `Admin · Badges`,
  `Admin · Games`, `Admin · Moderation` / `Comment Moderation`, `Admin · Analytics`,
  `Admin · Notifications`, `Admin · Settings`, `Admin · Events`, `Media`.
- **Pagination:** admin tables are server-paginated — drive from `data.pagination`.

---

## 10. Mobile app — integration notes

- **Channel:** bearer. Store `accessToken` + `refreshToken` securely; send
  `Authorization: Bearer <accessToken>`; on `401`, call `refresh` once then retry, else re-auth.
- **Launch:** guest bootstrap (if no token) → `GET /v1/me` to hydrate the shell.
- **Auth:** phone OTP (Twilio) and Google/Apple; carry `guestToken` through upgrade (§7).
- **Telemetry:** batch-post `AppEventName` events as the user navigates (§8) — these power
  analytics and game/streak signals.
- **Surface (customer tag groups):** `Customer Auth`, `Me`, `Profile` / `Profile · Notifications`,
  `Content` / `Content · Access` / `Content · Taxonomy`, `Engagement · Reactions/Comments/Shares/
  Watchlist/Views`, `Earn`, `Leaderboard`, `Leveling`, `Badges`, `Rewards Store`,
  `Games · Quests/Predictions/Bidding/Daily Streak`, `Subscriptions`, `Events`, `Devices`, `Media`.
- **Subscriptions:** `GET /v1/subscriptions/...` returns the customer's current plan + all options
  with per-option upgrade/downgrade/cancel eligibility in one call; billing runs through an
  env-selected payment provider (manual / Stripe / in-app purchase) — the client flow is the same.
- **Pagination:** infinite-scroll lists read `data.pagination`.

---

## 11. Environment & provider config (no code change)

The backend is env-driven; the same build runs local → stage → prod by config only:

- **Email:** `EMAIL_PROVIDER=sendgrid` + `SENDGRID_API_KEY` (transactional email, e.g. admin OTP).
- **SMS:** `SMS_PROVIDER=twilio` + Twilio creds (phone OTP). Sent off the request path via a worker.
- **Queue/Cache:** SQS (ElasticMQ local → AWS SQS) and Redis (local → ElastiCache) switch by env.

Frontend impact: none beyond the API base URL — behavior and contracts are identical across
environments.

---

## 12. Checklist for a new frontend integration

1. Point at the right API base; confirm `/api/v1` loads.
2. Generate the SDK from `/api/v1-json`; wire regeneration into CI.
3. Implement the auth channel for your app (cookie+CSRF for web, bearer for mobile).
4. Centralize envelope unwrapping (`data`) + error handling (`status`/`error`/`traceId`) + `401`
   refresh-once logic.
5. Drive lists from `data.pagination`.
6. Gate UI by account type / admin permissions.
7. Wire telemetry (`AppEventName`) and, on mobile, the `/me` bootstrap.
