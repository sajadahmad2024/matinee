import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { sql } from 'drizzle-orm';

export interface ShareRecordResult {
  id: string;
  /** false when this user already shared this content to this channel today (deduped). */
  created: boolean;
}

/**
 * Content shares. One row per (content, user, channel, UTC day) — enforced by the
 * `uq_content_shares_daily` unique index (0023). A repeat share the same day returns the
 * existing row instead of inserting, so `share_count` (maintained by the `share_counts`
 * trigger) and the "shared_content" earning seam can't be inflated by repeated taps.
 */
@Injectable()
export class ShareRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  async record(userId: string, contentId: string, channel: string | undefined, tx?: DBExecutor, retried = false): Promise<ShareRecordResult> {
    const db = this.exec(tx);
    const ch = channel ?? null;
    const inserted = (await db.execute(sql`
      insert into content_shares (content_id, user_id, channel)
      values (${contentId}, ${userId}, ${ch})
      on conflict (content_id, user_id, (coalesce(channel, '')), share_date) do nothing
      returning id`)) as unknown as { rows: Array<{ id: string }> };
    const created = inserted.rows[0];
    if (created) {
      return { id: created.id, created: true };
    }
    const existing = (await db.execute(sql`
      select id from content_shares
      where content_id = ${contentId} and user_id = ${userId} and coalesce(channel, '') = coalesce(${ch}::varchar, '')
        and share_date = (now() at time zone 'UTC')::date
      order by created_at limit 1`)) as unknown as { rows: Array<{ id: string }> };
    const row = existing.rows[0];
    if (!row) {
      // Raced with a UTC-midnight rollover or a concurrent delete — retry once as a fresh share.
      if (!retried) {
        return this.record(userId, contentId, channel, tx, true);
      }
      throw new Error('share dedupe: conflicting row not found');
    }
    return { id: row.id, created: false };
  }
}
