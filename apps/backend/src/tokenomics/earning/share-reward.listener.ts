import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ContentSharedPayload, EngagementEvent } from '../../engagement/events/engagement.events';
import { EarningService } from './earning.service';

/**
 * Consumes the engagement ContentShared domain event and awards the share (capped, idempotent).
 * This is the live wiring of the engagement→tokenomics seam. Best-effort and async: a failed
 * award never breaks the share request. (Moves to the durable queue when the Events module lands.)
 */
@Injectable()
export class ShareRewardListener {
  private readonly logger = new Logger(ShareRewardListener.name);

  constructor(private readonly earning: EarningService) {}

  @OnEvent(EngagementEvent.ContentShared, { async: true })
  async onShared(payload: ContentSharedPayload): Promise<void> {
    try {
      await this.earning.awardShare(payload.userId, payload.contentId, payload.shareId);
    } catch (err) {
      this.logger.error(`Failed to award share ${payload.shareId}: ${(err as Error).message}`);
    }
  }
}
