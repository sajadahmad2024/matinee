import { Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { AnalyticsRepository, ContentAnalytics, DashboardOverview } from '@db/repositories/analytics/analytics.repository';

const OVERVIEW_TTL = 60; // dashboard KPIs — light caching

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly analytics: AnalyticsRepository,
    private readonly cache: CacheService,
  ) {}

  /** Dashboard "critical KPIs" — cached briefly (heavy aggregate). */
  overview(): Promise<DashboardOverview> {
    return this.cache.getOrSet('analytics:overview', OVERVIEW_TTL, () => this.analytics.overview());
  }

  users(): Promise<Record<string, unknown>> {
    return this.cache.getOrSet('analytics:users', OVERVIEW_TTL, () => this.analytics.users());
  }

  subscriptions(): Promise<Record<string, unknown>> {
    return this.cache.getOrSet('analytics:subscriptions', OVERVIEW_TTL, () => this.analytics.subscriptions());
  }

  games(): Promise<Record<string, unknown>> {
    return this.cache.getOrSet('analytics:games', OVERVIEW_TTL, () => this.analytics.games());
  }

  /** Realtime pulse — not cached (must be live). */
  realtime(): Promise<Record<string, unknown>> {
    return this.analytics.realtime();
  }

  licensing(): Promise<Record<string, unknown>> {
    return this.cache.getOrSet('analytics:licensing', OVERVIEW_TTL, () => this.analytics.licensing());
  }

  async content(contentId: string): Promise<ContentAnalytics> {
    const a = await this.analytics.content(contentId);
    if (!a) {
      throw new NotFoundException('Content not found');
    }
    return a;
  }
}
