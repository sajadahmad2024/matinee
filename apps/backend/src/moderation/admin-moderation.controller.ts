import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../auth/decorators/account-type.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ModerationService } from './moderation.service';
import {
  ModerationStatsDto,
  ResolveTicketDto,
  TicketAssignedDto,
  TicketDetailDto,
  TicketDto,
  TicketResolvedDto,
  TicketsQueryDto,
  TicketStatusDto,
  UpdateTicketStatusDto,
} from './dto/moderation.dto';

/** Admin content/user moderation — the ticket queue + resolution. */
@ApiTags('Admin · Moderation')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.MODERATION}`, version: '1' })
export class AdminModerationController {
  constructor(private readonly moderation: ModerationService) {}

  @Get('tickets')
  @Permissions('users:moderate')
  @ApiOperation({ summary: 'Moderation queue (filter status / severity / category)' })
  @ApiPaginatedEnvelope(TicketDto)
  tickets(@Query() query: TicketsQueryDto) {
    return this.moderation.list(query);
  }

  @Get('stats')
  @Permissions('users:moderate')
  @ApiOperation({ summary: 'Ticket counts by status' })
  @ApiEnvelope(ModerationStatsDto)
  stats() {
    return this.moderation.stats();
  }

  @Get('tickets/:id')
  @Permissions('users:moderate')
  @ApiOperation({ summary: 'Ticket detail + evidence (reports + snapshot)' })
  @ApiEnvelope(TicketDetailDto)
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.moderation.detail(id);
  }

  @Post('tickets/:id/assign')
  @HttpCode(HttpStatus.OK)
  @Permissions('users:moderate')
  @ApiOperation({ summary: 'Assign the ticket to me (→ in review)' })
  @ApiEnvelope(TicketAssignedDto)
  assign(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.moderation.assign(id, adminId);
  }

  @Patch('tickets/:id/status')
  @Permissions('users:moderate')
  @ApiOperation({ summary: 'Update ticket status (in_review / escalated / open)' })
  @ApiEnvelope(TicketStatusDto)
  status(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTicketStatusDto) {
    return this.moderation.setStatus(id, dto.status);
  }

  @Post('tickets/:id/resolve')
  @HttpCode(HttpStatus.OK)
  @Permissions('users:moderate')
  @ApiOperation({ summary: 'Resolve — applies the action (remove content / warn / suspend / ban)' })
  @ApiEnvelope(TicketResolvedDto)
  resolve(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ResolveTicketDto) {
    return this.moderation.resolve(id, dto, adminId);
  }
}
