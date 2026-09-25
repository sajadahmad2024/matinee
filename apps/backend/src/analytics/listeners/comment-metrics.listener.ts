import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserMetricRepository } from '@db/repositories/analytics/user-metric.repository';
import { CommentCreatedPayload, EngagementEvent } from '../../engagement/events/engagement.events';

export const COMMENTS_POSTED_METRIC = 'comments_posted';
export const REPLIES_POSTED_METRIC = 'replies_posted';

/**
 * Maintains the per-user comment metrics the badge engine evaluates (`comments_posted`, and
 * `replies_posted` for replies). Fire-and-forget: a failure is logged, never surfaced to the
 * commenter.
 */
@Injectable()
export class CommentMetricsListener {
  private readonly logger = new Logger(CommentMetricsListener.name);

  constructor(private readonly metrics: UserMetricRepository) {}

  @OnEvent(EngagementEvent.CommentCreated, { async: true })
  async onCommentCreated(payload: CommentCreatedPayload): Promise<void> {
    try {
      await this.metrics.increment(payload.userId, COMMENTS_POSTED_METRIC, 1);
      if (payload.parentCommentId) {
        await this.metrics.increment(payload.userId, REPLIES_POSTED_METRIC, 1);
      }
    } catch (err) {
      this.logger.warn(`comment metrics failed for ${payload.userId}: ${(err as Error).message}`);
    }
  }
}
