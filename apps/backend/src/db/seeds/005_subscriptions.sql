-- Seed: starter subscription plans + per-region prices (admin paywall config)
-- Idempotent. Extracted from migration 0008 (tables stay in the migration).

INSERT INTO subscription_plans (id, name, description, base_price_cents, base_currency, interval, is_popular, sort_order, features)
VALUES
  ('01890000-0000-7000-8000-0000000000a1', 'Monthly', 'Essential access to content library', 999, 'USD', 'monthly', false, 1,
     '["Access to standard library","SD streaming quality","1 device at a time","Basic game participation"]'::jsonb),
  ('01890000-0000-7000-8000-0000000000a2', 'Premium Annual', 'Best value for dedicated fans', 9999, 'USD', 'yearly', true, 2,
     '["Full 4K HDR access","No advertisements","4 devices simultaneously","Elite game participation","Priority customer support"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO plan_region_prices (plan_id, region, price_cents, currency) VALUES
  ('01890000-0000-7000-8000-0000000000a1', 'NA',    999, 'USD'),
  ('01890000-0000-7000-8000-0000000000a1', 'EU',    899, 'EUR'),
  ('01890000-0000-7000-8000-0000000000a1', 'APAC',  499, 'USD'),
  ('01890000-0000-7000-8000-0000000000a1', 'LATAM', 399, 'USD'),
  ('01890000-0000-7000-8000-0000000000a1', 'MEA',   499, 'USD'),
  ('01890000-0000-7000-8000-0000000000a2', 'NA',    9999, 'USD'),
  ('01890000-0000-7000-8000-0000000000a2', 'EU',    8999, 'EUR'),
  ('01890000-0000-7000-8000-0000000000a2', 'APAC',  4999, 'USD'),
  ('01890000-0000-7000-8000-0000000000a2', 'LATAM', 3999, 'USD'),
  ('01890000-0000-7000-8000-0000000000a2', 'MEA',   4999, 'USD')
ON CONFLICT (plan_id, region) DO NOTHING;
