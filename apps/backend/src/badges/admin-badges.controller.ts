import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { MessageResponseDto } from '@common/dto/message-response.dto';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../auth/decorators/account-type.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { BadgesService } from './badges.service';
import { BadgeDto, BadgeTriggerDto, CreateBadgeDto, UpdateBadgeDto } from './dto/badge.dto';

/** Admin badge management (the "Badge Management" screen). */
@ApiTags('Admin · Badges')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.BADGES}`, version: '1' })
export class AdminBadgesController {
  constructor(private readonly badges: BadgesService) {}

  @Get()
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'List all badges' })
  @ApiEnvelope(BadgeDto, { isArray: true })
  list() {
    return this.badges.adminList();
  }

  @Get('triggers')
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'Available badge triggers (metric catalog)' })
  @ApiEnvelope(BadgeTriggerDto, { isArray: true })
  triggers() {
    return this.badges.triggers();
  }

  @Post()
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Create a badge' })
  @ApiEnvelope(BadgeDto, { status: 201 })
  create(@CurrentUser('id') adminId: string, @Body() dto: CreateBadgeDto) {
    return this.badges.create(dto, adminId);
  }

  @Patch(':id')
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Update a badge (incl. activate/deactivate)' })
  @ApiEnvelope(BadgeDto)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBadgeDto) {
    return this.badges.update(id, dto);
  }

  @Delete(':id')
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Delete (soft) a badge' })
  @ApiEnvelope(MessageResponseDto)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.badges.remove(id);
  }
}
