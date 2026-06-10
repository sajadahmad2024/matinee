export const QUEUE_DRIVER = 'QUEUE_DRIVER';
export const QUEUE_HANDLER_METADATA = 'queue:handler';

/** Logical queue names (prefixed per-env by the driver via SQS_QUEUE_PREFIX). */
export enum QueueName {
  EMAIL = 'email',
  CRON = 'cron',
  MEDIA = 'media',
}

/** Job names carried as an SQS message attribute and dispatched on by the consumer. */
export enum JobName {
  OTP_EMAIL = 'otp-email',
  PASSWORD_RESET_EMAIL = 'password-reset-email',
  DAILY_MAIL = 'daily-mail',
  // Media
  TRANSCODE_VIDEO = 'transcode-video',     // submit the HLS transcode job for a media asset
  TRANSCODE_POLL = 'transcode-poll',       // delayed self-poll of an in-flight transcode (status by status)
  MEDIA_RECONCILE = 'media-reconcile',     // cron safety-net: resume/fail stuck transcodes
  MEDIA_ORPHAN_SWEEP = 'media-orphan-sweep', // cron: delete never-completed (stale pending) uploads
  MEDIA_CLEANUP = 'media-cleanup',         // delete storage objects for a soft-deleted asset
}

/** Dead-letter queue name for a given logical queue (SQS redrive target). */
export const dlqNameFor = (queue: QueueName): string => `${queue}-dlq`;

export const ALL_QUEUES: QueueName[] = Object.values(QueueName);
