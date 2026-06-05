-- ════════════════════════════════════════════════════════════════════════════
-- Badges — admin-defined milestones unlocked by a DYNAMIC rule (trigger·operator·value).
-- A user earns many badges "as and when they overcome a rule". The rule evaluates a
-- per-user METRIC (the trigger dropdown = a catalog of metric keys). When a metric
-- crosses a badge's threshold, an autonomous trigger awards the badge + its points.
-- ════════════════════════════════════════════════════════════════════════════

-- The "Select trigger…" catalog — metric keys badges can test (data-driven dropdown).
-- The VALUE of each metric per user lives in user_metrics (fed by feature handlers).
CREATE TABLE IF NOT EXISTS badge_triggers (
    key         VARCHAR(50) PRIMARY KEY,             -- e.g. 'quizzes_completed'
    label       VARCHAR(100) NOT NULL,               -- 'Quizzes Completed'
    unit        VARCHAR(20),                         -- 'days' | 'mins' | null
    description VARCHAR(300),
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Badge definitions (the "Create New Badge" form / Badge Management cards).
CREATE TABLE IF NOT EXISTS badges (
    id                     UUID PRIMARY KEY DEFAULT uuidv7(),
    name                   VARCHAR(150) NOT NULL,
    slug                   VARCHAR(170) NOT NULL UNIQUE,
    description            TEXT,
    active_icon_media_id   UUID REFERENCES media_metadata(id) ON DELETE SET NULL,  -- earned state
    inactive_icon_media_id UUID REFERENCES media_metadata(id) ON DELETE SET NULL,  -- locked state
    -- Single-criterion rule (matches the UI: Trigger · Operator · Value)
    trigger_key            VARCHAR(50) NOT NULL REFERENCES badge_triggers(key) ON DELETE RESTRICT,
    operator               VARCHAR(5) NOT NULL CHECK (operator IN ('gt','gte','eq','lt','lte')),
    threshold              NUMERIC NOT NULL,
    reward_points          INTEGER NOT NULL DEFAULT 0,
    reward_xp              INTEGER NOT NULL DEFAULT 0,
    is_active              BOOLEAN NOT NULL DEFAULT true,   -- the "Inactive" badge state
    earned_count           BIGINT NOT NULL DEFAULT 0,       -- denormalized "X earned"
    created_by             UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at             TIMESTAMPTZ
);
CREATE INDEX idx_badges_trigger ON badges(trigger_key) WHERE is_active AND deleted_at IS NULL;

-- Per-user metric store (what badge triggers evaluate against). Generic key/value so any
-- feature handler can bump a metric (watch → total_watch_minutes, referral → referrals_completed,
-- streak → watch_streak_days, …) and badge evaluation reacts.
CREATE TABLE IF NOT EXISTS user_metrics (
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric_key VARCHAR(50) NOT NULL,
    value      BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, metric_key)
);

-- Badges a user has earned (a user can have many).
CREATE TABLE IF NOT EXISTS user_badges (
    user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id  UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);

-- Denormalized "X earned" on the badge.
CREATE OR REPLACE FUNCTION trg_badge_earned_count() RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE badges SET earned_count = earned_count + 1 WHERE id = NEW.badge_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE badges SET earned_count = earned_count - 1 WHERE id = OLD.badge_id;
  END IF;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER badge_earned_count
  AFTER INSERT OR DELETE ON user_badges
  FOR EACH ROW EXECUTE FUNCTION trg_badge_earned_count();

-- Award a badge once (idempotent) + credit its points/XP to the ledger.
CREATE OR REPLACE FUNCTION award_badge(p_user UUID, p_badge UUID) RETURNS void AS $$
DECLARE pts INTEGER; xp INTEGER;
BEGIN
  INSERT INTO user_badges(user_id, badge_id) VALUES (p_user, p_badge) ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN RETURN; END IF;                 -- already earned
  SELECT reward_points, reward_xp INTO pts, xp FROM badges WHERE id = p_badge;
  IF pts > 0 THEN
    INSERT INTO ledger_transactions(user_id, currency, amount, direction, source_type, source_id, idempotency_key)
    VALUES (p_user, 'points', pts, 'earn', 'badge', p_badge, 'badge:' || p_badge || ':' || p_user);
  END IF;
  IF xp > 0 THEN
    INSERT INTO ledger_transactions(user_id, currency, amount, direction, source_type, source_id, idempotency_key)
    VALUES (p_user, 'xp', xp, 'earn', 'badge', p_badge, 'badge_xp:' || p_badge || ':' || p_user);
  END IF;
END; $$ LANGUAGE plpgsql;

-- Autonomous engine: when a user's metric changes, award any active badge whose rule is now met.
CREATE OR REPLACE FUNCTION trg_evaluate_badges() RETURNS trigger AS $$
DECLARE b RECORD; ok BOOLEAN;
BEGIN
  FOR b IN
    SELECT id, operator, threshold FROM badges
     WHERE trigger_key = NEW.metric_key AND is_active AND deleted_at IS NULL
  LOOP
    IF NOT EXISTS (SELECT 1 FROM user_badges WHERE user_id = NEW.user_id AND badge_id = b.id) THEN
      ok := CASE b.operator
              WHEN 'gt'  THEN NEW.value >  b.threshold
              WHEN 'gte' THEN NEW.value >= b.threshold
              WHEN 'eq'  THEN NEW.value =  b.threshold
              WHEN 'lt'  THEN NEW.value <  b.threshold
              WHEN 'lte' THEN NEW.value <= b.threshold
              ELSE false END;
      IF ok THEN PERFORM award_badge(NEW.user_id, b.id); END IF;
    END IF;
  END LOOP;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER evaluate_badges
  AFTER INSERT OR UPDATE OF value ON user_metrics
  FOR EACH ROW EXECUTE FUNCTION trg_evaluate_badges();

-- ─── Seed: trigger catalog + the sample badges from the admin screen ────────
INSERT INTO badge_triggers (key, label, unit, description) VALUES
  ('quizzes_completed',  'Quizzes Completed',   NULL,   'Number of quizzes/predictions completed'),
  ('watch_streak_days',  'Watch Streak (days)', 'days', 'Current consecutive watch-day streak'),
  ('total_watch_minutes','Total Watch Time',    'mins', 'Lifetime watch time in minutes'),
  ('fast_completions',   'Fast Completions',    NULL,   'Games completed under the time limit'),
  ('first_place_wins',   'First Place Wins',    NULL,   'Times finishing #1 on a leaderboard'),
  ('referrals_completed','Referrals Completed', NULL,   'Referred users who finished their first game')
ON CONFLICT (key) DO NOTHING;

INSERT INTO badges (name, slug, description, trigger_key, operator, threshold, reward_points, is_active) VALUES
  ('Quiz Master',     'quiz-master',     'Complete 50 quizzes with 80%+ accuracy',          'quizzes_completed',   'gt',  50,   500,  true),
  ('Streak Champion', 'streak-champion', 'Maintain a 30-day watch streak',                  'watch_streak_days',   'eq',  30,   1000, true),
  ('Binge Watcher',   'binge-watcher',   'Watch over 100 hours of content',                 'total_watch_minutes', 'gt',  6000, 750,  true),
  ('Speed Demon',     'speed-demon',     'Complete 10 games in under 5 minutes each',       'fast_completions',    'gt',  10,   300,  true),
  ('First Place',     'first-place',     'Win first place in any leaderboard',              'first_place_wins',    'gt',  1,    200,  true),
  ('Social Butterfly','social-butterfly','Refer 5 friends who complete their first game',   'referrals_completed', 'gt',  5,    400,  false)
ON CONFLICT (slug) DO NOTHING;
