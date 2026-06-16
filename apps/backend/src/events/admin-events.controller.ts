import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../auth/decorators/account-type.decorator';
import { EventRecordDto, EventsQueryDto, EventVolumeDto } from './dto/event.dto';
import { EventsService } from './events.service';

/** Admin read views over the telemetry stream — recent feed + volume rollup. */
@ApiTags('Admin · Events')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.EVENTS}`, version: '1' })
export class AdminEventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Recent telemetry events (last 7 days), optionally filtered' })
  @ApiEnvelope(EventRecordDto, { isArray: true })
  recent(@Query() query: EventsQueryDto) {
    return this.events.recent(query);
  }

  @Get('top')
  @ApiOperation({ summary: 'Event volume by name over a window (default 24h)' })
  @ApiEnvelope(EventVolumeDto, { isArray: true })
  top(@Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number) {
    return this.events.top(hours);
  }
}
