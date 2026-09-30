import { RouteNames } from '@common/route-names';
import { MessageResponseDto } from '@common/dto/message-response.dto';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../auth/decorators/account-type.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { AdSalesService } from './ad-sales.service';
import {
  AdvertiserDto,
  AdvertiserQueryDto,
  AdWindowRegionQueryDto,
  AttachContentsDto,
  CampaignDto,
  CampaignEndDto,
  CampaignQueryDto,
  CreateAdvertiserDto,
  CreateCampaignDto,
  CreateLedgerEntryDto,
  InventoryQueryDto,
  LedgerEntryDto,
  LedgerQueryDto,
  StatementQueryDto,
  UpdateAdvertiserDto,
  UpdateCampaignDto,
} from './dto/ad-sales.dto';

/**
 * Ad Sales home (platform-level): advertisers, campaigns (feed commercials + sponsorship groups),
 * the ad-sales ledger, summary and inventory. Doc: docs/backend/ads/ad-sales-management.md
 */
@ApiTags('Admin · Ad Sales')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.ADS}`, version: '1' })
export class AdminAdSalesController {
  constructor(private readonly sales: AdSalesService) {}

  // ─── Home ───────────────────────────────────────────────────────────────────
  @Get('summary')
  @Permissions('ads:read')
  @ApiOperation({ summary: 'Ad Sales home: revenue, delivery (commercial vs sponsorship), fill rate, top advertisers' })
  summary(@Query() q: AdWindowRegionQueryDto) {
    return this.sales.summary(q);
  }

  @Get('inventory')
  @Permissions('ads:read')
  @ApiOperation({ summary: 'Sellable inventory: daily views, projected slots, top most-viewed titles' })
  inventory(@Query() q: InventoryQueryDto) {
    return this.sales.inventory(q);
  }

  // ─── Advertisers ────────────────────────────────────────────────────────────
  @Get('advertisers')
  @Permissions('ads:read')
  @ApiOperation({ summary: 'Advertiser directory (search, status; campaign counts + ledger totals)' })
  @ApiPaginatedEnvelope(AdvertiserDto)
  listAdvertisers(@Query() q: AdvertiserQueryDto) {
    return this.sales.listAdvertisers(q);
  }

  @Post('advertisers')
  @Permissions('ads:write')
  @ApiOperation({ summary: 'Create advertiser' })
  @ApiEnvelope(AdvertiserDto, { status: 201 })
  createAdvertiser(@CurrentUser('id') adminId: string, @Body() dto: CreateAdvertiserDto) {
    return this.sales.createAdvertiser(adminId, dto);
  }

  @Get('advertisers/:id')
  @Permissions('ads:read')
  @ApiOperation({ summary: 'Advertiser detail: totals + campaigns' })
  getAdvertiser(@Param('id', ParseUUIDPipe) id: string) {
    return this.sales.getAdvertiser(id);
  }

  @Patch('advertisers/:id')
  @Permissions('ads:write')
  @ApiOperation({ summary: 'Update advertiser' })
  @ApiEnvelope(AdvertiserDto)
  updateAdvertiser(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAdvertiserDto) {
    return this.sales.updateAdvertiser(id, dto);
  }

  @Delete('advertisers/:id')
  @Permissions('ads:write')
  @ApiOperation({ summary: 'Archive advertiser (no running campaigns)' })
  @ApiEnvelope(MessageResponseDto)
  removeAdvertiser(@Param('id', ParseUUIDPipe) id: string) {
    return this.sales.removeAdvertiser(id);
  }

  @Get('advertisers/:id/statement')
  @Permissions('ads:read')
  @ApiOperation({ summary: 'Account statement: opening balance, entries, closing balance' })
  statement(@Param('id', ParseUUIDPipe) id: string, @Query() q: StatementQueryDto) {
    return this.sales.statement(id, q);
  }

  // ─── Campaigns ──────────────────────────────────────────────────────────────
  @Get('campaigns')
  @Permissions('ads:read')
  @ApiOperation({ summary: 'Campaigns (advertiser, type, status, region, flight window, search) with delivery' })
  @ApiPaginatedEnvelope(CampaignDto)
  listCampaigns(@Query() q: CampaignQueryDto) {
    return this.sales.listCampaigns(q);
  }

  @Post('campaigns')
  @Permissions('ads:write')
  @ApiOperation({ summary: 'Create campaign (draft) — commercial (feed spot) or sponsorship (video group)' })
  @ApiEnvelope(CampaignDto, { status: 201 })
  createCampaign(@CurrentUser('id') adminId: string, @Body() dto: CreateCampaignDto) {
    return this.sales.createCampaign(adminId, dto);
  }

  @Get('campaigns/:id')
  @Permissions('ads:read')
  @ApiOperation({ summary: 'Campaign detail: delivery, linked videos, ledger totals' })
  getCampaign(@Param('id', ParseUUIDPipe) id: string) {
    return this.sales.getCampaign(id);
  }

  @Patch('campaigns/:id')
  @Permissions('ads:write')
  @ApiOperation({ summary: 'Update campaign (not ended)' })
  @ApiEnvelope(CampaignDto)
  updateCampaign(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCampaignDto) {
    return this.sales.updateCampaign(id, dto);
  }

  @Delete('campaigns/:id')
  @Permissions('ads:write')
  @ApiOperation({ summary: 'Delete campaign (draft / paused / ended)' })
  @ApiEnvelope(MessageResponseDto)
  removeCampaign(@Param('id', ParseUUIDPipe) id: string) {
    return this.sales.removeCampaign(id);
  }

  @Post('campaigns/:id/activate')
  @Permissions('ads:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate (or schedule if the flight starts later); books a flat fee once' })
  @ApiEnvelope(CampaignDto)
  activate(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.sales.activateCampaign(adminId, id);
  }

  @Post('campaigns/:id/pause')
  @Permissions('ads:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause an active / scheduled campaign' })
  @ApiEnvelope(CampaignDto)
  pause(@Param('id', ParseUUIDPipe) id: string) {
    return this.sales.pauseCampaign(id);
  }

  @Post('campaigns/:id/resume')
  @Permissions('ads:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume a paused campaign' })
  @ApiEnvelope(CampaignDto)
  resume(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.sales.resumeCampaign(adminId, id);
  }

  @Post('campaigns/:id/end')
  @Permissions('ads:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End a campaign now' })
  @ApiEnvelope(CampaignDto)
  end(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CampaignEndDto) {
    return this.sales.endCampaign(id, dto.reason);
  }

  @Put('campaigns/:id/contents')
  @Permissions('ads:write')
  @ApiOperation({ summary: "Sponsorship campaign: set the videos whose active sponsorship belongs to it (full set)" })
  attachContents(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AttachContentsDto) {
    return this.sales.attachContents(id, dto);
  }

  @Get('campaigns/:id/performance')
  @Permissions('ads:read')
  @ApiOperation({ summary: 'Campaign performance: window totals, lifetime, pacing, daily series' })
  campaignPerformance(@Param('id', ParseUUIDPipe) id: string, @Query() q: AdWindowRegionQueryDto) {
    return this.sales.campaignPerformance(id, q);
  }

  // ─── Ledger ─────────────────────────────────────────────────────────────────
  @Get('ledger')
  @Permissions('ads:read')
  @ApiOperation({ summary: 'Ad-sales ledger entries (+ totals for the filter)' })
  @ApiPaginatedEnvelope(LedgerEntryDto)
  ledger(@Query() q: LedgerQueryDto) {
    return this.sales.listLedger(q);
  }

  @Post('ledger')
  @Permissions('ads:write')
  @ApiOperation({ summary: 'Record a booking, invoice, payment or credit' })
  @ApiEnvelope(LedgerEntryDto, { status: 201 })
  createLedger(@CurrentUser('id') adminId: string, @Body() dto: CreateLedgerEntryDto) {
    return this.sales.createLedgerEntry(adminId, dto);
  }
}
