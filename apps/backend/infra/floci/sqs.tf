# All application queues used by the worker's SQS driver (src/queue/drivers/sqs.driver.ts).
# One DLQ per main queue, native SQS redrive after `QUEUE_MAX_RECEIVE_COUNT` attempts.
#
# Naming convention: keep queue names EXACTLY equal to the QueueName enum values in
# src/queue/queue.constant.ts — the driver prefixes with SQS_QUEUE_PREFIX (empty in local
# dev). The DLQ suffix `-dlq` matches `dlqNameFor(queue)` in queue.constant.ts.
locals {
  queue_names = [
    "email",
    "sms",
    "cron",
    "media",
    "content",
    "notifications",
  ]
}

#trivy:ignore:AVD-AWS-0096
resource "aws_sqs_queue" "dlq" {
  for_each = toset(local.queue_names)

  name                      = "${each.key}-dlq"
  message_retention_seconds = 1209600 # 14 days
}

#trivy:ignore:AVD-AWS-0096
resource "aws_sqs_queue" "main" {
  for_each = toset(local.queue_names)

  name                       = each.key
  visibility_timeout_seconds = 60

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq[each.key].arn
    maxReceiveCount     = 3
  })
}

# Separate queue that receives S3 event notifications from the source bucket. Consumed by the
# worker's `MediaS3EventHandler` (PR-3). Kept distinct from `media` so:
#   * the payload shape stays clean (S3 event on this queue; {mediaId} on `media`)
#   * DLQ policy can differ (S3 events can retry more aggressively)
#   * turning S3 events on/off is one Terraform toggle without touching app code
#trivy:ignore:AVD-AWS-0096
resource "aws_sqs_queue" "media_source_events_dlq" {
  name                      = "media-source-events-dlq"
  message_retention_seconds = 1209600
}

#trivy:ignore:AVD-AWS-0096
resource "aws_sqs_queue" "media_source_events" {
  name                       = "media-source-events"
  visibility_timeout_seconds = 60

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.media_source_events_dlq.arn
    maxReceiveCount     = 5
  })
}

# Grant the source bucket permission to publish to this queue (required for S3 → SQS notifs).
resource "aws_sqs_queue_policy" "media_source_events" {
  queue_url = aws_sqs_queue.media_source_events.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "s3.amazonaws.com" }
        Action    = "sqs:SendMessage"
        Resource  = aws_sqs_queue.media_source_events.arn
        Condition = {
          ArnLike = { "aws:SourceArn" = "arn:aws:s3:::${local.media_source_bucket}" }
        }
      },
    ]
  })
}
