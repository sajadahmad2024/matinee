output "media_source_bucket" {
  description = "Source (upload) bucket name — set MEDIA_S3_BUCKET to this in .env."
  value       = aws_s3_bucket.media_source.bucket
}

output "media_output_bucket" {
  description = "Output (HLS) bucket name — set MEDIA_OUTPUT_BUCKET to this in .env."
  value       = aws_s3_bucket.media_output.bucket
}

output "queue_urls" {
  description = "Main queue URLs, keyed by QueueName enum value."
  value       = { for name, q in aws_sqs_queue.main : name => q.id }
}

output "dlq_urls" {
  value = { for name, q in aws_sqs_queue.dlq : name => q.id }
}

output "media_source_events_queue_url" {
  description = "URL of the S3 → SQS notification queue (consumed by MediaS3EventHandler)."
  value       = aws_sqs_queue.media_source_events.id
}

output "transcoder_lambda_arn" {
  description = "ARN of the transcoder Lambda (triggered by SQS event source mapping — no manual invoke)."
  value       = aws_lambda_function.transcoder.arn
}

output "transcoder_lambda_function_name" {
  value = aws_lambda_function.transcoder.function_name
}

output "transcoder_lambda_role_arn" {
  value = aws_iam_role.transcoder_lambda.arn
}

output "secrets_manager_secret_id" {
  description = "Set SECRETS_MANAGER_SECRET_ID to this — hydrated by src/config/secrets-bootstrap.ts before Nest modules load."
  value       = aws_secretsmanager_secret.app.name
}
