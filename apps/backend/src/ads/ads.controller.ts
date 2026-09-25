import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdSalesService } from './ad-sales.service';
import { AdsService } from './ads.service';
import { CommercialServeDto } from './dto/ad-sales.dto';
import { ContentAdsDto, TrackAdEventsDto, TrackAdEventsResultDto } from './dto/ads.dto';

/** Ad event tracking (any authenticated account). */
@ApiTags('Ads')
@ApiBearerAuth()
@Controller({ path: RouteNames.ADS, version: '1' })
export class AdsController {
  constructor(
    private readonly ads: AdsService,
    private readonly sales: AdSalesService,
  ) {}

  @Get('commercials/:campaignId')
  @ApiOperation({ summary: 'Commercial for a feed slot (creative playback, CTA); skip=true when ad-free / capped / not live' })
  @ApiEnvelope(CommercialServeDto)
  commercial(@CurrentUser('id') userId: string, @Param('campaignId', ParseUUIDPipe) campaignId: string) {
    return this.sales.serveCommercial(userId, campaignId);
  }

  @Post('events')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record ad impressions / clicks / skips / completes (batched ≤50, deduped per view)' })
  @ApiEnvelope(TrackAdEventsResultDto)
  track(@CurrentUser('id') userId: string, @Body() dto: TrackAdEventsDto) {
    return this.ads.track(userId, dto);
  }
}

/** Per-content ad descriptor (sponsor pre/mid/post-roll or overlay). */
@ApiTags('Ads')
@ApiBearerAuth()
@Controller({ path: RouteNames.CONTENT, version: '1' })
export class ContentAdsController {
  constructor(private readonly ads: AdsService) {}

  @Get(':id/ads')
  @ApiOperation({ summary: 'Live sponsor ad for a content (roll ads suppressed for active subscribers)' })
  @ApiEnvelope(ContentAdsDto)
  forContent(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.ads.forContent(userId, id);
  }
}
