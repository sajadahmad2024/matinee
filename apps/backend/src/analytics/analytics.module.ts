import { Module } from '@nestjs/common';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AnalyticsService } from './analytics.service';

/**
 * Analytics module — admin dashboard KPIs + per-content analytics. Aggregates live tables
 * (users, subscriptions, ledger, invoices, content) plus the rollup tables (content_daily_stats)
 * populated from the ingested content_watch_events. Read-only; cached briefly.
 */
@Module({
  controllers: [AdminAnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
