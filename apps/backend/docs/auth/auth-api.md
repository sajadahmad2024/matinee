# Auth & Identity — API Reference

> Companion to `auth-module-rfc.md` (CONFIRMED). This is the endpoint-by-endpoint
> contract used for implementation and **manual testing**. Base URL: `http://localhost:3000`.
> All business routes are URI-versioned under `/v1`.

---

## 0. Conventions

### Response envelope
Every response is wrapped by the global `TransformInterceptor`:
```jsonc
{ "statusCode": 200, "status": "Success", "message": "Request successful", "data": <payload>, "error": null }
```
Below, **"Response"** describes the `data` payload only.

### Authentication channels
| Surface | How the request carries auth | How tokens are returned |
|---------|------------------------------|--------------------------|
| **Mobile (customer)** | `Authorization: Bearer <accessToken>` | `data.accessToken` / `data.refreshToken` in the JSON body |
| **Web (admin)** | `access_token` httpOnly cookie (sent automatically) | `Set-Cookie` (httpOnly) — never in the body |

- Platform is auto-detected (cookie ⇒ web, `Authorization` header ⇒ mobile); a
  `X-Client-Platform: web|mobile` header can force it.
- **Sliding renewal:** if the access token is in its last ~5m, the response carries a fresh one:
  web ⇒ new `Set-Cookie: access_token`; mobile ⇒ `X-Renewed-Access-Token: <jwt>` header. Clients
  should adopt it transparently.
- **CSRF (web only):** non-GET admin routes require `X-CSRF-Token` matching the `csrf` cookie
  (issued at admin login) when `CSRF_ENABLED=true`.

### Standard error codes
| HTTP | When |
|------|------|
| 400 | validation failure (bad/missing fields) |
| 401 | missing/invalid/expired token, wrong credentials, bad/expired OTP |
| 403 | authenticated but not allowed (role/permission), or account `suspended`/`banned`/`disabled` |
| 404 | resource not found |
| 409 | conflict — identifier (phone/email/username) already belongs to another active account |
| 429 | throttled (rate limit / OTP request flood) |

Error body example:
```jsonc
{ "statusCode": 403, "status": "Error", "message": "Account suspended", "data": null,
  "error": { "code": "ACCOUNT_SUSPENDED", "suspendedUntil": "2026-06-10T00:00:00Z" } }
```

### `user` payload (shared shape)
```jsonc
{
  "id": "uuid", "accountType": "guest|customer|admin",
  "email": "a@b.com|null", "phone": "+91...|null", "username": "neo|null",
  "firstName": "…|null", "lastName": "…|null", "gender": "male|…|null", "avatarUrl": "…|null",
  "status": "active|suspended|banned|disabled",
  "isPhoneVerified": true, "isEmailVerified": false,
  "countryCode": "IN|null", "roles": ["admin"], "permissions": ["users:read", …],
  "createdAt": "…"
}
```
(`roles`/`permissions` are present for admins; empty for customers/guests.)

---

## 1. Customer Auth — `/v1/auth`

### 1.1 `POST /v1/auth/guest` — bootstrap guest  ·  Public
Create an anonymous guest and issue tokens (mobile).
- **Request:** `{ "deviceId"?: string, "platform"?: "ios|android|web" }`
- **Response 201:** `{ "accessToken": "...", "refreshToken": "...", "user": { accountType: "guest", ... } }`

### 1.2 `POST /v1/auth/phone/otp` — request phone OTP  ·  Public
- **Request:** `{ "phone": "+919876543210" }` — E.164, required.
- **Response 200:** `{ "delivery": "sent" | "client_managed" }`
  (`client_managed` when `PHONE_VERIFICATION_PROVIDER=firebase`; the client gets the OTP via Firebase.)
- **Errors:** 400 invalid phone, 429 too many requests (per-phone OTP throttle).

### 1.3 `POST /v1/auth/phone/verify` — verify & sign in/up  ·  Public
- **Request:** `{ "phone": "+91...", "code"?: "1234", "firebaseToken"?: "...", "guestToken"?: "<guest access/refresh>" }`
  - `code` required for the Twilio path; `firebaseToken` required for the Firebase path.
  - `guestToken` (optional): the current guest's token so its data is carried over/merged.
- **Response 200:** `{ "accessToken", "refreshToken", "user", "isNewUser": true, "needsProfile": true }`
  - `needsProfile=true` ⇒ no `username` yet ⇒ app shows the create-account screen (§1.6).
- **Errors:** 401 bad/expired OTP, 409 (rare — phone race).

### 1.4 Google / Apple — server redirect OAuth (no Firebase)  ·  Public
Browser/in-app-webview flow; the backend never sees provider passwords.
- `GET /v1/auth/social/google?guestToken=&redirect=` → **302** to Google consent.
- `GET /v1/auth/social/google/callback?code=&state=` → backend exchanges the code,
  signs in / signs up, then **302** to `redirect` (or `OAUTH_SUCCESS_REDIRECT`, default deep
  link `maintinee://auth/callback`) with tokens in the URL fragment:
  `…#accessToken=…&refreshToken=…&isNewUser=…&needsProfile=…`.
- Apple: `GET /v1/auth/social/apple` (302) and `POST /v1/auth/social/apple/callback`
  (Apple uses `response_mode=form_post`). Same redirect-with-tokens result.
- `guestToken` + `redirect` are carried through the OAuth `state` (base64url JSON).
- Env: `GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL`, `APPLE_CLIENT_ID/TEAM_ID/KEY_ID/PRIVATE_KEY/CALLBACK_URL`, `OAUTH_SUCCESS_REDIRECT`.

### 1.6 `POST /v1/auth/profile` — complete/update profile  ·  Auth: customer
- **Request:** `{ "username": "neo", "referralCode"?: "ABC123", "gender"?: "male|female|other|prefer_not_to_say", "fullName"?: "Thomas Anderson" }`
  - `username`: 3–50 chars, unique (case-insensitive), required if not yet set.
  - `referralCode`: optional; applied **once** for new users → creates a `pending` redemption.
- **Response 200:** `{ "user": { ... } }`
- **Errors:** 409 username taken / referral already used, 400 invalid referral code.

### 1.7 `POST /v1/auth/refresh` — rotate access  ·  Public (requires refresh token)
- **Request (mobile):** `{ "refreshToken": "..." }` · **(web):** refresh cookie, empty body.
- **Response 200:** mobile ⇒ `{ "accessToken": "..." }`; web ⇒ new `Set-Cookie`.
- **Errors:** 401 invalid/expired refresh, or `token_version` mismatch.

### 1.8 `GET /v1/auth/me` — current identity  ·  Auth: guest/customer
- **Response 200:** `{ "user": { ... } }`

### 1.9 `POST /v1/auth/logout`  ·  Auth
Clears web cookies; mobile discards locally. **Response 200:** `{ "message": "Logged out" }`

### 1.10 `POST /v1/auth/logout-all`  ·  Auth
Bumps `token_version` → invalidates every session. **Response 200:** `{ "message": "All sessions revoked" }`

---

## 2. Devices / Push — `/v1/devices`

### 2.1 `POST /v1/devices` — register/refresh device  ·  Auth: guest/customer
- **Request:** `{ "fcmToken": "...", "platform": "ios|android|web", "deviceId"?: "...", "appVersion"?: "1.2.0", "topics"?: ["all","daily_streak"] }`
- **Response 200:** `{ "device": { "id": "uuid", "platform": "ios", "topics": ["all"] } }`
- Upserts by `fcmToken` (re-registration moves it to the current user); migrates on guest→customer merge.

### 2.2 `DELETE /v1/devices/:fcmToken` — unregister  ·  Auth
- **Response 200:** `{ "message": "Device removed" }`

---

## 3. Admin Auth — `/v1/admin/auth`

### 3.1 `POST /v1/admin/auth/login`  ·  Public
- **Request:** `{ "email": "kumar.pus95@gmail.com", "password": "•••••", "rememberMe"?: true }`
- **Response 200:** sets `access_token` + `refresh_token` + `csrf` cookies; body `{ "user": { accountType: "admin", roles, permissions, ... } }`.
- **Errors:** 401 invalid credentials, 403 `status!=active`.

### 3.2 `POST /v1/admin/auth/refresh`  ·  refresh cookie → new cookies. **200** `{ "ok": true }`.
### 3.3 `POST /v1/admin/auth/logout`  ·  Auth: admin → clears cookies. **200** `{ "message": "Logged out" }`.

### 3.4 `POST /v1/admin/auth/forgot-password`  ·  Public
- **Request:** `{ "email": "..." }`
- **Response 200 (always):** `{ "message": "If the email exists, a code has been sent" }` (no account enumeration). Sends a 6-digit code (`otp_codes`, channel `email`) via the SQS email queue.

### 3.5 `POST /v1/admin/auth/reset-password`  ·  Public
- **Request:** `{ "email": "...", "code": "123456", "newPassword": "StrongP@ss1" }`
  - `newPassword`: min 8, upper+lower+digit+special.
- **Response 200:** `{ "message": "Password reset" }` — sets `password_hash`, **bumps `token_version`** (kills old sessions), issues fresh cookies.
- **Errors:** 401 bad/expired code.

---

## 4. Admin → Admin management — `/v1/admin/admins`

> All require `@AdminOnly()` + the noted permission. `super_admin` has all permissions.

| Method & path | Permission | Request | Notes |
|---------------|-----------|---------|-------|
| `GET /v1/admin/admins?page&pageSize&search&status` | `admins:read` | — | paginated list |
| `GET /v1/admin/admins/:id` | `admins:read` | — | one admin |
| `POST /v1/admin/admins` | `admins:write` | `{ email, firstName?, lastName?, roleIds: string[] }` | creates `account_type='admin'`, assigns roles (`assigned_by`=caller), emails a set-password link |
| `PATCH /v1/admin/admins/:id` | `admins:write` | `{ firstName?, lastName?, roleIds?, status? }` | role changes invalidate target's AuthContext |
| `DELETE /v1/admin/admins/:id` | `admins:delete` | — | sets `status='disabled'` + bumps `token_version` |

**Guards:** cannot remove/disable **yourself**; cannot remove/disable the **last `super_admin`**;
cannot assign a role you don't manage. Returns **409**/**403** accordingly.

**Create response 201:** `{ "user": { accountType: "admin", roles: ["support"], status: "active", ... } }`

---

## 5. Admin → Roles & Permissions — `/v1/admin/roles`, `/v1/admin/permissions`

| Method & path | Permission | Request | Notes |
|---------------|-----------|---------|-------|
| `GET /v1/admin/roles` | `roles:read` | — | roles + their permissions |
| `GET /v1/admin/roles/:id` | `roles:read` | — | one role |
| `POST /v1/admin/roles` | `roles:write` | `{ name, description?, permissionNames: string[] }` | creates a **custom** role |
| `PATCH /v1/admin/roles/:id` | `roles:write` | `{ description?, permissionNames? }` | replaces the role's permission set |
| `DELETE /v1/admin/roles/:id` | `roles:delete` | — | only if not `is_system` and not currently assigned |
| `GET /v1/admin/permissions` | `permissions:read` | — | the full permission catalog |

**`is_system` roles** (`super_admin`, `admin`) return **403** on PATCH/DELETE.
**Permission catalog:** `admins:read|write|delete`, `roles:read|write|delete`, `permissions:read`,
`users:read|write|delete|moderate`, `rewards:read|write`, `compliance:read|write`.

---

## 6. Admin → Customer management & moderation — `/v1/admin/users`

| Method & path | Permission | Request | Effect |
|---------------|-----------|---------|--------|
| `GET /v1/admin/users?page&pageSize&search&status&country` | `users:read` | — | paginated customers |
| `GET /v1/admin/users/:id` | `users:read` | — | one customer (+ enforcement history) |
| `PATCH /v1/admin/users/:id` | `users:write` | `{ firstName?, lastName?, ... }` | edit profile |
| `POST /v1/admin/users/:id/suspend` | `users:moderate` | `{ reason: string, until?: ISO8601 }` | `status='suspended'`, `suspended_until=until`, logs `user_enforcement_actions`, bumps target `token_version` |
| `POST /v1/admin/users/:id/ban` | `users:moderate` | `{ reason: string }` | `status='banned'` (indefinite), logs action, bumps `token_version` |
| `POST /v1/admin/users/:id/reinstate` | `users:moderate` | `{ reason?: string }` | `status='active'`, logs `reinstate` |

**Moderation response 200:** `{ "user": { id, status, suspendedUntil, statusReason }, "action": { action, performedBy, reason, createdAt } }`

After any moderation the target's next request fails the AuthContext status/`tv` check → effective immediately.

---

## 7. Token & cookie reference (for manual testing)

- **Access JWT claims:** `sub, typ:"access", act, plt, tv, iat, exp, jti` (signed `JWT_SECRET`).
- **Refresh JWT:** same with `typ:"refresh"` (signed `JWT_REFRESH_SECRET`).
- **Mobile testing:** copy `data.accessToken` from any auth response → send as `Authorization: Bearer …`.
- **Web testing:** use a cookie jar (`curl -c jar.txt -b jar.txt`); admin login sets the cookies; send `X-CSRF-Token` (value of the `csrf` cookie) on non-GET.
- **Force logout-all / revoke:** any `token_version` bump (reset, logout-all, ban, admin delete) makes prior tokens 401 on next call.

> Setup help (seeding the first `super_admin`, Firebase/Google/Apple keys, a ready-to-import
> request collection) will be provided alongside the code.
