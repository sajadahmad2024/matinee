-- ════════════════════════════════════════════════════════════════════════════
-- Engagement analytics tracking (TTLE-229).
-- Doc: apps/documentation/docs/backend/analytics/engagement-analytics.md
--   • user_sessions derived from app events (client session id + counters)
--   • content_shares daily dedupe (one per user + content + channel + UTC day)
--   • social_mentions idempotent ingest + country scope
--   • content_daily_stats rollup watermark
--   • comments_posted / replies_posted badge metrics
-- Idempotent: safe to re-run.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Sessions (derived from POST /v1/events batches) ────────────────────────
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS client_session_id  VARCHAR(64);
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS last_event_at      TIMESTAMPTZ;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS background_count   INTEGER NOT NULL DEFAULT 0;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS engagement_actions INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_sessions_client
  ON user_sessions (user_id, client_session_id) WHERE client_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_event ON user_sessions (last_event_at);

-- ─── Share dedupe ────────────────────────────────────────────────────────────
ALTER TABLE content_shares ADD COLUMN IF NOT EXISTS share_date DATE;
UPDATE content_shares SET share_date = (created_at AT TIME ZONE 'UTC')::date WHERE share_date IS NULL;
ALTER TABLE content_shares ALTER COLUMN share_date SET DEFAULT ((now() AT TIME ZONE 'UTC')::date);
ALTER TABLE content_shares ALTER COLUMN share_date SET NOT NULL;

-- Remove pre-existing duplicates (keep the earliest). The share_counts trigger decrements
-- contents.share_count for each removed row, correcting any inflation.
DELETE FROM content_shares s
 USING (
   SELECT id, row_number() OVER (
            PARTITION BY content_id, user_id, coalesce(channel, ''), share_date
            ORDER BY created_at, id) AS rn
     FROM content_shares
 ) d
 WHERE s.id = d.id AND d.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_content_shares_daily
  ON content_shares (content_id, user_id, (coalesce(channel, '')), share_date);
CREATE INDEX IF NOT EXISTS idx_content_shares_date ON content_shares (share_date);

-- ─── Social mentions: idempotent ingest + regional scope ─────────────────────
ALTER TABLE social_mentions ADD COLUMN IF NOT EXISTS country_code VARCHAR(2);
CREATE UNIQUE INDEX IF NOT EXISTS uq_social_mentions_external
  ON social_mentions (platform, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_social_mentions_time
  ON social_mentions ((coalesce(mentioned_at, ingested_at)));

-- ─── Rollup watermark ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_rollup_state (
    job_key         VARCHAR(50) PRIMARY KEY,           -- e.g. 'content_daily'
    covered_from    DATE,                              -- first fully rolled (closed) day
    covered_through DATE,                              -- last fully rolled (closed) day
    last_run_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_daily_stats_date ON content_daily_stats (stat_date);

-- ─── Supporting indexes for windowed aggregates ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_content_reactions_created ON content_reactions (created_at);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments (created_at);
CREATE INDEX IF NOT EXISTS idx_app_events_session ON app_events_default (session_id) WHERE session_id IS NOT NULL;

-- ─── Comment badge metrics ──────────────────────────────────────────────────
INSERT INTO badge_triggers (key, label, unit, description) VALUES
  ('comments_posted', 'Comments Posted', NULL, 'Comments and replies posted (lifetime)'),
  ('replies_posted',  'Replies Posted',  NULL, 'Replies posted to other comments (lifetime)')
ON CONFLICT (key) DO NOTHING;

-- Backfill from existing comments (only raises values — never lowers a live counter).
INSERT INTO user_metrics (user_id, metric_key, value)
SELECT user_id, 'comments_posted', count(*) FROM comments GROUP BY user_id
ON CONFLICT (user_id, metric_key) DO UPDATE
  SET value = greatest(user_metrics.value, excluded.value), updated_at = now()
  WHERE user_metrics.value < excluded.value;

INSERT INTO user_metrics (user_id, metric_key, value)
SELECT user_id, 'replies_posted', count(*) FROM comments WHERE parent_comment_id IS NOT NULL GROUP BY user_id
ON CONFLICT (user_id, metric_key) DO UPDATE
  SET value = greatest(user_metrics.value, excluded.value), updated_at = now()
  WHERE user_metrics.value < excluded.value;
