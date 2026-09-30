import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { ContentExtrasRepository } from '@db/repositories/content/content-extras.repository';
import { ContentRepository } from '@db/repositories/content/content.repository';
import { AdSalesRepository } from '@db/repositories/ads/ad-sales.repository';
import { BoostNotifierService } from '../../content/catalog/boost-notifier.service';

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
    private readonly extras: ContentExtrasRepository,
    private readonly boosts: BoostNotifierService,
    private readonly adSales: AdSalesRepository,
  ) {}

  /**
   * Every minute: announce boosts that became active (notifications/subscribers channels), clear
   * expired boosts, deactivate sponsorships past endsAt, and sync licence status (expiring ≤30d /
   * expired). Each step is independent — one failing doesn't block the others.
   */
  async maintenance(): Promise<void> {
    let changed = false;
    const step = async (name: string, fn: () => Promise<void>) => {
      try {
        await fn();
      } catch (err) {
        this.logger.error(`content maintenance: ${name} failed: ${(err as Error).message}`);
      }
    };
    await step('boost notifications', async () => {
      changed = (await this.boosts.notifyDue(50)) > 0 || changed;
    });
    await step('boost expiry', async () => {
      const ids = await this.repo.expireBoosts();
      for (const id of ids) await this.extras.recordChange(id, 'boosted', undefined, 'Boost expired');
      if (ids.length > 0) this.logger.log(`Expired ${ids.length} boost(s)`);
      changed = ids.length > 0 || changed;
    });
    await step('sponsorship expiry', async () => {
      const ids = await this.extras.expireSponsorships();
      for (const id of ids) await this.extras.recordChange(id, 'updated', undefined, 'Sponsorship ended');
      if (ids.length > 0) this.logger.log(`Ended ${ids.length} sponsorship(s)`);
      changed = ids.length > 0 || changed;
    });
    await step('licence status', async () => {
      const rows = await this.repo.syncLicenseStatuses();
      for (const r of rows) await this.extras.recordChange(r.id, 'updated', undefined, `License status → ${r.licenseStatus}`);
      if (rows.length > 0) this.logger.log(`Licence status changed on ${rows.length} content item(s)`);
      changed = rows.length > 0 || changed;
    });
    await step('ad campaign lifecycle', async () => {
      const rows = await this.adSales.sweepLifecycle();
      if (rows.length > 0) this.logger.log(`Ad campaigns changed: ${rows.map((r) => `${r.id}→${r.status}`).join(', ')}`);
      changed = rows.length > 0 || changed;
    });
    await step('ad revenue accrual', async () => {
      const n = await this.adSales.accrueDaily();
      if (n > 0) this.logger.log(`Accrued ${n} ad-sales ledger entr${n === 1 ? 'y' : 'ies'}`);
    });
    if (changed) {
      await this.cache.invalidateTag('content');
    }
  }

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
