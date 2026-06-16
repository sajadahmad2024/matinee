import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../auth/decorators/account-type.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { NotificationAdminService } from './notification-admin.service';
import { CampaignActionResultDto, CampaignDto, CampaignsQueryDto, CreateCampaignDto } from './dto/campaign.dto';

/** Admin notification authoring — broadcast/push + campaigns. */
@ApiTags('Admin · Notifications')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.NOTIFICATIONS}`, version: '1' })
export class AdminNotificationController {
  constructor(private readonly admin: NotificationAdminService) {}

  @Post('broadcast')
  @HttpCode(HttpStatus.OK)
  @Permissions('users:write')
  @ApiOperation({ summary: 'Compose + send a notification now (to all / segment / selected)' })
  @ApiEnvelope(CampaignActionResultDto)
  broadcast(@CurrentUser('id') adminId: string, @Body() dto: CreateCampaignDto) {
    return this.admin.broadcast(dto, adminId);
  }

  @Get('campaigns')
  @Permissions('users:read')
  @ApiOperation({ summary: 'List notification campaigns' })
  @ApiPaginatedEnvelope(CampaignDto)
  list(@Query() query: CampaignsQueryDto) {
    return this.admin.list(query.page, query.limit, query.status);
  }

  @Post('campaigns')
  @Permissions('users:write')
  @ApiOperation({ summary: 'Create a campaign (draft, or scheduled if scheduledAt set)' })
  @ApiEnvelope(CampaignDto, { status: 201 })
  create(@CurrentUser('id') adminId: string, @Body() dto: CreateCampaignDto) {
    return this.admin.createCampaign(dto, adminId);
  }

  @Get('campaigns/:id')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Campaign detail' })
  @ApiEnvelope(CampaignDto)
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.admin.get(id);
  }

  @Post('campaigns/:id/send')
  @HttpCode(HttpStatus.OK)
  @Permissions('users:write')
  @ApiOperation({ summary: 'Send a draft/scheduled campaign now (fan-out to inboxes)' })
  @ApiEnvelope(CampaignActionResultDto)
  send(@Param('id', ParseUUIDPipe) id: string) {
    return this.admin.send(id);
  }

  @Post('campaigns/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @Permissions('users:write')
  @ApiOperation({ summary: 'Cancel a draft/scheduled campaign' })
  @ApiEnvelope(CampaignActionResultDto)
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.admin.cancel(id);
  }
}
