-- ════════════════════════════════════════════════════════════════════════════
-- Leaderboards (rank by XP / level).
--   • All-time global → already supported by idx_wallets_xp (wallets.xp_total) + level_for_xp().
--   • Monthly        → per-user-per-month XP-EARNED aggregate, kept current by a trigger on the
--                      ledger (consistent with the other denormalized counters). Resets per month.
-- XP is earn-only, so a monthly board never needs to handle debits.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS leaderboard_monthly (
    period_month DATE   NOT NULL,                 -- first day of the month (date_trunc('month'))
    user_id      UUID   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    xp_earned    BIGINT NOT NULL DEFAULT 0,        -- XP earned by this user in this month
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (period_month, user_id)
);
-- Ranking query: WHERE period_month = :m ORDER BY xp_earned DESC
CREATE INDEX idx_leaderboard_monthly_rank ON leaderboard_monthly(period_month, xp_earned DESC);

-- Accrue monthly XP from each XP earn on the ledger.
CREATE OR REPLACE FUNCTION trg_leaderboard_monthly() RETURNS trigger AS $$
BEGIN
  IF NEW.currency = 'xp' AND NEW.amount > 0 THEN
    INSERT INTO leaderboard_monthly(period_month, user_id, xp_earned)
    VALUES (date_trunc('month', NEW.created_at)::date, NEW.user_id, NEW.amount)
    ON CONFLICT (period_month, user_id)
    DO UPDATE SET xp_earned = leaderboard_monthly.xp_earned + EXCLUDED.xp_earned, updated_at = NOW();
  END IF;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER leaderboard_monthly AFTER INSERT ON ledger_transactions
  FOR EACH ROW EXECUTE FUNCTION trg_leaderboard_monthly();
