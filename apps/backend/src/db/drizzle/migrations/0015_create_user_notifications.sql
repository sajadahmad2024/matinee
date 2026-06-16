-- ════════════════════════════════════════════════════════════════════════════
-- In-app notification feed (the customer Profile → Notifications inbox). Per-user
-- list of system events (new trailer, game updates, rewards, social) and pushes.
-- Distinct from notification_campaigns/notification_deliveries (0011), which model
-- the admin push-send + delivery log; a delivered campaign can also drop a row here.
-- UUIDv7 PKs.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_notifications (
    id             UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category       VARCHAR(20) NOT NULL DEFAULT 'general'
                     CHECK (category IN ('new_content','game_update','reward','social','subscription','system','general')),
    title          VARCHAR(150) NOT NULL,
    body           VARCHAR(500),
    deep_link      VARCHAR(300),                    -- in-app route to open on tap
    image_media_id UUID REFERENCES media_metadata(id) ON DELETE SET NULL,  -- thumbnail
    source_type    VARCHAR(30),                     -- 'content' | 'quest' | 'prediction' | 'badge' | …
    source_id      UUID,                            -- polymorphic ref to the originating row
    campaign_id    UUID REFERENCES notification_campaigns(id) ON DELETE SET NULL,  -- if from a push campaign
    is_read        BOOLEAN NOT NULL DEFAULT false,
    read_at        TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_user_notifications_user   ON user_notifications(user_id, created_at DESC);
CREATE INDEX idx_user_notifications_unread ON user_notifications(user_id) WHERE NOT is_read;
