import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../auth/decorators/account-type.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ActorContext, ModerationService } from './moderation.service';
import {
  AddTicketNoteDto,
  AssignTicketDto,
  AuditEntryDto,
  AuditQueryDto,
  BulkResultDto,
  BulkTicketsDto,
  ModerationStatsDto,
  ResolveTicketDto,
  TicketAssignedDto,
  TicketDetailDto,
  TicketDto,
  TicketNoteDto,
  TicketResolvedDto,
  TicketsQueryDto,
  TicketStatusDto,
  UpdateTicketStatusDto,
} from './dto/moderation.dto';

const actor = (adminId: string, ip: string | undefined, userAgent: string | undefined): ActorContext => ({ adminId, ip, userAgent });

/** Admin content/user moderation — the ticket queue, resolution, bulk actions, notes, audit. */
@ApiTags('Admin · Moderation')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.MODERATION}`, version: '1' })
export class AdminModerationController {
  constructor(private readonly moderation: ModerationService) {}

  @Get('tickets')
  @Permissions('users:moderate')
  @ApiOperation({ summary: 'Moderation queue (filter status / severity / category / type / assignee / search / dates)' })
  @ApiPaginatedEnvelope(TicketDto)
  tickets(@CurrentUser('id') adminId: string, @Query() query: TicketsQueryDto) {
    return this.moderation.list(query, adminId);
  }

  @Get('stats')
  @Permissions('users:moderate')
  @ApiOperation({ summary: 'Dashboard analytics: backlog, avg resolution, safety score, resolved today, 24h volume, violations' })
  @ApiEnvelope(ModerationStatsDto)
  stats() {
    return this.moderation.stats();
  }

  @Get('audit')
  @Permissions('users:moderate')
  @ApiOperation({ summary: 'Moderation audit feed (filter by ticket / actor)' })
  @ApiPaginatedEnvelope(AuditEntryDto)
  audit(@Query() query: AuditQueryDto) {
    return this.moderation.auditLog(query);
  }

  @Post('tickets/bulk')
  @HttpCode(HttpStatus.OK)
  @Permissions('users:moderate')
  @ApiOperation({ summary: 'Bulk dismiss / resolve / assign / escalate (per-item results)' })
  @ApiEnvelope(BulkResultDto)
  bulk(@CurrentUser('id') adminId: string, @Ip() ip: string, @Headers('user-agent') ua: string | undefined, @Body() dto: BulkTicketsDto) {
    return this.moderation.bulk(dto, actor(adminId, ip, ua));
  }

  @Get('tickets/:id')
  @Permissions('users:moderate')
  @ApiOperation({ summary: 'Ticket detail + evidence (reports, subject, offender history, notes, activity)' })
  @ApiEnvelope(TicketDetailDto)
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.moderation.detail(id);
  }

  @Post('tickets/:id/assign')
  @HttpCode(HttpStatus.OK)
  @Permissions('users:moderate')
  @ApiOperation({ summary: 'Assign the ticket (default: to me) → in review' })
  @ApiEnvelope(TicketAssignedDto)
  assign(@CurrentUser('id') adminId: string, @Ip() ip: string, @Headers('user-agent') ua: string | undefined, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignTicketDto) {
    return this.moderation.assign(id, actor(adminId, ip, ua), dto.assigneeId);
  }

  @Patch('tickets/:id/status')
  @Permissions('users:moderate')
  @ApiOperation({ summary: 'Update ticket status (in_review / escalated / open) with an optional note' })
  @ApiEnvelope(TicketStatusDto)
  status(@CurrentUser('id') adminId: string, @Ip() ip: string, @Headers('user-agent') ua: string | undefined, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTicketStatusDto) {
    return this.moderation.setStatus(id, dto.status, actor(adminId, ip, ua), dto.note);
  }

  @Post('tickets/:id/notes')
  @Permissions('users:moderate')
  @ApiOperation({ summary: 'Add an internal moderator note' })
  @ApiEnvelope(TicketNoteDto, { status: 201 })
  addNote(@CurrentUser('id') adminId: string, @Ip() ip: string, @Headers('user-agent') ua: string | undefined, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AddTicketNoteDto) {
    return this.moderation.addNote(id, actor(adminId, ip, ua), dto.body);
  }

  @Post('tickets/:id/resolve')
  @HttpCode(HttpStatus.OK)
  @Permissions('users:moderate')
  @ApiOperation({ summary: 'Resolve — applies the action (remove content / warn / suspend for a duration / ban)' })
  @ApiEnvelope(TicketResolvedDto)
  resolve(@CurrentUser('id') adminId: string, @Ip() ip: string, @Headers('user-agent') ua: string | undefined, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ResolveTicketDto) {
    return this.moderation.resolve(id, dto, actor(adminId, ip, ua));
  }
}
