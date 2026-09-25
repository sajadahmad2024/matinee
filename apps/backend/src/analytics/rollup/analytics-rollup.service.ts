import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AnalyticsRollupRepository, CONTENT_DAILY_JOB, RollupCoverage } from '@db/repositories/analytics/analytics-rollup.repository';
import { addDays, daysBetween, mergeCoverage, utcDay } from './coverage';

export const MAX_ROLLUP_DAYS = 92;

export interface RollupResult {
  from: string;
  to: string;
  rows: number;
  coverage: { coveredFrom: string | null; coveredThrough: string | null };
}

/**
 * Daily rollups. `content_daily_stats` ← content_views / reactions / comments / shares.
 * Run by the worker cron (yesterday + today every 15 min) and on demand by admins (backfill).
 */
@Injectable()
export class AnalyticsRollupService {
  private readonly logger = new Logger(AnalyticsRollupService.name);

  constructor(private readonly rollups: AnalyticsRollupRepository) {}

  /** Cron body: roll yesterday + today (UTC). */
  rollupRecent(now: Date = new Date()): Promise<RollupResult> {
    const today = utcDay(now);
    return this.rollupContentDaily(addDays(today, -1), today, now);
  }

  /** Recompute `[from, to]` (inclusive UTC days, ≤ 92 days, not in the future) and advance the watermark. */
  async rollupContentDaily(from: string, to: string, now: Date = new Date()): Promise<RollupResult> {
    const today = utcDay(now);
    const end = to > today ? today : to;
    if (from > end) {
      throw new BadRequestException('from must be on or before to (and not in the future)');
    }
    if (daysBetween(from, end) + 1 > MAX_ROLLUP_DAYS) {
      throw new BadRequestException(`A rollup run may cover at most ${MAX_ROLLUP_DAYS} days`);
    }
    const rows = await this.rollups.rollupContentDaily(from, end);
    const existing = await this.rollups.getCoverage(CONTENT_DAILY_JOB);
    const merged = mergeCoverage(existing, from, end, today);
    await this.rollups.setCoverage(CONTENT_DAILY_JOB, merged.coveredFrom, merged.coveredThrough);
    this.logger.debug(`content_daily rollup ${from}..${end}: ${rows} rows`);
    return { from, to: end, rows, coverage: merged };
  }

  coverage(): Promise<RollupCoverage> {
    return this.rollups.getCoverage(CONTENT_DAILY_JOB);
  }
}
