-- ════════════════════════════════════════════════════════════════════════════
-- Moderation queue. A unified ticket spans the three report subjects the admin
-- panel handles — comments, content (videos), and users — with severity, category,
-- assignment and resolution. Individual user reports roll up into one ticket
-- (report_count). Generalizes the comment-only `comment_reports` (0003); content
-- actions still log to `content_moderation_log` and bans to `user_enforcement_actions`.
-- UUIDv7 PKs.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS moderation_tickets (
    id                 UUID PRIMARY KEY DEFAULT uuidv7(),
    subject_type       VARCHAR(20) NOT NULL CHECK (subject_type IN ('comment','content','user')),
    subject_id         UUID,                            -- polymorphic → comments / contents / users
    offender_user_id   UUID REFERENCES users(id) ON DELETE SET NULL,
    severity           VARCHAR(10) NOT NULL DEFAULT 'low'
                         CHECK (severity IN ('high','medium','low')),
    category           VARCHAR(20) NOT NULL DEFAULT 'other'
                         CHECK (category IN ('hate_speech','spam','nudity','violence','harassment','other')),
    content_snapshot   TEXT,                            -- copy of the reported content at report time
    report_count       INTEGER NOT NULL DEFAULT 1,      -- how many users reported it
    is_repeat_offender BOOLEAN NOT NULL DEFAULT false,
    status             VARCHAR(20) NOT NULL DEFAULT 'open'
                         CHECK (status IN ('open','in_review','resolved','dismissed','escalated')),
    assigned_to        UUID REFERENCES users(id) ON DELETE SET NULL,  -- admin handling it
    resolution         VARCHAR(30)
                         CHECK (resolution IN ('content_removed','user_warned','user_suspended','user_banned','no_action')),
    resolution_note    VARCHAR(500),
    resolved_by        UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at        TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_moderation_tickets_queue    ON moderation_tickets(status, severity) WHERE status IN ('open','in_review','escalated');
CREATE INDEX idx_moderation_tickets_offender ON moderation_tickets(offender_user_id);
CREATE INDEX idx_moderation_tickets_subject  ON moderation_tickets(subject_type, subject_id);

-- Individual reports that roll up into a ticket (one ticket per offending subject).
CREATE TABLE IF NOT EXISTS moderation_reports (
    id               UUID PRIMARY KEY DEFAULT uuidv7(),
    ticket_id        UUID NOT NULL REFERENCES moderation_tickets(id) ON DELETE CASCADE,
    reporter_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reason           VARCHAR(20) NOT NULL DEFAULT 'other'
                       CHECK (reason IN ('hate_speech','spam','nudity','violence','harassment','other')),
    note             VARCHAR(500),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_moderation_reports_ticket ON moderation_reports(ticket_id);
