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
    variables = {
      MEDIA_OUTPUT_BUCKET = aws_s3_bucket.media_output.bucket
      DATABASE_URL        = var.transcoder_lambda_database_url
      # Under Floci, the S3 client inside Lambda needs to hit the Floci edge from the
      # perspective of the container network (docker socket used to spawn Lambda containers,
      # so they share the daemon; localhost is reachable via host.docker.internal).
      AWS_ENDPOINT_URL    = var.floci_endpoint
      LOG_LEVEL           = "info"
    }
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
