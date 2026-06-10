/**
 * Centralized cron registry. The scheduler (producer) lives in CronModule and only
 * decides WHEN; the actual work is either a trivial inline (sync) task or — by default —
 * an SQS job consumed by a background handler (async: retry/DLQ/scale).
 */
export enum CronName {
  DAILY_MAIL = 'daily-mail',                 // async → QueueName.CRON
  MEDIA_RECONCILE = 'media-reconcile',       // async → QueueName.MEDIA (resume/fail stuck transcodes)
  MEDIA_ORPHAN_SWEEP = 'media-orphan-sweep', // async → QueueName.MEDIA (delete never-completed uploads)
  HEARTBEAT = 'heartbeat',                   // sync example (in-process, trivial)
}

/**
 * Per-tick distributed-lock TTL (seconds). Kept shorter than the smallest cron interval
 * so the lock from one tick never blocks the next, but long enough to cover the tick's
 * enqueue/inline work. Only the worker that wins the lock runs the tick.
 */
export const CRON_LOCK_TTL = 50;
