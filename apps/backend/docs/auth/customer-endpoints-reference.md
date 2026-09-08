# Customer Auth & Profile — Endpoint Reference

> Fully-spec'd request/response for every endpoint the mobile app hits during signup,
> login, profile edit, verification and referral. Base URL: `http://localhost:3000`.
> All business routes are `/v1/...`.
>
> **Response envelope** — every response is wrapped by `TransformInterceptor`:
> ```jsonc
> { "statusCode": 200, "status": "Success", "message": "...", "data": <payload>, "error": null }
> ```
> Only `data` is shown below.

---

## Endpoint index

| # | Method | Path | Screen | Auth |
|---|---|---|---|---|
| 1 | POST | `/v1/auth/guest` | App open (pre-auth) | Public |
| 2 | GET | `/v1/auth/username/available` | Create Account (live check) | Public |
| 3 | POST | `/v1/auth/phone/otp` | Sign In → Get OTP | Public |
| 4 | POST | `/v1/auth/phone/verify` | Verify OTP → Continue | Public |
| 5 | GET | `/v1/auth/social/google` | Sign In → Continue with Google | Public (302) |
| 6 | GET | `/v1/auth/social/google/callback` | Google redirect target | Public (302) |
| 7 | POST | `/v1/auth/profile` | Create Account → Create Account button | Customer Bearer |
| 8 | GET | `/v1/auth/me` | Any authed refetch | Guest or Customer |
| 9 | GET | `/v1/me` | App-open bootstrap | Guest or Customer |
| 10 | GET | `/v1/profile` | Profile screen | Customer Bearer |
| 11 | PATCH | `/v1/profile` | Edit Profile → Save Changes | Customer Bearer |
| 12 | GET | `/v1/profile/wallet` | Points display | Customer Bearer |
| 13 | GET | `/v1/profile/earns` | My Earns screen | Customer Bearer |
| 14 | GET | `/v1/profile/referral` | Refer a Friend modal | Customer Bearer |
| 15 | GET | `/v1/profile/notifications` | Notifications screen | Customer Bearer |
| 16 | POST | `/v1/profile/notifications/:id/read` | Mark as read | Customer Bearer |
| 17 | POST | `/v1/profile/notifications/read-all` | Mark all as read | Customer Bearer |
| 18 | GET | `/v1/profile/notifications/unread-count` | Bell badge | Customer Bearer |
| 19 | POST | `/v1/profile/email/verify/request` | Edit Profile → Verify email | Customer Bearer |
| 20 | POST | `/v1/profile/email/verify/confirm` | Enter code → Verify | Public (otpToken IS auth) |
| 21 | POST | `/v1/auth/refresh` | Silent token renewal | Public |
| 22 | POST | `/v1/auth/logout` | Log out button | Guest or Customer |
| 23 | POST | `/v1/auth/logout-all` | Sign out of all devices | Guest or Customer |

---

## 1. `POST /v1/auth/guest` — Bootstrap anonymous guest

**Purpose:** issue tokens the mobile app can use before signup so it can browse feeds, hold a `guestToken` to link during signup.

| | |
|---|---|
| Auth | `@Public` |
| Headers | `Content-Type: application/json` (optional — body empty) |
| Body | — |

**Response 201:**
```jsonc
{
  "accessToken": "eyJ...",           // JWT, act='guest', 15m
  "refreshToken": "eyJ...",          // JWT, 60d
  "user": {
    "id": "01a0...", "accountType": "guest",
    "email": null, "phone": null, "username": null, ...
  },
  "isNewUser": true,
  "needsProfile": false
}
```

---

## 2. `GET /v1/auth/username/available?username=<name>` — Availability check

**Purpose:** debounced pre-check on the Create Account screen (green/red feedback while typing).

| | |
|---|---|
| Auth | `@Public` |
| Throttle | 30 / min |
| Query | `username` — 3–50 chars, `[a-zA-Z0-9_.]` |

**Response 200:**
```jsonc
{ "available": true }   // or false
```

**Errors:**
- `400` — invalid format (charset / length)

---

## 3. `POST /v1/auth/phone/otp` — Request phone OTP

**Purpose:** Sign In → "Get OTP" button. Issues a signed challenge JWT bound to the phone.

| | |
|---|---|
| Auth | `@Public` |
| Throttle | 5 / min short + 20 / 30min long |
| Headers | `Content-Type: application/json` |
| Body | `{ "phone": "+919876543210" }` (E.164) |

**Response 200:**
```jsonc
{
  "delivery": "sent",              // 'sent' (Twilio) OR 'client_managed' (Firebase)
  "otpToken": "eyJ..."             // pass back to /phone/verify — 10m TTL
}
```

**Errors:**
- `400` — `phone must be in E.164 format (e.g. +919876543210)`
- `429` — rate limited

---

## 4. `POST /v1/auth/phone/verify` — Verify OTP → issue session tokens

**Purpose:** Verify OTP → Continue button. Accepts either a Twilio-style 6-digit code OR a Firebase ID token. Creates/upgrades/merges the user as needed.

| | |
|---|---|
| Auth | `@Public` |
| Throttle | 10 / min |
| Headers | `Content-Type: application/json` |

**Body** — one of `code` or `firebaseToken` must be present:
```jsonc
{
  "otpToken":     "eyJ...",       // from /phone/otp — required
  "code":         "123456",       // Twilio path
  "firebaseToken": "eyJ...",      // Firebase path
  "guestToken":   "eyJ..."        // optional — links a guest session
}
```

**Response 200:**
```jsonc
{
  "accessToken":  "eyJ...",
  "refreshToken": "eyJ...",
  "user": { /* full UserDto with accountType='customer' */ },
  "isNewUser":     true,
  "needsProfile":  true            // true → route to Create Account
}
```

**Errors:**
- `400` — `OTP code is required` (Twilio path, missing code) / `firebaseToken is required` (Firebase path)
- `401` — `OTP session is invalid or expired`, or Firebase token has no phone number

---

## 5. `GET /v1/auth/social/google` — Start Google sign-in

**Purpose:** Sign In → "Continue with Google" button. Redirects to Google consent.

| | |
|---|---|
| Auth | `@Public` |
| Query | `guestToken?` (link), `redirect?` (deep link back to app) |

**Response 302:** `Location: https://accounts.google.com/o/oauth2/v2/auth?...&state=<signed>`

---

## 6. `GET /v1/auth/social/google/callback` — Google callback

**Purpose:** Google redirects here after consent. Server exchanges code, resolves the user, redirects back to the app with tokens in the URL fragment.

| | |
|---|---|
| Auth | `@Public` |
| Query | `code`, `state` |

**Response 302:** `Location: <app-redirect>#accessToken=...&refreshToken=...&isNewUser=...&needsProfile=...`

Tokens are in the **fragment** (not query) — they never hit server logs.

Apple has an equivalent at `/v1/auth/social/apple` + `POST /v1/auth/social/apple/callback` (Apple uses form_post).

---

## 7. `POST /v1/auth/profile` — Complete profile (username + optional referral)

**Purpose:** Create Account → "Create Account" button. One-time write for identity fields.

| | |
|---|---|
| Auth | `@CustomerOnly` — Bearer required |
| Headers | `Authorization: Bearer <accessToken>`, `Content-Type: application/json` |

**Body:**
```jsonc
{
  "username":     "madison",          // required — 3-50 chars [a-zA-Z0-9_.]
  "referralCode": "X5J7T0LE",         // optional — someone else's code
  "fullName":     "Madison Smith",    // optional — split into first/last
  "gender":       "female"            // optional — male|female|other|prefer_not_to_say
}
```

**Response 200:** full `UserDto` (id, accountType, username, firstName/lastName, ...).

**Effects on the DB:**
- `users.username` set
- `referral_codes` row created for this user (if not already — 8-char alphanumeric UPPER)
- If `referralCode` provided: `referral_redemptions` row `{ code, referrer_id, referee_id, status: 'pending' }`

**Errors:**
- `400` — `Invalid referral code` / `You cannot use your own referral code`
- `409` — `Username already taken`

---

## 8. `GET /v1/auth/me` — Current authenticated user (light)

**Purpose:** cheap refetch of the current user record. Guest or customer.

| | |
|---|---|
| Auth | `@CustomerOrGuest` |
| Headers | `Authorization: Bearer <accessToken>` |

**Response 200:** minimal `UserDto`.

---

## 9. `GET /v1/me` — App-open bootstrap (one call, everything)

**Purpose:** called on app launch. Returns profile + wallet + streak + subscription + unread notifications + leaderboard rank + subscription-gated access map — all in one shot.

| | |
|---|---|
| Auth | `@CustomerOrGuest` |
| Headers | `Authorization: Bearer <accessToken>` |

**Response 200:**
```jsonc
{
  "profile":  { id, accountType, email, phone, username, ... },
  "wallet":   { pointsBalance, pointsEarnedLifetime, xpTotal, level, currentLevelXp, nextLevelXp, ... },
  "streak":   { currentStreak, longestStreak, totalQualifiedDays, lastQualifiedDate },
  "subscription": { plan, status, currentPeriodEnd, ... } | null,
  "unreadNotifications": 0,
  "leaderboard": { rank: 260, xpEarned: ... } | null,
  "access": { isSubscribed, features: [ ... ] }
}
```

---

## 10. `GET /v1/profile` — Profile screen composite

**Purpose:** Profile tab. Identity + wallet + streak + subscription + unread — same as `/v1/me` minus access map (cheaper, cached).

| | |
|---|---|
| Auth | `@CustomerOnly` |
| Headers | `Authorization: Bearer <accessToken>` |

**Response 200:** `ProfileScreenDto`.

---

## 11. `PATCH /v1/profile` — Edit profile (partial update)

**Purpose:** Edit Profile → Save Changes.

| | |
|---|---|
| Auth | `@CustomerOnly` |
| Headers | `Authorization: Bearer <accessToken>`, `Content-Type: application/json` |

**Body** — all fields optional, only provided ones are written:
```jsonc
{
  "firstName":     "John",
  "lastName":      "Doe",
  "bio":           "Movie buff & trivia addict.",
  "gender":        "male",
  "avatarMediaId": "01a0...",             // uuid from media upload
  "avatarUrl":     "https://...",         // OR external URL
  "countryCode":   "US",
  "timezone":      "America/New_York",
  "email":         "john@example.com"     // stored UNVERIFIED — use /email/verify to verify
}
```

**Response 200:** updated `ProfileDto`.

**Rules:**
- `email` change resets `isEmailVerified=false` — user must run `/email/verify/*` to make it green
- Phone is NOT editable here (identity — requires re-verification flow, not yet built)
- Username is NOT editable here (one-time write via `/v1/auth/profile`)

**Errors:**
- `409` — `That email is already in use`

---

## 12. `GET /v1/profile/wallet` — Wallet balances + level

| | |
|---|---|
| Auth | `@CustomerOnly` |
| Headers | `Authorization: Bearer <accessToken>` |

**Response 200:**
```jsonc
{
  "pointsBalance": 2500,
  "pointsEarnedLifetime": 4200,
  "pointsSpentLifetime": 1700,
  "pointsPurchasedLifetime": 0,
  "xpTotal": 8100,
  "level": 12,
  "currentLevelXp": 900,
  "nextLevelXp": 2000
}
```

---

## 13. `GET /v1/profile/earns` — My Earns (paginated ledger)

| | |
|---|---|
| Auth | `@CustomerOnly` |
| Headers | `Authorization: Bearer <accessToken>` |
| Query | `page` (default 1), `limit` (default 10), `currency?` (`points`\|`xp`), `direction?` (`earn`\|`spend`\|`refund`\|`purchase`\|`adjust`) |

**Response 200:**
```jsonc
{
  "items": [
    { "id": "01a0...", "amount": 500, "balanceAfter": 2500, "direction": "earn",
      "sourceType": "quest", "sourceId": "01a0...", "createdAt": "..." },
    ...
  ],
  "pagination": { "pageNo": 1, "pageSize": 10, "totalCount": 42, "totalPages": 5 }
}
```

---

## 14. `GET /v1/profile/referral` — Referral code + count

**Purpose:** Refer a Friend modal — show the user's code + how many people signed up with it.

| | |
|---|---|
| Auth | `@CustomerOnly` |
| Headers | `Authorization: Bearer <accessToken>` |

**Response 200:**
```jsonc
{ "code": "X5J7T0LE", "completedReferrals": 3 }
```

---

## 15. `GET /v1/profile/notifications` — Inbox (paginated)

| | |
|---|---|
| Auth | `@CustomerOnly` |
| Headers | `Authorization: Bearer <accessToken>` |
| Query | `page?`, `limit?`, `category?` (`new_content`\|`game_update`\|`reward`\|`social`\|`subscription`\|`system`\|`general`), `unreadOnly?` (bool) |

**Response 200:** `{ items: [NotificationDto], pagination }`

---

## 16-18. Notification helpers

- `POST /v1/profile/notifications/:id/read` — mark one read (idempotent) → `{ message }`
- `POST /v1/profile/notifications/read-all` — mark all read → `{ message }`
- `GET /v1/profile/notifications/unread-count` — bell badge → `{ count: 3 }`

All `@CustomerOnly`.

---

## 19. `POST /v1/profile/email/verify/request` — Send email OTP

**Purpose:** Edit Profile → "Verify email" button. Emails a 6-digit code via SendGrid template.

| | |
|---|---|
| Auth | `@CustomerOnly` — Bearer required |
| Throttle | 5 / min short + 20 / 30min long |
| Headers | `Authorization: Bearer <accessToken>`, `Content-Type: application/json` |

**Body:**
```jsonc
{ "email": "jordan@example.com" }
```

**Response 200:**
```jsonc
{
  "delivery": "sent",
  "otpToken": "eyJ..."         // 10m TTL — bound to (email, userId, 'email_verification')
}
```

**Effects:**
- Inserts hashed 6-digit code into `otp_codes` (invalidates prior unconsumed OTP for same email+purpose)
- Enqueues SendGrid job on `QueueName.EMAIL` / `JobName.OTP_EMAIL`
- **Does NOT** touch `users.email` — that only happens on successful confirm

**Errors:**
- `400` — invalid email format
- `409` — `That email is already in use` (another customer has it)
- `429` — rate limited

---

## 20. `POST /v1/profile/email/verify/confirm` — Confirm email OTP

**Purpose:** user pastes the code from their inbox. **No Bearer needed** — the `otpToken` (which embeds `userId`) is the authorization.

| | |
|---|---|
| Auth | `@Public` (with `@AccountTypes()` clearing the class-level guard) |
| Throttle | 10 / min |
| Headers | `Content-Type: application/json` (NO `Authorization`) |

**Body:**
```jsonc
{
  "otpToken": "eyJ...",     // from step 19
  "code":     "123456"      // 6-digit from inbox
}
```

**Response 200:** full `ProfileDto` with `email` set and `isEmailVerified: true`.

**Effects (atomic):**
- Consumes the OTP row (`consumed_at = now()`)
- `UPDATE users SET email=<verified email>, is_email_verified=true`
- Invalidates profile cache

**Errors:**
- `401` — `Verification session is invalid or expired`
- `401` — `No active verification code — request a new one`
- `401` — `Too many attempts — request a new code` (after 5 wrong codes)
- `401` — `Incorrect code`
- `409` — `That email is already in use` (concurrent claim)

---

## 21. `POST /v1/auth/refresh` — Exchange refresh for a new access token

| | |
|---|---|
| Auth | `@Public` |
| Body | `{ "refreshToken": "eyJ..." }` |

**Response 200:** `{ "accessToken": "eyJ..." }`

**Errors:** `401` if refresh is expired / `tokenVersion` mismatch (logged out elsewhere).

---

## 22-23. Logout

- `POST /v1/auth/logout` — server-side no-op (client discards tokens). Response: `{ message }`.
- `POST /v1/auth/logout-all` — bumps `users.tokenVersion` → **all outstanding tokens invalid at next validation**. Response: `{ message: "All sessions revoked" }`.

Both `@CustomerOrGuest`, Bearer required.

---

## Common error responses

Every error follows the envelope:
```jsonc
{
  "statusCode": 400,
  "status": "Failure",
  "message": "phone must be in E.164 format (e.g. +919876543210)",
  "error": "Validation Error",
  "data": null,
  "traceId": "b6004d6d-..."
}
```

| HTTP | Meaning |
|---|---|
| `400` | Validation / bad input |
| `401` | Missing or invalid token (Bearer, otpToken, refreshToken) |
| `403` | Account type not allowed (`@CustomerOnly` hit by a guest) |
| `409` | Uniqueness conflict (username, email, phone) |
| `429` | Rate limited |

---

## Auth quick reference

| Header | When to send | Value |
|---|---|---|
| `Authorization: Bearer <token>` | All `@CustomerOnly` and `@CustomerOrGuest` endpoints | The `accessToken` from `/phone/verify`, `/guest`, or the OAuth fragment |
| `Content-Type: application/json` | Any POST/PATCH with a body | `application/json` |
| `X-Client-Platform: mobile` | Optional — force mobile mode | `mobile` (default via `Authorization`) or `web` (cookie mode) |

Access tokens live 15 minutes. Refresh 60 days. If a request 401s with `Missing or expired access token`, call `/v1/auth/refresh` transparently and retry once.
