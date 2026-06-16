import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../auth/decorators/account-type.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { AnalyticsService } from './analytics.service';
import {
  ContentAnalyticsDto,
  DashboardOverviewDto,
  GameAnalyticsDto,
  LicensingAnalyticsDto,
  RealtimeAnalyticsDto,
  SubscriptionAnalyticsDto,
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

  @Get('content/:id')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Per-content analytics (views / engagement / watch-time + 30-day trend)' })
  @ApiEnvelope(ContentAnalyticsDto)
  content(@Param('id', ParseUUIDPipe) id: string) {
    return this.analytics.content(id);
  }
}
