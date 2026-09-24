# Execution role for the transcoder Lambda:
#   * read source bucket    (download original)  — currently unused by dummy; needed once real
#   * write output bucket   (HLS + poster)
#   * receive SQS events    (event source mapping polls; needs Receive/Delete on that queue)
#   * basic Lambda logging  (CloudWatch — Floci ignores but the SDK path needs the perm)
data "aws_iam_policy_document" "transcoder_lambda_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "transcoder_lambda" {
  name               = "${var.app_name}-transcoder-lambda-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.transcoder_lambda_assume.json
}

data "aws_iam_policy_document" "transcoder_lambda_policy" {
  statement {
    sid    = "SourceRead"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:HeadObject",
    ]
    resources = ["${aws_s3_bucket.media_source.arn}/*"]
  }

  statement {
    sid    = "OutputWrite"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:AbortMultipartUpload",
      "s3:ListBucketMultipartUploads",
      "s3:ListMultipartUploadParts",
    ]
    resources = ["${aws_s3_bucket.media_output.arn}/*"]
  }

  statement {
    sid       = "OutputBucketList"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.media_output.arn]
  }

  # SQS event source mapping requires the Lambda role to be able to consume the queue —
  # the mapping itself does the polling on the Lambda's behalf, but with THIS role's perms.
  statement {
    sid    = "SqsConsume"
    effect = "Allow"
    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:GetQueueUrl",
      "sqs:ChangeMessageVisibility",
    ]
    resources = [aws_sqs_queue.media_source_events.arn]
  }

  statement {
    sid    = "Logs"
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "transcoder_lambda" {
  name   = "${var.app_name}-transcoder-lambda-${var.environment}"
  policy = data.aws_iam_policy_document.transcoder_lambda_policy.json
}

resource "aws_iam_role_policy_attachment" "transcoder_lambda" {
  role       = aws_iam_role.transcoder_lambda.name
  policy_arn = aws_iam_policy.transcoder_lambda.arn
}
