-- Seed: platform app_settings (admin-editable security + feature flags)
-- Idempotent. Extracted from migration 0010 (table stays in the migration).

INSERT INTO app_settings (key, value, category, description) VALUES
  ('security.session_timeout_minutes', '60'::jsonb,   'security',     'Admin session idle timeout'),
  ('security.require_2fa_for_admins',  'true'::jsonb,  'security',     'Force 2FA for all admin accounts'),
  ('security.ip_allowlist',            '[]'::jsonb,    'security',     'Admin panel IP allowlist (empty = all)'),
  ('feature.games_enabled',            'true'::jsonb,  'feature_flag', 'Master switch for the Game Centre'),
  ('feature.subscriptions_enabled',    'true'::jsonb,  'feature_flag', 'Master switch for subscriptions')
ON CONFLICT (key) DO NOTHING;
