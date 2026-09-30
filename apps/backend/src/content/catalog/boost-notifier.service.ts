import { Injectable, Logger } from '@nestjs/common';
import { DBService } from '@db/db.service';
import { BoostNotificationClaim, ContentRepository } from '@db/repositories/content/content.repository';
import { NotificationCampaignRepository } from '@db/repositories/notifications/notification-campaign.repository';
import { QueueService } from '@queue/queue.service';
import { JobName, QueueName } from '@queue/queue.constant';

export const BOOST_DEEP_LINK = (contentId: string): string => `matinee://content/${contentId}`;

/** Campaign payload for a boosted content (`notifications` → all customers, else subscribers only). */
export function boostCampaignFor(c: BoostNotificationClaim) {
  const toAll = c.boostChannels.includes('notifications');
  const description = c.description?.trim();
  return {
    title: `Trending now: ${c.title}`.slice(0, 150),
    message: (description ? description.slice(0, 200) : `Watch ${c.title} now on Matinee`).slice(0, 500),
    deepLink: BOOST_DEEP_LINK(c.id),
    targetType: (toAll ? 'all' : 'segment') as 'all' | 'segment',
    targetFilter: {
      category: 'new_content',
      source: 'boost',
      contentId: c.id,
      ...(toAll ? {} : { subscribers: true }),
    },
  };
}

/**
 * Boost `notifications` / `subscribers` channels → one notification campaign per boost.
 * The claim (`contents.boost_notified_at`) and the campaign row are written in ONE transaction,
 * so a boost is announced at most once even with concurrent cron ticks / API calls. The fan-out
 * itself is the existing campaign pipeline (NOTIFY_CAMPAIGN_FANOUT, worker).
 */
@Injectable()
export class BoostNotifierService {
  private readonly logger = new Logger(BoostNotifierService.name);

  constructor(
    private readonly db: DBService,
    private readonly content: ContentRepository,
    private readonly campaigns: NotificationCampaignRepository,
    private readonly queue: QueueService,
  ) {}

  /** Announce due boosts (or just `onlyId`). Returns the number of campaigns started. */
  async notifyDue(limit = 50, onlyId?: string): Promise<number> {
    const created = await this.db.transaction(async (tx) => {
      const claims = await this.content.claimBoostNotifications(limit, onlyId, tx);
      const out: Array<{ contentId: string; campaignId: string }> = [];
      for (const c of claims) {
        const campaignId = await this.campaigns.create(boostCampaignFor(c), 'draft', null, tx);
        await this.content.setBoostCampaign(c.id, campaignId, tx);
        out.push({ contentId: c.id, campaignId });
      }
      return out;
    });
    let started = 0;
    for (const { contentId, campaignId } of created) {
      try {
        await this.campaigns.setStatus(campaignId, 'sending');
        await this.queue.send(QueueName.NOTIFICATIONS, JobName.NOTIFY_CAMPAIGN_FANOUT, { campaignId });
        started++;
      } catch (err) {
        // Leave it as a draft: admins can still send it from the campaigns screen.
        await this.campaigns.setStatus(campaignId, 'draft').catch(() => undefined);
        this.logger.error(`Boost campaign ${campaignId} (content ${contentId}) enqueue failed: ${(err as Error).message}`);
      }
    }
    if (started > 0) {
      this.logger.log(`Started ${started} boost notification campaign(s)`);
    }
    return started;
  }

  /** Best-effort immediate announcement after an admin boosts (the cron retries anyway). */
  async notifyIfActive(contentId: string): Promise<void> {
    try {
      await this.notifyDue(1, contentId);
    } catch (err) {
      this.logger.warn(`Boost notification for ${contentId} deferred to cron: ${(err as Error).message}`);
    }
  }
}
