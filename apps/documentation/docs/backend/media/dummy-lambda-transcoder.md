# Dummy Transcoder Lambda

Owner: backend
Last updated: 2026-09-24

## Purpose

Owns every media state transition after the API creates the `pending` row: SQS-triggered,
S3-driven, DB-writing. **The transcode itself is a dummy** (placeholder HLS) so the whole
pipeline runs locally without FFmpeg or MediaConvert.

The rules that must not change when a real transcoder arrives — atomic claim, size check,
non-video finalization, retry semantics — live in **`lib.js`**, shared by the dummy
(`handler.js`) and the MediaConvert template (`prod-handler.js`). Going to prod swaps the
handler, not the rules.

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

## What the Lambda does per uploaded object

```
S3 ObjectCreated (inside the SQS message body)
  │
  ├─ select-media   SELECT … WHERE storage_key=$1 AND deleted_at IS NULL
  │     no row                                   → skip (not ours)
  │     status not pending/uploaded, and not
  │     "processing by THIS message"             → skip (already handled)
  │
  ├─ size check     event size > file_size_bytes declared at request time
  │                                              → DELETE source object, row → failed, stop
  │
  ├─ non-video      row → ready (is_hls=false, delivery_prefix=storage_key), stop
  │                 (the S3 event proves the bytes landed — no /complete call needed)
  │
  ├─ claim (tx)     UPDATE … SET status='processing', processing_job_id=<messageId>
  │                 WHERE status IN (pending, uploaded)
  │                    OR (status='processing' AND processing_job_id=<messageId>)
  │                 RETURNING id                 → 0 rows = another invocation owns it → skip
  │
  ├─ transcode      dummy: PUT master.m3u8, 360p/index.m3u8, 360p/seg_000.ts, poster.jpg
  │                 to the output bucket
  │
  └─ finalize (tx)  UPDATE … SET status='ready', hls_master_key, delivery_prefix
                    WHERE status='processing' AND processing_job_id=<messageId>
                      AND deleted_at IS NULL     → 0 rows = asset deleted meanwhile →
                                                   delete the outputs just written
```

Every status change and its `media_status_events` row are written in one transaction.

### Retries and failure

| Situation | Behaviour |
|---|---|
| Transient error (S3 blip, DB hiccup), not the last delivery | Rethrow → message in `batchItemFailures` → SQS redelivers. The row stays `processing`; the redelivery has the **same messageId**, so it re-claims its own row and continues |
| Error on the **last** delivery (`ApproximateReceiveCount >= MAX_RECEIVE_COUNT`) | Row → `failed` (only if this message still owns it), then the message goes to `media-source-events-dlq` |
| Duplicate delivery / S3 overwrite while another invocation works | The claim returns 0 rows → skip. No double transcode |
| Asset deleted mid-transcode | Finalize returns 0 rows → outputs removed; the deleted row is never resurrected |
| All retries died without finishing | The worker's reconcile cron fails `processing` rows idle > `MEDIA_TRANSCODE_STUCK_SECONDS` (15 min) |

`MAX_RECEIVE_COUNT` must equal the queue's redrive `maxReceiveCount` — both come from the
Terraform variable `media_source_events_max_receive_count` (default 5).

## Container image

`apps/backend/docker/dummy-transcoder/`:

- **`Dockerfile`** — `public.ecr.aws/lambda/nodejs:20` base, `npm ci` against the committed
  `package-lock.json` (reproducible builds). No FFmpeg
- **`lib.js`** — shared rules (claim, size, non-video, retries, DB/secret resolution)
- **`handler.js`** — the active dummy handler
- **`prod-handler.js`** / **`prod-completion-handler.js`** — MediaConvert templates (not wired)

Build:

```bash
pnpm media:lambda:build
# = docker build -t dummy-transcoder:latest ./docker/dummy-transcoder
```

Floci pulls this image from your local Docker daemon when it spawns the Lambda container.

## Env vars (set by Terraform in `lambda.tf`)

| Env | Source | Purpose |
|---|---|---|
| `MEDIA_OUTPUT_BUCKET` | `aws_s3_bucket.media_output.bucket` | Target of HLS writes |
| `MAX_RECEIVE_COUNT` | `var.media_source_events_max_receive_count` | Which delivery is the last one (only that one marks a row failed) |
| `DATABASE_URL` | `var.transcoder_lambda_database_url` | Local/Floci only |
| `DATABASE_URL_SECRET_ID` | `var.transcoder_lambda_database_secret_id` | Prod: Secrets Manager secret with a `DATABASE_URL` key. When set, `DATABASE_URL` is left out of the function env and Terraform state |
| `AWS_ENDPOINT_URL` | `var.lambda_aws_endpoint_url` | Floci only. Must be reachable **from inside the Lambda container** — default `http://host.docker.internal:4566`. Set `""` in real AWS (then omitted) |

## Networking (crucial detail)

Floci spawns the Lambda as its own Docker container. Inside it, `localhost` is the Lambda
container — not Floci and not Postgres. So both the AWS endpoint and the database are
addressed via `host.docker.internal` (Docker Desktop's alias for the host, where Floci's
`:4566` and Postgres's `:5432` are published):

- `AWS_ENDPOINT_URL=http://host.docker.internal:4566`
- `DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/postgres`

Verified end-to-end: a real Floci-run Lambda took a video, an image and an oversize upload
to `ready` / `ready` / `failed` in ~6 s.

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

- Add FFmpeg to the Dockerfile (johnvansickle static build), swap `placeholderOutputs()` + the PUT loop in `handler.js`
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

- **SQS and S3 are at-least-once.** Duplicates are harmless: the claim is a single
  status-guarded `UPDATE … RETURNING`, evaluated under the row lock, so exactly one
  invocation wins.
- **The API's `POST /:id/complete` races the Lambda safely.** The repository's transitions
  are status-guarded too, so a late `/complete` can't move a `ready` row back to `uploaded`;
  it just returns the current row.
- **MediaConvert (prod template)** passes the SQS messageId as `ClientRequestToken`, so a
  redelivery gets the original job back instead of a second, billed encode.

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
| Message stuck on `media-source-events` | Lambda erroring out — check its logs; after `MAX_RECEIVE_COUNT` deliveries → DLQ and the row → `failed` |
| Media row stuck at `pending` | Lambda ran but couldn't reach Postgres or S3. Check its logs for `ECONNREFUSED` — `DATABASE_URL` / `AWS_ENDPOINT_URL` must use `host.docker.internal`, not `localhost` |
| Media row stuck at `processing` | Retries still running, or all died. Reconcile fails it after `MEDIA_TRANSCODE_STUCK_SECONDS` |
| Media row `failed` | See `media_status_events.detail` for the error message |

## Related files

| Path | Role |
|---|---|
| `docker/dummy-transcoder/Dockerfile` | Container image (no FFmpeg; `npm ci` from lockfile) |
| `docker/dummy-transcoder/lib.js` | Shared rules: claim, size check, non-video, retries, DB URL resolution |
| `docker/dummy-transcoder/handler.js` | **Active** Lambda entry — dummy: SQS event → placeholder HLS → DB |
| `docker/dummy-transcoder/prod-handler.js` | **Not wired** — MediaConvert `CreateJob` submission (paired with completion handler below) |
| `docker/dummy-transcoder/prod-completion-handler.js` | **Not wired** — EventBridge-triggered final `UPDATE status='ready'` |
| `docker/dummy-transcoder/package.json` + `package-lock.json` | Deps: `@aws-sdk/client-s3`, `@aws-sdk/client-secrets-manager`, `pg` (add `@aws-sdk/client-mediaconvert` for prod) |
| `infra/floci/lambda.tf` | Lambda function + SQS event source mapping |
| `infra/floci/iam.tf` | Execution role (source read/delete, output write/delete, SQS consume, optional secret read, CloudWatch) |
| `infra/floci/sqs.tf` | `media-source-events` queue + its policy allowing S3 to publish |
| `infra/floci/s3.tf` | Source bucket + `ObjectCreated:*` notification to SQS |
