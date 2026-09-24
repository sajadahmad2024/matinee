-- ════════════════════════════════════════════════════════════════════════════
-- Transactional (non-campaign) push audit — one row per FCM send attempt.
-- Admin campaigns write to notification_deliveries (0011); this table captures
-- event-driven pushes (e.g. auction outbid, subscription events, streak reminders)
-- and topic broadcasts (device_token_id NULL, topic set). UUIDv7 PKs.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notification_logs (
    id              UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,           -- null for topic broadcasts
    device_token_id UUID REFERENCES device_tokens(id) ON DELETE SET NULL,   -- null for topic broadcasts
    channel         VARCHAR(20) NOT NULL DEFAULT 'push',
    provider        VARCHAR(20) NOT NULL DEFAULT 'fcm',
    template_key    VARCHAR(80) NOT NULL,                                   -- e.g. 'auction.outbid'
    title           VARCHAR(150),
    body            VARCHAR(500),
    data            JSONB NOT NULL DEFAULT '{}'::jsonb,                     -- deep-link payload
    topic           VARCHAR(100),                                           -- set only for topic sends
    status          VARCHAR(20) NOT NULL DEFAULT 'sent'
                      CHECK (status IN ('sent','failed')),
    fcm_message_id  VARCHAR(120),                                           -- FCM's returned message id
    error_code      VARCHAR(60),                                            -- e.g. 'messaging/registration-token-not-registered'
    error_message   VARCHAR(300),
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notification_logs_user     ON notification_logs(user_id, sent_at DESC);
CREATE INDEX idx_notification_logs_template ON notification_logs(template_key, sent_at DESC);
CREATE INDEX idx_notification_logs_failed   ON notification_logs(status, sent_at DESC) WHERE status = 'failed';
