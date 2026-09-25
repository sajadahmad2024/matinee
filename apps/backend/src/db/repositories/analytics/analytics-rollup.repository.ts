import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { sql } from 'drizzle-orm';

export const CONTENT_DAILY_JOB = 'content_daily';

export interface RollupCoverage {
  coveredFrom: string | null;
  coveredThrough: string | null;
  lastRunAt: string | null;
}

/**
 * Rollup writers + watermark. `content_daily_stats` is recomputed per UTC day with a
 * delete-then-insert inside one transaction, so re-running any range is idempotent and rows
 * disappear when their source activity does (e.g. a removed like).
 */
@Injectable()
export class AnalyticsRollupRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Recompute `content_daily_stats` for the UTC days `[fromDay, toDay]` (YYYY-MM-DD). Returns rows written. */
  async rollupContentDaily(fromDay: string, toDay: string): Promise<number> {
    return this.dbService.transaction(async (db) => {
      await db.execute(sql`delete from content_daily_stats where stat_date between ${fromDay}::date and ${toDay}::date`);
      const res = (await db.execute(sql`
        with bounds as (
          select (${fromDay}::date)::timestamp at time zone 'UTC' as f,
                 ((${toDay}::date) + 1)::timestamp at time zone 'UTC' as t
        ),
        v as (
          select cv.content_id, (cv.started_at at time zone 'UTC')::date as d,
            count(*)::int as views, count(distinct cv.user_id)::int as uv,
            coalesce(sum(cv.watched_seconds),0)::bigint as ws, coalesce(avg(cv.completion_percent),0)::numeric(5,2) as ac
          from content_views cv, bounds b
          where cv.counted and cv.started_at >= b.f and cv.started_at < b.t
          group by 1, 2
        ),
        l as (
          select r.content_id, (r.created_at at time zone 'UTC')::date as d, count(*)::int as likes
          from content_reactions r, bounds b
          where r.reaction = 'like' and r.created_at >= b.f and r.created_at < b.t
          group by 1, 2
        ),
        c as (
          select cm.content_id, (cm.created_at at time zone 'UTC')::date as d, count(*)::int as comments
          from comments cm, bounds b
          where cm.status = 'visible' and cm.deleted_at is null and cm.created_at >= b.f and cm.created_at < b.t
          group by 1, 2
        ),
        s as (
          select sh.content_id, sh.share_date as d, count(*)::int as shares
          from content_shares sh
          where sh.share_date between ${fromDay}::date and ${toDay}::date
          group by 1, 2
        ),
        k as (
          select content_id, d from v union select content_id, d from l
          union select content_id, d from c union select content_id, d from s
        ),
        ins as (
          insert into content_daily_stats (content_id, stat_date, views, unique_viewers, watch_seconds, avg_completion, likes, comments, shares)
          select k.content_id, k.d, coalesce(v.views,0), coalesce(v.uv,0), coalesce(v.ws,0), coalesce(v.ac,0),
            coalesce(l.likes,0), coalesce(c.comments,0), coalesce(s.shares,0)
          from k
            join contents ct on ct.id = k.content_id
            left join v on v.content_id = k.content_id and v.d = k.d
            left join l on l.content_id = k.content_id and l.d = k.d
            left join c on c.content_id = k.content_id and c.d = k.d
            left join s on s.content_id = k.content_id and s.d = k.d
          on conflict (content_id, stat_date) do update set
            views = excluded.views, unique_viewers = excluded.unique_viewers, watch_seconds = excluded.watch_seconds,
            avg_completion = excluded.avg_completion, likes = excluded.likes, comments = excluded.comments, shares = excluded.shares
          returning 1
        )
        select count(*)::int as n from ins`)) as unknown as { rows: Array<{ n: number }> };
      return Number(res.rows[0]?.n ?? 0);
    });
  }

  async getCoverage(jobKey: string, tx?: DBExecutor): Promise<RollupCoverage> {
    const res = (await this.exec(tx).execute(sql`
      select to_char(covered_from, 'YYYY-MM-DD') as "coveredFrom", to_char(covered_through, 'YYYY-MM-DD') as "coveredThrough",
        last_run_at as "lastRunAt"
      from analytics_rollup_state where job_key = ${jobKey}`)) as unknown as { rows: RollupCoverage[] };
    return res.rows[0] ?? { coveredFrom: null, coveredThrough: null, lastRunAt: null };
  }

  /** Persist the (already merged) coverage window for a job. */
  async setCoverage(jobKey: string, coveredFrom: string | null, coveredThrough: string | null, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).execute(sql`
      insert into analytics_rollup_state (job_key, covered_from, covered_through, last_run_at)
      values (${jobKey}, ${coveredFrom}::date, ${coveredThrough}::date, now())
      on conflict (job_key) do update set covered_from = excluded.covered_from,
        covered_through = excluded.covered_through, last_run_at = now()`);
  }
}
