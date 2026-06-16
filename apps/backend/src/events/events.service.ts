import { Injectable } from '@nestjs/common';
import { EventRepository, EventInput } from '@db/repositories/events/event.repository';
import { EventsQueryDto, IngestEventsDto } from './dto/event.dto';
import { EVENT_CATALOG_LIST, eventTypeOf } from './event-catalog';

/**
 * Events service — the single client-telemetry ingestion seam. Customers/guests post batched
 * interaction events (screen views, funnel steps, game/commerce signals); admins read the
 * stream + volume rollups. Fire-and-forget on the client; we ack with the accepted count.
 */
@Injectable()
export class EventsService {
  constructor(private readonly events: EventRepository) {}

  async ingest(userId: string | null, dto: IngestEventsDto): Promise<{ accepted: number }> {
    const rows: EventInput[] = dto.events.map((e) => ({
      // Category is resolved from the backend-owned catalog — never trusted from the client.
      eventType: eventTypeOf(e.eventName),
      eventName: e.eventName,
      ...(e.contentId ? { contentId: e.contentId } : {}),
      ...(e.sessionId ? { sessionId: e.sessionId } : {}),
      ...(e.properties ? { properties: e.properties } : {}),
      occurredAt: e.occurredAt,
    }));
    const accepted = await this.events.ingest(userId, dto.platform, rows);
    return { accepted };
  }

  /** The canonical event catalog (name → category) — lets non-SDK clients introspect valid events. */
  catalog() {
    return EVENT_CATALOG_LIST;
  }

  async recent(query: EventsQueryDto) {
    return this.events.recent({
      limit: query.limit,
      ...(query.eventName ? { eventName: query.eventName } : {}),
      ...(query.eventType ? { eventType: query.eventType } : {}),
    });
  }

  async top(hours: number) {
    return this.events.topByName(hours);
  }
}
