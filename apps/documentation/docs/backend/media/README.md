# Media Module — Documentation Index

Handles secure asset upload (images, videos, docs) + delivery. **Transcoding runs
out-of-process in an SQS-triggered Lambda** — the NestJS side owns only presigned URL
minting, reads, and delete-with-cleanup.

## Start here

- **[video-pipeline.md](./video-pipeline.md)** — top-level overview, architecture diagram,
  what each component owns

## Task-specific

- **[floci-local-aws.md](./floci-local-aws.md)** — run the whole pipeline locally with
  Floci + Terraform
- **[dummy-lambda-transcoder.md](./dummy-lambda-transcoder.md)** — the transcoder Lambda:
  SQS trigger, DB update, prod swap-in (MediaConvert / FFmpeg)
- **[video-pipeline-api.md](./video-pipeline-api.md)** — HTTP endpoints with sample
  payloads (`POST /uploads`, `GET /:id`, `GET /:id/playback`, `DELETE /:id`)
- **[video-pipeline-troubleshooting.md](./video-pipeline-troubleshooting.md)** — common
  failure modes + how to diagnose them

## Related (cross-cutting infrastructure)

- **[../infrastructure/deployment-target.md](../infrastructure/deployment-target.md)** —
  how `DEPLOYMENT_TARGET=local|aws` flips every AWS SDK client
- **[../infrastructure/secrets-management.md](../infrastructure/secrets-management.md)** —
  pre-boot Secrets Manager hydration gate

## Code locations

| Concern | Path |
|---|---|
| HTTP controller, service, DTOs | `apps/backend/src/media/` |
| Storage / delivery providers | `apps/backend/src/media/providers/` |
| **Transcoder** (SQS-triggered Lambda) | `apps/backend/docker/dummy-transcoder/` |
| DB repository + schema | `apps/backend/src/db/repositories/media/` |
| Terraform (S3 + SQS + Lambda + IAM) | `apps/backend/infra/floci/` |

## Not here anymore (v1 → v2 changes)

The NestJS worker used to own the transcode flow. As of v2, it doesn't touch media at all —
those files are deleted. See [video-pipeline.md § "What was deleted in v2"](./video-pipeline.md#what-was-deleted-in-v2-from-v1)
for the full list.
