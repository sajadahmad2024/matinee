-- Seed: default geo/compliance policy (fallback for any unlisted country)
-- Idempotent. Extracted from migration 0002 (table stays in the migration).

INSERT INTO geo_policies (country_code, is_default, is_supported, tokenomics_enabled,
                          onchain_rewards_enabled, subscription_required, notes)
SELECT NULL, true, true, true, false, true, 'Default fallback policy for unlisted countries'
WHERE NOT EXISTS (SELECT 1 FROM geo_policies WHERE is_default);
