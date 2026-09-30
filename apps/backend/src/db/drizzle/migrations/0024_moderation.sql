-- ════════════════════════════════════════════════════════════════════════════
-- Moderation APIs (TTLE-231): internal ticket notes, race-safe one-open-ticket-
-- per-subject, one report per reporter per ticket, queue/stats indexes and a
-- repeat-offender backfill. Idempotent — safe to re-run.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Internal moderator notes on a ticket ───────────────────────────────────
CREATE TABLE IF NOT EXISTS moderation_ticket_notes (
    id          UUID PRIMARY KEY DEFAULT uuidv7(),
    ticket_id   UUID NOT NULL REFERENCES moderation_tickets(id) ON DELETE CASCADE,
    author_id   UUID REFERENCES users(id) ON DELETE SET NULL,
    body        VARCHAR(1000) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_moderation_ticket_notes_ticket ON moderation_ticket_notes(ticket_id, created_at DESC);

-- ─── One open ticket per subject (createOrBumpTicket upserts against this) ──
-- Collapse any pre-existing duplicate open tickets first: keep the oldest, move reports.
WITH ranked AS (
    SELECT id, subject_type, subject_id,
           first_value(id) OVER (PARTITION BY subject_type, subject_id ORDER BY created_at, id) AS keep_id
      FROM moderation_tickets
     WHERE status IN ('open','in_review','escalated') AND subject_id IS NOT NULL
), dups AS (
    SELECT id, keep_id FROM ranked WHERE id <> keep_id
), moved AS (
    UPDATE moderation_reports r SET ticket_id = d.keep_id FROM dups d WHERE r.ticket_id = d.id RETURNING r.id
)
UPDATE moderation_tickets t
   SET status = 'dismissed', resolution = 'no_action', resolution_note = 'Merged duplicate open ticket', resolved_at = NOW(), updated_at = NOW()
  FROM dups d WHERE t.id = d.id;

CREATE UNIQUE INDEX IF NOT EXISTS uq_moderation_tickets_open_subject
    ON moderation_tickets(subject_type, subject_id)
    WHERE status IN ('open','in_review','escalated');

-- ─── One report per reporter per ticket ─────────────────────────────────────
DELETE FROM moderation_reports r
 USING moderation_reports o
 WHERE r.ticket_id = o.ticket_id AND r.reporter_user_id = o.reporter_user_id
   AND r.reporter_user_id IS NOT NULL AND (r.created_at, r.id) > (o.created_at, o.id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_moderation_reports_ticket_reporter
    ON moderation_reports(ticket_id, reporter_user_id)
    WHERE reporter_user_id IS NOT NULL;

-- ─── Queue / stats / history indexes ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_moderation_tickets_created      ON moderation_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_tickets_resolved_at  ON moderation_tickets(resolved_at DESC) WHERE resolved_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_moderation_tickets_assignee     ON moderation_tickets(assigned_to) WHERE status IN ('open','in_review','escalated');
CREATE INDEX IF NOT EXISTS idx_moderation_tickets_offender_time ON moderation_tickets(offender_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_created      ON moderation_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_reporter     ON moderation_reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target_time     ON admin_audit_log(target_type, target_id, created_at DESC);

-- ─── Backfill is_repeat_offender ────────────────────────────────────────────
UPDATE moderation_tickets t
   SET is_repeat_offender = true
 WHERE t.offender_user_id IS NOT NULL
   AND t.is_repeat_offender = false
   AND (
        EXISTS (SELECT 1 FROM moderation_tickets p
                 WHERE p.offender_user_id = t.offender_user_id AND p.id <> t.id
                   AND p.status = 'resolved' AND p.resolution IS DISTINCT FROM 'no_action'
                   AND p.resolved_at <= GREATEST(t.created_at, t.updated_at))
     OR EXISTS (SELECT 1 FROM user_enforcement_actions e
                 WHERE e.user_id = t.offender_user_id AND e.action IN ('warn','suspend','ban')
                   AND e.created_at <= GREATEST(t.created_at, t.updated_at))
   );
