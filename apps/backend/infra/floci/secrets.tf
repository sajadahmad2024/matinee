# One JSON secret per app/environment (e.g. maintinee/development), matching the
# "everything moves to Secrets Manager" decision. `src/config/secrets-bootstrap.ts` fetches
# this blob at boot and copies every key into `process.env`, so `EnvConfig`/Joi validation
# downstream is unaffected. Populate `var.app_secrets` via terraform.tfvars (gitignored).
locals {
  # Values already derived from the Floci-provisioned infra — kept alongside opaque
  # `var.app_secrets` (JWT keys, OAuth creds, third-party API keys, provider-selection
  # flags, etc.) in a single blob so the app has one place to look.
  computed_secrets = {
    DEPLOYMENT_TARGET = "aws"
    FLOCI_ENDPOINT    = var.floci_endpoint

    AWS_REGION          = var.aws_region
    MEDIA_S3_BUCKET     = aws_s3_bucket.media_source.bucket
    MEDIA_S3_REGION     = var.aws_region
    MEDIA_OUTPUT_BUCKET = aws_s3_bucket.media_output.bucket

    MEDIA_STORAGE_DRIVER  = "s3"
    MEDIA_DELIVERY_DRIVER = "cloudfront"
    # Transcoding runs in the Lambda (SQS-triggered) — NestJS-side has no MEDIA_TRANSCODER
    # env var; the Lambda function name isn't consumed by the NestJS app either.
  }

  # e.g. "media-source-events" -> MEDIA_SOURCE_EVENTS_QUEUE_URL. Not read by our current
  # SQS driver (it looks queues up by name via GetQueueUrl), but included so ops has one
  # source of truth in Secrets Manager instead of consulting two systems.
  queue_url_secrets = merge(
    {
      for name in local.queue_names :
      "${upper(replace(name, "-", "_"))}_QUEUE_URL" => aws_sqs_queue.main[name].id
    },
    {
      MEDIA_SOURCE_EVENTS_QUEUE_URL = aws_sqs_queue.media_source_events.id
    }
  )

  secret_blob = merge(local.computed_secrets, local.queue_url_secrets, var.app_secrets)
}

# A customer-managed KMS key is intentionally omitted — this only ever holds Floci-emulated
# dev secrets locally (see README "Terraform security exceptions (Floci-only)").
#trivy:ignore:AVD-AWS-0098
resource "aws_secretsmanager_secret" "app" {
  name = "${var.app_name}/${var.environment}"
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id     = aws_secretsmanager_secret.app.id
  secret_string = jsonencode(local.secret_blob)
}
