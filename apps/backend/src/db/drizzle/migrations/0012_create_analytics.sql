-- ════════════════════════════════════════════════════════════════════════════
-- Analytics tables that power the executive dashboard sections which currently
-- have no backing store: per-session quality (Screen Time), marketing spend (CAC /
-- LTV-by-channel), and external social listening (Community — External).
-- (users.acquisition_channel is added in place on the users table, 0002.)
-- UUIDv7 PKs.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Sessions (Screen Time & Session Quality, ARPDAU, funnel first-session) ──
CREATE TABLE IF NOT EXISTS user_sessions (
    id               UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at         TIMESTAMPTZ,
    duration_seconds INTEGER,
    foreground_count INTEGER NOT NULL DEFAULT 1,      -- background↔foreground transitions
    videos_viewed    INTEGER NOT NULL DEFAULT 0,      -- "doomscroll depth"
    points_earned    INTEGER NOT NULL DEFAULT 0,
    is_gamified      BOOLEAN NOT NULL DEFAULT false,  -- engaged any gamification this session
    country_code     VARCHAR(2),
    region           VARCHAR(10) CHECK (region IN ('NA','EU','APAC','LATAM','MEA')),
    platform         VARCHAR(20),                     -- ios / android / web
    app_version      VARCHAR(20),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_user_sessions_user   ON user_sessions(user_id, started_at DESC);
CREATE INDEX idx_user_sessions_time   ON user_sessions(started_at);
CREATE INDEX idx_user_sessions_region ON user_sessions(region);

-- ─── Marketing spend per channel/month (CAC = spend / new_users; LTV:CAC) ───
CREATE TABLE IF NOT EXISTS marketing_spend (
    id           UUID PRIMARY KEY DEFAULT uuidv7(),
    channel      VARCHAR(30) NOT NULL
                   CHECK (channel IN ('organic','paid_social','referral','influencer','search','other')),
    period_month DATE NOT NULL,                       -- first day of the month
    spend_cents  BIGINT NOT NULL DEFAULT 0,
    currency     VARCHAR(3) NOT NULL DEFAULT 'USD',
    new_users    INTEGER NOT NULL DEFAULT 0,          -- attributed acquisitions
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (channel, period_month)
);

-- ─── External social listening (Community — External; GA / social APIs) ─────
CREATE TABLE IF NOT EXISTS social_mentions (
    id              UUID PRIMARY KEY DEFAULT uuidv7(),
    platform        VARCHAR(20) NOT NULL
                      CHECK (platform IN ('x','tiktok','instagram','reddit','youtube','other')),
    external_id     VARCHAR(120),                     -- id on the source platform
    author_handle   VARCHAR(120),
    url             VARCHAR(500),
    content         TEXT,
    sentiment       VARCHAR(10) CHECK (sentiment IN ('positive','neutral','negative')),
    impressions     BIGINT NOT NULL DEFAULT 0,
    engagement      BIGINT NOT NULL DEFAULT 0,
    emv_cents       BIGINT NOT NULL DEFAULT 0,        -- earned media value
    is_viral_moment BOOLEAN NOT NULL DEFAULT false,
    mentioned_at    TIMESTAMPTZ,
    ingested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_social_mentions_platform  ON social_mentions(platform, mentioned_at DESC);
CREATE INDEX idx_social_mentions_sentiment ON social_mentions(sentiment);
CREATE INDEX idx_social_mentions_viral     ON social_mentions(is_viral_moment) WHERE is_viral_moment;
