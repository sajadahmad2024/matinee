-- Seed: tokenomics reward_rules + game widget config + leveling curve
-- Idempotent. Extracted from migrations 0002 (referral/daily_login), 0004 (games),
-- 0005 (leveling). The tables/functions are created by those migrations; this only
-- seeds data. reward_rule_versions snapshots v1 of every rule; the leveling curve is
-- (re)generated from the 'leveling' config.

-- Earning rules (referral + daily login)
INSERT INTO reward_rules (rule_key, name, description, is_enabled, config) VALUES
  ('referral',    'Referral Program', 'Reward users for inviting friends',      true,
     '{"xp_per_invite": 500, "max_invites_per_month": 10}'::jsonb),
  ('daily_login', 'Daily Login Bonus', 'Reward users for opening the app daily', true,
     '{"points": 10, "xp": 5}'::jsonb)
ON CONFLICT (rule_key) DO NOTHING;

-- Game rules
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

-- Leveling rule (XP → level progression curve; admin "Leveling Configuration" screen)
INSERT INTO reward_rules (rule_key, name, description, is_enabled, config, version) VALUES
  ('leveling', 'Leveling', 'XP → level progression curve', true,
     '{"base_xp":20,"growth_multiplier":1.5,"max_level_cap":100}'::jsonb, 1)
ON CONFLICT (rule_key) DO NOTHING;

-- Snapshot v1 of every rule
INSERT INTO reward_rule_versions (rule_id, rule_key, version, config)
SELECT id, rule_key, version, config FROM reward_rules
ON CONFLICT (rule_id, version) DO NOTHING;

-- Build the level curve from the 'leveling' config (idempotent: rebuilds level_definitions)
SELECT regenerate_level_definitions();

-- One app-widget row per fixed game type (visible card with a default CTA).
-- Per-instance banner overrides live on quests/predictions/auctions.banner_media_id.
INSERT INTO game_widget_configs (game_key, cta_label) VALUES
  ('daily_streak',  'Keep your streak'),
  ('quest',         'Start a quest'),
  ('shared_content','Share & earn'),
  ('prediction',    'Predict & win'),
  ('bidding',       'Place a bid')
ON CONFLICT (game_key) DO NOTHING;
