-- ════════════════════════════════════════════════════════════════════════════
-- Subscriptions module. Plans are the FOUNDATION (a subscription references a plan;
-- an invoice references a subscription). Pricing is per macro-region (NA/EU/APAC/LATAM/MEA)
-- via plan_region_prices; a subscription snapshots its region + country for regional analytics.
-- Provider-agnostic (Stripe today). Region gating still comes from geo_policies (0002).
-- UUIDv7 PKs; money stored as integer cents.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Plans (the paywall catalog) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_plans (
    id                  UUID PRIMARY KEY DEFAULT uuidv7(),
    name                VARCHAR(150) NOT NULL,
    description         VARCHAR(500),
    base_price_cents    BIGINT NOT NULL DEFAULT 0,        -- default price (regions may override)
    base_currency       VARCHAR(3) NOT NULL DEFAULT 'USD',
    interval            VARCHAR(10) NOT NULL DEFAULT 'monthly'
                          CHECK (interval IN ('monthly','yearly')),
    trial_days          INTEGER NOT NULL DEFAULT 0,
    features            JSONB NOT NULL DEFAULT '[]'::jsonb,   -- string[]
    is_active           BOOLEAN NOT NULL DEFAULT true,
    is_popular          BOOLEAN NOT NULL DEFAULT false,      -- highlighted in the paywall
    sort_order          INTEGER NOT NULL DEFAULT 0,
    provider            VARCHAR(20) NOT NULL DEFAULT 'stripe',
    provider_product_id VARCHAR(120),
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active) WHERE deleted_at IS NULL;

-- ─── Per-region price overrides (localized currency) ────────────────────────
CREATE TABLE IF NOT EXISTS plan_region_prices (
    id                UUID PRIMARY KEY DEFAULT uuidv7(),
    plan_id           UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    region            VARCHAR(10) NOT NULL
                        CHECK (region IN ('NA','EU','APAC','LATAM','MEA')),
    price_cents       BIGINT NOT NULL,
    currency          VARCHAR(3) NOT NULL DEFAULT 'USD',
    provider_price_id VARCHAR(120),                    -- e.g. Stripe price id per region
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (plan_id, region)
);
CREATE INDEX idx_plan_region_prices_plan ON plan_region_prices(plan_id);

-- ─── Subscriptions (user ⟷ plan; region snapshot for regional analytics) ────
CREATE TABLE IF NOT EXISTS subscriptions (
    id              UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id         UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'active'
                      CHECK (status IN ('trialing','active','past_due','canceled','unpaid')),
    region          VARCHAR(10) CHECK (region IN ('NA','EU','APAC','LATAM','MEA')),  -- priced/served region
    country_code    VARCHAR(2),                        -- snapshot of users.country_code at signup
    amount_cents    BIGINT NOT NULL DEFAULT 0,         -- billed amount per period
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_start TIMESTAMPTZ,
    current_period_end   TIMESTAMPTZ,                  -- "next billing"
    trial_end_at    TIMESTAMPTZ,
    canceled_at     TIMESTAMPTZ,
    cancel_reason   VARCHAR(200),
    ltv_cents       BIGINT NOT NULL DEFAULT 0,         -- denormalized lifetime value
    provider        VARCHAR(20) NOT NULL DEFAULT 'stripe',
    provider_subscription_id VARCHAR(120),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_subscriptions_user   ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_region ON subscriptions(region);
CREATE INDEX idx_subscriptions_plan   ON subscriptions(plan_id);

-- ─── Invoices / payments (the Transactions ledger; revenue by region + platform) ──
CREATE TABLE IF NOT EXISTS subscription_invoices (
    id              UUID PRIMARY KEY DEFAULT uuidv7(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_number  VARCHAR(60) NOT NULL UNIQUE,
    amount_cents    BIGINT NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    region          VARCHAR(10) CHECK (region IN ('NA','EU','APAC','LATAM','MEA')),
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('paid','failed','refunded','pending')),
    payment_method  VARCHAR(30),                       -- card / apple_pay / google_pay
    platform        VARCHAR(20),                       -- web / ios / android (revenue-by-platform)
    billed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at         TIMESTAMPTZ,
    refunded_at     TIMESTAMPTZ,
    provider        VARCHAR(20) NOT NULL DEFAULT 'stripe',
    provider_invoice_id VARCHAR(120),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sub_invoices_subscription ON subscription_invoices(subscription_id);
CREATE INDEX idx_sub_invoices_user   ON subscription_invoices(user_id);
CREATE INDEX idx_sub_invoices_status ON subscription_invoices(status, billed_at DESC);
CREATE INDEX idx_sub_invoices_region ON subscription_invoices(region);

-- Seed: starter subscription plans + per-region prices live in
-- src/db/seeds/005_subscriptions.sql — run via `pnpm db:seed`.
