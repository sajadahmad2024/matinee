-- App events — the general analytics/telemetry stream the client posts every interaction to
-- (screen views, funnel steps, game interactions, lifecycle), beyond the specific domain
-- endpoints. Append-only, partitioned by occurred_at (same pattern as content_watch_events).
-- This is the single ingestion seam: today the sink is Postgres; flipping to Kinesis Firehose
-- later is a writer change with no API change.

CREATE TABLE IF NOT EXISTS app_events (
    id            UUID NOT NULL DEFAULT uuidv7(),
    user_id       UUID,                                  -- null for pre-auth / anonymous
    session_id    VARCHAR(64),
    event_type    VARCHAR(40) NOT NULL,                  -- coarse category: screen|engagement|game|commerce|lifecycle|other
    event_name    VARCHAR(80) NOT NULL,                  -- specific: screen_view, video_play, game_enter, ...
    content_id    UUID,                                  -- optional content context
    properties    JSONB NOT NULL DEFAULT '{}'::jsonb,    -- arbitrary client-supplied payload
    platform      VARCHAR(20),                           -- ios|android|web
    occurred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),    -- client event time
    ingested_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),    -- server receive time
    PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);

CREATE TABLE IF NOT EXISTS app_events_default PARTITION OF app_events DEFAULT;

CREATE INDEX IF NOT EXISTS idx_app_events_user ON app_events_default (user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_name ON app_events_default (event_name, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_type ON app_events_default (event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_content ON app_events_default (content_id, occurred_at DESC) WHERE content_id IS NOT NULL;
