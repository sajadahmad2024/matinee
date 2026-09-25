import { Module } from '@nestjs/common';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AdminDashboardAnalyticsController } from './dashboard/admin-dashboard-analytics.controller';
import { DashboardAnalyticsService } from './dashboard/dashboard-analytics.service';
import { CommentMetricsListener } from './listeners/comment-metrics.listener';
import { AdminMarketingController } from './marketing/admin-marketing.controller';
import { MarketingService } from './marketing/marketing.service';
import { AdminReportsController } from './reports/admin-reports.controller';
import { ReportsService } from './reports/reports.service';
import { AnalyticsRollupModule } from './rollup/analytics-rollup.module';

/**
 * Analytics module — admin dashboard KPIs, region drill-down sections, report builder,
 * marketing inputs (spend / social mentions) and per-content analytics. Read-mostly;
 * cached briefly. `content_daily_stats` is filled by the worker rollup cron
 * (AnalyticsRollupModule); comment metrics for badges come from CommentMetricsListener.
 * Doc: apps/documentation/docs/backend/analytics/engagement-analytics.md
 */
@Module({
  imports: [AnalyticsRollupModule],
  controllers: [AdminAnalyticsController, AdminDashboardAnalyticsController, AdminMarketingController, AdminReportsController],
  providers: [AnalyticsService, DashboardAnalyticsService, MarketingService, ReportsService, CommentMetricsListener],
})
export class AnalyticsModule {}
