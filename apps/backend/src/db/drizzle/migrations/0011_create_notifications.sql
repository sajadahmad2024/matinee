-- ════════════════════════════════════════════════════════════════════════════
-- Push notification campaigns + per-device delivery log. Backs the admin
-- "Send Notification" flow (target all/segment/selected, schedule, deep link).
-- Delivery rides on device_tokens (0002). UUIDv7 PKs.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notification_campaigns (
    id              UUID PRIMARY KEY DEFAULT uuidv7(),
    title           VARCHAR(150) NOT NULL,
    message         VARCHAR(500) NOT NULL,
    deep_link       VARCHAR(300),
    target_type     VARCHAR(20) NOT NULL DEFAULT 'all'
                      CHECK (target_type IN ('all','segment','selected')),
    target_filter   JSONB NOT NULL DEFAULT '{}'::jsonb,   -- segment criteria OR explicit user ids
    status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft','scheduled','sending','sent','failed','canceled')),
    scheduled_at    TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ,
    recipient_count INTEGER NOT NULL DEFAULT 0,
    delivered_count INTEGER NOT NULL DEFAULT 0,
    opened_count    INTEGER NOT NULL DEFAULT 0,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notification_campaigns_status ON notification_campaigns(status, scheduled_at);

CREATE TABLE IF NOT EXISTS notification_deliveries (
    id              UUID PRIMARY KEY DEFAULT uuidv7(),
    campaign_id     UUID NOT NULL REFERENCES notification_campaigns(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    device_token_id UUID REFERENCES device_tokens(id) ON DELETE SET NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'queued'
                      CHECK (status IN ('queued','sent','delivered','opened','failed')),
    error           VARCHAR(300),
    sent_at         TIMESTAMPTZ,
    opened_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notification_deliveries_campaign ON notification_deliveries(campaign_id);
CREATE INDEX idx_notification_deliveries_user     ON notification_deliveries(user_id);
