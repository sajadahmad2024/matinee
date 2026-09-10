# Guest login flow — removed

The anonymous "guest → customer merge" flow has been removed from the API surface.
This note describes what was removed, why, and exactly how to restore it if the client
decides they want it back.

## What was removed

**Endpoint:**
- `POST /v1/auth/guest` — bootstrap an anonymous guest and issue tokens.

**Request fields:**
- `POST /v1/auth/phone/verify` — `body.guestToken` (drop the field).
- `GET  /v1/auth/social/google` — `?guestToken=` query param.
- `GET  /v1/auth/social/apple`  — `?guestToken=` query param.

**Behaviour:**
- OAuth `state` JWT no longer carries `gt` (guest token); only `rd` (redirect).
- Phone-verify + social sign-in no longer merge a prior guest into the resolved
  customer — new accounts are always created fresh via `users.createCustomer`.

**Code deleted:**
- `CustomerAuthService.bootstrapGuest`
- `CustomerAuthService.mergeGuestIfAny` (private)
- `CustomerAuthService.extractGuestId` (private)
- `UsersRepository.createGuest`
- `UsersRepository.upgradeGuestToCustomer`
- `UsersRepository.mergeGuestInto`
- `DeviceRepository.repointUser`
- Decorator `CustomerOrGuest`  (callers switched to `CustomerOnly`)

**Kept intact:**
- DB schema — `account_type = 'guest'` enum value + `merged_into_user_id` column still exist.
- `AccountType.GUEST` in the TypeScript enum (matches the DB).
- Any existing guest rows already in the DB are inert but preserved.

## Why removed

Product decision: the app no longer offers an anonymous browsing tier. Every user
signs in via phone OTP or social OAuth from first launch. Deferring account creation
until later added complexity (guest → customer merge, device repointing, referral
carry-over) with no user-facing benefit under the new product model.

## How to restore

The removal lives in a **single commit**:

- SHA: `929c8ab1941bf910158b543c464fdafe8821bc77`
- Short: `929c8ab`
- Branch: `chore/remove-guest-flow`
- Title: `chore(auth): remove guest login + merge flow`

To bring the flow back on any branch:

```bash
# preferred — reintroduces exactly what was removed
git revert 929c8ab1941bf910158b543c464fdafe8821bc77

# or if you prefer a manual patch you can review + edit before applying
git show 929c8ab1941bf910158b543c464fdafe8821bc77 | git apply --reverse -
```

Because the DB schema was left untouched, no migration is needed — the revert
applies cleanly at the code level.

If the removal commit has drifted from the current codebase (e.g. types changed,
files moved), the revert diff still tells you exactly which lines to reintroduce.
Look at:
- `apps/backend/src/auth/customer/customer-auth.controller.ts` — the `bootstrapGuest` route + `guestToken` query params.
- `apps/backend/src/auth/customer/customer-auth.service.ts` — the two private helpers, the merge branches inside `verifyPhone` / `resolveSocialUser`, and the `guestToken` param on `encodeOAuthState` / `completeSocialLogin`.
- `apps/backend/src/auth/services/token.service.ts` — `guestToken` on `signOAuthState` / `verifyOAuthState`.
- `apps/backend/src/db/repositories/users/users.repository.ts` — the three lifecycle methods.
- `apps/backend/src/db/repositories/auth/device.repository.ts` — `repointUser`.
- `apps/backend/src/auth/decorators/account-type.decorator.ts` — `CustomerOrGuest`.
- `apps/backend/src/auth/customer/dto/verify-phone.dto.ts` — `guestToken` field.
- `apps/backend/src/interceptors/logging.interceptor.ts` — `'guesttoken'` in the redact list.

## Docs that may still reference the guest flow

The following files under `apps/backend/docs/` describe the flow as it was before
removal and will need a pass if the flow stays gone:

- `auth/client-integration.md`
- `auth/customer-endpoints-reference.md`
- `auth/auth-api.md`
- `auth/auth-module-rfc.md`
- `auth/verification-flows.md`
- `auth/token-machinery.md`
- `content/content-module-design.md`
- `gamification/tokenomics-and-games-design.md`

They were left as-is on purpose — restoring the flow makes them accurate again.
If restoration is off the table long-term, they should be updated in a follow-up.
