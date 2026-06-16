-- ════════════════════════════════════════════════════════════════════════════
-- Best-practice index pass: cover the high-traffic FK columns that grow large and
-- are queried by user/content or scanned on cascade-delete. Postgres does NOT auto-
-- index FK columns. We intentionally do NOT index cold FKs (created_by / updated_by /
-- changed_by / *_media_id / admin-config FKs) — those tables are small and rarely
-- filtered by those columns, so indexing them only adds write cost.
-- ════════════════════════════════════════════════════════════════════════════

-- Engagement (large, queried by user; cascade on user delete)
CREATE INDEX IF NOT EXISTS idx_comments_user           ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_content_reactions_user  ON content_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user  ON comment_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_content_shares_user     ON content_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_content_progress_content ON content_progress(content_id);

-- Games activity (per-user history + content→game lookups)
CREATE INDEX IF NOT EXISTS idx_prediction_entries_user     ON prediction_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_prediction_entries_option   ON prediction_entries(option_id);
CREATE INDEX IF NOT EXISTS idx_quest_participations_user   ON quest_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_content_progress_user ON quest_content_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_content_progress_content ON quest_content_progress(content_id);
CREATE INDEX IF NOT EXISTS idx_quest_contents_content      ON quest_contents(content_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_monthly_user    ON leaderboard_monthly(user_id);
CREATE INDEX IF NOT EXISTS idx_auctions_content            ON auctions(content_id);
CREATE INDEX IF NOT EXISTS idx_predictions_content         ON predictions(content_id);

-- Auth + delivery hot paths
CREATE INDEX IF NOT EXISTS idx_otp_codes_user                 ON otp_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_device ON notification_deliveries(device_token_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission    ON role_permissions(permission_id);
