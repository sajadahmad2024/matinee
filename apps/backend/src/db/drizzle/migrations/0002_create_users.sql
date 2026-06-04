-- ════════════════════════════════════════════════════════════════════════════
-- Foundational migration: Identity, RBAC, Auth, Devices/Push, Tokenomics config
-- Tables:
--   users, roles, permissions, user_roles, role_permissions,
--   oauth_accounts, otp_codes,
--   reward_rules, referral_codes, referral_redemptions,
--   device_tokens, device_token_topics
-- No DB-level audit triggers (auditing handled at the app layer later).
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Users (guest / customer / admin, unified) ──────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id                  UUID PRIMARY KEY DEFAULT uuidv7(),
    account_type        VARCHAR(20) NOT NULL DEFAULT 'guest'
                          CHECK (account_type IN ('guest','customer','admin')),
    email               VARCHAR(255),                -- admins: required; customers: optional
    password_hash       VARCHAR(255),                -- admins (bcrypt); null for phone/social/guest
    phone               VARCHAR(20),                 -- E.164 (normalized at app layer); customer login id
    username            VARCHAR(50),                 -- shown across platform; set at create-account
    first_name          VARCHAR(100),
    last_name           VARCHAR(100),
    gender              VARCHAR(20) CHECK (gender IN ('male','female','other','prefer_not_to_say')),
    avatar_url          TEXT,                        -- externally-hosted avatar imported from social (Google/Apple)
    avatar_media_id     UUID REFERENCES media_metadata(id) ON DELETE SET NULL,  -- avatar uploaded into OUR pipeline (private S3 + CDN); preferred over avatar_url
    primary_auth_method VARCHAR(20) CHECK (primary_auth_method IN ('phone','google','apple','email')),
    country_code        VARCHAR(2),                  -- ISO 3166-1 alpha-2; resolved location (compliance)
    region              VARCHAR(100),                -- state/province (optional)
    timezone            VARCHAR(64),                 -- IANA tz; streak day boundaries + display
    location_source     VARCHAR(10) CHECK (location_source IN ('ip','device','manual')),
    location_updated_at TIMESTAMPTZ,
    wallet_address      VARCHAR(64),                 -- forward hook for on-chain rewards (Rewards module)
    token_version       INTEGER NOT NULL DEFAULT 0,  -- bump to invalidate all stateless JWTs
    merged_into_user_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- guest → real-user merge pointer
    status              VARCHAR(20) NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','suspended','banned','disabled')),  -- disabled = admin access revoked
    suspended_until     TIMESTAMPTZ,                 -- when a temporary suspension auto-lifts (null = indefinite)
    status_reason       VARCHAR(500),                -- reason for current non-active status
    status_changed_by   UUID REFERENCES users(id) ON DELETE SET NULL,  -- admin who set the current status
    status_changed_at   TIMESTAMPTZ,
    is_email_verified   BOOLEAN NOT NULL DEFAULT false,
    is_phone_verified   BOOLEAN NOT NULL DEFAULT false,
    last_login_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

-- One ACTIVE account per identifier; case-insensitive for email/username; soft-deleted rows free the identifier
CREATE UNIQUE INDEX idx_users_phone    ON users(phone)           WHERE phone    IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX idx_users_email    ON users(lower(email))    WHERE email    IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX idx_users_username ON users(lower(username)) WHERE username IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX        idx_users_account_type ON users(account_type) WHERE deleted_at IS NULL;
CREATE INDEX        idx_users_status       ON users(status)       WHERE deleted_at IS NULL;
CREATE INDEX        idx_users_country_code ON users(country_code) WHERE deleted_at IS NULL;
CREATE INDEX        idx_users_avatar_media ON users(avatar_media_id) WHERE avatar_media_id IS NOT NULL;

-- ─── Enforcement history (suspend / ban / reinstate; who took the action) ───
CREATE TABLE IF NOT EXISTS user_enforcement_actions (
    id           UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,   -- target user
    action       VARCHAR(20) NOT NULL
                   CHECK (action IN ('suspend','ban','reinstate','disable','enable')),
    reason       VARCHAR(500),
    expires_at   TIMESTAMPTZ,                 -- for temporary suspensions (null = indefinite/permanent)
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,  -- admin who took the action
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_user_enforcement_user         ON user_enforcement_actions(user_id);
CREATE INDEX idx_user_enforcement_performed_by ON user_enforcement_actions(performed_by);

-- ─── RBAC: roles / permissions / mappings (admins only get user_roles) ──────
CREATE TABLE IF NOT EXISTS roles (
    id          UUID PRIMARY KEY DEFAULT uuidv7(),
    name        VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_system   BOOLEAN NOT NULL DEFAULT false,   -- built-ins cannot be edited/deleted
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id          UUID PRIMARY KEY DEFAULT uuidv7(),
    name        VARCHAR(100) NOT NULL UNIQUE,     -- e.g. 'admins:write'
    description VARCHAR(255),
    resource    VARCHAR(100) NOT NULL,
    action      VARCHAR(50)  NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,   -- super-admin who granted it
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_user_roles_user_id          ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id          ON user_roles(role_id);
CREATE INDEX idx_role_permissions_role_id    ON role_permissions(role_id);
CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);

-- ─── OAuth accounts (Google / Apple) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id                      UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider                VARCHAR(20) NOT NULL CHECK (provider IN ('google','apple')),
    provider_user_id        VARCHAR(255) NOT NULL,
    email                   VARCHAR(255),
    raw_profile             JSONB,          -- social name/avatar/etc. captured at link time
    access_token_encrypted  TEXT,
    refresh_token_encrypted TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_oauth_accounts_provider_user ON oauth_accounts(provider, provider_user_id);
CREATE INDEX        idx_oauth_accounts_user_id       ON oauth_accounts(user_id);

-- ─── OTP codes (customer phone OTP + admin email password-reset) ────────────
CREATE TABLE IF NOT EXISTS otp_codes (
    id           UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id      UUID REFERENCES users(id) ON DELETE CASCADE,  -- null pre-signup (phone login before account exists)
    destination  VARCHAR(255) NOT NULL,        -- phone (E.164) or email
    channel      VARCHAR(10)  NOT NULL CHECK (channel IN ('sms','email')),
    purpose      VARCHAR(30)  NOT NULL
                   CHECK (purpose IN ('login','phone_verification','email_verification','password_reset')),
    code_hash    VARCHAR(255) NOT NULL,        -- OTP stored hashed, never plaintext
    expires_at   TIMESTAMPTZ NOT NULL,
    consumed_at  TIMESTAMPTZ,
    attempts     INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_otp_codes_destination_purpose ON otp_codes(destination, purpose) WHERE consumed_at IS NULL;
CREATE INDEX idx_otp_codes_expires_at          ON otp_codes(expires_at);

-- ─── Tokenomics config (admin-editable; common to ALL reward types) ─────────
-- One row per reward type; type-specific knobs live in `config` (JSONB).
-- The earned points/XP balance + transaction LEDGER is deferred to the Rewards module.
CREATE TABLE IF NOT EXISTS reward_rules (
    id          UUID PRIMARY KEY DEFAULT uuidv7(),
    rule_key    VARCHAR(50) NOT NULL UNIQUE,   -- 'referral' | 'daily_login' | 'weekly_streak' | 'predictive_streak' | ...
    name        VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    is_enabled  BOOLEAN NOT NULL DEFAULT true,
    config      JSONB NOT NULL DEFAULT '{}'::jsonb,  -- e.g. {"xp_per_invite":500,"max_invites_per_month":10}
    updated_by  UUID REFERENCES users(id) ON DELETE SET NULL,  -- admin who last edited
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reward_rules_enabled ON reward_rules(is_enabled);

-- ─── Geo compliance policy (admin-editable; gates tokenomics & subscription) ─
-- One row per country + a single default/fallback row (country_code NULL).
CREATE TABLE IF NOT EXISTS geo_policies (
    id                      UUID PRIMARY KEY DEFAULT uuidv7(),
    country_code            VARCHAR(2),              -- ISO 3166-1 alpha-2; NULL on the default row
    is_default              BOOLEAN NOT NULL DEFAULT false,  -- fallback for unlisted countries
    is_supported            BOOLEAN NOT NULL DEFAULT true,   -- app available in region
    tokenomics_enabled      BOOLEAN NOT NULL DEFAULT true,   -- may earn points / XP
    onchain_rewards_enabled BOOLEAN NOT NULL DEFAULT false,  -- crypto / on-chain rewards allowed
    subscription_required   BOOLEAN NOT NULL DEFAULT true,   -- gating differs by region
    config                  JSONB NOT NULL DEFAULT '{}'::jsonb,  -- currency, pricing tier, restrictions
    notes                   VARCHAR(500),
    updated_by              UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_geo_policies_country ON geo_policies(country_code) WHERE country_code IS NOT NULL;
CREATE UNIQUE INDEX idx_geo_policies_default ON geo_policies(is_default)   WHERE is_default;

-- ─── Referral graph (codes + redemptions; amounts driven by reward_rules) ───
CREATE TABLE IF NOT EXISTS referral_codes (
    id         UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id    UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    code       VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referral_redemptions (
    id          UUID PRIMARY KEY DEFAULT uuidv7(),
    code        VARCHAR(20) NOT NULL,
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,          -- code owner
    referee_id  UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,   -- new user (one referral each)
    status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','qualified','rewarded','reverted')),
    rewarded_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (referrer_id <> referee_id)
);
CREATE INDEX idx_referral_redemptions_referrer ON referral_redemptions(referrer_id);
CREATE INDEX idx_referral_redemptions_status   ON referral_redemptions(status);

-- ─── Devices & push (FCM) — guests and customers; migrate on merge ──────────
CREATE TABLE IF NOT EXISTS device_tokens (
    id           UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- guest or customer
    fcm_token    TEXT NOT NULL,
    platform     VARCHAR(10) NOT NULL CHECK (platform IN ('ios','android','web')),
    device_id    VARCHAR(255),        -- client-stable device id (optional; anti-abuse later)
    app_version  VARCHAR(20),
    is_active    BOOLEAN NOT NULL DEFAULT true,
    last_seen_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_device_tokens_fcm  ON device_tokens(fcm_token);   -- re-register = upsert/move
CREATE INDEX        idx_device_tokens_user ON device_tokens(user_id) WHERE is_active;

CREATE TABLE IF NOT EXISTS device_token_topics (
    device_token_id UUID NOT NULL REFERENCES device_tokens(id) ON DELETE CASCADE,
    topic           VARCHAR(100) NOT NULL,   -- e.g. 'all', 'daily_streak', 'bidding'
    subscribed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (device_token_id, topic)
);
CREATE INDEX idx_device_token_topics_topic ON device_token_topics(topic);

-- ════════════════════════════════════════════════════════════════════════════
-- Seed data
-- ════════════════════════════════════════════════════════════════════════════

-- System roles (customers are identified by account_type, not a role)
INSERT INTO roles (name, description, is_system) VALUES
    ('super_admin', 'Full access; can manage admins, roles and permissions', true),
    ('admin',       'Administrative access per assigned permissions',         true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, description, resource, action) VALUES
    ('admins:read',       'View admin users',          'admins',       'read'),
    ('admins:write',      'Create and update admins',  'admins',       'write'),
    ('admins:delete',     'Deactivate/revoke admins',  'admins',       'delete'),
    ('roles:read',        'View roles',                'roles',        'read'),
    ('roles:write',       'Create and update roles',   'roles',        'write'),
    ('roles:delete',      'Delete roles',              'roles',        'delete'),
    ('permissions:read',  'View permissions',          'permissions',  'read'),
    ('users:read',        'View customers',            'users',        'read'),
    ('users:write',       'Update customers',          'users',        'write'),
    ('users:delete',      'Deactivate customers',      'users',        'delete'),
    ('users:moderate',    'Suspend / ban / reinstate customers', 'users', 'moderate'),
    ('rewards:read',      'View tokenomics config',    'rewards',      'read'),
    ('rewards:write',     'Edit tokenomics config',    'rewards',      'write'),
    ('compliance:read',   'View geo/compliance policy','compliance',   'read'),
    ('compliance:write',  'Edit geo/compliance policy','compliance',   'write')
ON CONFLICT (name) DO NOTHING;

-- super_admin → all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- admin → manage customers + rewards, read-only on admin/role config
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin'
  AND p.name IN ('admins:read','roles:read','permissions:read',
                 'users:read','users:write','users:delete','users:moderate',
                 'rewards:read','rewards:write','compliance:read')
ON CONFLICT DO NOTHING;

-- Default tokenomics config (matches the admin panel defaults)
INSERT INTO reward_rules (rule_key, name, description, is_enabled, config) VALUES
    ('referral',    'Referral Program', 'Reward users for inviting friends', true,
        '{"xp_per_invite": 500, "max_invites_per_month": 10}'::jsonb),
    ('daily_login', 'Daily Login Bonus', 'Reward users for opening the app daily', true,
        '{"points": 10, "xp": 5}'::jsonb)
ON CONFLICT (rule_key) DO NOTHING;

-- Default geo policy (fallback for any unlisted country)
INSERT INTO geo_policies (country_code, is_default, is_supported, tokenomics_enabled,
                          onchain_rewards_enabled, subscription_required, notes)
SELECT NULL, true, true, true, false, true, 'Default fallback policy for unlisted countries'
WHERE NOT EXISTS (SELECT 1 FROM geo_policies WHERE is_default);
