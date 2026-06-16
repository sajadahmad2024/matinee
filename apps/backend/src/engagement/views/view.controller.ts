import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOrGuest } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ViewService } from './view.service';
import {
  HeartbeatDto,
  IngestResultDto,
  IngestWatchEventsDto,
  ProgressResponseDto,
  StartViewDto,
  ViewStartedDto,
} from './dto/view.dto';

/**
 * Watch tracking: view sessions, resume progress, and watch-event ingestion.
 * CustomerOrGuest — guests watch the feed too, so their sessions/analytics count.
 */
@ApiTags('Engagement · Views')
@ApiBearerAuth()
@CustomerOrGuest()
@Controller({ path: RouteNames.CONTENT, version: '1' })
export class ViewController {
  constructor(private readonly views: ViewService) {}

  @Post(':id/views')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start a viewing session (bumps view count)' })
  @ApiEnvelope(ViewStartedDto)
  start(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: StartViewDto) {
    return this.views.start(userId, id, dto);
  }

  @Patch(':id/views/:viewId')
  @ApiOperation({ summary: 'Heartbeat — update watch metrics + resume point' })
  @ApiEnvelope(ProgressResponseDto)
  heartbeat(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('viewId', ParseUUIDPipe) viewId: string,
    @Body() dto: HeartbeatDto,
  ) {
    return this.views.heartbeat(userId, id, viewId, dto);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'My resume point for a content' })
  @ApiEnvelope(ProgressResponseDto)
  progress(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.views.progress(userId, id);
  }

  @Post(':id/watch-events')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ingest a batch of watch events (play/pause/seek/heartbeat/complete)' })
  @ApiEnvelope(IngestResultDto)
  ingest(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: IngestWatchEventsDto) {
    return this.views.ingest(userId, id, dto);
  }
}
