import { Module } from '@nestjs/common';
import { AnalyticsRollupService } from './analytics-rollup.service';

/**
 * Rollup jobs (no controllers) — imported by CronModule (worker, scheduled) and by
 * AnalyticsModule (API, admin backfill endpoint). Repositories come from the global DBModule.
 */
@Module({
  providers: [AnalyticsRollupService],
  exports: [AnalyticsRollupService],
})
export class AnalyticsRollupModule {}
