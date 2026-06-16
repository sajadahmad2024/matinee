-- Seed: badge trigger catalog + sample badges (admin "Badges" screen)
-- Idempotent. Extracted from migration 0007 (tables/triggers stay in the migration).

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
