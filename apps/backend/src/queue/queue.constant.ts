export const QUEUE_DRIVER = 'QUEUE_DRIVER';
export const QUEUE_HANDLER_METADATA = 'queue:handler';

/**
 * Logical queue names (prefixed per-env by the driver via SQS_QUEUE_PREFIX).
 *
 * The `media-source-events` queue receives S3 → SQS event notifications from the media
 * source bucket, but is NOT consumed by this NestJS worker — it's an event source mapping
 * on the transcoder Lambda (see infra/floci/lambda.tf). It's declared in Terraform's
 * `sqs.tf` only; there's no handler in this project for it.
 */
export enum QueueName {
  EMAIL = 'email',
  SMS = 'sms',
  CRON = 'cron',
  CONTENT = 'content',
  NOTIFICATIONS = 'notifications',
}

/** Job names carried as an SQS message attribute and dispatched on by the consumer. */
export enum JobName {
  OTP_EMAIL = 'otp-email',
  PASSWORD_RESET_EMAIL = 'password-reset-email',
  DAILY_MAIL = 'daily-mail',
  // SMS
  SEND_SMS = 'send-sms',                    // deliver a transactional SMS (e.g. phone OTP) off the request path
  // Notifications
  NOTIFY_CAMPAIGN_FANOUT = 'notify-campaign-fanout', // fan a campaign out to its resolved audience in batches
  // Content
  PUBLISH_SCHEDULED = 'publish-scheduled',         // cron: flip scheduled→published when go-live passes
  LICENSE_EXPIRY_REMINDER = 'license-expiry-reminder', // cron: surface licenses expiring soon
}

/** Dead-letter queue name for a given logical queue (SQS redrive target). */
export const dlqNameFor = (queue: QueueName): string => `${queue}-dlq`;

export const ALL_QUEUES: QueueName[] = Object.values(QueueName);
