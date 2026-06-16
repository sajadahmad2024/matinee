import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShareRepository } from '@db/repositories/engagement/share.repository';
import { ContentAccessService } from '../services/content-access.service';
import { ContentSharedPayload, EngagementEvent } from '../events/engagement.events';
import { ShareResultDto } from './dto/share.dto';

@Injectable()
export class ShareService {
  constructor(
    private readonly shares: ShareRepository,
    private readonly access: ContentAccessService,
    private readonly events: EventEmitter2,
  ) {}

  /**
   * Record a share. The award (points, with daily cap + idempotency) is the Tokenomics
   * module's job — it subscribes to ContentShared. Here we only persist + bump the counter.
   */
  async share(userId: string, contentId: string, channel: string | undefined): Promise<ShareResultDto> {
    await this.access.assertPublished(contentId);
    const shareId = await this.shares.record(userId, contentId, channel);
    this.events.emit(EngagementEvent.ContentShared, {
      userId,
      contentId,
      shareId,
      ...(channel ? { channel } : {}),
    } satisfies ContentSharedPayload);
    const counts = await this.access.getCounts(contentId);
    return { shareId, shareCount: counts.shareCount };
  }
}
