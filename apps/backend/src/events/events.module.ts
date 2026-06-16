import { Module } from '@nestjs/common';
import { AdminEventsController } from './admin-events.controller';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

/**
 * Events module — the single client-telemetry ingestion seam. Customers/guests post batched
 * interaction events to POST /v1/events; admins read the stream via /v1/admin/events. The
 * EventRepository (centralized in DBModule) writes append-only into the partitioned
 * `app_events` table — today Postgres, swappable to a stream sink later with no API change.
 */
@Module({
  controllers: [EventsController, AdminEventsController],
  providers: [EventsService],
})
export class EventsModule {}
