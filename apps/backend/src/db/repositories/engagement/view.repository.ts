import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { contentViews, contentProgress } from '@db/drizzle/schema';
import { and, eq, sql } from 'drizzle-orm';

export type WatchEventType = 'play' | 'pause' | 'seek' | 'heartbeat' | 'complete';

export interface WatchEventInput {
  type: WatchEventType;
  positionSeconds: number;
  occurredAt: string;
}

export interface ProgressRecord {
  lastPositionSeconds: number;
  isCompleted: boolean;
  updatedAt: string;
}

@Injectable()
export class ViewRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Open a viewing session. The `view_counts` trigger bumps view_count + unique_viewer_count. */
  async startView(
    userId: string,
    contentId: string,
    opts: { sessionId?: string; device?: string },
    tx?: DBExecutor,
  ): Promise<string> {
    const rows = await this.exec(tx)
      .insert(contentViews)
      .values({
        contentId,
        userId,
        ...(opts.sessionId ? { sessionId: opts.sessionId } : {}),
        ...(opts.device ? { device: opts.device } : {}),
      })
      .returning({ id: contentViews.id });
    return rows[0]!.id;
  }

  /** Update a session's watch metrics (ownership-scoped). max_position only ever grows. */
  async updateView(
    userId: string,
    viewId: string,
    data: { watchedSeconds: number; positionSeconds: number; completionPercent: number; isCompleted: boolean },
    tx?: DBExecutor,
  ): Promise<boolean> {
    const rows = await this.exec(tx)
      .update(contentViews)
      .set({
        watchedSeconds: data.watchedSeconds,
        maxPositionSeconds: sql`greatest(${contentViews.maxPositionSeconds}, ${data.positionSeconds})`,
        completionPercent: data.completionPercent.toFixed(2),
        isCompleted: data.isCompleted,
        lastHeartbeatAt: sql`now()`,
      })
      .where(and(eq(contentViews.id, viewId), eq(contentViews.userId, userId)))
      .returning({ id: contentViews.id });
    return rows.length > 0;
  }

  /** Resume point — upserted on every heartbeat. position never regresses. */
  async upsertProgress(
    userId: string,
    contentId: string,
    lastPositionSeconds: number,
    isCompleted: boolean,
    tx?: DBExecutor,
  ): Promise<void> {
    await this.exec(tx)
      .insert(contentProgress)
      .values({ userId, contentId, lastPositionSeconds, isCompleted })
      .onConflictDoUpdate({
        target: [contentProgress.userId, contentProgress.contentId],
        set: {
          lastPositionSeconds: sql`greatest(${contentProgress.lastPositionSeconds}, ${lastPositionSeconds})`,
          isCompleted: sql`${contentProgress.isCompleted} or ${isCompleted}`,
          updatedAt: sql`now()`,
        },
      });
  }

  async getProgress(userId: string, contentId: string, tx?: DBExecutor): Promise<ProgressRecord | null> {
    const rows = await this.exec(tx)
      .select({
        lastPositionSeconds: contentProgress.lastPositionSeconds,
        isCompleted: contentProgress.isCompleted,
        updatedAt: contentProgress.updatedAt,
      })
      .from(contentProgress)
      .where(and(eq(contentProgress.userId, userId), eq(contentProgress.contentId, contentId)))
      .limit(1);
    return rows[0] ?? null;
  }

  /**
   * Append watch events. Inserts into the PARTITIONED PARENT `content_watch_events` (raw SQL —
   * Drizzle only models the default partition) so Postgres routes each row by occurred_at.
   */
  async appendWatchEvents(
    userId: string,
    contentId: string,
    viewId: string | undefined,
    events: WatchEventInput[],
    tx?: DBExecutor,
  ): Promise<number> {
    if (events.length === 0) {
      return 0;
    }
    const rows = events.map(
      (e) =>
        sql`(${contentId}, ${userId}, ${viewId ?? null}, ${e.type}, ${e.positionSeconds}, ${e.occurredAt})`,
    );
    await this.exec(tx).execute(
      sql`insert into content_watch_events (content_id, user_id, view_id, event_type, position_seconds, occurred_at) values ${sql.join(rows, sql`, `)}`,
    );
    return events.length;
  }
}
