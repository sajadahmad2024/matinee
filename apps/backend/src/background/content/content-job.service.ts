import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { ContentRepository } from '@db/repositories/content/content.repository';

/**
 * Worker-side content jobs (run async via @QueueHandler, enqueued by the cron scheduler).
 * Uses the global ContentRepository; busts the shared 'content' cache tag when state changes.
 */
@Injectable()
export class ContentJobService {
  private readonly logger = new Logger(ContentJobService.name);

  constructor(
    private readonly repo: ContentRepository,
    private readonly cache: CacheService,
  ) {}

  /** Publish any scheduled content whose go-live time has passed; refresh the feed cache. */
  async publishScheduled(): Promise<void> {
    const count = await this.repo.publishDueScheduled();
    if (count > 0) {
      await this.cache.invalidateTag('content');
      this.logger.log(`Published ${count} scheduled content item(s)`);
    }
  }

  /** Surface licenses expiring within 30 days (notifications wired when that module lands). */
  async licenseExpiryReminder(): Promise<void> {
    const expiring = await this.repo.findExpiringLicenses(30);
    if (expiring.length > 0) {
      this.logger.warn(
        `${expiring.length} license(s) expiring within 30 days: ${expiring
          .map((c) => `${c.title} (${c.licensorName ?? 'unknown'} · ${c.licenseExpiresAt})`)
          .join(', ')}`,
      );
      // TODO(notifications module): enqueue admin notifications for each expiring license.
    }
  }
}
