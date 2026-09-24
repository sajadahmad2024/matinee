# Dummy Transcoder Lambda

Owner: backend
Last updated: 2026-09-24

## Purpose

Owns the whole transcode flow: SQS-triggered, S3-driven, DB-writing. **Dummy** for now — no
real video transcoding — so the pipeline can be exercised end-to-end locally without shipping
FFmpeg. In prod, replace `writePlaceholderOutputs()` in `handler.js` with a real transcoder
(FFmpeg spawn or MediaConvert `CreateJob`); every other piece of the Lambda stays.

## Trigger

**SQS event source mapping** (not manual invocation). Defined in
`infra/floci/lambda.tf`:

```hcl
resource "aws_lambda_event_source_mapping" "transcoder_from_events" {
  event_source_arn        = aws_sqs_queue.media_source_events.arn
  function_name           = aws_lambda_function.transcoder.arn
  batch_size              = 1
  function_response_types = ["ReportBatchItemFailures"]
}
```

Every message that lands on `media-source-events` triggers the Lambda. Batch size 1 for
observability; the mapping's built-in polling handles concurrency + retries.

## What the Lambda does per message

```
event.Records[i].body
  ├── { "Records": [{ eventSource: "aws:s3", eventName: "ObjectCreated:Put",
  │                   s3: { bucket, object: { key, size } } }] }
  ▼
handleS3ObjectCreated(record):
  1. storageKey = decode(record.s3.object.key)
  2. pg SELECT id, status FROM media_metadata WHERE storage_key = $1 AND deleted_at IS NULL
     └─ no row → warn + skip (S3 event for something we don't own)
     └─ status not in (pending, uploaded) → skip (idempotent — S3 is at-least-once)
  3. pg UPDATE status='processing', processing_provider='dummy-lambda',
        processing_job_id=<sqs message id>, processing_progress=0
     + INSERT into media_status_events (status='processing', detail='dummy transcode invoked')
  4. writePlaceholderOutputs(outputPrefix):
     - s3://output-bucket/<prefix>master.m3u8      (references 360p/index.m3u8)
     - s3://output-bucket/<prefix>360p/index.m3u8  (one segment, 6s)
     - s3://output-bucket/<prefix>360p/seg_000.ts  (4-byte MPEG-TS packet header)
     - s3://output-bucket/<prefix>poster.jpg       (1×1 minimal JPEG)
  5. pg UPDATE status='ready', is_hls=true, hls_master_key=<masterKey>,
        delivery_prefix=<outputPrefix>, processing_progress=100, processed_at=NOW()
     + INSERT into media_status_events (status='ready', detail='dummy transcode complete')
```

On any exception in step 3-5:
- `pg UPDATE status='failed', processing_error=<msg>` (best-effort — swallowed if DB unreachable)
- The message is added to `batchItemFailures` in the return payload
- SQS's event source mapping treats that as a per-message failure → redrive → after
  `maxReceiveCount=5` retries the message goes to `media-source-events-dlq`

## Container image

`apps/backend/docker/dummy-transcoder/`:

- **`Dockerfile`** — `public.ecr.aws/lambda/nodejs:20` base. **No FFmpeg install** — the
  entire image is ~40 MB
- **`handler.js`** — the code above
- **`package.json`** — `@aws-sdk/client-s3` + `pg` only

Build:

```bash
pnpm media:lambda:build
# = docker build -t dummy-transcoder:latest ./docker/dummy-transcoder
```

Floci pulls this image from your local Docker daemon when it spawns the Lambda container.

## Env vars (set by Terraform in `lambda.tf`)

| Env | Source | Purpose |
|---|---|---|
| `MEDIA_OUTPUT_BUCKET` | `aws_s3_bucket.media_output.bucket` | Target of placeholder HLS writes |
| `DATABASE_URL` | `var.transcoder_lambda_database_url` | Postgres connection. Locally: `postgresql://postgres:postgres@host.docker.internal:5432/postgres` |
| `AWS_ENDPOINT_URL` | `var.floci_endpoint` | S3 client override — Lambda inside Floci hits Floci-S3, not real AWS |
| `AWS_REGION` | Lambda auto-provided | S3 client region |

## Networking (crucial detail)

The Lambda container runs inside Floci. When it needs to reach Postgres (which runs in the
`docker-compose.yml` stack on the host's default Docker network), it uses
`host.docker.internal:5432` — Docker Desktop's magic DNS alias for the host machine. That's
why `DATABASE_URL` defaults to `host.docker.internal`, not `localhost`.

On Linux Docker Engines (not Desktop), `host.docker.internal` doesn't resolve by default. Add
this to `docker-compose.floci.yml` under the `floci` service:

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

(Docker Desktop already does this automatically.)

## Going to prod

**The MediaConvert prod code is already written** — see two files in
`docker/dummy-transcoder/`:

- **`prod-handler.js`** — submits the MediaConvert job (HLS ABR ladder 1080p/720p/480p/240p +
  poster). Replaces `handler.js` as the SQS-triggered Lambda entry
- **`prod-completion-handler.js`** — subscribes to EventBridge's
  `MediaConvert Job State Change` event; runs the final `UPDATE status='ready'` (or
  `failed`) when MediaConvert finishes

### Why two Lambdas?

MediaConvert's `CreateJob` is async — it returns a jobId immediately, and the actual encode
happens minutes later. If ONE Lambda waited for completion it'd burn idle-time cost. The
AWS-native pattern is: submit-Lambda + EventBridge-triggered completion-Lambda.

```
S3 → SQS → prod-handler.js Lambda
              └─ CreateJob + UPDATE status='processing'

MediaConvert async encode (minutes)…

EventBridge (aws.mediaconvert Job State Change: COMPLETE/ERROR)
       ↓
prod-completion-handler.js Lambda
       └─ UPDATE status='ready' + hls_master_key + duration + w + h
```

### Activation steps

1. Add dep: in `docker/dummy-transcoder/package.json`, add `"@aws-sdk/client-mediaconvert": "^3.891.0"`
2. Build image with the prod entrypoint: change `Dockerfile` `CMD` to `["prod-handler.handler"]`
3. Set these env vars in Terraform's `aws_lambda_function.transcoder`:
   ```
   MEDIACONVERT_ENDPOINT   — from `aws mediaconvert describe-endpoints`
   MEDIACONVERT_ROLE_ARN   — IAM role MediaConvert assumes for S3 access
   MEDIACONVERT_QUEUE_ARN  — optional; empty = account default queue
   ```
4. Add a **second `aws_lambda_function`** using the same image with
   `CMD ["prod-completion-handler.handler"]`
5. Add an `aws_cloudwatch_event_rule` subscribed to
   `{"source":["aws.mediaconvert"], "detail-type":["MediaConvert Job State Change"], "detail":{"status":["COMPLETE","ERROR","CANCELED"]}}`
   with a target pointing at the completion Lambda

### Alternative: FFmpeg in-Lambda (short clips only)

If you don't want MediaConvert cost/complexity, do FFmpeg inside the same Lambda:

- Add FFmpeg to the Dockerfile (johnvansickle static build), swap `writePlaceholderOutputs()`
  for a `spawn('ffmpeg', ...)` HLS ABR ladder
- **Trade:** Lambda 15 min timeout caps source video length (~5-8 min at 3 GB memory)
- Kills the "two Lambdas" complexity; adds image size (~500 MB) and per-invocation compute cost

The Dockerfile diff for FFmpeg:
```
RUN dnf install -y tar xz && \
    curl -fsSL -o /tmp/ffmpeg.tar.xz \
      https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz && \
    mkdir -p /opt/ffmpeg && tar -xJf /tmp/ffmpeg.tar.xz -C /opt/ffmpeg --strip-components=1 && \
    ln -sf /opt/ffmpeg/ffmpeg /usr/local/bin/ffmpeg && dnf clean all
```

In all three modes (dummy / MediaConvert / FFmpeg), the Lambda's SQS trigger + DB-update
scaffolding stays identical — only the transcode function body changes.

## Idempotency guarantees

- **SQS is at-least-once** — the same message can be delivered twice under retry. Handler
  checks `status IN (pending, uploaded)` before doing work; a re-delivery for an
  already-processed row is a no-op.
- **S3 is at-least-once too** — a client can upload the same key twice (overwrite). The
  Lambda re-processes and re-writes HLS outputs (which just overwrite the previous placeholder
  in output bucket). Not ideal for real transcoding cost, but safe.

## Observability

**Local:**
```bash
docker logs floci 2>&1 | grep -A 5 dummy-transcoder
# or in Floci's data volume:
docker exec floci ls /app/data/logs/lambda/
```

**Prod:** CloudWatch Logs group `/aws/lambda/maintinee-transcoder-<env>`.

Every invocation logs `[<mediaId>] → ready (master: ...)` on success or `[msg <id>] failed:`
on error.

## Failure modes

| Symptom | Where to look |
|---|---|
| Lambda not triggered | Check SQS event source mapping: `aws --endpoint-url=http://localhost:4566 lambda list-event-source-mappings --function-name maintinee-transcoder-development` |
| Message stuck on `media-source-events` | Lambda erroring out — check its logs; after 5 retries → DLQ |
| Media row stuck at `pending` | Lambda ran but `pg` write failed. Check Lambda logs for `pg` errors — usually `ECONNREFUSED` (Postgres not reachable from Lambda network) |
| Media row `failed` | See `media_status_events.detail` for the error message |

## Related files

| Path | Role |
|---|---|
| `docker/dummy-transcoder/Dockerfile` | Container image (~40 MB, no FFmpeg) |
| `docker/dummy-transcoder/handler.js` | **Active** Lambda entry — dummy: SQS event → placeholder HLS → DB |
| `docker/dummy-transcoder/prod-handler.js` | **Not wired** — MediaConvert `CreateJob` submission (paired with completion handler below) |
| `docker/dummy-transcoder/prod-completion-handler.js` | **Not wired** — EventBridge-triggered final `UPDATE status='ready'` |
| `docker/dummy-transcoder/package.json` | Deps: `@aws-sdk/client-s3` + `pg` (add `@aws-sdk/client-mediaconvert` for prod) |
| `infra/floci/lambda.tf` | Lambda function + SQS event source mapping |
| `infra/floci/iam.tf` | Execution role (S3 read/write on both buckets, SQS consume, CloudWatch) |
| `infra/floci/sqs.tf` | `media-source-events` queue + its policy allowing S3 to publish |
| `infra/floci/s3.tf` | Source bucket + `ObjectCreated:*` notification to SQS |
