import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { AnalyticsWindowQueryDto } from '../dto/analytics.dto';
import {
  CommunityDataDto,
  DashboardQueryDto,
  GamificationDataDto,
  GraphsDataDto,
  MonetizationDataDto,
  RegionAnalyticsDto,
  RegionAnalyticsQueryDto,
  RegionsSummaryDto,
  ScreenTimeDataDto,
  StripDto,
  UserAnalyticsDataDto,
  UserAnalyticsQueryDto,
} from '../dto/dashboard.dto';
import { RollupCoverageDto, RollupResultDto, RunRollupDto } from '../dto/marketing.dto';
import { AnalyticsRollupService } from '../rollup/analytics-rollup.service';
import { DashboardAnalyticsService } from './dashboard-analytics.service';

/**
 * Admin dashboard sections (master + /dashboard/region/[code]) — payloads mirror
 * apps/web dashboard/constants.ts. All accept `from`/`to` (default last 30 days) and `region`.
 */
@ApiTags('Admin · Analytics')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.ANALYTICS}`, version: '1' })
export class AdminDashboardAnalyticsController {
  constructor(
    private readonly dashboard: DashboardAnalyticsService,
    private readonly rollups: AnalyticsRollupService,
  ) {}

  @Get('dashboard/strip')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Region strip — users / subscribers / online now / playing now' })
  @ApiEnvelope(StripDto)
  strip(@Query() q: DashboardQueryDto) {
    return this.dashboard.strip(this.dashboard.resolve(q, q.region));
  }

  @Get('dashboard/user-analytics')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Box 1 — video starts/completes, swipe-through, loops, engagement & videos per session, hit rate' })
  @ApiEnvelope(UserAnalyticsDataDto)
  userAnalytics(@Query() q: UserAnalyticsQueryDto) {
    return this.dashboard.userAnalytics(this.dashboard.resolve(q, q.region), q.hitThreshold);
  }

  @Get('dashboard/gamification')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Box 2 — points economy, streaks, leaderboard, challenges, earned-by-source, balances, weekly trends' })
  @ApiEnvelope(GamificationDataDto)
  gamification(@Query() q: DashboardQueryDto) {
    return this.dashboard.gamification(this.dashboard.resolve(q, q.region));
  }

  @Get('dashboard/screen-time')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Box 3 — session length/buckets/heatmap, BG↔FG re-entries, doomscroll depth, viewers vs gamified' })
  @ApiEnvelope(ScreenTimeDataDto)
  screenTime(@Query() q: DashboardQueryDto) {
    return this.dashboard.screenTime(this.dashboard.resolve(q, q.region));
  }

  @Get('dashboard/monetization')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Box 4 — ARPU/ARPDAU, trial→paid, LTV:CAC by channel, funnel, subs & revenue trends' })
  @ApiEnvelope(MonetizationDataDto)
  monetization(@Query() q: DashboardQueryDto) {
    return this.dashboard.monetization(this.dashboard.resolve(q, q.region));
  }

  @Get('dashboard/community')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Boxes 5/6 — in-app community (comments/user/week, reply rate, reaction:view, shares/video) + external mentions' })
  @ApiEnvelope(CommunityDataDto)
  community(@Query() q: DashboardQueryDto) {
    return this.dashboard.community(this.dashboard.resolve(q, q.region));
  }

  @Get('dashboard/graphs')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Box 7 — retention cohorts (current vs previous), K-factor by month, gameplay velocity' })
  @ApiEnvelope(GraphsDataDto)
  graphs(@Query() q: DashboardQueryDto) {
    return this.dashboard.graphs(this.dashboard.resolve(q, q.region));
  }

  @Get('dashboard/regions')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Master dashboard — per macro-region summary (viewership split) + per-country activity map cells' })
  @ApiEnvelope(RegionsSummaryDto)
  regions(@Query() q: AnalyticsWindowQueryDto) {
    return this.dashboard.regions(q);
  }

  @Get('region/:code')
  @Permissions('users:read')
  @ApiParam({ name: 'code', description: 'global | NA | EU | APAC | LATAM | MEA | ISO alpha-2 country' })
  @ApiOperation({ summary: 'Region drill-down — the full RegionAnalytics payload (strip + 7 boxes)' })
  @ApiEnvelope(RegionAnalyticsDto)
  region(@Param('code') code: string, @Query() q: RegionAnalyticsQueryDto) {
    return this.dashboard.region(code, q, q.hitThreshold);
  }

  @Get('rollup/content-daily')
  @Permissions('content:read')
  @ApiOperation({ summary: 'content_daily_stats rollup watermark (closed days served from the rollup)' })
  @ApiEnvelope(RollupCoverageDto)
  rollupStatus() {
    return this.rollups.coverage();
  }

  @Post('rollup/content-daily')
  @HttpCode(HttpStatus.OK)
  @Permissions('content:write')
  @ApiOperation({ summary: 'Recompute content_daily_stats for [from, to] UTC days (≤ 92 days; idempotent backfill)' })
  @ApiEnvelope(RollupResultDto)
  runRollup(@Body() dto: RunRollupDto) {
    return this.rollups.rollupContentDaily(dto.from, dto.to);
  }
}
