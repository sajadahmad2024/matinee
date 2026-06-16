# Media Module — Design (DB-first, for review)

> **Status:** schema **applied** (`0001_create_media.sql`) + introspected; type-check green;
> auth smoke-tested. Next: Media API doc → implementation.
> Media now runs as the **foundational first migration** (`0001`), before identity
> (`0002_create_users`), so consumers can reference `media_metadata(id)` inline with no
> `ALTER` (greenfield — DB recreated). `media_metadata.uploaded_by` is a **soft audit
> pointer (not a FK)** so media stays a dependency-free leaf table and an uploader id
> survives the user's deletion.
> Scope: the **centralized asset registry + secure delivery**. Content (trailers/BTS
> catalog) and Game Centre are separate modules that *reference* media.

---

## 1. Why a central registry

Every asset on the platform — content videos, trailers, thumbnails, user avatars,
studio logos, banners, documents — is uploaded once and recorded as a **single row in
`media_metadata`**. Other tables never store URLs or keys; they store a `*_media_id`
foreign key. Benefits:

- **One source of truth** for storage location, processing status, dimensions, security
  tier — no duplicated/forked URL columns scattered across the schema.
- **Reusable** — one asset can be referenced by many rows (a thumbnail shared across
  placements) without copying.
- **Provider-agnostic** — the row records *provider + bucket + key*, never a baked URL, so
  swapping S3 → GCS/R2 or CloudFront → another CDN is a provider+env change, not a data
  migration.
- **Governable** — access tier, processing state and soft-delete live in one place; the
  delivery layer reads them to decide *how* to serve each asset.

```
   users.avatar_media_id ─────►┌─────────────────────┐
contents.video_media_id ──────►│   media_metadata    │
contents.trailer_media_id ────►│   (1 row / asset)   │
contents.thumbnail_media_id ──►└─────────────────────┘
        (consumers own the FK)
```

> **Decisions (confirmed):** transcoder = **AWS MediaConvert**; protected delivery =
> **CloudFront signed cookies** for HLS + **signed URLs** for images; **no `media_renditions`
> table** for v1 (§2.1); **UUIDv7 primary keys** platform-wide (§2.2); video **poster/thumbnail
> via `poster_media_id`** self-link, MediaConvert frame-capture or admin upload (§5).

---

## 2. Tables

### `media_metadata` — one row per logical asset
Key column groups (full DDL in `0002_create_media.sql`):

| Group | Columns | Notes |
|-------|---------|-------|
| Classification | `media_type`, `usage_type`, `access_level`, `status` | type = image/video/…; usage = what it's for; access = security tier; status = lifecycle |
| Storage (source of truth) | `storage_provider`, `storage_bucket`, `storage_key`, `storage_region` | the **original/mezzanine** object; provider-agnostic |
| Delivery | `cdn_provider`, `delivery_prefix` | video: HLS output prefix the signed cookie covers; image: = storage_key |
| File facts | `original_filename`, `mime_type`, `file_size_bytes`, `checksum` | checksum enables integrity + dedupe |
| Media facts | `width`, `height`, `duration_seconds` | filled after probe/transcode |
| Streaming | `is_hls`, `hls_master_key`, `poster_media_id` | HLS master key; poster = self-FK to an image media row (§5) |
| Processing | `processing_provider`, `processing_job_id`, `processing_error`, `processed_at` | transcode job tracking |
| Ownership / misc | `uploaded_by`, `upload_completed_at`, `alt_text`, `metadata (jsonb)` | jsonb = codec/bitrate/fps/EXIF/provider extras without schema churn |
| Lifecycle | `created_at`, `updated_at`, `deleted_at` | soft delete |

### 2.2 Primary keys = UUIDv7
All PKs default to **`uuidv7()`** (added in `0000_init`), not `gen_random_uuid()` (UUIDv4).
v7 keys embed a millisecond timestamp in the high 48 bits, so they're **time-ordered** →
sequential B-tree inserts, tight index locality, and much less page-split/WAL churn than
random v4 (matters for high-volume tables like media + future watch/engagement events).
The function is a portable, RFC-9562-correct shim for Postgres < 18 (verified on PG17:
version nibble `7`, RFC variant, monotonic). On PG18+ it can be swapped for native
`uuidv7()` with no row-format change. **Applied platform-wide** — `users` and all auth
tables are switched too (greenfield, so the local DB is recreated).

**`access_level`** — the security tier that decides *how* a URL is minted at serve time:
- `public` → unsigned CDN URL (avatars, thumbnails, public images). Cacheable, no token.
- `protected` → short-lived **signed** CDN cookie/URL, issued by the app only to an
  authorized viewer (streaming content). **App-only, super secure.**
- `private` → never client-served (originals/mezzanine; admin-only via a signed URL).

**`status`** lifecycle: `pending → uploading → uploaded → processing → ready` (`failed`
on transcode error, `archived` when retired). Content can only be published when its
backing media is `ready`.

### 2.1 Why there is no `media_renditions` table (v1)
HLS/ABR transcode (MediaConvert) emits the **master playlist + per-quality variant
playlists + segments** as *files* under one output prefix in storage:
```
content/<id>/hls/  master.m3u8  1080p.m3u8 1080p_*.ts  720p.m3u8 720p_*.ts  480p… 240p…
```
- Segments are thousands of ephemeral files — never stored as rows.
- The player needs only **`master.m3u8`** (`media_metadata.hls_master_key`); it does ABR
  itself by reading the ladder the master encodes.
- A signed cookie over the **output prefix** (`delivery_prefix`) authorizes the whole set
  in one grant.

So a per-quality table would be **convenience metadata only** (admin "this video has
1080p/720p/480p", analytics) — not load-bearing. Deferred. If we want that summary sooner
it fits in `metadata` jsonb (e.g. `{"ladder":[{"label":"1080p","bitrate":5000}, …]}`) with
no new table. **Images don't get renditions** (single original + optional CDN resize).

---

## 3. Secure delivery architecture (S3 private + CloudFront)

```
 Admin upload (presigned PUT)                Client playback
      │                                            │
      ▼                                            ▼
 ┌──────────┐   OAC    ┌──────────────┐   signed   ┌──────────────┐
 │   S3     │◄─────────│  CloudFront  │───cookie───►│  App player  │
 │ PRIVATE  │ (only CF │  (CDN)       │  (HLS) /    │  (ABR/HLS)   │
 │ bucket   │  can read│              │  unsigned   │              │
 └──────────┘          └──────────────┘  (images)   └──────────────┘
```

- **S3 bucket:** Block Public Access **ON**. No object is ever public. CloudFront reads
  via **OAC** (Origin Access Control); the bucket policy trusts only the distribution.
- **Upload:** bucket is "open for upload, closed for read" — admins upload via a
  **presigned PUT URL** (short TTL, content-type/size constrained). The `media_metadata`
  row is created *first* (`status=pending`) so its `id` is available to associate with
  content immediately; the client PUTs the bytes directly to S3.
- **Public images** (`access_level=public`): served by a CDN path that doesn't require
  signing → plain URL the app/web embeds without any token. Bucket still private.
- **Protected content** (`access_level=protected`): backend issues **CloudFront signed
  cookies** (or signed URLs) with a **short TTL** (e.g. 5–15 min), scoped to the asset's
  path prefix so a single grant covers the HLS master + variant playlists + segments.
  Issued **only after authorization** (within free-video quota / content unlocked with
  points / active subscription). This is what makes streaming "app-only and secure."
- **Private originals:** never handed to clients; admin tooling gets a one-off signed URL.

---

## 4. Provider abstraction (swap = provider + env, no business change)

Mirrors the existing Email/SMS/Queue/Cache provider pattern (env-selected, no code change
local↔cloud). Two seams:

- **`StorageProvider`** (token + impls `S3StorageProvider`, later `GcsStorageProvider`…):
  `createUploadUrl()`, `headObject()`, `deleteObject()`, `copyObject()`.
- **`MediaDeliveryProvider`** (`CloudFrontDeliveryProvider`, later others):
  `publicUrl(asset)`, `signedUrl(asset, ttl)`, `signedCookies(pathPrefix, ttl)`.
- **`TranscoderProvider`** (`MediaConvertTranscoder` / `LocalTranscoder`):
  `submitHlsJob(...)`, `getJobStatus(jobId)`. Local-default for dev (simulates a finished
  job so the lifecycle completes without AWS).

Each seam has a **local** impl so the full flow runs on the dev box; flip one env var per seam
(`MEDIA_STORAGE_DRIVER` / `MEDIA_DELIVERY_DRIVER` / `MEDIA_TRANSCODER`) for cloud.

A `MediaService` (facade) + `MediaRepository` (the only `@db/*` consumer) sit above them.
URL resolution always goes through the provider using the row's `storage_provider` /
`cdn_provider` — never a hardcoded hostname.

```
MediaController (HTTP) → MediaService (facade) → MediaRepository (Drizzle)
                                              → StorageProvider   (S3 presign / delete)
                                              → MediaDeliveryProvider (CloudFront sign)
                                              → QueueService (enqueue transcode → worker)
```

---

## 5. Transcode pipeline (HLS / ABR) — fully SQS-driven, status by status

MediaConvert is an **asynchronous** managed service: you submit a job and it transcodes in
the background. The whole flow is driven through **SQS** (no EventBridge/Lambda glue), and
every transition is written to `media_status_events` so the path is always visible.

```
 API (completeUpload)                 WORKER (SQS-driven)                AWS
 ──────────────────                   ────────────────────              ───
 verify object (HEAD)
 status → uploaded
 enqueue TRANSCODE_VIDEO ───SQS───▶  submit MediaConvert job ─────────▶ MediaConvert
                                     status → processing                (runs async)
                                     enqueue TRANSCODE_POLL (delay 20s)
                                          │
                       ┌──────────────────┘  (SQS delayed self-poll loop)
                       ▼
                     GetJob(jobId) ─────────────────────────────────────▶ progress %
                     PROGRESSING → updateProgress(%) + re-enqueue poll
                     COMPLETE    → status → ready (hls_master_key, …)
                     ERROR       → status → failed (processing_error)
```

1. Admin requests upload → row `pending`, presigned PUT returned.
2. Client PUTs the original to S3 → `complete` verifies it (HEAD) → status `uploaded`.
3. Video: API enqueues **`TRANSCODE_VIDEO`** on SQS and returns (fast). The **worker owns**
   the rest — it submits the MediaConvert job (with `UserMetadata.mediaId`), sets
   `processing` + `processing_job_id`, and enqueues a **delayed `TRANSCODE_POLL`** message.
4. Each `TRANSCODE_POLL` calls `GetJob`: still running → record `processing_progress` (%) and
   re-enqueue another delayed poll; `COMPLETE` → `ready` (set `hls_master_key`, `is_hls`,
   dimensions); `ERROR` → `failed`. The poll cadence is `MEDIA_TRANSCODE_POLL_INTERVAL` (20s).
5. Images skip 3–4, going `uploaded → ready` (CDN handles responsive sizing at serve time).

> **Why self-poll over EventBridge push?** It reuses the SQS infra we already run (one
> consumer, native retry/DLQ, no extra AWS components to deploy or secure), keeps the entire
> trigger+completion loop **in our code** (transparent — "clear how it works"), and naturally
> emits a progress event on every poll. EventBridge→SQS would land events without our job-name
> attribute (our consumer dispatches by it), so it'd need a Lambda/HTTP shim — more moving
> parts for marginal latency gain on jobs that take minutes. Switching to push later is
> additive (a `getJobStatus`-style callback) with no schema change.

**Video poster / thumbnail.** MediaConvert's **Frame Capture** output group extracts JPG/PNG
poster frames from the video *in the same job* (at an interval or specific timecodes) — no
separate tool. The worker registers a generated poster as its own image `media_metadata`
row and sets the video row's **`poster_media_id`** to it. The admin can instead upload a
**custom thumbnail** (the "Thumbnail" slot in the content form) — also an image media row;
content points at it via `thumbnail_media_id`, and `poster_media_id` stays the auto fallback.

### 5.1 Operational concerns (handled in the worker, not the schema)
- **Orphan sweep:** a row is created `pending` before the upload; if the client never
  completes, a cron (existing worker scheduler) deletes stale `pending`/`uploading` rows and
  aborts the S3 multipart upload.
- **Delete = soft-delete + async cleanup:** deleting a media row sets `deleted_at` and
  enqueues an SQS job to remove the S3 object/HLS prefix — bytes are never hard-deleted
  synchronously on the request path.
- **DRM:** signed cookies + short TTL is strong app-only protection; full DRM
  (Widevine/FairPlay) is a later add-on if studios require it (no schema change needed now).

This reuses the existing SQS + `@QueueHandler` worker infrastructure — no new queue tech.

---

## 6. Cross-module references

Because media (`0001`) is created **before** every consumer, each consumer references
`media_metadata(id)` **inline** — no `ALTER`, no FK cycle.

**`0002_create_users`** — wires the profile picture:
- `users.avatar_media_id` → `media_metadata(id)` (inline FK) for avatars uploaded into our
  pipeline. `avatar_url` is kept for externally-hosted social (Google/Apple) avatars.
  Resolution order: `avatar_media_id` (our hosted image) → `avatar_url` (social) → none.

**Content module (later)** — same inline pattern:
- `contents.video_media_id`, `contents.trailer_media_id`, `contents.thumbnail_media_id`

---

## 7. Decisions & remaining questions

**Confirmed**
- Transcoder → **AWS MediaConvert** (HLS outputs stay in your bucket; pairs with private-S3
  + CloudFront-signed delivery).
- Protected delivery → **CloudFront signed cookies** for HLS, **signed URLs** for images.
- **No `media_renditions` table** in v1 (see §2.1) — everything lives on `media_metadata`.

**Still open (don't block applying the migration)**
1. **Image variants** — generate responsive sizes on upload (Sharp/Lambda) vs. CloudFront
   on-the-fly resizing of the original? (Lean: CloudFront resize; no pre-gen, no rows.)
2. **Dedup** — identical `checksum` reuses an existing asset, or always a new row? (Index
   is in place either way; default = new row, dedup later if needed.)

---

*Once you confirm (or amend) the schema, I'll apply the migration, regenerate the Drizzle
schema, and move to the Media API doc + implementation.*
