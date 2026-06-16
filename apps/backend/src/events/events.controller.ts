import { RouteNames } from '@common/route-names';
import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOrGuest } from '../auth/decorators/account-type.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EventCatalogItemDto, IngestEventsDto } from './dto/event.dto';
import { EventsService } from './events.service';

/** Client telemetry ingestion — customers and guests post batched interaction events. */
@ApiTags('Events')
@ApiBearerAuth()
@CustomerOrGuest()
@Controller({ path: RouteNames.EVENTS, version: '1' })
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get('catalog')
  @ApiOperation({ summary: 'The canonical event catalog (every valid event name + its category)' })
  @ApiOkResponse({ type: EventCatalogItemDto, isArray: true })
  catalog() {
    return this.events.catalog();
  }

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Ingest a batch of client interaction events (fire-and-forget)' })
  @ApiOkResponse({ schema: { properties: { accepted: { type: 'number' } } } })
  ingest(@CurrentUser('id') userId: string | undefined, @Body() dto: IngestEventsDto) {
    return this.events.ingest(userId ?? null, dto);
  }
}
