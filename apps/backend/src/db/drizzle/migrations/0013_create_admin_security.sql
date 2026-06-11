-- ════════════════════════════════════════════════════════════════════════════
-- Admin onboarding + 2FA. Closes the two schema gaps from the end-to-end flow
-- review: inviting admins (Settings → Admin Management) and managing 2FA. Integrates
-- with the auth-module rebuild (RBAC roles from 0002). UUIDv7 PKs.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Admin invites (pending team members in Settings → Admin Management) ────
CREATE TABLE IF NOT EXISTS admin_invites (
    id               UUID PRIMARY KEY DEFAULT uuidv7(),
    email            VARCHAR(255) NOT NULL,
    role_id          UUID REFERENCES roles(id) ON DELETE SET NULL,   -- role the invitee will get
    token_hash       VARCHAR(255) NOT NULL UNIQUE,                   -- hashed one-time invite token
    status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','accepted','revoked','expired')),
    invited_by       UUID REFERENCES users(id) ON DELETE SET NULL,
    accepted_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at       TIMESTAMPTZ,
    accepted_at      TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_admin_invites_email   ON admin_invites(email);
CREATE INDEX idx_admin_invites_pending ON admin_invites(status) WHERE status = 'pending';

-- ─── 2FA / MFA enrollment (one per user; admins can be forced on via app_settings) ──
CREATE TABLE IF NOT EXISTS user_mfa (
    user_id      UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    method       VARCHAR(20) NOT NULL DEFAULT 'totp'
                   CHECK (method IN ('totp','sms','email')),
    secret       VARCHAR(255),                       -- TOTP secret (encrypted at app layer)
    is_enabled   BOOLEAN NOT NULL DEFAULT false,
    backup_codes JSONB NOT NULL DEFAULT '[]'::jsonb,  -- hashed one-time backup codes
    verified_at  TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
