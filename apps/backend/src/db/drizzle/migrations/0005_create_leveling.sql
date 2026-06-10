-- ════════════════════════════════════════════════════════════════════════════
-- Leveling (XP → levels via an admin-configurable curve) + leaderboard support.
-- Curve: xp_to_advance(level) = round(base_xp * growth_multiplier^(level-1)),
-- capped at max_level_cap. Config lives in the versioned reward_rules ('leveling').
-- A user's level is derived from wallets.xp_total via level_definitions (no stored
-- column needed — level is monotonic with XP, so leaderboards order by xp_total).
-- ════════════════════════════════════════════════════════════════════════════

-- Admin-editable, versioned leveling config (the "Leveling Configuration" screen)
INSERT INTO reward_rules (rule_key, name, description, is_enabled, config, version) VALUES
  ('leveling', 'Leveling', 'XP → level progression curve', true,
    '{"base_xp":20,"growth_multiplier":1.5,"max_level_cap":100}'::jsonb, 1)
ON CONFLICT (rule_key) DO NOTHING;

INSERT INTO reward_rule_versions (rule_id, rule_key, version, config)
SELECT id, rule_key, version, config FROM reward_rules WHERE rule_key = 'leveling'
ON CONFLICT (rule_id, version) DO NOTHING;

-- Precomputed curve (powers the admin "Level Requirements Table" + fast level lookup).
-- NUMERIC (not bigint): with a high cap + growth >1, late-level XP exceeds bigint range
-- (level 100 @ 1.5x ≈ 1e19, aspirational). NUMERIC stores the full curve without overflow.
CREATE TABLE IF NOT EXISTS level_definitions (
    level               INTEGER PRIMARY KEY,
    xp_to_advance       NUMERIC NOT NULL,   -- XP to go from this level to the next
    cumulative_to_reach NUMERIC NOT NULL    -- total XP needed to BE at this level
);

-- Rebuild level_definitions from the current 'leveling' config.
-- The admin "Save Configuration" action calls this after updating the rule.
CREATE OR REPLACE FUNCTION regenerate_level_definitions() RETURNS void AS $$
DECLARE cfg jsonb; base numeric; mult numeric; cap int; lvl int; adv numeric; cum numeric := 0;
BEGIN
  SELECT config INTO cfg FROM reward_rules WHERE rule_key = 'leveling';
  IF cfg IS NULL THEN RETURN; END IF;
  base := COALESCE((cfg->>'base_xp')::numeric, 20);
  mult := COALESCE((cfg->>'growth_multiplier')::numeric, 1.5);
  cap  := COALESCE((cfg->>'max_level_cap')::int, 100);
  TRUNCATE level_definitions;
  FOR lvl IN 1..cap LOOP
    adv := round(base * power(mult, lvl - 1));
    INSERT INTO level_definitions(level, xp_to_advance, cumulative_to_reach) VALUES (lvl, adv, cum);
    cum := cum + adv;
  END LOOP;
END; $$ LANGUAGE plpgsql;

SELECT regenerate_level_definitions();   -- seed with the default curve

-- Level for a given XP total (display + leaderboard rows).
CREATE OR REPLACE FUNCTION level_for_xp(p_xp bigint) RETURNS integer AS $$
  SELECT COALESCE(MAX(level), 1) FROM level_definitions WHERE cumulative_to_reach <= p_xp;
$$ LANGUAGE sql STABLE;

-- Leaderboard support: all-time global ranking by XP (level tracks XP, so this orders both).
CREATE INDEX IF NOT EXISTS idx_wallets_xp ON wallets(xp_total DESC);
