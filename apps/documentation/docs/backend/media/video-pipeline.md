# Video Pipeline — Overview

Status: **SHIPPED (v2 — Lambda-owned)**
Owner: backend
Last updated: 2026-09-24

Top-level doc for the video upload → transcode → playback pipeline. Links to detailed docs
per subsystem.

## What it does

1. Client calls `POST /v1/media/uploads` → API creates a `media_metadata` row (`status=pending`)
   and returns a presigned S3 PUT URL
2. Client PUTs bytes directly to the S3 source bucket
3. S3 fires `ObjectCreated:*` → SQS `media-source-events` → the SQS event source mapping
   triggers the transcoder Lambda, which (rules in `docker/dummy-transcoder/lib.js`):
   - rejects + deletes objects larger than the size declared in step 1
   - **video:** atomically claims the row (`processing`), writes placeholder HLS + poster to
     the output bucket, sets `ready`
   - **image/doc/other:** sets `ready` directly (no transcode)
4. Optionally the client calls `POST /v1/media/:id/complete` → HEAD + size check; images/docs
   flip to `ready` here if the Lambda hasn't already. Both paths use status-guarded writes, so
   whichever runs second is a no-op — neither can regress the other
5. Client calls `GET /v1/media/:id/playback` → HLS master playlist URL (plus signed cookies
   for `protected` assets)

| Media type | READY transition |
|---|---|
| `video` | Transcoder Lambda, after the (dummy) transcode |
| `image` / `document` / `audio` / other | Lambda on the S3 event, or `POST /:id/complete` — whichever comes first |

### Delivery: two buckets

Originals live in the **source** bucket, HLS output in the **output** bucket; URLs are built
from one CDN base. So:
- **Cloud:** the CloudFront distribution needs two origins — path pattern `*/hls/*` → output
  bucket, default behaviour → source bucket (both via OAC)
- **Local** (`MEDIA_DELIVERY_DRIVER=local`): `LocalCdnController` serves `/__local-cdn/<key>`
  by streaming from S3/Floci — `…/hls/…` keys from the output bucket, everything else from
  source. Dev only (404 in production), no auth
- **Delete** (`DELETE /media/:id`) purges the asset prefix in **both** buckets

## Architecture diagram

```
┌─────────┐   1. POST /v1/media/uploads             ┌────────┐
│ Client  │ ──────────────────────────────────────▶ │  API   │
│         │   {mediaType,usageType,mimeType,size}   │        │
│         │ ◀────────────────────────────────────── │        │
└─────────┘   {mediaId, presigned PUT url}          └────────┘
      │                                                  ▲
      │ 2. PUT bytes                                     │
      ▼                                                  │
┌───────────────────┐                                    │
│ S3 source bucket  │                                    │
│ (Floci or AWS)    │                                    │
└─────┬─────────────┘                                    │
      │                                                  │
      │ 3a. ObjectCreated:* (videos → transcode path)    │
      ▼                                                  │
┌───────────────────────────┐        3b. POST /:id/complete
│ SQS media-source-events   │        (optional, any media type — HEAD +
└───────────────────────────┘         size check; images/docs → READY)
      │                                                  │
      │ 4. SQS → Lambda event source mapping             │
      ▼                                                  │
┌─────────────────────────────────────────────────────┐  │
│ Transcoder Lambda (dummy locally, real in prod)     │  │
│   a. Parse SQS event → S3 key                       │  │
│   b. pg: SELECT id, status, media_type WHERE ...    │  │
│   c. oversize → delete + failed; non-video → ready  │  │
│   d. UPDATE status='processing' + status event      │  │
│   e. Write placeholder master.m3u8 + poster → S3    │  │
│      (real path: FFmpeg or MediaConvert.CreateJob)  │  │
│   f. UPDATE status='ready', hls_master_key,         │  │
│      delivery_prefix, is_hls, processed_at          │  │
└─────────────────────────────────────────────────────┘  │
                                                         │
                      status-guarded writes: whichever │
                      of Lambda / /complete runs 2nd  │
                      is a no-op                      │
                                                         │
      │ 6. GET /v1/media/:id/playback ────────────────────┘
      ▼
        {kind:'hls' | 'file', url, cookies}
```

## Component responsibilities

| Component | Role | Code location |
|---|---|---|
| **API** (`MediaController` + `MediaService`) | Presigned upload, reads, playback URL minting, delete + inline S3 cleanup | `src/media/` |
| **S3 source bucket** | Holds original uploads. Notification fires on `ObjectCreated:*` | Terraform: `infra/floci/s3.tf` |
| **SQS `media-source-events`** | Bridge queue: S3 events → Lambda. Visibility = 6× Lambda timeout; DLQ after `media_source_events_max_receive_count` (5) deliveries | Terraform: `infra/floci/sqs.tf` |
| **Transcoder Lambda** | Sole owner of `pending → processing → ready` transitions. Dummy handler locally; swap in FFmpeg / MediaConvert for prod | `docker/dummy-transcoder/` + `infra/floci/lambda.tf` |
| **S3 output bucket** | HLS outputs (`master.m3u8`, variants, poster). Separate from source for lifecycle / IAM segregation | `infra/floci/s3.tf` |
| **NestJS worker** | Does NOT touch media. Owns email/sms/notifications/content crons only | `src/background/` (media handlers deleted in v2) |

## What was deleted in v2 (from v1)

- `src/background/media/` — all `MediaJobService`, `MediaTranscodeHandler`,
  `MediaTranscodePollHandler`, `MediaReconcileHandler`, `MediaOrphanSweepHandler`,
  `MediaCleanupHandler`, `MediaS3EventHandler`
- `src/media/providers/transcoder.provider.ts` (+ Local/MediaConvert/Lambda impls) — the
  MediaConvert config is preserved in `docker/dummy-transcoder/prod-handler.js` as a prod
  swap-in template
- `src/media/interfaces/media-jobs.interface.ts`
- `TRANSCODE_VIDEO`, `TRANSCODE_POLL`, `MEDIA_RECONCILE`, `MEDIA_ORPHAN_SWEEP`,
  `MEDIA_CLEANUP`, `S3_OBJECT_CREATED` job names
- `QueueName.MEDIA` + `QueueName.MEDIA_SOURCE_EVENTS` from the NestJS enum (queue still
  exists in Terraform — Lambda consumes it, not NestJS)
- `MEDIA_TRANSCODER` + `MEDIA_TRANSCODER_LAMBDA_NAME` env vars
- `@aws-sdk/client-lambda` + `@aws-sdk/client-mediaconvert` deps (moved to Lambda container)

**Kept from v1:** `POST /v1/media/:id/complete` endpoint + `MediaService.completeUpload()`
— but stripped of the `queue.send()` call. It's now the fast-path HEAD-check + finalizer
for non-videos, redundant-but-safe for videos.

## Cross-cutting docs

- **[deployment-target.md](../infrastructure/deployment-target.md)** — how `DEPLOYMENT_TARGET`
  flips every AWS SDK client between Floci (local) and real AWS
- **[secrets-management.md](../infrastructure/secrets-management.md)** — pre-Nest-boot
  Secrets Manager hydration gate

## Pipeline docs

- **[floci-local-aws.md](./floci-local-aws.md)** — how to run locally with Floci + Terraform
- **[dummy-lambda-transcoder.md](./dummy-lambda-transcoder.md)** — the Lambda container:
  what it does, the SQS trigger, DB update, prod swap-in
- **[video-pipeline-api.md](./video-pipeline-api.md)** — HTTP endpoints
- **[video-pipeline-troubleshooting.md](./video-pipeline-troubleshooting.md)** — failure
  modes + diagnosis

## Env-selected components

Zero code change between local dev, staging, and production — only these vars flip:

| Env var | Local (Floci) | Prod (AWS) |
|---|---|---|
| `DEPLOYMENT_TARGET` | `aws` | `aws` |
| `FLOCI_ENDPOINT` | `http://localhost:4566` | (unset) |
| `MEDIA_STORAGE_DRIVER` | `s3` | `s3` |
| `MEDIA_S3_BUCKET` | `maintinee-media-source-development` | `maintinee-media-source-production` |
| `MEDIA_OUTPUT_BUCKET` | `maintinee-media-output-development` | `maintinee-media-output-production` |

The Lambda's own env (set by Terraform in `lambda.tf`, not by NestJS):
- `MEDIA_OUTPUT_BUCKET`, `MAX_RECEIVE_COUNT`, `DATABASE_URL` (local) or `DATABASE_URL_SECRET_ID` (prod), `AWS_ENDPOINT_URL` (Floci only — `host.docker.internal`, never `localhost`)

For pure local dev without Floci (default): set `MEDIA_STORAGE_DRIVER=local` — uploads land
on disk. There is no local transcode path — the transcode chain only fires against S3+SQS+Lambda.

## DB schema (unchanged from v1)

Tables `media_metadata` + `media_status_events` (migration `0004_create_media_metadata`).
The Lambda writes to both. Video-specific columns on `media_metadata`:

| Column | Set by | When |
|---|---|---|
| `status` | API (pending), Lambda (processing/ready/failed) | Lifecycle |
| `is_hls`, `hls_master_key`, `delivery_prefix` | Lambda | On ready |
| `duration_seconds`, `width`, `height` | Lambda | On ready (populated when real transcoder replaces dummy) |
| `processing_provider` | Lambda | Set to `dummy-lambda` locally; `mediaconvert` / `ffmpeg` in prod |
| `processing_job_id` | Lambda | SQS message id (or MediaConvert Job.Id in prod) |
| `processing_error` | Lambda | On failure |

## Rollout history

- **v1** (PR-1..5) — NestJS worker owned the transcode flow; Lambda was optional
- **v2** (this doc) — Lambda owns the entire transcode flow; worker's media handlers deleted
