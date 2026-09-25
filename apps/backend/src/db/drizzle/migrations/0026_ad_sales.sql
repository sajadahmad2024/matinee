-- ════════════════════════════════════════════════════════════════════════════
-- Ad Sales management (platform-level). Doc: apps/documentation/docs/backend/ads/ad-sales-management.md
--   • advertisers, ad_campaigns (commercial | sponsorship), ad_ledger_entries
--   • content_sponsorships → advertiser / campaign links
--   • ad_events can reference a campaign (feed commercials) instead of a sponsorship
--   • permissions ads:read / ads:write (super_admin)
--   • data: commercial sponsorships → commercial campaigns; sponsors → advertisers
-- Idempotent.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS advertisers (
    id             UUID PRIMARY KEY DEFAULT uuidv7(),
    name           VARCHAR(200) NOT NULL,
    logo_media_id  UUID REFERENCES media_metadata(id) ON DELETE SET NULL,
    website        VARCHAR(500),
    contact_name   VARCHAR(200),
    contact_email  VARCHAR(255),
    billing_email  VARCHAR(255),
    currency       VARCHAR(3)  NOT NULL DEFAULT 'USD',
    status         VARCHAR(20) NOT NULL DEFAULT 'active',
    notes          VARCHAR(2000),
    created_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at     TIMESTAMPTZ,
    CONSTRAINT advertisers_status_check CHECK (status IN ('active','paused','archived'))
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_advertisers_name ON advertisers (lower(name)) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS ad_campaigns (
    id                          UUID PRIMARY KEY DEFAULT uuidv7(),
    advertiser_id               UUID NOT NULL REFERENCES advertisers(id) ON DELETE RESTRICT,
    name                        VARCHAR(200) NOT NULL,
    type                        VARCHAR(20)  NOT NULL,
    status                      VARCHAR(20)  NOT NULL DEFAULT 'draft',
    starts_at                   TIMESTAMPTZ,
    ends_at                     TIMESTAMPTZ,
    regions                     VARCHAR(10)[] NOT NULL DEFAULT '{}',
    -- commercial creative
    creative_media_id           UUID REFERENCES media_metadata(id) ON DELETE SET NULL,
    click_url                   VARCHAR(1000),
    cta_label                   VARCHAR(40),
    duration_seconds            INTEGER,
    skippable_after_seconds     INTEGER,
    -- delivery
    feed_frequency              INTEGER NOT NULL DEFAULT 5,
    weight                      INTEGER NOT NULL DEFAULT 1,
    frequency_cap_per_user_day  INTEGER,
    -- pricing + budget
    pricing_model               VARCHAR(10) NOT NULL DEFAULT 'flat',
    flat_fee_cents              BIGINT NOT NULL DEFAULT 0,
    cpm_cents                   INTEGER NOT NULL DEFAULT 0,
    cpc_cents                   INTEGER NOT NULL DEFAULT 0,
    budget_cents                BIGINT,
    daily_budget_cents          BIGINT,
    impression_goal             BIGINT,
    currency                    VARCHAR(3) NOT NULL DEFAULT 'USD',
    ended_reason                VARCHAR(30),
    notes                       VARCHAR(2000),
    created_by                  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at                  TIMESTAMPTZ,
    CONSTRAINT ad_campaigns_type_check CHECK (type IN ('commercial','sponsorship')),
    CONSTRAINT ad_campaigns_status_check CHECK (status IN ('draft','scheduled','active','paused','ended')),
    CONSTRAINT ad_campaigns_pricing_check CHECK (pricing_model IN ('flat','cpm','cpc')),
    CONSTRAINT ad_campaigns_regions_check CHECK (regions <@ ARRAY['NA','EU','APAC','LATAM','MEA']::varchar[]),
    CONSTRAINT ad_campaigns_dates_check CHECK (starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at),
    CONSTRAINT ad_campaigns_numbers_check CHECK (
        feed_frequency >= 1 AND weight >= 1 AND flat_fee_cents >= 0 AND cpm_cents >= 0 AND cpc_cents >= 0
        AND (budget_cents IS NULL OR budget_cents >= 0) AND (daily_budget_cents IS NULL OR daily_budget_cents >= 0)
        AND (frequency_cap_per_user_day IS NULL OR frequency_cap_per_user_day >= 1)
        AND (duration_seconds IS NULL OR duration_seconds >= 0)
        AND (skippable_after_seconds IS NULL OR skippable_after_seconds >= 0))
);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_advertiser ON ad_campaigns (advertiser_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_live ON ad_campaigns (type, status, starts_at, ends_at) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS ad_ledger_entries (
    id              UUID PRIMARY KEY DEFAULT uuidv7(),
    advertiser_id   UUID NOT NULL REFERENCES advertisers(id) ON DELETE RESTRICT,
    campaign_id     UUID REFERENCES ad_campaigns(id) ON DELETE SET NULL,
    kind            VARCHAR(20) NOT NULL,
    amount_cents    BIGINT NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    entry_date      DATE NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
    invoice_number  VARCHAR(60),
    due_date        DATE,
    reference       VARCHAR(200),
    note            VARCHAR(1000),
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ad_ledger_kind_check CHECK (kind IN ('booked','accrued','invoiced','paid','credit')),
    CONSTRAINT ad_ledger_amount_check CHECK (amount_cents >= 0)
);
CREATE INDEX IF NOT EXISTS idx_ad_ledger_advertiser ON ad_ledger_entries (advertiser_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_ad_ledger_campaign ON ad_ledger_entries (campaign_id, entry_date);
-- one automatic accrual per campaign per day
CREATE UNIQUE INDEX IF NOT EXISTS uq_ad_ledger_accrual ON ad_ledger_entries (campaign_id, entry_date) WHERE kind = 'accrued';

ALTER TABLE content_sponsorships
    ADD COLUMN IF NOT EXISTS advertiser_id UUID REFERENCES advertisers(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS campaign_id   UUID REFERENCES ad_campaigns(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_content_sponsorships_campaign ON content_sponsorships (campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_sponsorships_advertiser ON content_sponsorships (advertiser_id) WHERE advertiser_id IS NOT NULL;

-- ad_events: commercial campaign events carry campaign_id and no sponsorship/content.
ALTER TABLE ad_events ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE CASCADE;
ALTER TABLE ad_events ALTER COLUMN sponsorship_id DROP NOT NULL;
ALTER TABLE ad_events ALTER COLUMN content_id DROP NOT NULL;
ALTER TABLE ad_events DROP CONSTRAINT IF EXISTS ad_events_target_check;
ALTER TABLE ad_events ADD CONSTRAINT ad_events_target_check CHECK (sponsorship_id IS NOT NULL OR campaign_id IS NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ad_events_campaign_dedupe ON ad_events (campaign_id, user_id, view_key, event_type) WHERE campaign_id IS NOT NULL AND sponsorship_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_ad_events_campaign ON ad_events (campaign_id, occurred_at) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ad_events_user_day ON ad_events (user_id, campaign_id, occurred_at) WHERE campaign_id IS NOT NULL;

-- permissions (super_admin gets everything; re-grant so the new ones are covered)
INSERT INTO permissions (name, description, resource, action) VALUES
    ('ads:read',  'View advertisers, campaigns, ad performance and the ad-sales ledger', 'ads', 'read'),
    ('ads:write', 'Manage advertisers, campaigns and ad-sales ledger entries',            'ads', 'write')
ON CONFLICT (name) DO NOTHING;
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
 WHERE r.name = 'super_admin' AND p.name IN ('ads:read','ads:write')
ON CONFLICT DO NOTHING;

-- ─── data: sponsors → advertisers; commercial sponsorships → commercial campaigns ───
INSERT INTO advertisers (name)
SELECT DISTINCT ON (lower(trim(s.sponsor_name))) trim(s.sponsor_name)
  FROM content_sponsorships s
 WHERE trim(s.sponsor_name) <> ''
   AND NOT EXISTS (SELECT 1 FROM advertisers a WHERE lower(a.name) = lower(trim(s.sponsor_name)) AND a.deleted_at IS NULL)
ON CONFLICT DO NOTHING;

UPDATE content_sponsorships s
   SET advertiser_id = a.id
  FROM advertisers a
 WHERE s.advertiser_id IS NULL AND a.deleted_at IS NULL AND lower(a.name) = lower(trim(s.sponsor_name));

WITH src AS (
  SELECT s.id AS sponsorship_id, s.advertiser_id, c.title, c.video_media_id, s.click_url, s.cta_label,
         s.ad_duration_seconds, s.skippable_after_seconds, coalesce(s.feed_frequency, 5) AS feed_frequency,
         s.starts_at, s.ends_at, s.revenue_cents, s.cpm_cents, s.cpc_cents, s.currency, s.is_active
    FROM content_sponsorships s
    JOIN contents c ON c.id = s.content_id
   WHERE s.ad_format = 'commercial' AND s.campaign_id IS NULL AND s.advertiser_id IS NOT NULL
), ins AS (
  INSERT INTO ad_campaigns (advertiser_id, name, type, status, starts_at, ends_at, creative_media_id, click_url, cta_label,
                            duration_seconds, skippable_after_seconds, feed_frequency, pricing_model, flat_fee_cents,
                            cpm_cents, cpc_cents, currency, notes)
  SELECT advertiser_id, left(title, 200), 'commercial',
         CASE WHEN NOT is_active OR (ends_at IS NOT NULL AND ends_at <= now()) THEN 'ended'
              WHEN starts_at IS NOT NULL AND starts_at > now() THEN 'scheduled' ELSE 'active' END,
         starts_at, ends_at, video_media_id, click_url, cta_label, ad_duration_seconds, skippable_after_seconds,
         feed_frequency,
         CASE WHEN coalesce(cpm_cents, 0) > 0 THEN 'cpm' WHEN coalesce(cpc_cents, 0) > 0 THEN 'cpc' ELSE 'flat' END,
         coalesce(revenue_cents, 0), coalesce(cpm_cents, 0), coalesce(cpc_cents, 0), currency,
         'Migrated from commercial sponsorship ' || sponsorship_id
    FROM src
  RETURNING id, notes
)
UPDATE content_sponsorships s
   SET campaign_id = ins.id
  FROM ins
 WHERE ins.notes = 'Migrated from commercial sponsorship ' || s.id;
