# Dummy transcoder Lambda + SQS event source mapping. Same container image runs under Floci
# locally (image pulled from host Docker daemon after `pnpm media:lambda:build`) and in real
# AWS via ECR — the only prod difference is `var.transcoder_lambda_image_uri`.
resource "aws_lambda_function" "transcoder" {
  function_name = "${var.app_name}-transcoder-${var.environment}"
  role          = aws_iam_role.transcoder_lambda.arn

  package_type = "Image"
  image_uri    = var.transcoder_lambda_image_uri

  memory_size = var.transcoder_lambda_memory_mb
  timeout     = var.transcoder_lambda_timeout_seconds

  environment {
    variables = merge(
      {
        MEDIA_OUTPUT_BUCKET = aws_s3_bucket.media_output.bucket
        # Must match the queue's redrive maxReceiveCount — the handler only marks a row FAILED on
        # the final delivery; earlier failures are retried by SQS.
        MAX_RECEIVE_COUNT = tostring(var.media_source_events_max_receive_count)
        LOG_LEVEL         = "info"
      },
      var.transcoder_lambda_database_secret_id != ""
      ? { DATABASE_URL_SECRET_ID = var.transcoder_lambda_database_secret_id }
      : { DATABASE_URL = var.transcoder_lambda_database_url },
      # Floci only: an endpoint reachable from INSIDE the Lambda container (not localhost).
      var.lambda_aws_endpoint_url != "" ? { AWS_ENDPOINT_URL = var.lambda_aws_endpoint_url } : {},
    )
  }

  depends_on = [aws_iam_role_policy_attachment.transcoder_lambda]
}

# SQS → Lambda event source mapping: every message that lands on `media-source-events` (which
# S3 populates via bucket notification, see s3.tf) triggers this Lambda. Batch size = 1 for
# simplicity/observability; bump when the volume justifies it. `report_batch_item_failures`
# tells SQS to redrive ONLY failed items in a batch (handler returns `batchItemFailures`).
resource "aws_lambda_event_source_mapping" "transcoder_from_events" {
  event_source_arn = aws_sqs_queue.media_source_events.arn
  function_name    = aws_lambda_function.transcoder.arn
  batch_size       = 1
  enabled          = true

  function_response_types = ["ReportBatchItemFailures"]
}
