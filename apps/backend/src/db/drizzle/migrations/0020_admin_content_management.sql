-- ════════════════════════════════════════════════════════════════════════════
-- Admin content management integration pass.
-- Doc: apps/documentation/docs/backend/content/admin-content-management-api.md §8
--   • contents: where-to-watch links, live-window end, boost window + channels
--   • content_regions: per-region Live/Off toggle (selection ≠ live)
--   • studios.country_code, people.known_for (taxonomy manager)
--   • content_views.source (traffic-source analytics) + started_at index (windowed analytics)
--   • content_change_history: 'unscheduled' / 'deleted' actions
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE contents
    ADD COLUMN IF NOT EXISTS watch_links     JSONB        NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS available_until TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS boost_starts_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS boost_channels  VARCHAR(20)[] NOT NULL DEFAULT '{}';

ALTER TABLE contents
    ADD CONSTRAINT contents_boost_channels_check
        CHECK (boost_channels <@ ARRAY['homepage','notifications','regional','subscribers']::varchar[]);

CREATE INDEX IF NOT EXISTS idx_contents_available_until
    ON contents(available_until) WHERE available_until IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contents_created_at
    ON contents(created_at DESC) WHERE deleted_at IS NULL;

ALTER TABLE content_regions
    ADD COLUMN IF NOT EXISTS is_live BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE studios
    ADD COLUMN IF NOT EXISTS country_code VARCHAR(2);

ALTER TABLE people
    ADD COLUMN IF NOT EXISTS known_for VARCHAR(20);
ALTER TABLE people
    ADD CONSTRAINT people_known_for_check
        CHECK (known_for IS NULL OR known_for IN ('actor','director','writer','producer','other'));

ALTER TABLE content_views
    ADD COLUMN IF NOT EXISTS source VARCHAR(20);
ALTER TABLE content_views
    ADD CONSTRAINT content_views_source_check
        CHECK (source IS NULL OR source IN ('feed','search','share','notification','profile','deeplink','other'));
CREATE INDEX IF NOT EXISTS idx_content_views_started_at ON content_views(started_at);

ALTER TABLE content_change_history DROP CONSTRAINT IF EXISTS content_change_history_action_check;
ALTER TABLE content_change_history
    ADD CONSTRAINT content_change_history_action_check
        CHECK (action IN ('created','updated','submitted','approved','rejected','scheduled','published',
                          'boosted','archived','unscheduled','deleted'));
