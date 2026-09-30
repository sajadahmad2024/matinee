import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import {
  DeletedDto,
  SocialIngestResultDto,
  IngestSocialMentionsDto,
  MarketingSpendDto,
  MarketingSpendQueryDto,
  SocialMentionDto,
  SocialMentionPageDto,
  SocialMentionsQueryDto,
  SocialSummaryDto,
  SocialSummaryQueryDto,
  UpdateSocialMentionDto,
  UpsertMarketingSpendDto,
} from '../dto/marketing.dto';
import { MarketingService } from './marketing.service';

/** Admin inputs for CAC / LTV:CAC (marketing spend) and Community — External (social mentions). */
@ApiTags('Admin · Analytics')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.ANALYTICS}`, version: '1' })
export class AdminMarketingController {
  constructor(private readonly marketing: MarketingService) {}

  @Get('marketing-spend')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Marketing spend per channel/month' })
  @ApiEnvelope(MarketingSpendDto, { isArray: true })
  listSpend(@Query() q: MarketingSpendQueryDto) {
    return this.marketing.listSpend(q);
  }

  @Put('marketing-spend')
  @Permissions('users:write')
  @ApiOperation({ summary: 'Upsert spend for a (channel, month)' })
  @ApiEnvelope(MarketingSpendDto)
  upsertSpend(@Body() dto: UpsertMarketingSpendDto) {
    return this.marketing.upsertSpend(dto);
  }

  @Delete('marketing-spend/:id')
  @Permissions('users:write')
  @ApiOperation({ summary: 'Delete a spend row' })
  @ApiEnvelope(DeletedDto)
  deleteSpend(@Param('id', ParseUUIDPipe) id: string) {
    return this.marketing.deleteSpend(id);
  }

  @Get('social-mentions/summary')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Community — External: mentions/week, sentiment split, viral moments, impressions, EMV, advocates, by platform' })
  @ApiEnvelope(SocialSummaryDto)
  socialSummary(@Query() q: SocialSummaryQueryDto) {
    return this.marketing.socialSummary(q);
  }

  @Get('social-mentions')
  @Permissions('users:read')
  @ApiOperation({ summary: 'List social mentions (paged, newest first)' })
  @ApiEnvelope(SocialMentionPageDto)
  listMentions(@Query() q: SocialMentionsQueryDto) {
    return this.marketing.listMentions(q);
  }

  @Post('social-mentions')
  @Permissions('users:write')
  @ApiOperation({ summary: 'Batch ingest mentions (≤ 500; upsert on platform + externalId)' })
  @ApiEnvelope(SocialIngestResultDto)
  ingestMentions(@Body() dto: IngestSocialMentionsDto) {
    return this.marketing.ingestMentions(dto);
  }

  @Patch('social-mentions/:id')
  @Permissions('users:write')
  @ApiOperation({ summary: 'Edit a mention (sentiment, viral flag, metrics…)' })
  @ApiEnvelope(SocialMentionDto)
  updateMention(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSocialMentionDto) {
    return this.marketing.updateMention(id, dto);
  }

  @Delete('social-mentions/:id')
  @Permissions('users:write')
  @ApiOperation({ summary: 'Delete a mention' })
  @ApiEnvelope(DeletedDto)
  deleteMention(@Param('id', ParseUUIDPipe) id: string) {
    return this.marketing.deleteMention(id);
  }
}
