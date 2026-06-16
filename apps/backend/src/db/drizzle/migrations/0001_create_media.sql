-- ════════════════════════════════════════════════════════════════════════════
-- Media module: centralized asset registry for the whole platform.
-- This runs FIRST (before users/identity) because media is a foundational leaf
-- table that other tables reference (users.avatar_media_id, content.*_media_id …).
-- Table:
--   media_metadata — one row per logical asset (the single source of truth; every
--                    other table references this by id: avatars, content videos /
--                    trailers / thumbnails, studio logos, banners, documents…).
--
-- Video streaming (HLS/ABR): the transcoder (AWS MediaConvert) emits the master
-- playlist + per-quality variant playlists + segments as FILES under one output
-- prefix in storage. We do NOT enumerate those as rows — playback only needs the
-- master playlist key (`hls_master_key`) + a signed cookie over the output prefix.
-- The ABR ladder (which qualities/bitrates) is defined in the MediaConvert job
-- template; the master playlist is the contract with the player. A per-quality
-- "renditions" table is intentionally deferred (only useful as admin/analytics
-- metadata later; the ladder summary can live in `metadata` jsonb if needed).
--
-- Storage is provider-agnostic (S3 today, swappable): the row records the provider,
-- bucket, object key and delivery path, never a hardcoded URL. The bucket is PRIVATE
-- (no public access); delivery is via CDN — unsigned for public images, short-lived
-- SIGNED cookies/URLs for protected streaming content (issued by the app after authz).
-- ════════════════════════════════════════════════════════════════════════════

-- ─── media_metadata (central asset registry) ────────────────────────────────
CREATE TABLE IF NOT EXISTS media_metadata (
    id                  UUID PRIMARY KEY DEFAULT uuidv7(),

    -- Classification ----------------------------------------------------------
    media_type          VARCHAR(20) NOT NULL
                          CHECK (media_type IN ('image','video','audio','document','other')),
    usage_type          VARCHAR(40) NOT NULL DEFAULT 'generic'
                          CHECK (usage_type IN (
                            'content_video','content_trailer','content_thumbnail',
                            'avatar','studio_logo','banner','document','generic')),
    -- Delivery security tier (drives how a URL is minted at serve time):
    --   public    → unsigned CDN URL (avatars, thumbnails, public images)
    --   protected → short-lived SIGNED CDN cookie/URL, app-only (streaming content)
    --   private   → never client-served (originals/mezzanine, admin-only via signed URL)
    access_level        VARCHAR(20) NOT NULL DEFAULT 'protected'
                          CHECK (access_level IN ('public','protected','private')),
    -- Lifecycle: pending → uploading → uploaded → processing → ready (or failed)
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','uploading','uploaded','processing','ready','failed','archived')),

    -- Storage (provider-agnostic; source of truth = the ORIGINAL upload) -------
    storage_provider    VARCHAR(30) NOT NULL DEFAULT 's3',   -- s3 | gcs | r2 | … (provider switch)
    storage_bucket      VARCHAR(255),
    storage_key         TEXT,                                -- object key of the original/mezzanine file
    storage_region      VARCHAR(30),

    -- Delivery (CDN) ----------------------------------------------------------
    cdn_provider        VARCHAR(30) DEFAULT 'cloudfront',    -- cloudfront | … (provider switch)
    delivery_prefix     TEXT,                                -- video: HLS output prefix the signed cookie covers; image: = storage_key

    -- File facts --------------------------------------------------------------
    original_filename   VARCHAR(500),
    mime_type           VARCHAR(150),
    file_size_bytes     BIGINT,
    checksum            VARCHAR(128),                        -- etag/sha256 — integrity + dedupe

    -- Media-specific (nullable; populated after probe/transcode) ---------------
    width               INTEGER,
    height              INTEGER,
    duration_seconds    NUMERIC(10,3),                       -- video/audio length

    -- Streaming (HLS / ABR) — video only --------------------------------------
    is_hls              BOOLEAN NOT NULL DEFAULT false,      -- true once transcoded to HLS
    hls_master_key      TEXT,                                -- key of master.m3u8 — the player's single entry point (ABR handled by the player)
    -- Poster/thumbnail for a video: links to ANOTHER media row (an image) — either a
    -- MediaConvert frame-capture poster or an admin-uploaded custom thumbnail.
    poster_media_id     UUID REFERENCES media_metadata(id) ON DELETE SET NULL,

    -- Processing / transcode --------------------------------------------------
    processing_provider VARCHAR(40),                         -- mediaconvert | mux | … | null
    processing_job_id   VARCHAR(255),
    processing_progress INTEGER,                             -- 0–100 (live transcode %); null when not transcoding
    processing_error    TEXT,
    processed_at        TIMESTAMPTZ,

    -- Ownership / misc --------------------------------------------------------
    -- Soft audit pointer (intentionally NOT a FK): media is created before `users`,
    -- and an uploader-id should survive that user's deletion. Holds the admin
    -- (content) or user (avatar) id that uploaded this asset.
    uploaded_by         UUID,
    upload_completed_at TIMESTAMPTZ,
    alt_text            VARCHAR(500),                        -- a11y for images
    metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,  -- codec/bitrate/fps/EXIF/provider extras

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);
CREATE INDEX        idx_media_status      ON media_metadata(status)      WHERE deleted_at IS NULL;
CREATE INDEX        idx_media_usage_type  ON media_metadata(usage_type)  WHERE deleted_at IS NULL;
CREATE INDEX        idx_media_access      ON media_metadata(access_level) WHERE deleted_at IS NULL;
CREATE INDEX        idx_media_uploaded_by ON media_metadata(uploaded_by) WHERE deleted_at IS NULL;
CREATE INDEX        idx_media_created_at  ON media_metadata(created_at);
CREATE INDEX        idx_media_checksum    ON media_metadata(checksum)    WHERE checksum IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX        idx_media_poster      ON media_metadata(poster_media_id) WHERE poster_media_id IS NOT NULL;

-- ─── media_status_events (append-only lifecycle audit — track it status by status)
-- One row per transition (requested → uploaded → processing → progress% → ready/failed),
-- so the exact path of every asset is always visible (admin UI / debugging / SLAs).
CREATE TABLE IF NOT EXISTS media_status_events (
    id         UUID PRIMARY KEY DEFAULT uuidv7(),
    media_id   UUID NOT NULL REFERENCES media_metadata(id) ON DELETE CASCADE,
    status     VARCHAR(20) NOT NULL,    -- the status the asset moved INTO
    detail     VARCHAR(500),            -- note / job id / error message
    progress   INTEGER,                 -- 0–100 for transcode progress events
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_media_status_events_media ON media_status_events(media_id, created_at);

-- ────────────────────────────────────────────────────────────────────────────
-- Cross-reference pattern — consumers own the FK INLINE (media is created first,
-- so every consumer can reference media_metadata(id) directly, no ALTER):
--   users.avatar_media_id        UUID REFERENCES media_metadata(id)  — next migration
--   contents.video_media_id      UUID REFERENCES media_metadata(id)  — content module
--   contents.trailer_media_id    UUID REFERENCES media_metadata(id)
--   contents.thumbnail_media_id  UUID REFERENCES media_metadata(id)
-- media_metadata stays reusable and agnostic of who points at it.
-- ────────────────────────────────────────────────────────────────────────────
