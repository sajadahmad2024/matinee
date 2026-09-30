# Floci — Local AWS Emulator Setup

Owner: backend
Last updated: 2026-09-24

## What Floci is

Floci (`floci/floci` on Docker Hub) is a LocalStack-compatible single-container emulator that
exposes a unified AWS edge endpoint on `http://localhost:4566`. Emulates S3, SQS, **Lambda
(container images)**, Secrets Manager, SES, SNS — everything the video pipeline needs.

Set `DEPLOYMENT_TARGET=aws` + `FLOCI_ENDPOINT=http://localhost:4566` and every AWS SDK client
in the codebase (as well as Terraform in `infra/floci/`) routes to Floci. See
[../infrastructure/deployment-target.md](../infrastructure/deployment-target.md).

## Prerequisites

- Docker Desktop or engine (≥ 20.x)
- Terraform ≥ 1.5 (`brew install terraform`)
- awscli (only for one-off verification / debug)
- `pnpm install` in `apps/backend/` done

## First-time setup (all-in-one)

```bash
cd apps/backend
pnpm local:floci:up
```

That script chains:
1. `pnpm db:dev:up` — Postgres + Redis
2. `pnpm floci:up` — Floci container
3. `pnpm media:lambda:build` — build the dummy-transcoder image (Floci pulls it from your
   local Docker daemon)
4. `pnpm infra:floci:apply` — Terraform: S3 + SQS + Lambda + IAM + Secrets Manager
5. `pnpm db:migrate` — Drizzle migrations
6. `pnpm start:dev` — API + worker

## Individual scripts

| Script | Runs | Notes |
|---|---|---|
| `pnpm floci:up` | Start the Floci container | Keeps existing postgres/redis untouched |
| `pnpm floci:down` | Stop Floci | State persists in the `floci_data` volume |
| `pnpm infra:floci:init` | `terraform init` | One-time after clone |
| `pnpm infra:floci:apply` | `terraform apply -auto-approve` | Provisions S3/SQS/Lambda/IAM/secrets |
| `pnpm infra:floci:destroy` | `terraform destroy -auto-approve` | Wipes Floci-provisioned resources |
| `pnpm media:lambda:build` | `docker build -t dummy-transcoder:latest ./docker/dummy-transcoder` | Builds the transcoder Lambda image (~40 MB, no FFmpeg) |
| `pnpm local:floci:up` | The full sequence | Assumes `infra:floci:init` already ran once |

## Directory layout

```
apps/backend/
├── docker-compose.floci.yml           # Floci service (layers on docker-compose.yml)
├── docker/
│   └── dummy-transcoder/              # Lambda container image
│       ├── Dockerfile                 # Node 20 base, no FFmpeg
│       ├── handler.js                 # SQS-triggered, writes placeholder HLS + updates DB
│       └── package.json               # @aws-sdk/client-s3 + pg
└── infra/
    └── floci/                         # Terraform modules
        ├── provider.tf                # AWS provider → Floci endpoint
        ├── s3.tf                      # source + output buckets, S3→SQS notification
        ├── sqs.tf                     # queues + DLQs, media-source-events bridge queue
        ├── lambda.tf                  # transcoder Lambda + SQS event source mapping
        ├── iam.tf                     # Lambda role (S3 R/W, SQS consume, logs)
        ├── secrets.tf                 # Secrets Manager blob (app config + app_secrets)
        ├── variables.tf
        ├── outputs.tf
        ├── versions.tf
        └── terraform.tfvars.example   # copy to terraform.tfvars (gitignored)
```

## The Terraform footprint

| File | Resource | Purpose |
|---|---|---|
| `provider.tf` | AWS provider | Dummy creds, `s3_use_path_style`, per-service endpoint overrides |
| `s3.tf` | 2× `aws_s3_bucket` + CORS + notification | Source (with `ObjectCreated:*` → SQS notification) + output |
| `sqs.tf` | Queues + DLQs | App queues (email/sms/etc) + `media-source-events` bridge queue |
| `lambda.tf` | `aws_lambda_function` + `aws_lambda_event_source_mapping` | Transcoder Lambda auto-triggered by SQS |
| `iam.tf` | Role + policy | Lambda: S3 read source, S3 write output, SQS consume, CloudWatch logs |
| `secrets.tf` | `aws_secretsmanager_secret` + version | Single JSON blob (computed values + `var.app_secrets`) |

## Configuring `terraform.tfvars`

```bash
cp infra/floci/terraform.tfvars.example infra/floci/terraform.tfvars
# edit — fill in app_secrets + transcoder_lambda_database_url if you changed defaults
pnpm infra:floci:apply
```

`terraform.tfvars` is gitignored (`infra/**/terraform.tfvars` in `.gitignore`).

## Environment variables for local Floci mode

In `.env`:

```
DEPLOYMENT_TARGET=aws
FLOCI_ENDPOINT=http://localhost:4566
FLOCI_PORT=4566

AWS_REGION=us-east-1

MEDIA_STORAGE_DRIVER=s3
MEDIA_DELIVERY_DRIVER=local
MEDIA_S3_BUCKET=maintinee-media-source-development
MEDIA_OUTPUT_BUCKET=maintinee-media-output-development

# Optional: hydrate the rest from Secrets Manager instead of .env
SECRETS_MANAGER_SECRET_ID=maintinee/development
```

Note: there is no `MEDIA_TRANSCODER` env — the transcoder is the Lambda, wired by Terraform,
not selected by the NestJS process.

## Verifying Floci is working

```bash
# Health
curl http://localhost:4566/_localstack/health | jq .

# Buckets
aws --endpoint-url=http://localhost:4566 s3 ls
# → maintinee-media-source-development, maintinee-media-output-development

# Queues
aws --endpoint-url=http://localhost:4566 sqs list-queues
# → media-source-events, media-source-events-dlq, email, sms, cron, content, notifications (+ DLQs)

# Lambda
aws --endpoint-url=http://localhost:4566 lambda list-functions \
  --query 'Functions[].FunctionName'
# → maintinee-transcoder-development

# Event source mapping (Lambda ← SQS wiring)
aws --endpoint-url=http://localhost:4566 lambda list-event-source-mappings \
  --function-name maintinee-transcoder-development
```

## End-to-end smoke test (with real S3 event → Lambda → DB update)

```bash
# 1. Ensure JWT
TOKEN=$(curl -sS -X POST http://localhost:3000/v1/admin/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"Admin@123456"}' \
  | jq -r '.data.accessToken // .accessToken')

# 2. Request upload
curl -sS -X POST http://localhost:3000/v1/media/uploads \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"mediaType":"video","usageType":"content_video","mimeType":"video/mp4","filename":"t.mp4","sizeBytes":2848208}' \
  | tee /tmp/upload.json

MEDIA_ID=$(jq -r '.data.mediaId // .mediaId' /tmp/upload.json)
PUT_URL=$(jq -r '.data.upload.url // .upload.url' /tmp/upload.json)

# 3. PUT — this is what triggers the whole Lambda chain
curl -sSL -o /tmp/sample.mp4 "https://download.samplelib.com/mp4/sample-5s.mp4"
curl -X PUT "$PUT_URL" -H 'Content-Type: video/mp4' --data-binary @/tmp/sample.mp4

# 4. Wait for Lambda (dummy takes ~2s)
sleep 3

# 5. See the result in DB
PGPASSWORD=postgres psql -h localhost -U postgres -d postgres -c \
  "SELECT status, is_hls, hls_master_key, processing_provider FROM media_metadata WHERE id='$MEDIA_ID';"
# → status=ready, is_hls=true, hls_master_key='media/content_video/…/hls/master.m3u8',
#   processing_provider='dummy-lambda'

# 6. See the placeholder HLS output in S3
aws --endpoint-url=http://localhost:4566 s3 ls \
  s3://maintinee-media-output-development/ --recursive
```

## Cleaning up

```bash
pnpm infra:floci:destroy   # remove all provisioned resources
pnpm floci:down            # stop container (state persists in floci_data volume)
docker volume rm tmp_floci_data  # wipe state completely (destructive)
```

## Troubleshooting

See [video-pipeline-troubleshooting.md](./video-pipeline-troubleshooting.md).
