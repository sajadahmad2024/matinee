import { Module } from '@nestjs/common';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AnalyticsService } from './analytics.service';

/**
 * Analytics module — admin dashboard KPIs + per-content analytics. Aggregates live tables
 * (users, subscriptions, ledger, invoices, content) plus the raw engagement tables (content_views, reactions, shares, games)
 * — content_daily_stats has no rollup job yet. Read-only; cached briefly.
 */
@Module({
  controllers: [AdminAnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
