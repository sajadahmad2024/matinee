-- ════════════════════════════════════════════════════════════════════════════
-- Content module: catalog + engagement + deep per-video analytics.
-- (Games — daily-streak / quest / predictive / bidding — are a later module; their
--  FKs into content land then. Points/tokens are awarded by the tokenomics trigger
--  layer, NOT here; this module only RECORDS spends, e.g. content_unlocks.)
--
-- Decisions baked in: UUIDv7 PKs; assets are media_id FKs → media_metadata; normalized
-- taxonomy (studios/genres/people/series); single genre per video (+ tags); denormalized
-- counters maintained by DB triggers; field-level JSONB change history; raw heartbeat
-- analytics in a time-RANGE-partitioned table.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Taxonomy ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS studios (
    id             UUID PRIMARY KEY DEFAULT uuidv7(),
    name           VARCHAR(200) NOT NULL,
    slug           VARCHAR(220) NOT NULL UNIQUE,
    logo_media_id  UUID REFERENCES media_metadata(id) ON DELETE SET NULL,
    description    TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at     TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS genres (
    id         UUID PRIMARY KEY DEFAULT uuidv7(),
    name       VARCHAR(100) NOT NULL,
    slug       VARCHAR(120) NOT NULL UNIQUE,
    is_active  BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
    id         UUID PRIMARY KEY DEFAULT uuidv7(),
    name       VARCHAR(80) NOT NULL,
    slug       VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS people (
    id             UUID PRIMARY KEY DEFAULT uuidv7(),
    name           VARCHAR(200) NOT NULL,
    slug           VARCHAR(220) NOT NULL UNIQUE,
    photo_media_id UUID REFERENCES media_metadata(id) ON DELETE SET NULL,
    bio            TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Catalog ────────────────────────────────────────────────────────────────
-- TikTok-style standalone vertical videos — each content is individual; NO
-- series/season/episode grouping.
CREATE TABLE IF NOT EXISTS contents (
    id                  UUID PRIMARY KEY DEFAULT uuidv7(),
    title               VARCHAR(300) NOT NULL,
    slug                VARCHAR(320) NOT NULL UNIQUE,
    description         TEXT,
    content_type        VARCHAR(20) NOT NULL DEFAULT 'trailer'
                          CHECK (content_type IN ('trailer','bts','clip')),  -- every type is first-class content
    access_tier         VARCHAR(20) NOT NULL DEFAULT 'free'
                          CHECK (access_tier IN ('free','exclusive')),       -- ANY content may be exclusive
    unlock_points       INTEGER,                       -- cost when access_tier='exclusive'

    -- A BTS/clip MAY belong to one primary title (e.g. its trailer); NULL = standalone.
    -- A title can have many extras. No content REQUIRES a BTS.
    parent_content_id   UUID REFERENCES contents(id) ON DELETE SET NULL,

    studio_id           UUID REFERENCES studios(id) ON DELETE SET NULL,
    -- genres are many-per-content via content_genres (M2M), like tags

    video_media_id      UUID REFERENCES media_metadata(id) ON DELETE SET NULL,  -- main HLS video
    thumbnail_media_id  UUID REFERENCES media_metadata(id) ON DELETE SET NULL,  -- primary thumbnail
    duration_seconds    INTEGER,                       -- denormalized from media
    language            VARCHAR(10),

    -- Licensing (admin signals shown on the content row)
    license_status      VARCHAR(20) NOT NULL DEFAULT 'original'
                          CHECK (license_status IN ('original','licensed','expiring','expired')),
    license_expires_at  TIMESTAMPTZ,                    -- NULL for 'original'
    licensor_name       VARCHAR(200),                  -- rights holder when licensed
    license_terms       VARCHAR(500),                  -- short terms summary (chip tooltip)

    -- Editorial recommendation (complements is_boosted; 'deprioritized' was unrepresentable)
    recommendation      VARCHAR(20) NOT NULL DEFAULT 'normal'
                          CHECK (recommendation IN ('promoted','normal','deprioritized')),

    -- Rights focus region (geomapping/rights — where this content is primarily licensed/served;
    -- country-level availability gating still comes from geo_policies)
    rights_region       VARCHAR(10) NOT NULL DEFAULT 'global'
                          CHECK (rights_region IN ('global','NA','EU','APAC','LATAM','MEA')),

    -- Ad-Sales (denormalized flags; detail in content_sponsorships)
    is_sponsored        BOOLEAN NOT NULL DEFAULT false,   -- carries a sponsor logo + ad
    is_ad_commercial    BOOLEAN NOT NULL DEFAULT false,   -- is itself a feed commercial

    status              VARCHAR(20) NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','pending_approval','scheduled','published','rejected','archived')),
    scheduled_at        TIMESTAMPTZ,
    published_at        TIMESTAMPTZ,

    is_boosted          BOOLEAN NOT NULL DEFAULT false,
    boost_priority      INTEGER NOT NULL DEFAULT 0,
    boosted_until       TIMESTAMPTZ,

    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,  -- admin owner
    updated_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    requested_by        UUID REFERENCES users(id) ON DELETE SET NULL,  -- approval workflow
    approved_by         UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at         TIMESTAMPTZ,
    rejection_reason    VARCHAR(500),

    -- Denormalized counters (trigger-maintained; see section "Counter triggers")
    view_count          BIGINT  NOT NULL DEFAULT 0,
    unique_viewer_count BIGINT  NOT NULL DEFAULT 0,
    like_count          INTEGER NOT NULL DEFAULT 0,
    dislike_count       INTEGER NOT NULL DEFAULT 0,
    comment_count       INTEGER NOT NULL DEFAULT 0,
    share_count         INTEGER NOT NULL DEFAULT 0,
    total_watch_seconds BIGINT  NOT NULL DEFAULT 0,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,

    CHECK (parent_content_id IS NULL OR parent_content_id <> id)   -- cannot be its own parent
);
CREATE INDEX idx_contents_status_published ON contents(status, published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_contents_studio           ON contents(studio_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contents_type             ON contents(content_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_contents_parent           ON contents(parent_content_id) WHERE parent_content_id IS NOT NULL;
CREATE INDEX idx_contents_boost            ON contents(boost_priority DESC) WHERE is_boosted AND deleted_at IS NULL;
CREATE INDEX idx_contents_scheduled        ON contents(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_contents_license_expiry   ON contents(license_expires_at) WHERE license_status IN ('licensed','expiring');
CREATE INDEX idx_contents_sponsored        ON contents(id) WHERE is_sponsored AND deleted_at IS NULL;

-- Extra gallery images (the editor's multiple thumbnail/poster slots)
CREATE TABLE IF NOT EXISTS content_media (
    id         UUID PRIMARY KEY DEFAULT uuidv7(),
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    media_id   UUID NOT NULL REFERENCES media_metadata(id) ON DELETE CASCADE,
    kind       VARCHAR(20) NOT NULL DEFAULT 'still'
                 CHECK (kind IN ('thumbnail','poster','still','banner')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_content_media_content ON content_media(content_id);

-- Ad-Sales: a content item may be sponsored (carries a sponsor logo + ad) OR be an Ad-Sales
-- commercial inserted into the swipe feed. One active placement at a time; history retained.
CREATE TABLE IF NOT EXISTS content_sponsorships (
    id                  UUID PRIMARY KEY DEFAULT uuidv7(),
    content_id          UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    ad_format           VARCHAR(20) NOT NULL DEFAULT 'sponsored'
                          CHECK (ad_format IN ('sponsored','commercial')),  -- sponsored content vs feed commercial
    sponsor_name        VARCHAR(200) NOT NULL,         -- sponsor / advertiser
    banner_media_id     UUID REFERENCES media_metadata(id) ON DELETE SET NULL,  -- "Sponsored by" logo/banner
    ad_duration_seconds INTEGER NOT NULL DEFAULT 0,    -- timer: ad length / commercial length
    placement           VARCHAR(20) NOT NULL DEFAULT 'pre-roll'
                          CHECK (placement IN ('pre-roll','mid-roll','post-roll','overlay')),  -- sponsored only
    feed_frequency      INTEGER,                       -- commercial: insert every N videos in the feed
    skippable_after_seconds INTEGER,                   -- commercial: skip countdown (NULL = not skippable)
    revenue_cents       BIGINT NOT NULL DEFAULT 0,     -- ad-sales revenue (settled by billing)
    currency            VARCHAR(3) NOT NULL DEFAULT 'USD',
    starts_at           TIMESTAMPTZ,
    ends_at             TIMESTAMPTZ,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_content_sponsorships_content ON content_sponsorships(content_id) WHERE is_active;
CREATE INDEX idx_content_sponsorships_commercial ON content_sponsorships(content_id)
  WHERE is_active AND ad_format = 'commercial';

-- Operational licensing agreements (cost / revenue / ROI / renewal) — powers the Licensing table.
-- (The denormalized license_status/expires chip lives on contents; this is the full record.)
CREATE TABLE IF NOT EXISTS content_licenses (
    id                      UUID PRIMARY KEY DEFAULT uuidv7(),
    content_id              UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    licensor_name           VARCHAR(200) NOT NULL,
    license_type            VARCHAR(20) NOT NULL DEFAULT 'non_exclusive'
                              CHECK (license_type IN ('exclusive','non_exclusive')),
    starts_at               TIMESTAMPTZ,
    expires_at              TIMESTAMPTZ,                 -- days-left + expiry alerts derive from this
    renewal_status          VARCHAR(20) NOT NULL DEFAULT 'renewing'
                              CHECK (renewal_status IN ('renewing','in_negotiation','expiring','lapsed','auto_renew')),
    license_cost_cents      BIGINT NOT NULL DEFAULT 0,
    currency                VARCHAR(3) NOT NULL DEFAULT 'USD',
    revenue_generated_cents BIGINT NOT NULL DEFAULT 0,  -- attributed revenue (ROI = revenue / cost)
    revenue_source          VARCHAR(100),               -- e.g. 'Ads + Subs'
    terms                   VARCHAR(500),
    is_active               BOOLEAN NOT NULL DEFAULT true,
    created_by              UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_content_licenses_content ON content_licenses(content_id) WHERE is_active;
CREATE INDEX idx_content_licenses_expiry  ON content_licenses(expires_at) WHERE is_active;

CREATE TABLE IF NOT EXISTS content_genres (
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    genre_id   UUID NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT false,   -- one may be flagged primary for display
    PRIMARY KEY (content_id, genre_id)
);
CREATE INDEX idx_content_genres_genre ON content_genres(genre_id);

CREATE TABLE IF NOT EXISTS content_tags (
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    tag_id     UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, tag_id)
);
CREATE INDEX idx_content_tags_tag ON content_tags(tag_id);

CREATE TABLE IF NOT EXISTS content_cast (
    content_id     UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    person_id      UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    role           VARCHAR(20) NOT NULL DEFAULT 'actor'
                     CHECK (role IN ('actor','director','writer','producer','other')),
    character_name VARCHAR(200),
    billing_order  INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (content_id, person_id, role)
);
CREATE INDEX idx_content_cast_person ON content_cast(person_id);

-- Field-level change history ("Change History" panel) — app-layer product feature.
CREATE TABLE IF NOT EXISTS content_change_history (
    id         UUID PRIMARY KEY DEFAULT uuidv7(),
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    action     VARCHAR(20) NOT NULL
                 CHECK (action IN ('created','updated','submitted','approved','rejected','scheduled','published','boosted','archived')),
    changes    JSONB NOT NULL DEFAULT '{}'::jsonb,   -- {field: {from, to}}
    note       VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_content_change_history_content ON content_change_history(content_id, created_at DESC);

-- ─── Engagement ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_reactions (
    id         UUID PRIMARY KEY DEFAULT uuidv7(),
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction   VARCHAR(10) NOT NULL CHECK (reaction IN ('like','dislike')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (content_id, user_id)                       -- one stance per user (toggle)
);
CREATE INDEX idx_content_reactions_content ON content_reactions(content_id);

CREATE TABLE IF NOT EXISTS comments (
    id                UUID PRIMARY KEY DEFAULT uuidv7(),
    content_id        UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,  -- null = top-level
    body              TEXT NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'visible'
                        CHECK (status IN ('visible','hidden','deleted')),
    like_count        INTEGER NOT NULL DEFAULT 0,
    dislike_count     INTEGER NOT NULL DEFAULT 0,
    reply_count       INTEGER NOT NULL DEFAULT 0,
    flag_count        INTEGER NOT NULL DEFAULT 0,
    is_flagged        BOOLEAN NOT NULL DEFAULT false,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ
);
CREATE INDEX idx_comments_content ON comments(content_id, created_at DESC) WHERE status = 'visible';
CREATE INDEX idx_comments_parent  ON comments(parent_comment_id);
CREATE INDEX idx_comments_flagged ON comments(content_id) WHERE is_flagged;

CREATE TABLE IF NOT EXISTS comment_reactions (
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction   VARCHAR(10) NOT NULL CHECK (reaction IN ('like','dislike')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (comment_id, user_id)
);

CREATE TABLE IF NOT EXISTS comment_reports (
    id          UUID PRIMARY KEY DEFAULT uuidv7(),
    comment_id  UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    reported_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason      VARCHAR(30) NOT NULL
                  CHECK (reason IN ('nudity_sexual','violence_gore','hate_speech','harassment_bullying','other')),
    description VARCHAR(500),
    status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','actioned','dismissed')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (comment_id, reported_by)                   -- one report per user per comment
);
CREATE INDEX idx_comment_reports_open ON comment_reports(comment_id) WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS content_shares (
    id         UUID PRIMARY KEY DEFAULT uuidv7(),
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel    VARCHAR(30),                            -- whatsapp | x | copy_link | …
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_content_shares_content ON content_shares(content_id);

CREATE TABLE IF NOT EXISTS content_watchlist (
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, content_id)
);
CREATE INDEX idx_content_watchlist_content ON content_watchlist(content_id);

CREATE TABLE IF NOT EXISTS content_moderation_log (
    id           UUID PRIMARY KEY DEFAULT uuidv7(),
    comment_id   UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    action       VARCHAR(20) NOT NULL
                   CHECK (action IN ('hide','unhide','delete','warn_user')),
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reason       VARCHAR(500),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_content_moderation_log_comment ON content_moderation_log(comment_id);

-- ─── Access (exclusive unlock; balance/deduction handled by tokenomics) ──────
CREATE TABLE IF NOT EXISTS content_unlocks (
    id           UUID PRIMARY KEY DEFAULT uuidv7(),
    content_id   UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points_spent INTEGER NOT NULL DEFAULT 0,
    unlocked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (content_id, user_id)
);
CREATE INDEX idx_content_unlocks_user ON content_unlocks(user_id);

-- ─── Analytics ──────────────────────────────────────────────────────────────
-- Per viewing session (summary). Drives view_count, completion, free-quota.
CREATE TABLE IF NOT EXISTS content_views (
    id                   UUID PRIMARY KEY DEFAULT uuidv7(),
    content_id           UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id           VARCHAR(64),
    device               VARCHAR(20),
    started_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_heartbeat_at    TIMESTAMPTZ,
    watched_seconds      INTEGER NOT NULL DEFAULT 0,
    max_position_seconds INTEGER NOT NULL DEFAULT 0,
    completion_percent   NUMERIC(5,2) NOT NULL DEFAULT 0,
    is_completed         BOOLEAN NOT NULL DEFAULT false,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_content_views_content ON content_views(content_id);
CREATE INDEX idx_content_views_user    ON content_views(user_id, content_id);

-- Raw heartbeat/event stream — HIGH VOLUME, time-RANGE partitioned by occurred_at.
-- No FK constraints (append-only, perf); validity ensured by the app. Monthly child
-- partitions are created ahead of time by an ops cron (pg_partman or a Cron-module job);
-- the DEFAULT partition is a catch-all so inserts never fail before that runs.
CREATE TABLE IF NOT EXISTS content_watch_events (
    id               UUID NOT NULL DEFAULT uuidv7(),
    content_id       UUID NOT NULL,
    user_id          UUID NOT NULL,
    view_id          UUID,                             -- → content_views.id (logical)
    event_type       VARCHAR(15) NOT NULL
                       CHECK (event_type IN ('play','pause','seek','heartbeat','complete')),
    position_seconds INTEGER NOT NULL DEFAULT 0,
    occurred_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);
CREATE TABLE IF NOT EXISTS content_watch_events_default PARTITION OF content_watch_events DEFAULT;
CREATE INDEX idx_watch_events_content ON content_watch_events(content_id, occurred_at);
CREATE INDEX idx_watch_events_user    ON content_watch_events(user_id, occurred_at);
CREATE INDEX idx_watch_events_view    ON content_watch_events(view_id);

-- Per-user-per-content resume state ("continue watching").
CREATE TABLE IF NOT EXISTS content_progress (
    user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id           UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    last_position_seconds INTEGER NOT NULL DEFAULT 0,
    is_completed         BOOLEAN NOT NULL DEFAULT false,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, content_id)
);

-- Per-user-per-day rollup (the daily-streak engine reads only this).
CREATE TABLE IF NOT EXISTS user_daily_activity (
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_date    DATE NOT NULL,
    watch_seconds    BIGINT  NOT NULL DEFAULT 0,
    videos_started   INTEGER NOT NULL DEFAULT 0,
    videos_completed INTEGER NOT NULL DEFAULT 0,
    contents_watched INTEGER NOT NULL DEFAULT 0,
    first_seen_at    TIMESTAMPTZ,
    last_seen_at     TIMESTAMPTZ,
    PRIMARY KEY (user_id, activity_date)
);

-- Per-content-per-day rollup (admin analytics/dashboards).
CREATE TABLE IF NOT EXISTS content_daily_stats (
    content_id     UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    stat_date      DATE NOT NULL,
    views          INTEGER NOT NULL DEFAULT 0,
    unique_viewers INTEGER NOT NULL DEFAULT 0,
    watch_seconds  BIGINT  NOT NULL DEFAULT 0,
    avg_completion NUMERIC(5,2) NOT NULL DEFAULT 0,
    likes          INTEGER NOT NULL DEFAULT 0,
    comments       INTEGER NOT NULL DEFAULT 0,
    shares         INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (content_id, stat_date)
);

-- ════════════════════════════════════════════════════════════════════════════
-- Counter triggers (denormalized totals → O(1) reads for feeds/grids).
-- A nightly reconcile cron can re-derive these to correct any drift.
-- ════════════════════════════════════════════════════════════════════════════

-- contents.like_count / dislike_count ← content_reactions
CREATE OR REPLACE FUNCTION trg_content_reaction_counts() RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE contents SET like_count    = like_count    + (NEW.reaction = 'like')::int,
                        dislike_count = dislike_count + (NEW.reaction = 'dislike')::int
     WHERE id = NEW.content_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE contents SET like_count    = like_count    - (OLD.reaction = 'like')::int,
                        dislike_count = dislike_count - (OLD.reaction = 'dislike')::int
     WHERE id = OLD.content_id;
  ELSIF (TG_OP = 'UPDATE' AND NEW.reaction <> OLD.reaction) THEN
    UPDATE contents SET like_count    = like_count    + (NEW.reaction='like')::int    - (OLD.reaction='like')::int,
                        dislike_count = dislike_count + (NEW.reaction='dislike')::int - (OLD.reaction='dislike')::int
     WHERE id = NEW.content_id;
  END IF;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER content_reaction_counts
  AFTER INSERT OR UPDATE OR DELETE ON content_reactions
  FOR EACH ROW EXECUTE FUNCTION trg_content_reaction_counts();

-- comments.like_count / dislike_count ← comment_reactions
CREATE OR REPLACE FUNCTION trg_comment_reaction_counts() RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE comments SET like_count    = like_count    + (NEW.reaction = 'like')::int,
                        dislike_count = dislike_count + (NEW.reaction = 'dislike')::int
     WHERE id = NEW.comment_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE comments SET like_count    = like_count    - (OLD.reaction = 'like')::int,
                        dislike_count = dislike_count - (OLD.reaction = 'dislike')::int
     WHERE id = OLD.comment_id;
  ELSIF (TG_OP = 'UPDATE' AND NEW.reaction <> OLD.reaction) THEN
    UPDATE comments SET like_count    = like_count    + (NEW.reaction='like')::int    - (OLD.reaction='like')::int,
                        dislike_count = dislike_count + (NEW.reaction='dislike')::int - (OLD.reaction='dislike')::int
     WHERE id = NEW.comment_id;
  END IF;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER comment_reaction_counts
  AFTER INSERT OR UPDATE OR DELETE ON comment_reactions
  FOR EACH ROW EXECUTE FUNCTION trg_comment_reaction_counts();

-- contents.comment_count + parent comments.reply_count ← comments (counts non-deleted)
CREATE OR REPLACE FUNCTION trg_comment_counts() RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.status <> 'deleted') THEN
      UPDATE contents SET comment_count = comment_count + 1 WHERE id = NEW.content_id;
      IF (NEW.parent_comment_id IS NOT NULL) THEN
        UPDATE comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_comment_id;
      END IF;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.status <> 'deleted') THEN
      UPDATE contents SET comment_count = comment_count - 1 WHERE id = OLD.content_id;
      IF (OLD.parent_comment_id IS NOT NULL) THEN
        UPDATE comments SET reply_count = reply_count - 1 WHERE id = OLD.parent_comment_id;
      END IF;
    END IF;
  ELSIF (TG_OP = 'UPDATE' AND NEW.status <> OLD.status) THEN
    -- crossing the 'deleted' boundary toggles the count
    IF (OLD.status <> 'deleted' AND NEW.status = 'deleted') THEN
      UPDATE contents SET comment_count = comment_count - 1 WHERE id = NEW.content_id;
      IF (NEW.parent_comment_id IS NOT NULL) THEN
        UPDATE comments SET reply_count = reply_count - 1 WHERE id = NEW.parent_comment_id;
      END IF;
    ELSIF (OLD.status = 'deleted' AND NEW.status <> 'deleted') THEN
      UPDATE contents SET comment_count = comment_count + 1 WHERE id = NEW.content_id;
      IF (NEW.parent_comment_id IS NOT NULL) THEN
        UPDATE comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_comment_id;
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER comment_counts
  AFTER INSERT OR UPDATE OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION trg_comment_counts();

-- contents.share_count ← content_shares
CREATE OR REPLACE FUNCTION trg_share_counts() RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE contents SET share_count = share_count + 1 WHERE id = NEW.content_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE contents SET share_count = share_count - 1 WHERE id = OLD.content_id;
  END IF;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER share_counts
  AFTER INSERT OR DELETE ON content_shares
  FOR EACH ROW EXECUTE FUNCTION trg_share_counts();

-- contents.view_count ← content_views (one row per session)
CREATE OR REPLACE FUNCTION trg_view_counts() RETURNS trigger AS $$
BEGIN
  UPDATE contents SET view_count = view_count + 1 WHERE id = NEW.content_id;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER view_counts
  AFTER INSERT ON content_views
  FOR EACH ROW EXECUTE FUNCTION trg_view_counts();

-- comments.flag_count + is_flagged ← comment_reports (open reports only)
CREATE OR REPLACE FUNCTION trg_comment_flag_counts() RETURNS trigger AS $$
DECLARE target UUID; delta INT := 0;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    target := NEW.comment_id;
    IF (NEW.status = 'pending') THEN delta := 1; END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    target := OLD.comment_id;
    IF (OLD.status = 'pending') THEN delta := -1; END IF;
  ELSIF (TG_OP = 'UPDATE' AND NEW.status <> OLD.status) THEN
    target := NEW.comment_id;
    IF (OLD.status = 'pending' AND NEW.status <> 'pending') THEN delta := -1;
    ELSIF (OLD.status <> 'pending' AND NEW.status = 'pending') THEN delta := 1; END IF;
  END IF;
  IF (delta <> 0) THEN
    UPDATE comments SET flag_count = flag_count + delta,
                        is_flagged = (flag_count + delta) > 0
     WHERE id = target;
  END IF;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER comment_flag_counts
  AFTER INSERT OR UPDATE OR DELETE ON comment_reports
  FOR EACH ROW EXECUTE FUNCTION trg_comment_flag_counts();
