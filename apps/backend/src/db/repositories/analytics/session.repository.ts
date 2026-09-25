import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { sql, type SQL } from 'drizzle-orm';

/** One folded client session delta (mirrors events/session-fold.ts SessionDelta). */
export interface SessionUpsert {
  clientSessionId: string;
  startedAt: string;
  lastEventAt: string;
  ended: boolean;
  foregrounds: number;
  backgrounds: number;
  videos: number;
  actions: number;
  gamified: boolean;
}

/** Hard cap on a derived session's length (guards against skewed client clocks). */
export const MAX_SESSION_SECONDS = 6 * 60 * 60;

/**
 * `user_sessions` writer. Sessions are derived from POST /v1/events batches: one row per
 * (user, client session id), accumulated across batches with an idempotent-shape upsert.
 */
@Injectable()
export class SessionRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** The user's country (sessions are stamped with it at creation). */
  async userCountry(userId: string, tx?: DBExecutor): Promise<string | null> {
    const res = (await this.exec(tx).execute(sql`select country_code from users where id = ${userId}`)) as unknown as {
      rows: Array<{ country_code: string | null }>;
    };
    return res.rows[0]?.country_code ?? null;
  }

  async upsertFromEvents(
    userId: string,
    meta: { platform: string | null; countryCode: string | null; region: string | null },
    sessions: readonly SessionUpsert[],
    tx?: DBExecutor,
  ): Promise<number> {
    if (sessions.length === 0) {
      return 0;
    }
    const values = sessions.map(
      (s) => sql`(${s.clientSessionId}::varchar, ${s.startedAt}::timestamptz, ${s.lastEventAt}::timestamptz, ${s.ended}::boolean,
        ${s.foregrounds}::int, ${s.backgrounds}::int, ${s.videos}::int, ${s.actions}::int, ${s.gamified}::boolean)`,
    );
    const dur = (start: SQL, end: SQL) =>
      sql`least(${MAX_SESSION_SECONDS}, greatest(0, floor(extract(epoch from (${end} - ${start})))))::int`;
    await this.exec(tx).execute(sql`
      insert into user_sessions (user_id, client_session_id, started_at, last_event_at, ended_at, duration_seconds,
        foreground_count, background_count, videos_viewed, engagement_actions, is_gamified, platform, country_code, region)
      select ${userId}, v.sid, v.st, v.le, case when v.ended then v.le end, ${dur(sql`v.st`, sql`v.le`)},
        1 + v.fg, v.bg, v.vids, v.acts, v.gam, ${meta.platform}, ${meta.countryCode}, ${meta.region}
      from (values ${sql.join(values, sql`, `)}) as v(sid, st, le, ended, fg, bg, vids, acts, gam)
      on conflict (user_id, client_session_id) where client_session_id is not null do update set
        started_at = least(user_sessions.started_at, excluded.started_at),
        last_event_at = greatest(coalesce(user_sessions.last_event_at, excluded.last_event_at), excluded.last_event_at),
        ended_at = case when excluded.ended_at is not null
                        then greatest(coalesce(user_sessions.ended_at, excluded.ended_at), excluded.ended_at)
                        else user_sessions.ended_at end,
        duration_seconds = ${dur(
          sql`least(user_sessions.started_at, excluded.started_at)`,
          sql`greatest(coalesce(user_sessions.last_event_at, excluded.last_event_at), excluded.last_event_at)`,
        )},
        foreground_count = user_sessions.foreground_count + excluded.foreground_count - 1,
        background_count = user_sessions.background_count + excluded.background_count,
        videos_viewed = user_sessions.videos_viewed + excluded.videos_viewed,
        engagement_actions = user_sessions.engagement_actions + excluded.engagement_actions,
        is_gamified = user_sessions.is_gamified or excluded.is_gamified,
        platform = coalesce(user_sessions.platform, excluded.platform)`);
    return sessions.length;
  }
}
