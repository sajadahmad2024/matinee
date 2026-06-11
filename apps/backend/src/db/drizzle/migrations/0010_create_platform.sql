-- ════════════════════════════════════════════════════════════════════════════
-- Platform administration: admin audit trail, mobile app-version gating, and a
-- typed key-value settings store (security policy + feature flags + economy knobs).
-- Backs the Settings module (Admin Management / Security / App Version). UUIDv7 PKs.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Admin audit log (every privileged action; the Settings "Audit Log") ────
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id           UUID PRIMARY KEY DEFAULT uuidv7(),
    actor_id     UUID REFERENCES users(id) ON DELETE SET NULL,  -- admin who acted
    actor_label  VARCHAR(150),                                  -- name/email snapshot at action time
    action       VARCHAR(80) NOT NULL,                          -- e.g. 'content.published', 'user.banned'
    target_type  VARCHAR(40),                                   -- 'content' | 'user' | 'plan' | 'setting' | …
    target_id    UUID,
    target_label VARCHAR(200),
    metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,            -- before/after, extra context
    ip_address   VARCHAR(45),                                   -- IPv4/IPv6
    user_agent   VARCHAR(300),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_admin_audit_log_actor  ON admin_audit_log(actor_id, created_at DESC);
CREATE INDEX idx_admin_audit_log_target ON admin_audit_log(target_type, target_id);
CREATE INDEX idx_admin_audit_log_time   ON admin_audit_log(created_at DESC);

-- ─── App version gating (force-update / supported versions per platform) ────
CREATE TABLE IF NOT EXISTS app_versions (
    id             UUID PRIMARY KEY DEFAULT uuidv7(),
    platform       VARCHAR(10) NOT NULL CHECK (platform IN ('ios','android')),
    version        VARCHAR(20) NOT NULL,                -- semver
    is_supported   BOOLEAN NOT NULL DEFAULT true,
    force_update   BOOLEAN NOT NULL DEFAULT false,      -- block usage until updated
    is_latest      BOOLEAN NOT NULL DEFAULT false,
    update_message VARCHAR(300),
    released_at    TIMESTAMPTZ,
    created_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (platform, version)
);
CREATE INDEX idx_app_versions_platform ON app_versions(platform, force_update);

-- ─── Typed settings store (security policy, feature flags, economy knobs) ───
CREATE TABLE IF NOT EXISTS app_settings (
    key         VARCHAR(80) PRIMARY KEY,             -- e.g. 'security.session_timeout_minutes'
    value       JSONB NOT NULL,                      -- typed value
    category    VARCHAR(40) NOT NULL DEFAULT 'general'
                  CHECK (category IN ('general','security','feature_flag','economy','notifications')),
    description VARCHAR(300),
    updated_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_app_settings_category ON app_settings(category);

-- Seed a few platform settings (admin-editable)
INSERT INTO app_settings (key, value, category, description) VALUES
  ('security.session_timeout_minutes', '60'::jsonb,   'security',     'Admin session idle timeout'),
  ('security.require_2fa_for_admins',  'true'::jsonb,  'security',     'Force 2FA for all admin accounts'),
  ('security.ip_allowlist',            '[]'::jsonb,    'security',     'Admin panel IP allowlist (empty = all)'),
  ('feature.games_enabled',            'true'::jsonb,  'feature_flag', 'Master switch for the Game Centre'),
  ('feature.subscriptions_enabled',    'true'::jsonb,  'feature_flag', 'Master switch for subscriptions')
ON CONFLICT (key) DO NOTHING;
