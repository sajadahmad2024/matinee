import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import {
  AnalyticsRepository,
  AnalyticsWindow,
  ContentAnalytics,
  ContentLibraryAnalytics,
  DashboardOverview,
  TREND_METRICS,
  TrendInterval,
  TrendMetric,
  TrendPoint,
} from '@db/repositories/analytics/analytics.repository';
import { AnalyticsWindowQueryDto, ContentLibraryQueryDto, TrendsQueryDto } from './dto/analytics.dto';

const OVERVIEW_TTL = 60; // dashboard KPIs — light caching (seconds)
const WINDOW_TTL = 60; // windowed library / trends aggregates (seconds)
const DAY_MS = 24 * 60 * 60 * 1000;
export const DEFAULT_WINDOW_DAYS = 30;
export const MAX_WINDOW_DAYS = 366;
export const DEFAULT_HIT_THRESHOLD = 1000;

export interface TrendsResult {
  interval: TrendInterval;
  from: string;
  to: string;
  region: string | null;
  series: Partial<Record<TrendMetric, TrendPoint[]>>;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly analytics: AnalyticsRepository,
    private readonly cache: CacheService,
  ) {}

  /**
   * Resolve a `[from, to)` window. `to` defaults to now (floored to the minute so cache keys
   * are stable), `from` to `to − 30 days`. Rejects `from ≥ to` and spans over 366 days.
   */
  resolveWindow(q: AnalyticsWindowQueryDto, now: Date = new Date()): AnalyticsWindow {
    const to = q.to !== undefined ? new Date(q.to) : new Date(Math.floor(now.getTime() / 60_000) * 60_000);
    const from = q.from !== undefined ? new Date(q.from) : new Date(to.getTime() - DEFAULT_WINDOW_DAYS * DAY_MS);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestException('from/to must be valid ISO-8601 timestamps');
    }
    if (from.getTime() >= to.getTime()) {
      throw new BadRequestException('from must be before to');
    }
    if (to.getTime() - from.getTime() > MAX_WINDOW_DAYS * DAY_MS) {
      throw new BadRequestException(`Window must not exceed ${MAX_WINDOW_DAYS} days`);
    }
    return { from: from.toISOString(), to: to.toISOString() };
  }

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

  async content(contentId: string, q: AnalyticsWindowQueryDto = {}): Promise<ContentAnalytics> {
    const window = this.resolveWindow(q);
    const a = await this.analytics.content(contentId, window);
    if (!a) {
      throw new NotFoundException('Content not found');
    }
    return a;
  }

  /** Catalog-wide content analytics (cached 60 s per region/window/threshold). */
  contentLibrary(q: ContentLibraryQueryDto): Promise<ContentLibraryAnalytics> {
    const { from, to } = this.resolveWindow(q);
    const region = q.region?.trim() ? q.region.trim() : null;
    const hitThreshold = q.hitThreshold ?? DEFAULT_HIT_THRESHOLD;
    const key = `analytics:content-library:${region ?? '*'}:${from}:${to}:${hitThreshold}`;
    return this.cache.getOrSet(key, WINDOW_TTL, () =>
      this.analytics.contentLibrary({ from, to, region, hitThreshold }),
    );
  }

  /** Dashboard time series — one zero-filled series per requested metric (cached 60 s). */
  trends(q: TrendsQueryDto): Promise<TrendsResult> {
    const { from, to } = this.resolveWindow(q);
    const interval: TrendInterval = q.interval ?? 'day';
    const region = q.region?.trim() ? q.region.trim() : null;
    const requested = q.metrics && q.metrics.length > 0 ? q.metrics : [...TREND_METRICS];
    // Dedupe + canonical order so equivalent requests share a cache entry.
    const metrics = TREND_METRICS.filter((m) => requested.includes(m));
    const key = `analytics:trends:${metrics.join(',')}:${interval}:${region ?? '*'}:${from}:${to}`;
    return this.cache.getOrSet(key, WINDOW_TTL, async () => {
      const params = { from, to, interval, region };
      const results = await Promise.all(metrics.map((m) => this.analytics.trend(m, params)));
      const series: Partial<Record<TrendMetric, TrendPoint[]>> = {};
      metrics.forEach((m, i) => {
        series[m] = results[i] ?? [];
      });
      return { interval, from, to, region, series };
    });
  }
}
