-- ════════════════════════════════════════════════════════════════════════════
-- Comment fixes. Doc: apps/documentation/docs/backend/engagement/comments.md
--   • 'spam' report reason; 'warn' enforcement action
--   • comment_count / reply_count count VISIBLE comments only (hidden no longer counted)
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE comment_reports DROP CONSTRAINT IF EXISTS comment_reports_reason_check;
ALTER TABLE comment_reports ADD CONSTRAINT comment_reports_reason_check
  CHECK (reason IN ('nudity_sexual','violence_gore','hate_speech','harassment_bullying','spam','other'));

ALTER TABLE user_enforcement_actions DROP CONSTRAINT IF EXISTS user_enforcement_actions_action_check;
ALTER TABLE user_enforcement_actions ADD CONSTRAINT user_enforcement_actions_action_check
  CHECK (action IN ('suspend','ban','reinstate','disable','enable','warn'));

CREATE OR REPLACE FUNCTION trg_comment_counts() RETURNS trigger AS $$
DECLARE delta INT := 0; cid UUID; pid UUID;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.status = 'visible') THEN delta := 1; END IF;
    cid := NEW.content_id; pid := NEW.parent_comment_id;
  ELSIF (TG_OP = 'DELETE') THEN
    IF (OLD.status = 'visible') THEN delta := -1; END IF;
    cid := OLD.content_id; pid := OLD.parent_comment_id;
  ELSIF (TG_OP = 'UPDATE' AND NEW.status <> OLD.status) THEN
    IF (OLD.status = 'visible') THEN delta := -1;
    ELSIF (NEW.status = 'visible') THEN delta := 1; END IF;
    cid := NEW.content_id; pid := NEW.parent_comment_id;
  END IF;
  IF delta <> 0 THEN
    UPDATE contents SET comment_count = greatest(0, comment_count + delta) WHERE id = cid;
    IF pid IS NOT NULL THEN
      UPDATE comments SET reply_count = greatest(0, reply_count + delta) WHERE id = pid;
    END IF;
  END IF;
  RETURN NULL;
END; $$ LANGUAGE plpgsql;

-- Backfill both counters from visible comments.
UPDATE contents c SET comment_count = coalesce(s.n, 0)
  FROM (SELECT ct.id, count(cm.id) FILTER (WHERE cm.status = 'visible') AS n
          FROM contents ct LEFT JOIN comments cm ON cm.content_id = ct.id GROUP BY ct.id) s
 WHERE s.id = c.id AND c.comment_count <> coalesce(s.n, 0);

UPDATE comments p SET reply_count = coalesce(s.n, 0)
  FROM (SELECT pc.id, count(r.id) FILTER (WHERE r.status = 'visible') AS n
          FROM comments pc LEFT JOIN comments r ON r.parent_comment_id = pc.id GROUP BY pc.id) s
 WHERE s.id = p.id AND p.reply_count <> coalesce(s.n, 0);
