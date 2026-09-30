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

export interface HeartbeatResult {
  /** Session watch time after capping. */
  sessionWatchedSeconds: number;
  /** Seconds added to today's watch time by this heartbeat. */
  credited: number;
  /** Today's (UTC) total credited watch seconds. */
  dayWatchSeconds: number;
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

  /**
   * Open a viewing session — or reuse one. Returns the existing session when the same user has a
   * session for this content with the same client `sessionId`, or an unfinished one started in
   * the last `reuseMinutes`. A new session starts uncounted; see `recordHeartbeat`.
   */
  async startView(
    userId: string,
    contentId: string,
    opts: { sessionId?: string; device?: string; source?: string; reuseMinutes: number },
    tx?: DBExecutor,
  ): Promise<{ viewId: string; resumed: boolean }> {
    const run = async (db: DBExecutor) => {
      const existing = (await db.execute(sql`
        select id from content_views
         where user_id = ${userId} and content_id = ${contentId}
           and (${opts.sessionId ? sql`session_id = ${opts.sessionId} or ` : sql``}
                (not is_completed and started_at > now() - make_interval(mins => ${opts.reuseMinutes})))
         order by started_at desc
         limit 1`)) as unknown as { rows: Array<{ id: string }> };
      const hit = existing.rows[0];
      if (hit) {
        return { viewId: hit.id, resumed: true };
      }
      const rows = await db
        .insert(contentViews)
        .values({
          contentId,
          userId,
          ...(opts.sessionId ? { sessionId: opts.sessionId } : {}),
          ...(opts.device ? { device: opts.device } : {}),
          ...(opts.source ? { source: opts.source } : {}),
        })
        .returning({ id: contentViews.id });
      // Daily activity: +1 video started; +1 distinct content the first time it's opened today.
      await db.execute(sql`
        insert into user_daily_activity (user_id, activity_date, videos_started, contents_watched, first_seen_at, last_seen_at)
        values (${userId}, (now() at time zone 'UTC')::date, 1, 1, now(), null)
        on conflict (user_id, activity_date) do update set
          videos_started = user_daily_activity.videos_started + 1,
          contents_watched = user_daily_activity.contents_watched + case when exists (
            select 1 from content_views v
             where v.user_id = ${userId} and v.content_id = ${contentId} and v.id <> ${rows[0]!.id}
               and v.started_at >= date_trunc('day', now() at time zone 'UTC') at time zone 'UTC'
          ) then 0 else 1 end,
          first_seen_at = coalesce(user_daily_activity.first_seen_at, now())`);
      return { viewId: rows[0]!.id, resumed: false };
    };
    return tx ? run(tx) : this.dbService.transaction(run);
  }

  /**
   * Apply a heartbeat atomically:
   *  1. cap the claimed session watch time by wall-clock time since the session started (+5 s)
   *     and never let it go backwards;
   *  2. credit the delta to today's `user_daily_activity`, capped by the time since the user's
   *     last credited heartbeat (+2 s) so parallel sessions can't double-count;
   *  3. update the session (position, completion) and count it as a view once it reaches
   *     `countMinSeconds` of watch time AND of real elapsed time — unless the user already has a counted view of this content in the
   *     last `recountMinutes`;
   *  4. add the credit to `contents.total_watch_seconds` and the user's watch metrics (badges);
   *  5. save the resume point (latest position; completion is sticky).
   * Returns null when the session doesn't exist / isn't this user's / isn't this content.
   */
  async recordHeartbeat(
    input: {
      userId: string;
      contentId: string;
      viewId: string;
      watchedSeconds: number;
      positionSeconds: number;
      completionPercent: number;
      completed: boolean;
      countMinSeconds: number;
      recountMinutes: number;
    },
  ): Promise<HeartbeatResult | null> {
    const { userId, contentId, viewId } = input;
    return this.dbService.transaction(async (db) => {
      const sessRes = (await db.execute(sql`
        select watched_seconds as "watchedSeconds", counted, is_completed as "isCompleted",
               floor(extract(epoch from (now() - started_at)))::int as "elapsed"
          from content_views
         where id = ${viewId} and user_id = ${userId} and content_id = ${contentId}
         for update`)) as unknown as {
        rows: Array<{ watchedSeconds: number; counted: boolean; isCompleted: boolean; elapsed: number }>;
      };
      const sess = sessRes.rows[0];
      if (!sess) {
        return null;
      }
      const capped = Math.min(input.watchedSeconds, Number(sess.elapsed) + 5);
      const newWatched = Math.max(Number(sess.watchedSeconds), capped);
      const sessionDelta = newWatched - Number(sess.watchedSeconds);
      const newlyCompleted = input.completed && !sess.isCompleted;

      // Daily credit (row locked by the upsert).
      const dayRes = (await db.execute(sql`
        with prev as (
          select last_seen_at from user_daily_activity
           where user_id = ${userId} and activity_date = (now() at time zone 'UTC')::date
           for update
        ), credit as (
          select greatest(0, least(${sessionDelta}::int,
                   coalesce((select floor(extract(epoch from (now() - last_seen_at)))::int + 2 from prev), ${sessionDelta}::int)
                 )) as c
        )
        insert into user_daily_activity (user_id, activity_date, watch_seconds, videos_completed, first_seen_at, last_seen_at)
        values (${userId}, (now() at time zone 'UTC')::date, (select c from credit), ${newlyCompleted ? 1 : 0}, now(), now())
        on conflict (user_id, activity_date) do update set
          watch_seconds = user_daily_activity.watch_seconds + (select c from credit),
          videos_completed = user_daily_activity.videos_completed + ${newlyCompleted ? 1 : 0},
          first_seen_at = coalesce(user_daily_activity.first_seen_at, now()),
          last_seen_at = now()
        returning watch_seconds as "dayWatchSeconds", (select c from credit) as credited`)) as unknown as {
        rows: Array<{ dayWatchSeconds: string | number; credited: string | number }>;
      };
      const credited = Number(dayRes.rows[0]?.credited ?? 0);
      const dayWatchSeconds = Number(dayRes.rows[0]?.dayWatchSeconds ?? 0);

      // Real time must have passed too — the +5 s tolerance alone must not count a view.
      const shouldCount = !sess.counted && newWatched >= input.countMinSeconds && Number(sess.elapsed) >= input.countMinSeconds;
      await db.execute(sql`
        update content_views set
          watched_seconds = ${newWatched},
          max_position_seconds = greatest(max_position_seconds, ${input.positionSeconds}),
          completion_percent = ${input.completionPercent.toFixed(2)},
          is_completed = is_completed or ${input.completed},
          last_heartbeat_at = now()
          ${shouldCount
            ? sql`, counted = not exists (
                select 1 from content_views v
                 where v.user_id = ${userId} and v.content_id = ${contentId} and v.counted and v.id <> ${viewId}
                   and v.counted_at > now() - make_interval(mins => ${input.recountMinutes})),
                counted_at = now()`
            : sql``}
        where id = ${viewId}`);

      if (credited > 0) {
        await db.execute(sql`update contents set total_watch_seconds = total_watch_seconds + ${credited} where id = ${contentId}`);
        await db.execute(sql`
          with secs as (
            insert into user_metrics (user_id, metric_key, value) values (${userId}, 'total_watch_seconds', ${credited})
            on conflict (user_id, metric_key) do update set value = user_metrics.value + excluded.value, updated_at = now()
            returning value
          )
          insert into user_metrics (user_id, metric_key, value)
          select ${userId}, 'total_watch_minutes', value / 60 from secs
          on conflict (user_id, metric_key) do update set value = excluded.value, updated_at = now()
            where user_metrics.value <> excluded.value`);
      }

      // Resume point: latest position; completion sticky.
      await db
        .insert(contentProgress)
        .values({ userId, contentId, lastPositionSeconds: input.positionSeconds, isCompleted: input.completed })
        .onConflictDoUpdate({
          target: [contentProgress.userId, contentProgress.contentId],
          set: {
            lastPositionSeconds: input.positionSeconds,
            isCompleted: sql`${contentProgress.isCompleted} or ${input.completed}`,
            updatedAt: sql`now()`,
          },
        });

      return { sessionWatchedSeconds: newWatched, credited, dayWatchSeconds };
    });
  }

  /** Today's (UTC) credited watch seconds for a user. */
  async todayWatchSeconds(userId: string, tx?: DBExecutor): Promise<number> {
    const res = (await this.exec(tx).execute(sql`
      select watch_seconds from user_daily_activity
       where user_id = ${userId} and activity_date = (now() at time zone 'UTC')::date`)) as unknown as {
      rows: Array<{ watch_seconds: string | number }>;
    };
    return Number(res.rows[0]?.watch_seconds ?? 0);
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
