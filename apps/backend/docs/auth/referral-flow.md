# Referral Flow

> How referral codes are generated, claimed, and stored. Reward payout is designed but not
> yet wired — see §4.

---

## 1. Mind map

```mermaid
mindmap
  root((Referral))
    Own code
      Auto-generated on signup
        ensureOwnReferralCode(userId, tx)
        8-char alphanumeric UPPER
        Stored in referral_codes (UNIQUE per user + UNIQUE code)
      Called in
        verifyPhone
        resolveSocialUser
        completeProfile (belt-and-braces)
    Claim someone else's code
      POST /v1/auth/profile with referralCode
      Validation
        Code owner must exist (400 if not)
        Owner is not me (400 if self)
        I haven't already redeemed (silent no-op)
      Effect
        INSERT referral_redemptions
          code, referrer_id, referee_id, status='pending'
        UNIQUE(referee_id) → can only be referred once ever
    Read
      GET /v1/profile/referral
        { code, completedReferrals }
    Reward payout
      NOT BUILT
      status transitions
        pending → qualified → rewarded → (or reverted)
      Needs
        Product decision on qualify criteria
        ledger_transactions row (sourceType='referral')
        Notification to referrer
```

---

## 2. Endpoints

### 2a. `GET /v1/profile/referral` — Read own code

**Auth:** `@CustomerOnly`

**Response 200:**
```json
{ "code": "X5J7T0LE", "completedReferrals": 3 }
```

The `code` field is auto-generated at signup — never null for a customer.

### 2b. `POST /v1/auth/profile` — Claim someone's code

The referral claim happens as part of "complete profile" (see `customer-endpoints-reference.md` §7). Passing `referralCode` in this call is the ONE place a referee ever gets linked to a referrer.

```jsonc
POST /v1/auth/profile
Authorization: Bearer <customer-access-token>
{
  "username":     "bob",
  "referralCode": "X5J7T0LE"   // Alice's code — optional
}
```

**Result on DB:**
```
referral_redemptions
  code:        X5J7T0LE
  referrer_id: <alice's userId>     ← code owner
  referee_id:  <bob's userId>       ← the new user (UNIQUE)
  status:      pending
  created_at:  now()
```

**Errors on the referral portion:**
- `400` `Invalid referral code` — no such code
- `400` `You cannot use your own referral code`
- Silent skip if `referral_redemptions` already has a row for this user (idempotent — profile update still proceeds)

---

## 3. Code format & generation

```ts
randomBytes(6)
  .toString('base64url')
  .replace(/[^A-Za-z0-9]/g, '')
  .slice(0, 8)
  .toUpperCase()
```

- **8 chars**, alphanumeric, UPPER — matches the design (`X5J7T0LE`, `CH8362`, `BR2MJWBV`)
- **Retry up to 5×** on unique-index collision (`referral_codes.code` UNIQUE)
- Implementation: `CustomerAuthService.ensureOwnReferralCode(userId, tx)` in `src/auth/customer/customer-auth.service.ts`

Called inside these signup transactions so the code is guaranteed to exist by the time the user is a customer:

| Where | When |
|---|---|
| `verifyPhone` (new customer path) | Phone-first signup succeeds |
| `resolveSocialUser` (new customer path) | Google/Apple signup succeeds |
| `completeProfile` | Idempotent fallback — catches any race |

---

## 4. Reward payout — NOT YET BUILT

The schema is ready for the full lifecycle:

```
pending → qualified → rewarded
                    ↘
                     reverted    (fraud, refund, referee deletion, …)
```

**Missing work** — needs a **product decision first:**

1. **When does `pending → qualified`?**
   - After phone verification? (already true at claim time, so effectively immediate)
   - After first content view?
   - After first paid subscription?
   - After X earned points?
2. **What does each party get?**
   - Referrer: N points? % of referee lifetime spend?
   - Referee: welcome bonus?
   - Configurable via `reward_rules` table + versioned in `reward_rule_versions` (both already exist).
3. **How is it credited?**
   - Insert a `ledger_transactions` row with `sourceType='referral'` and `sourceId=redemption.id`
   - This ripples through `wallets.pointsBalance` automatically via the ledger
   - Set `referral_redemptions.status='rewarded'` + `rewarded_at=now()`
   - Emit a `user_notifications` entry for the referrer

Once (1)–(3) are decided, wiring is ~1 day: a `ReferralService.qualifyReferrals()` method plus a cron/event trigger, all inside a transaction.

---

## 5. Where it lives in code

| Concern | File |
|---|---|
| Ensure code / find owner / create redemption | `src/db/repositories/auth/referral.repository.ts` |
| Auto-generate on signup | `CustomerAuthService.ensureOwnReferralCode` |
| Claim during complete-profile | `CustomerAuthService.completeProfile` |
| Read own code + count | `ProfileService.getReferral` |
| Read endpoint | `src/profile/self/profile.controller.ts` (`GET /profile/referral`) |

---

## 6. Query snippet for debugging

```sql
SELECT u.username, u.phone,
       rc.code AS own_code,
       rr.code AS used_code, rr.status,
       ref.username AS referred_by
FROM users u
LEFT JOIN referral_codes rc      ON rc.user_id  = u.id
LEFT JOIN referral_redemptions rr ON rr.referee_id = u.id
LEFT JOIN users ref              ON ref.id      = rr.referrer_id
WHERE u.username IS NOT NULL
ORDER BY u.created_at DESC LIMIT 20;
```

Sample output:
```
username    phone            own_code   used_code   status   referred_by
alice_abc   +919000000001    BR2MJWBV                
bob_xyz     +919100000002    GVSTRM4G   BR2MJWBV    pending  alice_abc
```
