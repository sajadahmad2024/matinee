# Auth & Identity Module — RFC (Proposal)

> Status: **CONFIRMED (2026-06-02)** — design approved; ready for implementation docs/code.
> Schema reference: migration `0001_create_users` (already reviewed & approved).
> Builds on the new infra: `QueueService` (SQS) for OTP delivery, `CacheService`
> (Redis/ElastiCache) for OTP storage + per-request auth context.

---

## 1. Summary

- **Feature name:** Auth & Identity (customer mobile + admin web)
- **Problem statement:** One identity system serving two very different surfaces:
  - **Customer (mobile app):** anonymous **guest** browsing → phone-OTP / Google / Apple sign-up → persona + referral. Tokens carried as **bearer tokens** in the app.
  - **Admin (web portal):** invite-only **email + password**, **forgot-password via 6-digit email OTP**, full **RBAC**, ability to **create/update/remove other admins** and to **moderate customers** (suspend / ban / reinstate). Tokens carried in **httpOnly cookies**.
- **Scope:** identity bootstrap & merge, all sign-in methods, JWT issuance/verification, per-platform token delivery, the guard pipeline (incl. middleware-level **sliding token renewal**), RBAC, admin & user management, OTP delivery (provider-pluggable: **Firebase preferred, Twilio fallback**), device/push registration hooks, referral linkage at signup.
- **Non-goals (separate modules, later):** points/XP **ledger** + on-chain mint (Rewards module), notification **sending** (Notifications module), video/engagement & the 8-free-videos counter (Engagement module), guest anti-abuse/fraud, MFA/TOTP for admins (phase 2).

---

## 2. JWT & Token Design (core)

### 2.1 Two stateless tokens

| Token | Purpose | Default TTL | Signed with |
|-------|---------|-------------|-------------|
| **Access** | Authorizes API calls | `JWT_ACCESS_TTL` (15m) | `JWT_SECRET` |
| **Refresh** | Mints new access after inactivity | `JWT_REFRESH_TTL` (mobile 60d; admin 12h, or `JWT_REMEMBER_TTL` 30d if "keep me signed in") | `JWT_REFRESH_SECRET` |

Both are **stateless JWTs** (no `refresh_tokens` table — removed by design). Server-side
invalidation is achieved with **`users.token_version`**: every token embeds the version it
was minted at; bumping `token_version` (password reset, "log out everywhere", role/permission
change, ban) instantly invalidates all outstanding tokens for that user.

### 2.2 Access token claims

```jsonc
{
  "sub":  "uuid",            // user id
  "typ":  "access",          // 'access' | 'refresh'
  "act":  "customer",        // account_type: 'guest' | 'customer' | 'admin'
  "plt":  "mobile",          // platform: 'web' | 'mobile'  (delivery channel intent)
  "tv":   3,                 // token_version snapshot — must equal users.token_version
  "iat":  1730000000,
  "exp":  1730000900,
  "jti":  "uuid"             // unique id (telemetry / future denylist if ever needed)
}
```

Refresh token is the same shape with `"typ":"refresh"` and the longer `exp`.

**Deliberately NOT in the token:** roles, permissions, status. Those are **resolved per
request from a cached auth-context** (see §2.4) so RBAC and bans take effect immediately
without re-issuing tokens. The token stays tiny and identity-only.

### 2.3 Per-platform delivery

| Surface | Access token | Refresh token | Sent by client as |
|---------|--------------|---------------|-------------------|
| **Web (admin)** | `httpOnly`, `Secure`, `SameSite=Lax` cookie `access_token` | `httpOnly`, `Secure`, `SameSite=Strict`, path `/v1/admin/auth/refresh` cookie `refresh_token` | cookies (browser auto) |
| **Mobile (customer)** | JSON body on auth responses | JSON body | `Authorization: Bearer <access>` header; refresh posted to `/v1/auth/refresh` |

- Platform is determined by the **token extractor**: a cookie present → treat as web; else
  `Authorization` header → mobile. A `X-Client-Platform: web|mobile` header may override.
- Web mutations are protected against CSRF via `SameSite` + a **double-submit CSRF token**
  (`X-CSRF-Token` header vs `csrf` cookie) on non-GET admin routes.

### 2.4 Per-request auth context (one cache hit)

On every authenticated request the global guard loads an **AuthContext** keyed by `sub`:

```ts
interface AuthContext {
  id: string;
  accountType: 'guest' | 'customer' | 'admin';
  status: 'active' | 'suspended' | 'banned' | 'disabled';
  suspendedUntil: Date | null;
  tokenVersion: number;
  roles: string[];        // admins only
  permissions: string[];  // admins only (resolved from role_permissions)
}
```

- Source of truth = DB; cached via `CacheService` under tag `auth:user:<id>` with a short TTL
  (e.g. 60s) and **explicit invalidation** (`invalidateTag('auth:user:'+id)`) whenever the
  user, their roles, permissions, status, or `token_version` change. → fresh RBAC + instant
  bans with near-zero DB load.

### 2.5 Sliding renewal (the "extend at middleware" behavior)

When the access token is **valid but within the renewal window** (`exp - now < JWT_RENEW_WINDOW`,
e.g. last 5m of a 15m token), the request is allowed AND a fresh access token is minted and
returned on the response:

- **Web:** `Set-Cookie: access_token=<new>` on the response.
- **Mobile:** `X-Renewed-Access-Token: <new>` response header; the app swaps its stored token.

So an actively-used session never sees a 401. Only after full inactivity past the access TTL
does the client fall back to `/auth/refresh` (mobile) or the refresh cookie (web). If the
refresh token is also expired/invalid → 401, client re-authenticates.

Implementation split:
- **`AuthGuard` (global):** extract → verify signature+exp → load AuthContext → enforce
  `tv` match + status → attach `request.user` → set `request.renewAccessToken = true` when in
  the renewal window. Honors `@Public()`.
- **`TokenRenewalInterceptor` (global):** if `request.renewAccessToken`, mint + attach the new
  token to the response (cookie or header) on the way out.

---

## 3. Guard & Decorator Pipeline (each level)

Global guard order (extends the existing chain):

```
ThrottlerGuard → AuthGuard → AccountTypeGuard → RolesGuard → PermissionsGuard
```

| Layer | Decorator(s) | Logic |
|-------|--------------|-------|
| **AuthGuard** (global) | `@Public()` skips it | token extract+verify, AuthContext, `tv` + status checks, sliding-renewal flag, `request.user` |
| **AccountTypeGuard** | `@Guest()`, `@CustomerOnly()`, `@AdminOnly()` | gate by `account_type` (e.g. admin endpoints reject customers) |
| **RolesGuard** | `@Roles('super_admin','admin')` | OR logic over `AuthContext.roles` (admins) |
| **PermissionsGuard** | `@Permissions('admins:write')` | AND logic over `AuthContext.permissions` |
| (in AuthGuard) | — | `status='banned'/'disabled'` → 403; `suspended` & `suspendedUntil>now` → 403 (with retry-after); lapsed suspension auto-treated as active |

Param decorators: `@CurrentUser()` (full AuthContext) and `@CurrentUser('id')` (field).

`@Public()` is used by: guest bootstrap, phone OTP request/verify, social login, admin login,
forgot/reset password, and all infra endpoints (health/metrics/tracing/dev-tools).

---

## 3.5 RBAC — Roles & Permissions (admin authorization)

**Yes, roles are required** — they are the unit by which admin permissions are managed,
edited, and revoked. Customers are NOT roled (they're uniform, identified by `account_type`);
**only admins** get role assignments. The model is a standard 3-layer RBAC already backed by the
schema (`roles`, `permissions`, `role_permissions`, `user_roles`):

```
permission  (resource:action, atomic)  ──many──┐
                                                ├─ role_permissions ─ role  (named bundle)
                                       ──many──┘                       │
                                                                 user_roles (assigned_by)
                                                                       │
                                                                  admin user
```

- **Permission** = atomic `resource:action` capability. Fixed **catalog** (seeded):
  `admins:read|write|delete`, `roles:read|write|delete`, `permissions:read`,
  `users:read|write|delete|moderate`, `rewards:read|write`, `compliance:read|write`.
  New capabilities are added as the app grows (one place).
- **Role** = a named, editable bundle of permissions. **`is_system` roles** (`super_admin`,
  `admin`) are protected — cannot be edited or deleted.
- **Admin → role(s):** an admin is assigned one or more roles via `user_roles`
  (`assigned_by` = the granting admin). **Effective permissions = union** of the assigned roles'
  permissions. `super_admin` is treated as **all-permissions** (god mode).
- **AuthContext** (cached, §2.4) carries the resolved `roles[]` + `permissions[]`; `RolesGuard`
  (OR) and `PermissionsGuard` (AND) check against it. Changing a role/assignment invalidates
  `auth:user:<id>` → effective immediately, no re-login.

### Why roles (not permissions-directly-on-admins)
The product requires "roles can be **edited** and access **revoked**." Roles give you:
editable bundles (change a role once → applies to all its admins), clean revocation (unassign a
role, or bump the role and `token_version`), least-privilege presets, and an auditable
`assigned_by` trail — none of which a flat per-admin permission list gives cleanly.

### Seeded vs custom roles
| Role | `is_system` | Permissions | Created by |
|------|-------------|-------------|------------|
| `super_admin` | ✅ locked | **all** | seed |
| `admin` | ✅ locked | manage customers + rewards/compliance read (baseline ops) | seed |
| `support` *(example)* | ❌ editable | `users:read`, `users:moderate` | super_admin, at runtime |
| `finance` *(example)* | ❌ editable | `rewards:read`, `rewards:write` | super_admin, at runtime |
| `compliance_officer` *(example)* | ❌ editable | `compliance:read`, `compliance:write`, `users:read` | super_admin, at runtime |

The seed ships only the two **system** roles; **`super_admin` creates custom roles at runtime**
via the role-management API (§4.7: `POST /v1/admin/roles`, edit `role_permissions`, assign to
admins, revoke). The example custom roles above illustrate the intended usage — I can pre-seed a
few if you want them out of the box.

---

## 4. User/Developer Flows

### 4.1 Customer — guest bootstrap
1. App opens (no token) → `POST /v1/auth/guest` (`@Public`).
2. Server inserts `users(account_type='guest')`, issues access+refresh (act=guest, plt=mobile).
3. App stores tokens; every call is now authenticated as the guest. Engagement (8-free-videos)
   tracks against this `user.id`.

### 4.2 Customer — phone OTP sign-in / sign-up
1. `POST /v1/auth/phone/otp { phone }` → resolve a **PhoneVerificationProvider** (§7):
   - **Backend-OTP (Twilio/SNS):** generate 4-digit code → store `code_hash` in `otp_codes`
     (purpose `login`, channel `sms`) → enqueue SMS via `QueueService`/send.
   - **Firebase path:** client does Firebase phone verification directly; this endpoint may be
     a no-op (client already holds a Firebase token).
2. `POST /v1/auth/phone/verify { phone, code | firebaseToken, guestToken? }`:
   - Verify OTP (or Firebase ID token) → phone proven.
   - **Find-or-create** user by `phone`:
     - none → upgrade the **guest** row in place (`account_type='customer'`, set `phone`,
       `is_phone_verified=true`) if `guestToken` present, else create a new customer.
     - exists → **merge** the guest into the existing customer (reassign engagement + device
       tokens, set `guest.merged_into_user_id`, soft-delete guest), then issue tokens for the
       existing customer.
   - Response: tokens + `{ isNewUser, needsProfile }`. If `needsProfile` (no username yet) the
     app shows the **create-account** screen.

### 4.3 Customer — Google / Apple
- `POST /v1/auth/social/google { idToken, guestToken? }` / `.../apple { identityToken, guestToken? }`
- Verify provider token → upsert `oauth_accounts` (`raw_profile` seeds name/avatar) →
  find-or-create/merge as in 4.2 → issue tokens.

### 4.4 Customer — complete profile (create-account screen)
- `POST /v1/auth/profile { username, referralCode?, gender?, fullName? }` (auth: customer)
  - Set unique `username` (case-insensitive), persona fields.
  - If `referralCode` valid & user is new → create `referral_redemptions(pending)` linking
    `referrer_id` (code owner) ↔ `referee_id` (this user). Reward **amounts come from
    `reward_rules('referral')`**; the actual grant is the Rewards module's job later.

### 4.5 Customer — session lifecycle
- `POST /v1/auth/refresh` (refresh token in body/cookie) → new access (+ optional refresh
  rotation). `GET /v1/auth/me` → current profile. `POST /v1/auth/logout` → clear cookies /
  client discards; `POST /v1/auth/logout-all` → bump `token_version`.

### 4.6 Admin — login & password reset
- `POST /v1/admin/auth/login { email, password, rememberMe? }` (`@Public`) → verify bcrypt →
  issue cookies (longer refresh if `rememberMe`). Wrong creds / `status!=active` → 401/403.
- `POST /v1/admin/auth/forgot-password { email }` (`@Public`) → 6-digit code in `otp_codes`
  (channel `email`, purpose `password_reset`) → enqueue email via `QueueService` (EMAIL queue).
- `POST /v1/admin/auth/reset-password { email, code, newPassword }` (`@Public`) → verify OTP →
  set `password_hash` → **bump `token_version`** (kills existing sessions) → issue fresh cookies.

### 4.7 Admin — manage admins (moderate other admins)
Guarded by `@AdminOnly()` + permissions; `super_admin` has all.
- `POST   /v1/admin/admins` — invite/create admin: `{ email, firstName?, lastName?, roleIds[] }`
  → create `users(account_type='admin')`, assign roles (`user_roles.assigned_by = current admin`),
  email an invite/set-password link. Perm: `admins:write`.
- `GET    /v1/admin/admins` (`admins:read`), `GET /v1/admin/admins/:id`.
- `PATCH  /v1/admin/admins/:id` — update profile / **change roles** (`admins:write` + `roles:read`).
- `DELETE /v1/admin/admins/:id` — **remove/revoke** = set `status='disabled'` + bump
  `token_version` (`admins:delete`). Hard-guard: cannot disable the last `super_admin`; cannot
  remove yourself.
- Roles: `GET/POST/PATCH/DELETE /v1/admin/roles` + manage `role_permissions` (`roles:*`).
  `is_system` roles (`super_admin`, `admin`) cannot be edited/deleted.

### 4.8 Admin — control customers (suspend / ban / reinstate)
- `GET   /v1/admin/users` (`users:read`), `GET /v1/admin/users/:id`.
- `PATCH /v1/admin/users/:id` (`users:write`).
- `POST  /v1/admin/users/:id/suspend { reason, until? }` (`users:moderate`) → write
  `user_enforcement_actions(action='suspend', performed_by, reason, expires_at)` + set
  `users.status='suspended'`, `suspended_until`, `status_changed_by` + invalidate auth cache.
- `POST  /v1/admin/users/:id/ban { reason }` (`users:moderate`) → `action='ban'`, `status='banned'`.
- `POST  /v1/admin/users/:id/reinstate { reason? }` (`users:moderate`) → `action='reinstate'`,
  `status='active'`.
- Every action bumps the target's `token_version` so active sessions are cut immediately.

### 4.9 Device / push registration
- `POST   /v1/devices { fcmToken, platform, topics?[] }` (auth: guest or customer) → upsert
  `device_tokens` for `current user`, record `device_token_topics` (and subscribe via FCM later).
- `DELETE /v1/devices/:fcmToken` (logout/unregister). On guest→customer **merge**, device rows
  are repointed to the customer automatically.

---

## 5. API Contract (summary)

- **Customer (`/v1/auth`, `/v1/devices`):** `POST guest`, `POST phone/otp`, `POST phone/verify`,
  `POST social/google`, `POST social/apple`, `POST profile`, `POST refresh`, `GET me`,
  `POST logout`, `POST logout-all`, `POST/DELETE devices`.
- **Admin (`/v1/admin/...`):** `auth/login`, `auth/forgot-password`, `auth/reset-password`,
  `auth/refresh`, `auth/logout`; `admins` CRUD; `roles` CRUD + permission assignment;
  `users` list/get/update/suspend/ban/reinstate.
- **DTOs:** `class-validator` + `class-transformer` + `@ApiProperty`; phone validated to E.164;
  email lowercased; password policy (min 8, upper/lower/digit/special).
- **Response envelope:** standard `TransformInterceptor` shape; auth responses include
  `{ accessToken?, refreshToken?, user }` on mobile (tokens omitted for web — set as cookies).
- **Error codes:** 400 validation, 401 unauthenticated/expired, 403 forbidden/suspended/banned,
  409 conflict (identifier already linked — see linking rules), 429 throttled.

---

## 6. Data Contract

- **Tables (from `0001_create_users`):** `users`, `roles`, `permissions`, `user_roles`,
  `role_permissions`, `oauth_accounts`, `otp_codes`, `referral_codes`, `referral_redemptions`,
  `device_tokens`, `device_token_topics`, `user_enforcement_actions`, `reward_rules`, `geo_policies`.
- **No new migration** expected for this module (schema already covers it). Any tweak goes into
  `0001_create_users` per the SQL-first workflow, then `db:introspect`.
- **Repositories** (under `src/db/repositories/`):
  - `users/users.repository.ts` — find by id/phone/email/username (case-insensitive, active-only),
    create guest/customer/admin, upgrade guest, merge guest, update persona/status/token_version.
  - `auth/identity.repository.ts` — oauth upsert/find, otp create/consume/expire.
  - `auth/rbac.repository.ts` — roles/permissions CRUD, user_roles assign/revoke, resolve
    permissions for a user (for AuthContext).
  - `auth/referral.repository.ts` — code create/get, redemption create/find.
  - `auth/enforcement.repository.ts` — write enforcement action + denormalize status.
  - `auth/device.repository.ts` — device upsert, topic subscribe, repoint on merge.
- **Linking & uniqueness** (already in schema): one active account per phone/email/username
  (partial, case-insensitive unique). Linking a new identifier requires verification; a unique
  violation → `409` (identifier already owned).

---

## 7. OTP / Phone Verification — provider-pluggable

Abstract base selected by env (mirrors the SMS/Email provider pattern), so going Firebase↔Twilio
is config-only:

```ts
abstract class PhoneVerificationProvider {
  // Backend-OTP providers send a code; Firebase returns a verifiable token instead.
  abstract requestOtp(phone: string): Promise<{ delivery: 'sent' | 'client_managed' }>;
  abstract verify(input: { phone: string; code?: string; firebaseToken?: string }): Promise<{ phone: string; verified: boolean }>;
}
```

- **FirebasePhoneProvider (preferred):** `requestOtp` = client-managed (Firebase SDK sends OTP);
  `verify` validates the Firebase **ID token** via `firebase-admin`, extracts the phone, trusts it.
  No `otp_codes` rows needed for phone.
- **TwilioOtpProvider (fallback):** `requestOtp` generates a 4-digit code, stores `code_hash` in
  `otp_codes`, enqueues an SMS; `verify` checks the code (attempts/expiry) and consumes it.
- **Email OTP (admin reset)** always uses the backend-OTP model over `otp_codes` (channel
  `email`) + the existing Email pipeline.
- Selection: `PHONE_VERIFICATION_PROVIDER=firebase|twilio` (factory in module registration).

---

## 8. Architecture Impact

- **Modules:** rebuild `src/auth/` (split into `customer-auth`, `admin-auth`, `rbac`,
  `referral`, `devices` controllers/services or sub-folders); add the global `AuthGuard` +
  `TokenRenewalInterceptor`; `TokenService` (sign/verify/cookie helpers); `AuthContextService`
  (cache-backed). Repositories under `src/db/repositories/`.
- **Providers/strategies:** `PhoneVerificationProvider` (Firebase/Twilio), reuse Google/Apple
  verification, reuse `EmailService`/`SmsService`.
- **Queue:** OTP **email** (admin reset) and optionally SMS enqueued via `QueueService`
  (`QueueName.EMAIL` + a new `QueueName.SMS`); handlers in `src/background/`.
- **Cache:** `otp:*` (rate-limit + attempts), `auth:user:<id>` AuthContext (tag-invalidated),
  `sms:otp:*` (existing). All via `CacheService`.
- **Observability:** structured auth logs (no secrets/tokens), metrics for login success/fail,
  OTP send/verify, token renew; spans on verify + DB lookups.

---

## 9. Testing Plan

- **Unit:** token sign/verify, `tv` mismatch → 401, status gating, sliding-window logic,
  guest-merge, referral linking, OTP attempts/expiry, RBAC resolution, "last super_admin" guard.
- **Functional:** each endpoint with valid/invalid/forbidden cases; cookie vs bearer extraction;
  CSRF on admin mutations; 409 on identifier conflict.
- **E2E:** guest → phone signup → profile+referral → device register; admin login → create admin
  → assign role → suspend customer → customer 403; password reset invalidates old session.
- **Load:** login + token verify throughput (cache hit path).

---

## 10. Rollout & Operations

- **Env vars (new):** `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`, `JWT_REMEMBER_TTL`, `JWT_RENEW_WINDOW`,
  `JWT_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_DOMAIN`, `COOKIE_SECURE`, `CSRF_ENABLED`,
  `PHONE_VERIFICATION_PROVIDER`, `FIREBASE_*` (already present), Google/Apple client envs.
- **Flags:** `PHONE_VERIFICATION_PROVIDER`, `CSRF_ENABLED`.
- **Migration/rollback:** schema already in `0001_create_users`; apply = drop & recreate dev DB,
  `db:migrate` → `db:introspect`; seed `super_admin` + first admin user.
- **Runbook:** "log out everyone" = bump `token_version`; revoke admin = disable + bump.

---

## 11. Acceptance Criteria

- [ ] Guest bootstrap issues usable tokens; guest merges into customer on signup/login.
- [ ] Phone-OTP (Firebase **and** Twilio paths), Google, Apple all sign in/up correctly.
- [ ] Web admin uses httpOnly cookies; mobile uses bearer; one extractor handles both.
- [ ] Sliding renewal extends active sessions at the middleware/guard layer (cookie + header).
- [ ] `token_version` bump invalidates all sessions (reset / logout-all / role change / ban).
- [ ] RBAC + status enforced per request from cached AuthContext; bans take effect immediately.
- [ ] Super-admin can add/update/remove admins and assign roles; guards prevent self/last-super-admin lockout.
- [ ] Admins can suspend/ban/reinstate customers with full `user_enforcement_actions` history.
- [ ] One active account per phone/email/username; linking conflicts return 409.

---

## 12. Confirmed Decisions (2026-06-02)

1. **Token freshness:** ✅ Identity-only JWT + cached `AuthContext` for roles/permissions/status.
2. **Sliding renewal:** ✅ Middleware/guard sliding-renew (Set-Cookie for web, `X-Renewed-Access-Token`
   for mobile) + refresh-token fallback.
3. **Phone OTP provider:** ✅ Ship **both** `firebase` (preferred) and `twilio` behind
   `PhoneVerificationProvider`, env-selected via `PHONE_VERIFICATION_PROVIDER`.
4. **Refresh rotation:** ✅ Keep refresh valid until expiry; invalidation via `token_version` bump
   (no per-token store/denylist).
5. **Default TTLs:** ✅ Access **15m**; refresh **customer 60d**, **admin 12h** (remember-me **30d**);
   renew window **5m**. All tunable via env.
