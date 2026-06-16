-- Idempotent sync of the UI-driven schema accommodations onto an already-migrated
-- dev DB (mirrors edits in 0003/0004). Safe to re-run. Non-destructive.
BEGIN;

-- ── Content: licensing + recommendation + sponsorship flag ──────────────────
ALTER TABLE contents ADD COLUMN IF NOT EXISTS license_status VARCHAR(20) NOT NULL DEFAULT 'original';
ALTER TABLE contents DROP CONSTRAINT IF EXISTS contents_license_status_check;
ALTER TABLE contents ADD CONSTRAINT contents_license_status_check
  CHECK (license_status IN ('original','licensed','expiring','expired'));
ALTER TABLE contents ADD COLUMN IF NOT EXISTS license_expires_at TIMESTAMPTZ;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS licensor_name VARCHAR(200);
ALTER TABLE contents ADD COLUMN IF NOT EXISTS license_terms VARCHAR(500);
ALTER TABLE contents ADD COLUMN IF NOT EXISTS recommendation VARCHAR(20) NOT NULL DEFAULT 'normal';
ALTER TABLE contents DROP CONSTRAINT IF EXISTS contents_recommendation_check;
ALTER TABLE contents ADD CONSTRAINT contents_recommendation_check
  CHECK (recommendation IN ('promoted','normal','deprioritized'));
ALTER TABLE contents ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_contents_license_expiry ON contents(license_expires_at)
  WHERE license_status IN ('licensed','expiring');
CREATE INDEX IF NOT EXISTS idx_contents_sponsored ON contents(id)
  WHERE is_sponsored AND deleted_at IS NULL;

-- ── Content: sponsorship / ad-sales table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS content_sponsorships (
    id                  UUID PRIMARY KEY DEFAULT uuidv7(),
    content_id          UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    sponsor_name        VARCHAR(200) NOT NULL,
    banner_media_id     UUID REFERENCES media_metadata(id) ON DELETE SET NULL,
    ad_duration_seconds INTEGER NOT NULL DEFAULT 0,
    placement           VARCHAR(20) NOT NULL DEFAULT 'pre-roll'
                          CHECK (placement IN ('pre-roll','mid-roll','post-roll','overlay')),
    revenue_cents       BIGINT NOT NULL DEFAULT 0,
    currency            VARCHAR(3) NOT NULL DEFAULT 'USD',
    starts_at           TIMESTAMPTZ,
    ends_at             TIMESTAMPTZ,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_sponsorships_content ON content_sponsorships(content_id) WHERE is_active;

-- ── Ad-Sales: commercial format on content_sponsorships + is_ad_commercial flag ──
ALTER TABLE contents ADD COLUMN IF NOT EXISTS is_ad_commercial BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE content_sponsorships ADD COLUMN IF NOT EXISTS ad_format VARCHAR(20) NOT NULL DEFAULT 'sponsored';
ALTER TABLE content_sponsorships DROP CONSTRAINT IF EXISTS content_sponsorships_ad_format_check;
ALTER TABLE content_sponsorships ADD CONSTRAINT content_sponsorships_ad_format_check
  CHECK (ad_format IN ('sponsored','commercial'));
ALTER TABLE content_sponsorships ADD COLUMN IF NOT EXISTS feed_frequency INTEGER;
ALTER TABLE content_sponsorships ADD COLUMN IF NOT EXISTS skippable_after_seconds INTEGER;
CREATE INDEX IF NOT EXISTS idx_content_sponsorships_commercial ON content_sponsorships(content_id)
  WHERE is_active AND ad_format = 'commercial';

-- ── Licensing: operational agreements table (cost / revenue / ROI / renewal) ──
CREATE TABLE IF NOT EXISTS content_licenses (
    id                      UUID PRIMARY KEY DEFAULT uuidv7(),
    content_id              UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    licensor_name           VARCHAR(200) NOT NULL,
    license_type            VARCHAR(20) NOT NULL DEFAULT 'non_exclusive'
                              CHECK (license_type IN ('exclusive','non_exclusive')),
    starts_at               TIMESTAMPTZ,
    expires_at              TIMESTAMPTZ,
    renewal_status          VARCHAR(20) NOT NULL DEFAULT 'renewing'
                              CHECK (renewal_status IN ('renewing','in_negotiation','expiring','lapsed','auto_renew')),
    license_cost_cents      BIGINT NOT NULL DEFAULT 0,
    currency                VARCHAR(3) NOT NULL DEFAULT 'USD',
    revenue_generated_cents BIGINT NOT NULL DEFAULT 0,
    revenue_source          VARCHAR(100),
    terms                   VARCHAR(500),
    is_active               BOOLEAN NOT NULL DEFAULT true,
    created_by              UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_licenses_content ON content_licenses(content_id) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_content_licenses_expiry  ON content_licenses(expires_at) WHERE is_active;

-- ── Content: optional parent title (BTS/clip → its primary title) ───────────
ALTER TABLE contents ADD COLUMN IF NOT EXISTS parent_content_id UUID REFERENCES contents(id) ON DELETE SET NULL;
ALTER TABLE contents DROP CONSTRAINT IF EXISTS contents_parent_not_self_check;
ALTER TABLE contents ADD CONSTRAINT contents_parent_not_self_check
  CHECK (parent_content_id IS NULL OR parent_content_id <> id);
CREATE INDEX IF NOT EXISTS idx_contents_parent ON contents(parent_content_id) WHERE parent_content_id IS NOT NULL;

-- ── Games: shared-content ledger source_type ────────────────────────────────
ALTER TABLE ledger_transactions DROP CONSTRAINT IF EXISTS ledger_transactions_source_type_check;
ALTER TABLE ledger_transactions ADD CONSTRAINT ledger_transactions_source_type_check
  CHECK (source_type IN ('referral','daily_streak','quest','prediction','bid','bid_refund','content_unlock','content_share','badge','admin','subscription'));

-- ── Games: per-instance unlock threshold + banner ───────────────────────────
ALTER TABLE quests      ADD COLUMN IF NOT EXISTS unlock_threshold_points INTEGER;
ALTER TABLE quests      ADD COLUMN IF NOT EXISTS banner_media_id UUID REFERENCES media_metadata(id) ON DELETE SET NULL;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS unlock_threshold_points INTEGER;
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS banner_media_id UUID REFERENCES media_metadata(id) ON DELETE SET NULL;
ALTER TABLE auctions    ADD COLUMN IF NOT EXISTS unlock_threshold_points INTEGER;
ALTER TABLE auctions    ADD COLUMN IF NOT EXISTS banner_media_id UUID REFERENCES media_metadata(id) ON DELETE SET NULL;

-- ── Games: app-widget config (per type) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS game_widget_configs (
    game_key        VARCHAR(30) PRIMARY KEY
                      CHECK (game_key IN ('daily_streak','quest','shared_content','prediction','bidding')),
    is_visible      BOOLEAN NOT NULL DEFAULT true,
    widget_style    VARCHAR(20) NOT NULL DEFAULT 'card'
                      CHECK (widget_style IN ('card','hero','carousel')),
    cta_label       VARCHAR(80),
    accent_color    VARCHAR(9),
    banner_media_id UUID REFERENCES media_metadata(id) ON DELETE SET NULL,
    updated_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Seeds: shared_content reward rule + widget rows + version snapshots ──────
INSERT INTO reward_rules (rule_key, name, description, is_enabled, config, version) VALUES
  ('shared_content', 'Shared Content', 'Earn for sharing content (autonomous, capped daily)', true,
     '{"points_per_share":15,"daily_share_cap":3,"xp_per_share":5}'::jsonb, 1)
ON CONFLICT (rule_key) DO NOTHING;

INSERT INTO game_widget_configs (game_key, cta_label) VALUES
  ('daily_streak',  'Keep your streak'),
  ('quest',         'Start a quest'),
  ('shared_content','Share & earn'),
  ('prediction',    'Predict & win'),
  ('bidding',       'Place a bid')
ON CONFLICT (game_key) DO NOTHING;

INSERT INTO reward_rule_versions (rule_id, rule_key, version, config)
SELECT id, rule_key, version, config FROM reward_rules WHERE rule_key = 'shared_content'
ON CONFLICT (rule_id, version) DO NOTHING;

COMMIT;
