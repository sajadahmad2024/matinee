import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { sql } from 'drizzle-orm';

export interface EventInput {
  eventType: string;
  eventName: string;
  contentId?: string;
  sessionId?: string;
  properties?: Record<string, unknown>;
  occurredAt: string;
}

export interface EventRow {
  [k: string]: unknown;
}
type Row = EventRow;
function rows(res: unknown): Row[] {
  return (res as { rows: Row[] }).rows;
}

/**
 * App-events ingestion + read. Append-only into the partitioned parent `app_events`
 * (raw SQL — same routing pattern as content_watch_events). The single analytics seam.
 */
@Injectable()
export class EventRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Batch-insert events for a user (userId null for anonymous). Returns count accepted. */
  async ingest(userId: string | null, platform: string | undefined, events: EventInput[], tx?: DBExecutor): Promise<number> {
    if (events.length === 0) {
      return 0;
    }
    const values = events.map(
      (e) =>
        sql`(${userId}, ${e.sessionId ?? null}, ${e.eventType}, ${e.eventName}, ${e.contentId ?? null}, ${JSON.stringify(e.properties ?? {})}::jsonb, ${platform ?? null}, ${e.occurredAt})`,
    );
    await this.exec(tx).execute(
      sql`insert into app_events (user_id, session_id, event_type, event_name, content_id, properties, platform, occurred_at) values ${sql.join(values, sql`, `)}`,
    );
    return events.length;
  }

  /** Admin: recent events (optionally filtered by name/type), newest first. */
  async recent(opts: { limit: number; eventName?: string; eventType?: string }, tx?: DBExecutor): Promise<Row[]> {
    const filters = [sql`occurred_at > now() - interval '7 days'`];
    if (opts.eventName) {
      filters.push(sql`event_name = ${opts.eventName}`);
    }
    if (opts.eventType) {
      filters.push(sql`event_type = ${opts.eventType}`);
    }
    const where = sql.join(filters, sql` and `);
    const res = await this.exec(tx).execute(sql`
      select id, user_id as "userId", event_type as "eventType", event_name as "eventName", content_id as "contentId", properties, platform, occurred_at as "occurredAt"
      from app_events where ${where} order by occurred_at desc limit ${opts.limit}`);
    return rows(res);
  }

  /** Admin: event volume by name over a window (top events). */
  async topByName(hours: number, tx?: DBExecutor): Promise<Row[]> {
    const res = await this.exec(tx).execute(sql`
      select event_type as "eventType", event_name as "eventName", count(*)::int as count
      from app_events where occurred_at > now() - (${hours} * interval '1 hour')
      group by event_type, event_name order by count desc limit 50`);
    return rows(res);
  }
}
