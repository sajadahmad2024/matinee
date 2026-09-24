# Two buckets: source (client PUTs originals here) and output (transcoder writes HLS + poster
# here). Separation mirrors prod (different lifecycle rules, IAM, storage class) and lets us give
# the FFmpeg Lambda read-only on source + write-only on output.
#
# Public-access-block / versioning / KMS encryption intentionally omitted — this only ever runs
# against Floci in dev; no real data lives here.
#trivy:ignore:AVD-AWS-0086 trivy:ignore:AVD-AWS-0087 trivy:ignore:AVD-AWS-0089 trivy:ignore:AVD-AWS-0090 trivy:ignore:AVD-AWS-0091 trivy:ignore:AVD-AWS-0093 trivy:ignore:AVD-AWS-0094 trivy:ignore:AVD-AWS-0132
resource "aws_s3_bucket" "media_source" {
  bucket        = local.media_source_bucket
  force_destroy = true
}

#trivy:ignore:AVD-AWS-0086 trivy:ignore:AVD-AWS-0087 trivy:ignore:AVD-AWS-0089 trivy:ignore:AVD-AWS-0090 trivy:ignore:AVD-AWS-0091 trivy:ignore:AVD-AWS-0093 trivy:ignore:AVD-AWS-0094 trivy:ignore:AVD-AWS-0132
resource "aws_s3_bucket" "media_output" {
  bucket        = local.media_output_bucket
  force_destroy = true
}

# CORS on the source bucket — presigned PUT from browsers needs this. Not applied in prod
# (Floci-only); prod uses signed CloudFront + strict origin whitelist at the CDN layer.
resource "aws_s3_bucket_cors_configuration" "media_source_cors" {
  bucket = aws_s3_bucket.media_source.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# S3 → SQS event notification on the source bucket (Option A safety net in the design doc).
# Fires on `ObjectCreated:*` — matches both single PUTs and multipart uploads. The `media`
# queue's handler will look up the row by storage_key and idempotently enqueue TRANSCODE_VIDEO
# if the row is still in `pending` / `uploaded`.
resource "aws_s3_bucket_notification" "media_source_notification" {
  bucket = aws_s3_bucket.media_source.id

  queue {
    queue_arn = aws_sqs_queue.media_source_events.arn
    events    = ["s3:ObjectCreated:*"]
  }

  depends_on = [aws_sqs_queue_policy.media_source_events]
}
