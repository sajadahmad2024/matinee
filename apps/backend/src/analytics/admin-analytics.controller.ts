import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../auth/decorators/account-type.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsWindowQueryDto,
  ContentAnalyticsDto,
  ContentLibraryAnalyticsDto,
  ContentLibraryQueryDto,
  DashboardOverviewDto,
  GameAnalyticsDto,
  LicensingAnalyticsDto,
  RealtimeAnalyticsDto,
  SubscriptionAnalyticsDto,
  TrendsDto,
  TrendsQueryDto,
  UserAnalyticsDto,
} from './dto/analytics.dto';

/** Admin analytics — dashboard KPIs + per-content analytics. */
@ApiTags('Admin · Analytics')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.ANALYTICS}`, version: '1' })
export class AdminAnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('overview')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Dashboard critical KPIs (users / subs / revenue / points economy / games)' })
  @ApiEnvelope(DashboardOverviewDto)
  overview() {
    return this.analytics.overview();
  }

  @Get('users')
  @Permissions('users:read')
  @ApiOperation({ summary: 'User analytics — totals, growth, region & status breakdowns' })
  @ApiEnvelope(UserAnalyticsDto)
  users() {
    return this.analytics.users();
  }

  @Get('subscriptions')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Subscription analytics — active/MRR + by-plan + by-region revenue' })
  @ApiEnvelope(SubscriptionAnalyticsDto)
  subscriptions() {
    return this.analytics.subscriptions();
  }

  @Get('games')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Game analytics — per game type instance + participation counts' })
  @ApiEnvelope(GameAnalyticsDto)
  games() {
    return this.analytics.games();
  }

  @Get('realtime')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Realtime pulse — live viewers, recent views, signups & points today' })
  @ApiEnvelope(RealtimeAnalyticsDto)
  realtime() {
    return this.analytics.realtime();
  }

  @Get('licensing')
  @Permissions('content:read')
  @ApiOperation({ summary: 'Licensing rollup — status breakdown + soon-expiring titles' })
  @ApiEnvelope(LicensingAnalyticsDto)
  licensing() {
    return this.analytics.licensing();
  }

  @Get('trends')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Dashboard time series (signups / active users / views / watch time / points / revenue), zero-filled' })
  @ApiEnvelope(TrendsDto)
  trends(@Query() query: TrendsQueryDto) {
    return this.analytics.trends(query);
  }

  @Get('content-library')
  @Permissions('content:read')
  @ApiOperation({ summary: 'Catalog-wide content analytics for a window (totals, regions, hit rate, funnel, revenue, BTS, sentiment, top content)' })
  @ApiEnvelope(ContentLibraryAnalyticsDto)
  contentLibrary(@Query() query: ContentLibraryQueryDto) {
    return this.analytics.contentLibrary(query);
  }

  @Get('content/:id')
  @Permissions('content:read')
  @ApiOperation({ summary: 'Per-content analytics (lifetime counters + windowed trend, retention, sources, demographics, geo, games, BTS)' })
  @ApiEnvelope(ContentAnalyticsDto)
  content(@Param('id', ParseUUIDPipe) id: string, @Query() query: AnalyticsWindowQueryDto) {
    return this.analytics.content(id, query);
  }
}
