-- ════════════════════════════════════════════════════════════════════════════
-- Watch tracking + watch-based daily streak levels.
-- Doc: apps/documentation/docs/backend/engagement/watch-tracking-and-streaks.md §7
--   • content_views.counted: a session only becomes a "view" after real watching
--     (the view_counts trigger now fires on counted=false→true, not on insert)
--   • backfill unique_viewer_count / total_watch_seconds (never maintained before)
--   • user_streaks levels + user_streak_days activity log
--   • badge trigger 'streak_level_completed'
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE content_views
    ADD COLUMN IF NOT EXISTS counted    BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS counted_at TIMESTAMPTZ;

-- Existing sessions were all counted by the old insert trigger. Runs before the trigger is
-- replaced (the old trigger is INSERT-only, so this UPDATE doesn't double count).
UPDATE content_views SET counted = TRUE, counted_at = started_at WHERE NOT counted;

CREATE INDEX IF NOT EXISTS idx_content_views_user_recent
    ON content_views(user_id, content_id, started_at DESC);

CREATE OR REPLACE FUNCTION trg_view_counts() RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.counted) OR (TG_OP = 'UPDATE' AND NEW.counted AND NOT OLD.counted) THEN
    UPDATE contents
       SET view_count = view_count + 1,
           unique_viewer_count = unique_viewer_count + CASE WHEN EXISTS (
             SELECT 1 FROM content_views v
              WHERE v.content_id = NEW.content_id AND v.user_id = NEW.user_id AND v.counted AND v.id <> NEW.id
           ) THEN 0 ELSE 1 END
     WHERE id = NEW.content_id;
  END IF;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS view_counts ON content_views;
CREATE TRIGGER view_counts
  AFTER INSERT OR UPDATE OF counted ON content_views
  FOR EACH ROW EXECUTE FUNCTION trg_view_counts();

UPDATE contents c
   SET unique_viewer_count = coalesce(s.viewers, 0),
       total_watch_seconds = coalesce(s.watch, 0)
  FROM (SELECT content_id, count(DISTINCT user_id) FILTER (WHERE counted) AS viewers, sum(watched_seconds) AS watch
          FROM content_views GROUP BY content_id) s
 WHERE s.content_id = c.id;

-- ─── Streak levels ─────────────────────────────────────────────────────────
ALTER TABLE user_streaks
    ADD COLUMN IF NOT EXISTS current_level       INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS level_progress_days INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS levels_completed    INTEGER NOT NULL DEFAULT 0;

-- One row per qualified day — the "Activity log" + calendar.
CREATE TABLE IF NOT EXISTS user_streak_days (
    user_id          UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day              DATE    NOT NULL,
    level            INTEGER NOT NULL,
    watch_seconds    INTEGER NOT NULL,
    required_seconds INTEGER NOT NULL,
    streak_day       INTEGER NOT NULL,
    points_awarded   INTEGER NOT NULL DEFAULT 0,
    level_completed  BOOLEAN NOT NULL DEFAULT FALSE,
    completion_bonus INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, day)
);

INSERT INTO badge_triggers (key, label, unit, description) VALUES
  ('streak_level_completed', 'Streak Levels Completed', 'levels', 'Daily-streak levels completed (7 qualifying days each)')
ON CONFLICT (key) DO NOTHING;
