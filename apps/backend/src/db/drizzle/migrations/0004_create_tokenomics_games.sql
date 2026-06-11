-- ════════════════════════════════════════════════════════════════════════════
-- Tokenomics ledger (the hub) + Game Centre (daily streak / quest / prediction /
-- bidding). Everything earns/spends ONE balance via an append-only, idempotency-keyed
-- ledger; a trigger keeps wallets in exact sync. Rule amounts come from the versioned
-- reward_rules (+ reward_rule_versions). Award FLOWS (cron/handlers) are built in code.
-- UUIDv7 PKs; prediction options / prizes are media_id FKs.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Versioned rule config (history of reward_rules edits) ──────────────────
CREATE TABLE IF NOT EXISTS reward_rule_versions (
    id         UUID PRIMARY KEY DEFAULT uuidv7(),
    rule_id    UUID NOT NULL REFERENCES reward_rules(id) ON DELETE CASCADE,
    rule_key   VARCHAR(50) NOT NULL,                 -- denormalized for convenience
    version    INTEGER NOT NULL,
    config     JSONB NOT NULL,                       -- snapshot of the config at this version
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (rule_id, version)
);
CREATE INDEX idx_reward_rule_versions_key ON reward_rule_versions(rule_key, version);

-- ─── Wallets (balances; kept in exact sync with the ledger by a trigger) ────
CREATE TABLE IF NOT EXISTS wallets (
    user_id                   UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    points_balance            BIGINT NOT NULL DEFAULT 0,
    points_earned_lifetime    BIGINT NOT NULL DEFAULT 0,
    points_spent_lifetime     BIGINT NOT NULL DEFAULT 0,
    points_purchased_lifetime BIGINT NOT NULL DEFAULT 0,   -- future money→points split (0 today)
    xp_total                  BIGINT NOT NULL DEFAULT 0,
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (points_balance >= 0)
);

-- ─── Ledger (append-only source of truth) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS ledger_transactions (
    id                     UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency               VARCHAR(10) NOT NULL CHECK (currency IN ('points','xp')),
    amount                 BIGINT NOT NULL,                 -- signed: + credit, - debit
    balance_after          BIGINT NOT NULL DEFAULT 0,       -- set by the trigger
    direction              VARCHAR(10) NOT NULL CHECK (direction IN ('earn','spend','refund','purchase','adjust')),
    source_kind            VARCHAR(10) NOT NULL DEFAULT 'earned' CHECK (source_kind IN ('earned','purchased')),
    source_type            VARCHAR(30) NOT NULL
                             CHECK (source_type IN ('referral','daily_streak','quest','prediction','bid','bid_refund','content_unlock','content_share','badge','admin','subscription')),
    source_id              UUID,                            -- polymorphic ref to the originating row
    reward_rule_version_id UUID REFERENCES reward_rule_versions(id) ON DELETE SET NULL,
    idempotency_key        VARCHAR(120) NOT NULL UNIQUE,    -- prevents double-credit (e.g. streak:<user>:<date>)
    note                   VARCHAR(300),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ledger_user   ON ledger_transactions(user_id, created_at DESC);
CREATE INDEX idx_ledger_source ON ledger_transactions(source_type, source_id);

-- Apply each ledger row to the wallet atomically (BEFORE INSERT): locks the wallet,
-- guards against negative balance, sets balance_after, updates lifetime splits.
-- A duplicate idempotency_key aborts the whole statement → no double-pay.
CREATE OR REPLACE FUNCTION trg_ledger_apply() RETURNS trigger AS $$
DECLARE bal BIGINT;
BEGIN
  INSERT INTO wallets(user_id) VALUES (NEW.user_id) ON CONFLICT (user_id) DO NOTHING;

  IF NEW.currency = 'points' THEN
    SELECT points_balance INTO bal FROM wallets WHERE user_id = NEW.user_id FOR UPDATE;
    bal := bal + NEW.amount;
    IF bal < 0 THEN
      RAISE EXCEPTION 'insufficient points (cannot apply % to balance)', NEW.amount
        USING ERRCODE = 'check_violation';
    END IF;
    NEW.balance_after := bal;
    UPDATE wallets SET
      points_balance            = bal,
      points_earned_lifetime    = points_earned_lifetime    + (CASE WHEN NEW.amount > 0 AND NEW.source_kind = 'earned'    THEN NEW.amount ELSE 0 END),
      points_purchased_lifetime = points_purchased_lifetime + (CASE WHEN NEW.amount > 0 AND NEW.source_kind = 'purchased' THEN NEW.amount ELSE 0 END),
      points_spent_lifetime     = points_spent_lifetime     + (CASE WHEN NEW.amount < 0 THEN -NEW.amount ELSE 0 END),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSE -- xp
    SELECT xp_total INTO bal FROM wallets WHERE user_id = NEW.user_id FOR UPDATE;
    bal := bal + NEW.amount;
    NEW.balance_after := bal;
    UPDATE wallets SET xp_total = bal, updated_at = NOW() WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER ledger_apply BEFORE INSERT ON ledger_transactions
  FOR EACH ROW EXECUTE FUNCTION trg_ledger_apply();

-- ─── Game 1: Daily streak (autonomous; daily cron from user_daily_activity) ──
CREATE TABLE IF NOT EXISTS user_streaks (
    user_id              UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak       INTEGER NOT NULL DEFAULT 0,
    longest_streak       INTEGER NOT NULL DEFAULT 0,
    last_qualified_date  DATE,
    total_qualified_days INTEGER NOT NULL DEFAULT 0,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Game 2: Quest (single window; "watch these videos by the deadline") ────
CREATE TABLE IF NOT EXISTS quests (
    id            UUID PRIMARY KEY DEFAULT uuidv7(),
    name          VARCHAR(200) NOT NULL,
    description   TEXT,
    reward_points INTEGER NOT NULL DEFAULT 0,
    reward_xp     INTEGER NOT NULL DEFAULT 0,
    start_at      TIMESTAMPTZ NOT NULL,
    end_at        TIMESTAMPTZ NOT NULL,
    require_all   BOOLEAN NOT NULL DEFAULT true,
    status        VARCHAR(20) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','active','ended','cancelled')),
    unlock_threshold_points INTEGER,                  -- locked until user holds ≥ N points (NULL = open)
    banner_media_id UUID REFERENCES media_metadata(id) ON DELETE SET NULL,  -- per-instance app banner override
    created_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_at > start_at)
);
CREATE INDEX idx_quests_active ON quests(status, end_at) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS quest_contents (
    quest_id   UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    PRIMARY KEY (quest_id, content_id)
);

CREATE TABLE IF NOT EXISTS quest_participations (
    quest_id        UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed_count INTEGER NOT NULL DEFAULT 0,
    is_completed    BOOLEAN NOT NULL DEFAULT false,
    completed_at    TIMESTAMPTZ,
    rewarded_at     TIMESTAMPTZ,
    PRIMARY KEY (quest_id, user_id)
);

CREATE TABLE IF NOT EXISTS quest_content_progress (
    quest_id     UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id   UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (quest_id, user_id, content_id)
);

-- ─── Game 3: Predictive (Q&A; options can be text/image/video) ──────────────
CREATE TABLE IF NOT EXISTS predictions (
    id                UUID PRIMARY KEY DEFAULT uuidv7(),
    question          VARCHAR(500) NOT NULL,
    description       TEXT,
    content_id        UUID REFERENCES contents(id) ON DELETE SET NULL,  -- optional attach
    start_at          TIMESTAMPTZ NOT NULL,
    end_at            TIMESTAMPTZ NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open','locked','resolved','cancelled')),
    reward_points     INTEGER NOT NULL DEFAULT 0,
    reward_xp         INTEGER NOT NULL DEFAULT 0,
    entry_cost_points INTEGER NOT NULL DEFAULT 0,     -- points spent to enter this prediction
    payout_multiplier INTEGER NOT NULL DEFAULT 1,     -- correct payout = entry_cost × multiplier (e.g. 5 / 10)
    unlock_threshold_points INTEGER,                 -- locked until user holds ≥ N points (NULL = open)
    banner_media_id   UUID REFERENCES media_metadata(id) ON DELETE SET NULL,  -- per-instance app banner override / visual element
    correct_option_id UUID,                          -- → prediction_options.id (logical; set at resolve)
    resolved_by       UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at       TIMESTAMPTZ,
    created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_at > start_at)
);
CREATE INDEX idx_predictions_open ON predictions(status, end_at) WHERE status IN ('open','locked');

CREATE TABLE IF NOT EXISTS prediction_options (
    id              UUID PRIMARY KEY DEFAULT uuidv7(),
    prediction_id   UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
    label           VARCHAR(300),
    option_media_id UUID REFERENCES media_metadata(id) ON DELETE SET NULL,  -- text/image/video option
    is_correct      BOOLEAN NOT NULL DEFAULT false,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_prediction_options_prediction ON prediction_options(prediction_id);

CREATE TABLE IF NOT EXISTS prediction_entries (
    id             UUID PRIMARY KEY DEFAULT uuidv7(),
    prediction_id  UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    option_id      UUID NOT NULL REFERENCES prediction_options(id) ON DELETE CASCADE,
    is_correct     BOOLEAN,
    points_staked  INTEGER NOT NULL DEFAULT 0,        -- entry cost spent (debited via ledger)
    points_awarded INTEGER NOT NULL DEFAULT 0,        -- payout on correct (staked × multiplier)
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (prediction_id, user_id)                  -- one entry per user
);
CREATE INDEX idx_prediction_entries_prediction ON prediction_entries(prediction_id);

-- ─── Game 4: Bidding (hold-on-bid + refund losers; spends points) ───────────
CREATE TABLE IF NOT EXISTS auctions (
    id             UUID PRIMARY KEY DEFAULT uuidv7(),
    title          VARCHAR(300) NOT NULL,
    description    TEXT,
    prize          VARCHAR(300),
    content_id     UUID REFERENCES contents(id) ON DELETE SET NULL,
    start_at       TIMESTAMPTZ NOT NULL,
    end_at         TIMESTAMPTZ NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'scheduled'
                     CHECK (status IN ('scheduled','open','closed','settled','cancelled')),
    min_bid_points INTEGER NOT NULL DEFAULT 0,
    unlock_threshold_points INTEGER,                 -- locked until user holds ≥ N points (NULL = open)
    banner_media_id UUID REFERENCES media_metadata(id) ON DELETE SET NULL,  -- per-instance app banner override
    winner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    winning_amount INTEGER,
    created_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (end_at > start_at)
);
CREATE INDEX idx_auctions_open ON auctions(status, end_at) WHERE status = 'open';

CREATE TABLE IF NOT EXISTS bids (
    id           UUID PRIMARY KEY DEFAULT uuidv7(),
    auction_id   UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_points INTEGER NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active','outbid','won','refunded')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_bids_auction ON bids(auction_id, amount_points DESC);
CREATE INDEX idx_bids_user    ON bids(user_id);

-- ─── App-widget config (per game TYPE; customer app reads this to render widgets) ──
-- Per-INSTANCE banner overrides live on quests/predictions/auctions.banner_media_id.
CREATE TABLE IF NOT EXISTS game_widget_configs (
    game_key        VARCHAR(30) PRIMARY KEY
                      CHECK (game_key IN ('daily_streak','quest','shared_content','prediction','bidding')),
    is_visible      BOOLEAN NOT NULL DEFAULT true,
    widget_style    VARCHAR(20) NOT NULL DEFAULT 'card'
                      CHECK (widget_style IN ('card','hero','carousel')),
    cta_label       VARCHAR(80),
    accent_color    VARCHAR(9),                        -- hex, e.g. '#7C3AED'
    banner_media_id UUID REFERENCES media_metadata(id) ON DELETE SET NULL,
    updated_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ════════════════════════════════════════════════════════════════════════════
-- Seed: game reward_rules (config holds the amounts) + version-1 snapshots
-- ════════════════════════════════════════════════════════════════════════════
INSERT INTO reward_rules (rule_key, name, description, is_enabled, config, version) VALUES
  ('daily_streak', 'Daily Streak', 'Earn for watching every day', true,
     '{"min_watch_seconds":300,"behaviors":[{"key":"watch_min","label":"Watch 5+ min today","points":10,"xp":5},{"key":"complete_videos","label":"Complete 3 videos","points":15,"xp":8},{"key":"engagement","label":"Engagement actions","points":5,"xp":2},{"key":"daily_open","label":"Daily app-open","points":10,"xp":5},{"key":"finish_series","label":"Finish a series","points":20,"xp":10}],"bonus_thresholds":{"7":50,"30":300}}'::jsonb, 1),
  ('quest', 'Quests', 'Watch a set of videos before the deadline', true,
     '{"default_points":100,"default_xp":50}'::jsonb, 1),
  ('shared_content', 'Shared Content', 'Earn for sharing content (autonomous, capped daily)', true,
     '{"daily_share_cap":3,"behaviors":[{"key":"internal_share","label":"Internal share","points":3,"xp":1},{"key":"external_share","label":"External share","points":15,"xp":5},{"key":"referral_completed","label":"Referral completed","points":100,"xp":25}]}'::jsonb, 1),
  ('prediction', 'Predictions', 'Predict outcomes to earn', true,
     '{"default_points":100,"default_xp":25,"default_entry_cost":50,"default_multiplier":5}'::jsonb, 1),
  ('bidding', 'Bidding', 'Spend points to win prizes', true,
     '{"min_increment_points":10}'::jsonb, 1)
ON CONFLICT (rule_key) DO NOTHING;

-- One app-widget row per fixed game type (visible card with a default CTA)
INSERT INTO game_widget_configs (game_key, cta_label) VALUES
  ('daily_streak',  'Keep your streak'),
  ('quest',         'Start a quest'),
  ('shared_content','Share & earn'),
  ('prediction',    'Predict & win'),
  ('bidding',       'Place a bid')
ON CONFLICT (game_key) DO NOTHING;

-- Snapshot the current config of every rule as version 1 (referral/daily_login from 0002 too)
INSERT INTO reward_rule_versions (rule_id, rule_key, version, config)
SELECT id, rule_key, version, config FROM reward_rules
ON CONFLICT (rule_id, version) DO NOTHING;
