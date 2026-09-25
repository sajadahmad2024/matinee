-- 0025_content_metadata_ads
-- TTLE-227 (content gaps) + TTLE-232 (video metadata) + TTLE-233 (ad configuration).
-- Idempotent: safe to re-run.

-- ─── contents: boost notification claim + manual duration ─────────────────────
ALTER TABLE contents ADD COLUMN IF NOT EXISTS boost_notified_at timestamptz;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS boost_campaign_id uuid;
ALTER TABLE contents ADD COLUMN IF NOT EXISTS duration_manual boolean NOT NULL DEFAULT false;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contents_boost_campaign_id_fkey') THEN
    ALTER TABLE contents ADD CONSTRAINT contents_boost_campaign_id_fkey
      FOREIGN KEY (boost_campaign_id) REFERENCES notification_campaigns(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Active boosts that still need their notifications/subscribers campaign.
CREATE INDEX IF NOT EXISTS idx_contents_boost_notify_pending ON contents (boost_starts_at)
  WHERE is_boosted AND boost_notified_at IS NULL AND deleted_at IS NULL;

-- ─── content_media: frame timecode + one attachment per media ─────────────────
ALTER TABLE content_media ADD COLUMN IF NOT EXISTS timecode_seconds numeric(10,3);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_media_timecode_check') THEN
    ALTER TABLE content_media ADD CONSTRAINT content_media_timecode_check
      CHECK (timecode_seconds IS NULL OR timecode_seconds >= 0);
  END IF;
END $$;
-- drop accidental duplicates before the unique index (keeps the oldest row)
DELETE FROM content_media a USING content_media b
 WHERE a.content_id = b.content_id AND a.media_id = b.media_id AND a.id > b.id;
CREATE UNIQUE INDEX IF NOT EXISTS uq_content_media_content_media ON content_media (content_id, media_id);

-- ─── duration propagation media_metadata → contents ───────────────────────────
-- The transcoder Lambda writes media_metadata via pg (bypassing the API), so this lives in SQL.
CREATE OR REPLACE FUNCTION contents_duration_from_media() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.duration_manual THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE'
     AND NEW.video_media_id IS NOT DISTINCT FROM OLD.video_media_id
     AND NOT (OLD.duration_manual AND NOT NEW.duration_manual) THEN
    RETURN NEW;
  END IF;
  IF NEW.video_media_id IS NULL THEN
    IF TG_OP = 'UPDATE' THEN
      NEW.duration_seconds := NULL;
    END IF;
    RETURN NEW;
  END IF;
  NEW.duration_seconds := (
    SELECT round(m.duration_seconds)::int FROM media_metadata m
     WHERE m.id = NEW.video_media_id AND m.deleted_at IS NULL
  );
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_contents_duration_from_media ON contents;
CREATE TRIGGER trg_contents_duration_from_media
  BEFORE INSERT OR UPDATE OF video_media_id, duration_manual ON contents
  FOR EACH ROW EXECUTE FUNCTION contents_duration_from_media();

CREATE OR REPLACE FUNCTION media_duration_to_contents() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.duration_seconds IS DISTINCT FROM OLD.duration_seconds THEN
    UPDATE contents
       SET duration_seconds = round(NEW.duration_seconds)::int, updated_at = now()
     WHERE video_media_id = NEW.id
       AND NOT duration_manual
       AND deleted_at IS NULL
       AND duration_seconds IS DISTINCT FROM round(NEW.duration_seconds)::int;
  END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_media_duration_to_contents ON media_metadata;
CREATE TRIGGER trg_media_duration_to_contents
  AFTER UPDATE OF duration_seconds ON media_metadata
  FOR EACH ROW EXECUTE FUNCTION media_duration_to_contents();

-- one-off backfill
UPDATE contents c
   SET duration_seconds = round(m.duration_seconds)::int
  FROM media_metadata m
 WHERE m.id = c.video_media_id
   AND m.duration_seconds IS NOT NULL
   AND NOT c.duration_manual
   AND c.duration_seconds IS DISTINCT FROM round(m.duration_seconds)::int;

-- ─── content_sponsorships: ad configuration ───────────────────────────────────
ALTER TABLE content_sponsorships ADD COLUMN IF NOT EXISTS creative_media_id uuid;
ALTER TABLE content_sponsorships ADD COLUMN IF NOT EXISTS click_url varchar(500);
ALTER TABLE content_sponsorships ADD COLUMN IF NOT EXISTS cta_label varchar(40);
ALTER TABLE content_sponsorships ADD COLUMN IF NOT EXISTS mid_roll_at_seconds integer;
ALTER TABLE content_sponsorships ADD COLUMN IF NOT EXISTS overlay_start_seconds integer;
ALTER TABLE content_sponsorships ADD COLUMN IF NOT EXISTS overlay_duration_seconds integer;
ALTER TABLE content_sponsorships ADD COLUMN IF NOT EXISTS cpm_cents integer;
ALTER TABLE content_sponsorships ADD COLUMN IF NOT EXISTS cpc_cents integer;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_sponsorships_creative_media_id_fkey') THEN
    ALTER TABLE content_sponsorships ADD CONSTRAINT content_sponsorships_creative_media_id_fkey
      FOREIGN KEY (creative_media_id) REFERENCES media_metadata(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_sponsorships_ad_numbers_check') THEN
    ALTER TABLE content_sponsorships ADD CONSTRAINT content_sponsorships_ad_numbers_check CHECK (
      (mid_roll_at_seconds IS NULL OR mid_roll_at_seconds >= 0)
      AND (overlay_start_seconds IS NULL OR overlay_start_seconds >= 0)
      AND (overlay_duration_seconds IS NULL OR overlay_duration_seconds > 0)
      AND (cpm_cents IS NULL OR cpm_cents >= 0)
      AND (cpc_cents IS NULL OR cpc_cents >= 0)
    );
  END IF;
END $$;

-- Deactivation sweep (cron): active deals with an end date.
CREATE INDEX IF NOT EXISTS idx_content_sponsorships_ends ON content_sponsorships (ends_at)
  WHERE is_active AND ends_at IS NOT NULL;

-- ─── ad_events: impression / click / skip / complete (deduped per view) ───────
CREATE TABLE IF NOT EXISTS ad_events (
  id               uuid PRIMARY KEY DEFAULT uuidv7(),
  sponsorship_id   uuid NOT NULL REFERENCES content_sponsorships(id) ON DELETE CASCADE,
  content_id       uuid NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  user_id          uuid REFERENCES users(id) ON DELETE SET NULL,
  view_key         varchar(64) NOT NULL,
  event_type       varchar(20) NOT NULL,
  position_seconds integer,
  region           varchar(100),
  occurred_at      timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ad_events_event_type_check CHECK (event_type IN ('impression', 'click', 'skip', 'complete')),
  CONSTRAINT ad_events_position_check CHECK (position_seconds IS NULL OR position_seconds >= 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ad_events_dedupe ON ad_events (sponsorship_id, user_id, view_key, event_type);
CREATE INDEX IF NOT EXISTS idx_ad_events_sponsorship ON ad_events (sponsorship_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_ad_events_content ON ad_events (content_id, occurred_at);

-- ─── feature flag seed ────────────────────────────────────────────────────────
INSERT INTO app_settings (key, value, category, description)
VALUES ('feature.ad_commercials_enabled', 'false'::jsonb, 'feature_flag', 'Insert Ad-Sales commercials in the feed')
ON CONFLICT (key) DO NOTHING;
