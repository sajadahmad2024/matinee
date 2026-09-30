import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../auth/decorators/account-type.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { AdsService } from './ads.service';
import { AdPerformanceItemDto, AdPerformanceQueryDto, AdWindowQueryDto } from './dto/ads.dto';

/** Admin ad-sales reporting. */
@ApiTags('Admin · Ads')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.ADS}`, version: '1' })
export class AdminAdsController {
  constructor(private readonly ads: AdsService) {}

  @Get('performance')
  @Permissions('content:read')
  @ApiOperation({ summary: 'Per-sponsorship impressions, clicks, CTR, skips, completion and revenue (windowed) + totals' })
  @ApiEnvelope(AdPerformanceItemDto, { isArray: true })
  performance(@Query() q: AdPerformanceQueryDto) {
    return this.ads.performance(q);
  }

  @Get('sponsorships/:id/performance')
  @Permissions('content:read')
  @ApiOperation({ summary: 'One sponsorship: metrics + daily series' })
  @ApiEnvelope(AdPerformanceItemDto)
  sponsorship(@Param('id', ParseUUIDPipe) id: string, @Query() q: AdWindowQueryDto) {
    return this.ads.sponsorshipPerformance(id, q);
  }
}
