-- ════════════════════════════════════════════════════════════════════════════
-- Two customer-app needs from the Figma review:
--  1) user_consents — record T&C / privacy / marketing acceptance (version + when) for
--     compliance (onboarding "I accept Terms & Privacy").
--  2) Rewards redemption store — fixed-price points → "Premium Experiences" catalog +
--     redemption log. Distinct from auctions (bidding) and content_unlocks (content).
--     The spend is debited via the ledger (source_type='reward_redemption', added on 0004).
-- UUIDv7 PKs.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Consents (legal acceptance trail) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_consents (
    id               UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type     VARCHAR(20) NOT NULL
                       CHECK (consent_type IN ('terms','privacy','marketing','age')),
    document_version VARCHAR(40) NOT NULL,          -- e.g. 'tos-2026-01' / 'privacy-v3'
    accepted         BOOLEAN NOT NULL DEFAULT true, -- false = explicitly declined (marketing)
    ip_address       VARCHAR(45),
    user_agent       VARCHAR(300),
    accepted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_user_consents_user ON user_consents(user_id, consent_type, accepted_at DESC);

-- ─── Rewards redemption store (Premium Experiences) ─────────────────────────
CREATE TABLE IF NOT EXISTS reward_catalog_items (
    id                    UUID PRIMARY KEY DEFAULT uuidv7(),
    name                  VARCHAR(200) NOT NULL,
    description           TEXT,
    category              VARCHAR(20) NOT NULL DEFAULT 'experience'
                            CHECK (category IN ('experience','merch','perk','content','voucher')),
    image_media_id        UUID REFERENCES media_metadata(id) ON DELETE SET NULL,
    cost_points           INTEGER NOT NULL,         -- fixed redemption price (coins/points)
    stock_total           INTEGER,                  -- NULL = unlimited
    stock_remaining       INTEGER,
    requires_subscription BOOLEAN NOT NULL DEFAULT false,  -- premium-only experiences
    region                VARCHAR(10) CHECK (region IN ('NA','EU','APAC','LATAM','MEA')),  -- NULL = global
    is_active             BOOLEAN NOT NULL DEFAULT true,
    starts_at             TIMESTAMPTZ,
    ends_at               TIMESTAMPTZ,
    created_by            UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reward_catalog_active ON reward_catalog_items(is_active) WHERE is_active;

CREATE TABLE IF NOT EXISTS reward_redemptions (
    id               UUID PRIMARY KEY DEFAULT uuidv7(),
    item_id          UUID NOT NULL REFERENCES reward_catalog_items(id) ON DELETE RESTRICT,
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cost_points      INTEGER NOT NULL,             -- price snapshot at redemption (debited via ledger)
    status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','confirmed','fulfilled','cancelled','refunded')),
    fulfillment_note VARCHAR(500),                 -- voucher code / booking ref / shipping
    redeemed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fulfilled_at     TIMESTAMPTZ
);
CREATE INDEX idx_reward_redemptions_user ON reward_redemptions(user_id, redeemed_at DESC);
CREATE INDEX idx_reward_redemptions_item ON reward_redemptions(item_id);
