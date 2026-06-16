import { INotifyCampaignFanoutJob } from '@bg/interfaces/job.interface';
import { DBService } from '@db/db.service';
import { NotificationCampaignRepository } from '@db/repositories/notifications/notification-campaign.repository';
import { NotificationRepository } from '@db/repositories/notifications/notification.repository';
import { Injectable, Logger } from '@nestjs/common';

const CHUNK = 5_000; // rows per multi-row insert (well under PG's parameter ceiling)

/**
 * Worker-side campaign fan-out. Resolves the audience and writes every inbox row in a SINGLE
 * transaction (chunked inserts) then marks the campaign sent — atomic, so an SQS retry after a
 * mid-fan-out failure rolls back cleanly and replays without duplicate inboxes. Off the request
 * path: a broadcast to 100k users no longer blocks the admin HTTP call.
 */
@Injectable()
export class NotificationFanoutJobService {
  private readonly logger = new Logger(NotificationFanoutJobService.name);

  constructor(
    private readonly db: DBService,
    private readonly campaigns: NotificationCampaignRepository,
    private readonly notifications: NotificationRepository,
  ) {}

  async run(data: INotifyCampaignFanoutJob): Promise<void> {
    const campaign = await this.campaigns.getById(data.campaignId);
    if (!campaign) {
      this.logger.warn(`Campaign ${data.campaignId} not found — skipping fan-out`);
      return;
    }
    if (campaign.status === 'sent') {
      this.logger.debug(`Campaign ${data.campaignId} already sent — skipping (idempotent)`);
      return;
    }
    try {
      const count = await this.db.transaction(async (tx) => {
        const audience = await this.campaigns.resolveAudience(
          campaign.targetType,
          (campaign.targetFilter ?? {}) as Record<string, unknown>,
          tx,
        );
        const category = ((campaign.targetFilter as { category?: string })?.category) ?? 'general';
        for (let i = 0; i < audience.length; i += CHUNK) {
          await this.notifications.createMany(
            audience.slice(i, i + CHUNK).map((userId) => ({
              userId,
              category,
              title: campaign.title,
              body: campaign.message,
              ...(campaign.deepLink ? { deepLink: campaign.deepLink } : {}),
              campaignId: campaign.id,
            })),
            tx,
          );
        }
        await this.campaigns.markSent(campaign.id, audience.length, tx);
        return audience.length;
      });
      this.logger.log(`Campaign ${data.campaignId} fanned out to ${count} recipients`);
    } catch (err) {
      // Surface the failure so SQS retries / DLQs; reflect it on the campaign for the admin UI.
      await this.campaigns.setStatus(data.campaignId, 'failed').catch(() => undefined);
      this.logger.error(`Campaign ${data.campaignId} fan-out failed: ${(err as Error).message}`);
      throw err;
    }
  }
}
