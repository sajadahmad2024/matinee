# Video Pipeline — Troubleshooting

Owner: backend
Last updated: 2026-09-24

Common failure modes for the v2 (Lambda-owned) pipeline.

## Debug checklist

1. `docker ps` — Floci container healthy?
2. `curl http://localhost:4566/_localstack/health` — services running?
3. `aws --endpoint-url=http://localhost:4566 s3 ls` — buckets exist?
4. `aws --endpoint-url=http://localhost:4566 lambda list-functions` — Lambda deployed?
5. `aws --endpoint-url=http://localhost:4566 lambda list-event-source-mappings --function-name maintinee-transcoder-development` — SQS → Lambda wired + `Enabled: True`?
6. Media row state — `SELECT id, status, processing_error, storage_key FROM media_metadata WHERE id='…';`
7. Status event trail — `GET /v1/media/:id/events`

---

## Upload fails / 403 or Signature-related error

**Symptom:** Client PUT to the presigned URL returns 403 or `SignatureDoesNotMatch`.

**Common causes:**

- **Content-Type mismatch.** Presigned PUT pins `Content-Type`. Client must send the exact
  value from `upload.headers['Content-Type']`.
- **URL expired.** Presigned URLs default to 900 s (`MEDIA_UPLOAD_URL_TTL`). Request a fresh one.
- **`forcePathStyle: true` missing.** Under Floci, the S3 client MUST use path-style
  (`http://localhost:4566/bucket/key`). Our `S3StorageProvider` sets this automatically when
  an endpoint override is present.
- **Region mismatch.** Presigned URL is region-scoped.

---

## Media row stays PENDING after PUT

**Symptom:** Upload succeeded (S3 200), but `GET /v1/media/:id` shows `status: pending`
indefinitely. **This is the most common failure — usually means the Lambda didn't run.**

### 1. Confirm the object landed
```bash
aws --endpoint-url=http://localhost:4566 s3 ls \
  s3://maintinee-media-source-development/ --recursive
```

### 2. Confirm the S3 → SQS notification fired
```bash
QURL=$(aws --endpoint-url=http://localhost:4566 sqs get-queue-url \
  --queue-name media-source-events --query QueueUrl --output text)
aws --endpoint-url=http://localhost:4566 sqs get-queue-attributes \
  --queue-url "$QURL" \
  --attribute-names ApproximateNumberOfMessages ApproximateNumberOfMessagesNotVisible
```

- `ApproximateNumberOfMessages > 0` → notification landed, Lambda hasn't consumed it yet
- Both zero → notification didn't fire (see next)

### 3. Confirm the bucket has a notification config
```bash
aws --endpoint-url=http://localhost:4566 s3api get-bucket-notification-configuration \
  --bucket maintinee-media-source-development
```

Empty → `pnpm infra:floci:apply` didn't run OR the queue policy is missing (Terraform
handles both).

### 4. Confirm the Lambda event source mapping is enabled
```bash
aws --endpoint-url=http://localhost:4566 lambda list-event-source-mappings \
  --function-name maintinee-transcoder-development
```

`State: Enabled` and `EventSourceArn` pointing at `media-source-events`.

### 5. Confirm the Lambda actually ran
```bash
# Floci Lambda logs live in the container:
docker exec floci cat /app/data/logs/lambda/maintinee-transcoder-development.log 2>/dev/null | tail -50

# Or via awscli:
aws --endpoint-url=http://localhost:4566 logs describe-log-streams \
  --log-group-name /aws/lambda/maintinee-transcoder-development
```

---

## Lambda can't reach S3 or Postgres (runs, but nothing changes)

The Lambda is its own container. `localhost` inside it is the Lambda, not Floci or Postgres.
Its env must use `host.docker.internal`:

```bash
aws --endpoint-url=http://localhost:4566 lambda get-function-configuration \
  --function-name maintinee-transcoder-development --query 'Environment.Variables'
# AWS_ENDPOINT_URL = http://host.docker.internal:4566
# DATABASE_URL     = postgresql://…@host.docker.internal:5432/…
```

Terraform sets these via `lambda_aws_endpoint_url` / `transcoder_lambda_database_url`. On
Linux Docker Engine, `host.docker.internal` may not resolve inside Floci-spawned containers —
point both at an address the containers can reach (e.g. the Docker bridge gateway IP).

## Lambda runs but doesn't update the DB

**Symptom:** `media-source-events` empties out (Lambda consumed the message), but
`media_metadata.status` stays `pending`.

**Root cause:** Lambda's `pg` client can't reach Postgres.

### Diagnose
```bash
docker logs floci 2>&1 | grep -i "econnrefused\|maintinee-transcoder"
```

Look for `ECONNREFUSED postgres` or `getaddrinfo ENOTFOUND host.docker.internal`.

### Fix (Docker Desktop macOS/Windows)
Should work out-of-box. Verify `DATABASE_URL` env in Terraform:

```bash
aws --endpoint-url=http://localhost:4566 lambda get-function-configuration \
  --function-name maintinee-transcoder-development \
  --query 'Environment.Variables'
```

`DATABASE_URL` should be `postgresql://postgres:postgres@host.docker.internal:5432/postgres`.

### Fix (Linux Docker Engine)
`host.docker.internal` doesn't resolve by default. Add to `docker-compose.floci.yml`:

```yaml
services:
  floci:
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

Then `pnpm floci:down && pnpm floci:up`.

---

## Message stuck retrying → eventually DLQ

**Symptom:** `media-source-events` shows a message that keeps returning after
`visibility_timeout_seconds`; after 5 attempts it moves to `media-source-events-dlq`.

**Root cause:** Lambda throws on every invocation.

### Diagnose
```bash
# The DLQ has the failed message:
QDLQ=$(aws --endpoint-url=http://localhost:4566 sqs get-queue-url \
  --queue-name media-source-events-dlq --query QueueUrl --output text)
aws --endpoint-url=http://localhost:4566 sqs receive-message --queue-url "$QDLQ"

# Lambda error should be in its logs (see previous section)
```

Common Lambda-side throws:
- `MEDIA_OUTPUT_BUCKET env is required` → Terraform didn't set the env → check `lambda.tf`
- `DATABASE_URL env is required` → same
- `Client has already been closed` → pg client double-close bug in handler; check
  `handler.js:finally` block
- Postgres connection timeout → see previous section

The handler is designed to `try { markFailed } finally { throw }` — so a failing Lambda also
marks the media row as `failed` with the error message in `processing_error`. Query:

```sql
SELECT id, status, processing_error FROM media_metadata WHERE status = 'failed' ORDER BY updated_at DESC LIMIT 5;
```

---

## Media row goes to FAILED with a specific error

**Symptom:** `status = failed`, `processing_error = '<some message>'`.

**Direct answer:** the string in `processing_error` is exactly what the Lambda threw. Look
that up. Common ones:

| Error snippet | Meaning |
|---|---|
| `PutObjectCommand … AccessDenied` | Lambda IAM policy doesn't allow write to output bucket. Check `iam.tf` |
| `no such column "hls_master_key"` | DB schema not migrated. `pnpm db:migrate` |
| `duplicate key value violates unique constraint` | Two concurrent Lambda invocations (SQS dupe). Handler is idempotent — shouldn't happen; check log |
| `Client has encountered a connection error` | Postgres killed the connection mid-query. Long-running Lambdas + short pg idle timeout. Increase `pool_recycle` if adopting a pool |

---

## Playback fails with 403 or CORS

**Symptom:** `GET /v1/media/:id/playback` returns a URL, browser can't fetch it.

**Common causes:**

- **CORS missing on the output bucket.** `s3.tf` sets CORS on the source bucket only.
  Add for output bucket if serving `.m3u8` directly from S3 without CloudFront:
  ```bash
  aws --endpoint-url=http://localhost:4566 s3api put-bucket-cors \
    --bucket maintinee-media-output-development \
    --cors-configuration '{"CORSRules":[{"AllowedOrigins":["*"],"AllowedMethods":["GET","HEAD"],"AllowedHeaders":["*"]}]}'
  ```
- **Signed cookies not attached** — see [video-pipeline-api.md](./video-pipeline-api.md#get-v1mediamediaidplayback).

**Note:** the dummy Lambda writes a 4-byte fake `.ts` segment — playback URL loads the
playlist but the "video" is nothing. This is expected for the dummy. Swap in real
FFmpeg / MediaConvert (see [dummy-lambda-transcoder.md](./dummy-lambda-transcoder.md#going-to-prod))
to see actual video.

---

## Secrets Manager blob is malformed at boot

**Symptom:** API crashes at startup with `Secrets Manager blob "…" must be a flat JSON object`
or `key "X" must be a string, got number`.

**Fix:** inspect + regenerate:
```bash
aws --endpoint-url=http://localhost:4566 secretsmanager get-secret-value \
  --secret-id maintinee/development | jq -r .SecretString | jq .
pnpm infra:floci:apply  # regenerate from Terraform (canonical source)
```

---

## Worker crashes at startup

**Symptom:** Worker fails immediately with a stack trace mentioning `hydrateSecretsIfNeeded`
or SDK client construction.

**Causes:**
- Floci not running + `DEPLOYMENT_TARGET=aws` → SM client throws ECONNREFUSED. `pnpm floci:up`.
- Secret not seeded → `pnpm infra:floci:apply`.
- Wrong `SECRETS_MANAGER_SECRET_ID` → default is `maintinee/<NODE_ENV>`.

The worker's `worker.main.ts` fail-loud handlers are working as designed — the
`concurrently --restart-tries -1` respawns endlessly, so you'll see a repeating stack trace.

---

## Complete reset

```bash
pnpm infra:floci:destroy
pnpm floci:down
docker volume rm tmp_floci_data       # wipe Floci state
pnpm db:dev:rm                        # wipe postgres too (destructive)
pnpm db:dev:up                        # postgres back up
pnpm floci:up                         # floci back up
pnpm db:migrate                       # reapply DB schema
pnpm media:lambda:build               # rebuild Lambda image
pnpm infra:floci:init && pnpm infra:floci:apply
pnpm start:dev
```

Or all-in-one after `pnpm infra:floci:init`:
```bash
pnpm local:floci:up
```

---

## Getting help

Capture:
1. The failing `media_id`
2. `SELECT * FROM media_metadata WHERE id = '…'`
3. `SELECT * FROM media_status_events WHERE media_id = '…' ORDER BY created_at`
4. Lambda logs (see "Lambda actually ran" above)
5. Floci health output
