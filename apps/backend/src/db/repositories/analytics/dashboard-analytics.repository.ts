import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { sql, type SQL } from 'drizzle-orm';

/** Window `[from, to)` + optional `users.country_code` scope (null = global). */
export interface DashboardParams {
  from: string;
  to: string;
  countries: string[] | null;
}

export type Row = Record<string, unknown>;

/** pg returns bigint / numeric as strings — normalise to number. */
export const num = (v: unknown): number => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

/** Swipe-through = a session abandoned before this many watched seconds. */
export const SWIPE_THROUGH_SECONDS = 3;

/**
 * Raw aggregates behind the admin dashboard (master + region drill-down) and the report
 * builder. Every method returns un-shaped numbers; AnalyticsDashboardService shapes them
 * into the UI payloads (percentages, labels, colours). Region scoping is by
 * `users.country_code` of the actor.
 */
@Injectable()
export class DashboardAnalyticsRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  private async rows(query: SQL, tx?: DBExecutor): Promise<Row[]> {
    return ((await this.exec(tx).execute(query)) as unknown as { rows: Row[] }).rows;
  }

  private async one(query: SQL, tx?: DBExecutor): Promise<Row> {
    return (await this.rows(query, tx))[0] ?? {};
  }

  /** `and <alias>.country_code in (...)` or nothing for global scope. */
  private sc(p: DashboardParams, alias = 'u'): SQL {
    if (p.countries === null) {
      return sql``;
    }
    if (p.countries.length === 0) {
      return sql`and false`;
    }
    return sql`and ${sql.raw(alias)}.country_code in (${sql.join(p.countries.map((c) => sql`${c}`), sql`, `)})`;
  }

  private win(p: DashboardParams, col: SQL): SQL {
    return sql`${col} >= ${p.from}::timestamptz and ${col} < ${p.to}::timestamptz`;
  }

  /** Distinct users who played a game in the window (game events, prediction entries, bids, gamified sessions). */
  private gamePlayers(p: DashboardParams): SQL {
    return sql`
      select e.user_id from app_events e where e.event_type = 'game' and e.user_id is not null and ${this.win(p, sql`e.occurred_at`)}
      union select pe.user_id from prediction_entries pe where ${this.win(p, sql`pe.created_at`)}
      union select b.user_id from bids b where ${this.win(p, sql`b.created_at`)}
      union select us.user_id from user_sessions us where us.is_gamified and ${this.win(p, sql`us.started_at`)}`;
  }

  async totalCustomers(tx?: DBExecutor): Promise<number> {
    const r = await this.one(sql`select count(*)::int as n from users where account_type = 'customer' and deleted_at is null`, tx);
    return num(r['n']);
  }

  // ─── Strip ──────────────────────────────────────────────────────────────────

  async strip(p: DashboardParams, tx?: DBExecutor): Promise<Row> {
    const sc = this.sc(p);
    return this.one(sql`
      select
        (select count(*)::int from users u where u.account_type = 'customer' and u.deleted_at is null ${sc}) as users,
        (select count(distinct s.user_id)::int from subscriptions s join users u on u.id = s.user_id
          where s.status in ('active','trialing') ${sc}) as subscribers,
        (select count(distinct x.user_id)::int from (
            select cv.user_id from content_views cv where cv.last_heartbeat_at > now() - interval '5 minutes'
            union select e.user_id from app_events e where e.user_id is not null and e.occurred_at > now() - interval '5 minutes'
          ) x join users u on u.id = x.user_id where true ${sc}) as "onlineNow",
        (select count(distinct x.user_id)::int from (
            select e.user_id from app_events e where e.event_type = 'game' and e.user_id is not null and e.occurred_at > now() - interval '5 minutes'
            union select pe.user_id from prediction_entries pe where pe.created_at > now() - interval '5 minutes'
            union select b.user_id from bids b where b.created_at > now() - interval '5 minutes'
          ) x join users u on u.id = x.user_id where true ${sc}) as "playingNow"`, tx);
  }

  // ─── User analytics ─────────────────────────────────────────────────────────

  async userAnalytics(p: DashboardParams, hitThreshold: number, tx?: DBExecutor): Promise<{ views: Row; sessions: Row; actions: Row; hit: Row }> {
    const sc = this.sc(p);
    const [views, sessions, actions, hit] = await Promise.all([
      this.one(sql`
        with sv as (
          select cv.user_id, cv.started_at, cv.watched_seconds, cv.completion_percent, cv.is_completed, cv.counted,
            c.duration_seconds as dur, c.status as cstatus
          from content_views cv join users u on u.id = cv.user_id join contents c on c.id = cv.content_id
          where ${this.win(p, sql`cv.started_at`)} ${sc}
        )
        select count(*)::int as starts,
          count(*) filter (where is_completed)::int as completes,
          coalesce(avg(completion_percent), 0)::float as "avgWatchPct",
          coalesce(avg(watched_seconds), 0)::float as "avgWatchSecs",
          coalesce(avg(dur) filter (where dur > 0), 0)::float as "avgClipSecs",
          count(*) filter (where watched_seconds < ${SWIPE_THROUGH_SECONDS})::int as swipes,
          coalesce(avg(watched_seconds::float / dur) filter (where dur > 0), 0)::float as loops,
          count(distinct (user_id, (started_at at time zone 'UTC')::date))::int as "userDays",
          count(*) filter (where counted)::int as counted,
          count(*) filter (where counted and cstatus = 'published')::int as "liveCounted",
          count(*) filter (where counted and cstatus = 'published' and is_completed)::int as "liveCompleted"
        from sv`, tx),
      this.one(sql`
        select count(*)::int as sessions, coalesce(avg(us.engagement_actions), 0)::float as "actionsPerSession",
          coalesce(avg(us.videos_viewed), 0)::float as "videosPerSession"
        from user_sessions us join users u on u.id = us.user_id where ${this.win(p, sql`us.started_at`)} ${sc}`, tx),
      this.one(sql`
        select
          (select count(*)::int from content_reactions r join users u on u.id = r.user_id where ${this.win(p, sql`r.created_at`)} ${sc})
          + (select count(*)::int from comments c join users u on u.id = c.user_id where c.deleted_at is null and ${this.win(p, sql`c.created_at`)} ${sc})
          + (select count(*)::int from content_shares s join users u on u.id = s.user_id where ${this.win(p, sql`s.created_at`)} ${sc})
          + (select count(*)::int from content_watchlist w join users u on u.id = w.user_id where ${this.win(p, sql`w.created_at`)} ${sc})
          as actions`, tx),
      this.one(sql`
        with pub as (
          select c.id, c.published_at from contents c
          where c.status = 'published' and c.deleted_at is null and ${this.win(p, sql`c.published_at`)}
        ),
        pv as (
          select pub.id, (select count(*) from content_views cv join users u on u.id = cv.user_id
            where cv.content_id = pub.id and cv.counted and cv.started_at < pub.published_at + interval '30 days' ${sc}) as views
          from pub
        )
        select count(*)::int as titles, count(*) filter (where views >= ${hitThreshold})::int as hits from pv`, tx),
    ]);
    return { views, sessions, actions, hit };
  }

  // ─── Gamification ───────────────────────────────────────────────────────────

  async gamification(p: DashboardParams, tx?: DBExecutor): Promise<{ totals: Row; bySource: Row[]; weekly: Row[] }> {
    const sc = this.sc(p);
    const ledger = (dir: 'earn' | 'spend') =>
      sql`from ledger_transactions lt join users u on u.id = lt.user_id
          where lt.currency = 'points' and lt.direction = ${dir} and ${this.win(p, sql`lt.created_at`)} ${sc}`;
    const [totals, bySource, weekly] = await Promise.all([
      this.one(sql`
        with viewers as (
          select distinct cv.user_id from content_views cv join users u on u.id = cv.user_id
          where cv.counted and ${this.win(p, sql`cv.started_at`)} ${sc}
        ),
        players as (
          select pe.user_id from prediction_entries pe where ${this.win(p, sql`pe.created_at`)}
          union select b.user_id from bids b where ${this.win(p, sql`b.created_at`)}
          union select qp.user_id from quest_participations qp join quests q on q.id = qp.quest_id
            where q.start_at < ${p.to}::timestamptz and q.end_at >= ${p.from}::timestamptz
        ),
        active as (
          select x.user_id from (
            select cv.user_id from content_views cv where ${this.win(p, sql`cv.started_at`)}
            union select e.user_id from app_events e where e.user_id is not null and ${this.win(p, sql`e.occurred_at`)}
          ) x join users u on u.id = x.user_id where true ${sc}
        ),
        cur as (
          select lm.user_id, rank() over (order by lm.xp_earned desc) as r from leaderboard_monthly lm
          where lm.period_month = date_trunc('month', ${p.to}::timestamptz at time zone 'UTC' - interval '1 microsecond')::date
        ),
        prev as (
          select lm.user_id, rank() over (order by lm.xp_earned desc) as r from leaderboard_monthly lm
          where lm.period_month = (date_trunc('month', ${p.to}::timestamptz at time zone 'UTC' - interval '1 microsecond') - interval '1 month')::date
        )
        select
          (select coalesce(sum(lt.amount), 0)::bigint ${ledger('earn')}) as earned,
          (select count(distinct (lt.user_id, (lt.created_at at time zone 'UTC')::date))::int ${ledger('earn')}) as "earnerDays",
          (select coalesce(sum(-lt.amount), 0)::bigint ${ledger('spend')}) as spent,
          (select coalesce(sum(w.points_balance), 0)::bigint from wallets w join users u on u.id = w.user_id where true ${sc}) as outstanding,
          (select coalesce(avg(s.current_streak) filter (where s.current_streak > 0), 0)::float from user_streaks s join users u on u.id = s.user_id where true ${sc}) as "streakAvg",
          (select coalesce(max(s.longest_streak), 0)::int from user_streaks s join users u on u.id = s.user_id where true ${sc}) as "streakLongest",
          (select count(*)::int from app_events e join users u on u.id = e.user_id
            where e.event_name = 'leaderboard_viewed' and ${this.win(p, sql`e.occurred_at`)} ${sc}) as "leaderboardViews",
          (select count(*)::int from active) as "activeUsers",
          (select count(*)::int from viewers) as viewers,
          (select count(*)::int from viewers join players using (user_id)) as players,
          (select count(*)::int from quest_participations qp join quests q on q.id = qp.quest_id join users u on u.id = qp.user_id
            where q.start_at < ${p.to}::timestamptz and q.end_at >= ${p.from}::timestamptz ${sc}) as "questParticipations",
          (select count(*) filter (where qp.is_completed)::int from quest_participations qp join quests q on q.id = qp.quest_id join users u on u.id = qp.user_id
            where q.start_at < ${p.to}::timestamptz and q.end_at >= ${p.from}::timestamptz ${sc}) as "questCompletions",
          (select coalesce(avg(abs(cur.r - prev.r)), 0)::float from cur join prev using (user_id) join users u on u.id = cur.user_id where true ${sc}) as "rankChangeMonth",
          (select count(*)::int from wallets w join users u on u.id = w.user_id where true ${sc}) as wallets,
          (select count(*) filter (where w.points_balance < 500)::int from wallets w join users u on u.id = w.user_id where true ${sc}) as b0,
          (select count(*) filter (where w.points_balance >= 500 and w.points_balance < 2000)::int from wallets w join users u on u.id = w.user_id where true ${sc}) as b1,
          (select count(*) filter (where w.points_balance >= 2000 and w.points_balance < 10000)::int from wallets w join users u on u.id = w.user_id where true ${sc}) as b2,
          (select count(*) filter (where w.points_balance >= 10000)::int from wallets w join users u on u.id = w.user_id where true ${sc}) as b3`, tx),
      this.rows(sql`select lt.source_type as source, coalesce(sum(lt.amount), 0)::bigint as points ${ledger('earn')} group by 1`, tx),
      this.rows(sql`
        with wk as (
          select generate_series(
            date_trunc('week', ${p.from}::timestamptz at time zone 'UTC'),
            ${p.to}::timestamptz at time zone 'UTC' - interval '1 microsecond',
            interval '1 week') as w
        ),
        agg as (
          select date_trunc('week', lt.created_at at time zone 'UTC') as w,
            coalesce(sum(lt.amount) filter (where lt.direction = 'earn'), 0)::bigint as distributed,
            coalesce(sum(-lt.amount) filter (where lt.direction = 'spend'), 0)::bigint as redeemed
          from ledger_transactions lt join users u on u.id = lt.user_id
          where lt.currency = 'points' and lt.direction in ('earn','spend') and ${this.win(p, sql`lt.created_at`)} ${sc}
          group by 1
        )
        select to_char(wk.w, 'YYYY-MM-DD') as "weekStart", coalesce(agg.distributed, 0) as distributed, coalesce(agg.redeemed, 0) as redeemed
        from wk left join agg on agg.w = wk.w order by wk.w`, tx),
    ]);
    return { totals, bySource, weekly };
  }

  // ─── Screen time & session quality ──────────────────────────────────────────

  async screenTime(p: DashboardParams, tx?: DBExecutor): Promise<{ sessions: Row; viewers: Row; heatmap: Row[] }> {
    const sc = this.sc(p);
    const [sessions, viewers] = await Promise.all([
      this.one(sql`
        with s as (
          select us.* from user_sessions us join users u on u.id = us.user_id where ${this.win(p, sql`us.started_at`)} ${sc}
        )
        select count(*)::int as sessions,
          coalesce(avg(coalesce(duration_seconds, 0)), 0)::float as "avgSecs",
          coalesce(percentile_cont(0.5) within group (order by coalesce(duration_seconds, 0)), 0)::float as "medianSecs",
          count(*) filter (where coalesce(duration_seconds, 0) < 300)::int as b0,
          count(*) filter (where duration_seconds >= 300 and duration_seconds < 900)::int as b1,
          count(*) filter (where duration_seconds >= 900 and duration_seconds < 1800)::int as b2,
          count(*) filter (where duration_seconds >= 1800 and duration_seconds < 3600)::int as b3,
          count(*) filter (where duration_seconds >= 3600)::int as b4,
          coalesce(avg(greatest(foreground_count - 1, 0)), 0)::float as reentries,
          coalesce(avg(videos_viewed), 0)::float as videos,
          coalesce(sum(coalesce(duration_seconds, 0)), 0)::bigint as "totalSecs",
          count(distinct (user_id, (started_at at time zone 'UTC')::date))::int as "userDays"
        from s`, tx),
      this.one(sql`
        with v as (
          select distinct cv.user_id from content_views cv join users u on u.id = cv.user_id
          where cv.counted and ${this.win(p, sql`cv.started_at`)} ${sc}
        ),
        g as (${this.gamePlayers(p)})
        select (select count(*)::int from v) as viewers,
          (select count(*)::int from v where exists (select 1 from g where g.user_id = v.user_id)) as gamified`, tx),
    ]);
    // Heatmap from session starts; fall back to view-session starts before sessions exist.
    const useSessions = num(sessions['sessions']) > 0;
    const heatmap = await this.rows(
      useSessions
        ? sql`select (extract(isodow from us.started_at at time zone 'UTC')::int - 1) as dow,
              extract(hour from us.started_at at time zone 'UTC')::int as h, count(*)::int as n
            from user_sessions us join users u on u.id = us.user_id where ${this.win(p, sql`us.started_at`)} ${sc} group by 1, 2`
        : sql`select (extract(isodow from cv.started_at at time zone 'UTC')::int - 1) as dow,
              extract(hour from cv.started_at at time zone 'UTC')::int as h, count(*)::int as n
            from content_views cv join users u on u.id = cv.user_id where ${this.win(p, sql`cv.started_at`)} ${sc} group by 1, 2`,
      tx,
    );
    return { sessions, viewers, heatmap };
  }

  // ─── Monetization & funnel ──────────────────────────────────────────────────

  async monetization(p: DashboardParams, tx?: DBExecutor): Promise<{ totals: Row; channels: Row[]; funnel: Row; subsWeekly: Row[]; revenueMonthly: Row[] }> {
    const sc = this.sc(p);
    const paidAt = sql`coalesce(si.paid_at, si.billed_at)`;
    const [totals, channels, funnel, subsWeekly, revenueMonthly] = await Promise.all([
      this.one(sql`
        with act as (
          select uda.user_id, uda.activity_date as d from user_daily_activity uda
          where uda.activity_date >= (${p.from}::timestamptz at time zone 'UTC')::date
            and uda.activity_date < (${p.to}::timestamptz at time zone 'UTC')::date + 1
          union
          select us.user_id, (us.started_at at time zone 'UTC')::date from user_sessions us where ${this.win(p, sql`us.started_at`)}
        )
        select
          (select coalesce(sum(si.amount_cents), 0)::bigint from subscription_invoices si join users u on u.id = si.user_id
            where si.status = 'paid' and ${this.win(p, paidAt)} ${sc}) as "revenueCents",
          (select count(*)::int from users u where u.account_type = 'customer' and u.deleted_at is null ${sc}) as customers,
          (select count(*)::int from act join users u on u.id = act.user_id where true ${sc}) as "activeUserDays",
          (select count(*)::int from subscriptions s join users u on u.id = s.user_id
            where s.trial_end_at is not null and ${this.win(p, sql`s.trial_end_at`)} ${sc}) as trials,
          (select count(*)::int from subscriptions s join users u on u.id = s.user_id
            where s.trial_end_at is not null and ${this.win(p, sql`s.trial_end_at`)} and s.status in ('active','past_due') ${sc}) as "trialsConverted",
          (select coalesce(sum(s.amount_cents), 0)::bigint from subscriptions s join users u on u.id = s.user_id
            where s.status in ('active','trialing') ${sc}) as "mrrCents",
          (select coalesce(sum(si.amount_cents), 0)::bigint from subscription_invoices si join users u on u.id = si.user_id where si.status = 'paid' ${sc}) as "lifetimeRevenueCents",
          (select count(distinct si.user_id)::int from subscription_invoices si join users u on u.id = si.user_id where si.status = 'paid' ${sc}) as "payingUsers"`, tx),
      this.rows(sql`
        with cu as (
          select u.id, coalesce(u.acquisition_channel, 'organic') as ch, u.created_at from users u
          where u.account_type = 'customer' and u.deleted_at is null ${sc}
        ),
        months as (
          select date_trunc('month', ${p.from}::timestamptz at time zone 'UTC')::date as m0,
                 date_trunc('month', ${p.to}::timestamptz at time zone 'UTC' - interval '1 microsecond')::date as m1
        ),
        ltv as (
          select cu.ch, count(*)::int as users, coalesce(sum(r.rev), 0)::bigint as rev
          from cu left join (select si.user_id, sum(si.amount_cents) as rev from subscription_invoices si where si.status = 'paid' group by 1) r
            on r.user_id = cu.id
          group by 1
        ),
        spend as (
          select ms.channel as ch, coalesce(sum(ms.spend_cents), 0)::bigint as spend, coalesce(sum(ms.new_users), 0)::int as nu
          from marketing_spend ms, months where ms.period_month between months.m0 and months.m1 group by 1
        ),
        signups as (
          select cu.ch, count(*)::int as n from cu, months
          where cu.created_at >= months.m0::timestamp at time zone 'UTC'
            and cu.created_at < (months.m1 + interval '1 month')::timestamp at time zone 'UTC'
          group by 1
        )
        select coalesce(ltv.ch, spend.ch) as channel, coalesce(ltv.users, 0) as users, coalesce(ltv.rev, 0) as "revenueCents",
          coalesce(spend.spend, 0) as "spendCents", coalesce(spend.nu, 0) as "attributedUsers", coalesce(signups.n, 0) as signups
        from ltv full join spend on spend.ch = ltv.ch
          left join signups on signups.ch = coalesce(ltv.ch, spend.ch)
        order by 1`, tx),
      this.one(sql`
        with cohort as (
          select u.id from users u where u.account_type = 'customer' and ${this.win(p, sql`u.created_at`)} ${sc}
        )
        select count(*)::int as signups,
          count(*) filter (where exists (select 1 from user_sessions us where us.user_id = cohort.id)
                              or exists (select 1 from content_views cv where cv.user_id = cohort.id))::int as "firstSession",
          count(*) filter (where exists (select 1 from content_reactions r where r.user_id = cohort.id)
                              or exists (select 1 from comments c where c.user_id = cohort.id)
                              or exists (select 1 from content_shares s where s.user_id = cohort.id)
                              or exists (select 1 from prediction_entries pe where pe.user_id = cohort.id)
                              or exists (select 1 from bids b where b.user_id = cohort.id))::int as engaged,
          count(*) filter (where exists (select 1 from subscriptions s where s.user_id = cohort.id))::int as subscribed,
          count(*) filter (where exists (select 1 from referral_redemptions rr where rr.referee_id = cohort.id and rr.status <> 'reverted'))::int as referred
        from cohort`, tx),
      this.rows(sql`
        with wk as (
          select generate_series(date_trunc('week', ${p.from}::timestamptz at time zone 'UTC'),
            ${p.to}::timestamptz at time zone 'UTC' - interval '1 microsecond', interval '1 week') as w
        ),
        n as (
          select date_trunc('week', s.started_at at time zone 'UTC') as w, count(*)::int as c
          from subscriptions s join users u on u.id = s.user_id where ${this.win(p, sql`s.started_at`)} ${sc} group by 1
        ),
        x as (
          select date_trunc('week', s.canceled_at at time zone 'UTC') as w, count(*)::int as c
          from subscriptions s join users u on u.id = s.user_id where s.canceled_at is not null and ${this.win(p, sql`s.canceled_at`)} ${sc} group by 1
        )
        select to_char(wk.w, 'YYYY-MM-DD') as date, coalesce(n.c, 0) as "newSubs", coalesce(x.c, 0) as cancellations
        from wk left join n on n.w = wk.w left join x on x.w = wk.w order by wk.w`, tx),
      this.rows(sql`
        with mo as (
          select generate_series(date_trunc('month', ${p.from}::timestamptz at time zone 'UTC'),
            ${p.to}::timestamptz at time zone 'UTC' - interval '1 microsecond', interval '1 month') as m
        ),
        r as (
          select date_trunc('month', ${paidAt} at time zone 'UTC') as m, coalesce(sum(si.amount_cents), 0)::bigint as c
          from subscription_invoices si join users u on u.id = si.user_id where si.status = 'paid' and ${this.win(p, paidAt)} ${sc} group by 1
        )
        select to_char(mo.m, 'YYYY-MM') as month, coalesce(r.c, 0) as "revenueCents" from mo left join r on r.m = mo.m order by mo.m`, tx),
    ]);
    return { totals, channels, funnel, subsWeekly, revenueMonthly };
  }

  // ─── Community ──────────────────────────────────────────────────────────────

  async communityInApp(p: DashboardParams, tx?: DBExecutor): Promise<Row> {
    const sc = this.sc(p);
    return this.one(sql`
      with vw as (
        select cv.user_id, cv.content_id from content_views cv join users u on u.id = cv.user_id
        where cv.counted and ${this.win(p, sql`cv.started_at`)} ${sc}
      ),
      tl as (
        select c.id from comments c join users u on u.id = c.user_id
        where c.parent_comment_id is null and c.deleted_at is null and ${this.win(p, sql`c.created_at`)} ${sc}
      )
      select
        (select count(*)::int from comments c join users u on u.id = c.user_id where c.deleted_at is null and ${this.win(p, sql`c.created_at`)} ${sc}) as comments,
        (select count(*)::int from tl) as "topLevel",
        (select count(*)::int from tl where exists (select 1 from comments r where r.parent_comment_id = tl.id and r.deleted_at is null)) as replied,
        (select count(*)::int from content_reactions r join users u on u.id = r.user_id where ${this.win(p, sql`r.created_at`)} ${sc}) as reactions,
        (select count(*)::int from content_shares s join users u on u.id = s.user_id where ${this.win(p, sql`s.created_at`)} ${sc}) as shares,
        (select count(*)::int from vw) as views,
        (select count(distinct user_id)::int from vw) as viewers,
        (select count(distinct content_id)::int from vw) as "viewedContents"`, tx);
  }

  /** Social listening aggregates; `countries` filters on the mention's own country (null = all). */
  async socialSummary(p: DashboardParams, tx?: DBExecutor): Promise<{ totals: Row; byPlatform: Row[] }> {
    const sc = this.sc(p, 'm');
    const m = sql`select * from social_mentions m where ${this.win(p, sql`coalesce(m.mentioned_at, m.ingested_at)`)} ${sc}`;
    const [totals, byPlatform] = await Promise.all([
      this.one(sql`
        with m as (${m})
        select count(*)::int as mentions,
          count(*) filter (where sentiment = 'positive')::int as positive,
          count(*) filter (where sentiment = 'neutral')::int as neutral,
          count(*) filter (where sentiment = 'negative')::int as negative,
          count(*) filter (where is_viral_moment)::int as viral,
          coalesce(sum(impressions), 0)::bigint as impressions,
          coalesce(sum(engagement), 0)::bigint as engagement,
          coalesce(sum(emv_cents), 0)::bigint as "emvCents",
          (select count(*)::int from (
            select author_handle from m where sentiment = 'positive' and author_handle is not null group by 1 having count(*) >= 2
          ) a) as advocates
        from m`, tx),
      this.rows(sql`
        with m as (${m})
        select platform, count(*)::int as mentions, coalesce(sum(impressions), 0)::bigint as impressions,
          count(*) filter (where sentiment = 'positive')::int as positive,
          count(*) filter (where sentiment = 'negative')::int as negative
        from m group by 1 order by mentions desc`, tx),
    ]);
    return { totals, byPlatform };
  }

  // ─── Graphs & trends ────────────────────────────────────────────────────────

  /** Retention for the cohort signed up in `[from, to)`: eligible / retained on day N. */
  async retention(p: DashboardParams, offsets: readonly number[], tx?: DBExecutor): Promise<Row[]> {
    const sc = this.sc(p);
    return this.rows(sql`
      with cohort as (
        select u.id, (u.created_at at time zone 'UTC')::date as d0 from users u
        where u.account_type = 'customer' and u.deleted_at is null and ${this.win(p, sql`u.created_at`)} ${sc}
      ),
      act as (
        select uda.user_id, uda.activity_date as d from user_daily_activity uda where uda.user_id in (select id from cohort)
        union
        select us.user_id, (us.started_at at time zone 'UTC')::date from user_sessions us where us.user_id in (select id from cohort)
      ),
      offs as (select unnest(${`{${offsets.join(',')}}`}::int[]) as n),
      today as (select (now() at time zone 'UTC')::date as t)
      select offs.n,
        count(c.id) filter (where c.d0 + offs.n <= today.t)::int as eligible,
        count(c.id) filter (where c.d0 + offs.n <= today.t
          and exists (select 1 from act a where a.user_id = c.id and a.d = c.d0 + offs.n))::int as retained,
        count(c.id)::int as cohort
      from offs cross join today left join cohort c on true
      group by offs.n order by offs.n`, tx);
  }

  async kFactor(p: DashboardParams, tx?: DBExecutor): Promise<Row[]> {
    const sc = this.sc(p);
    return this.rows(sql`
      with mo as (
        select generate_series(date_trunc('month', ${p.from}::timestamptz at time zone 'UTC'),
          ${p.to}::timestamptz at time zone 'UTC' - interval '1 microsecond', interval '1 month') as m
      ),
      su as (
        select date_trunc('month', u.created_at at time zone 'UTC') as m,
          count(*) filter (where rr.id is null)::int as organic, count(rr.id)::int as referred
        from users u left join referral_redemptions rr on rr.referee_id = u.id and rr.status <> 'reverted'
        where u.account_type = 'customer' and ${this.win(p, sql`u.created_at`)} ${sc}
        group by 1
      )
      select to_char(mo.m, 'YYYY-MM') as month, coalesce(su.referred, 0) as referred, coalesce(su.organic, 0) as organic
      from mo left join su on su.m = mo.m order by mo.m`, tx);
  }

  async velocity(p: DashboardParams, tx?: DBExecutor): Promise<Row[]> {
    const sc = this.sc(p);
    return this.rows(sql`
      with days as (
        select generate_series(date_trunc('day', ${p.from}::timestamptz at time zone 'UTC'),
          ${p.to}::timestamptz at time zone 'UTC' - interval '1 microsecond', interval '1 day') as d
      ),
      pl as (
        select date_trunc('day', e.occurred_at at time zone 'UTC') as d, e.user_id from app_events e
          where e.event_type = 'game' and e.user_id is not null and ${this.win(p, sql`e.occurred_at`)}
        union select date_trunc('day', pe.created_at at time zone 'UTC'), pe.user_id from prediction_entries pe where ${this.win(p, sql`pe.created_at`)}
        union select date_trunc('day', b.created_at at time zone 'UTC'), b.user_id from bids b where ${this.win(p, sql`b.created_at`)}
      ),
      agg as (select pl.d, count(distinct pl.user_id)::int as n from pl join users u on u.id = pl.user_id where true ${sc} group by 1)
      select to_char(days.d, 'YYYY-MM-DD') as day, to_char(days.d, 'Dy') as weekday, coalesce(agg.n, 0) as players
      from days left join agg on agg.d = days.d order by days.d`, tx);
  }

  // ─── Regions (master map + viewership split) ────────────────────────────────

  async byCountry(p: DashboardParams, tx?: DBExecutor): Promise<Row[]> {
    return this.rows(sql`
      with cu as (
        select u.id, upper(u.country_code) as cc from users u
        where u.account_type = 'customer' and u.deleted_at is null and u.country_code is not null
      ),
      rev as (
        select si.user_id, sum(si.amount_cents) as r from subscription_invoices si
        where si.status = 'paid' and ${this.win(p, sql`coalesce(si.paid_at, si.billed_at)`)} group by 1
      ),
      pts as (
        select lt.user_id, sum(lt.amount) as pts from ledger_transactions lt
        where lt.currency = 'points' and lt.direction = 'earn' and ${this.win(p, sql`lt.created_at`)} group by 1
      ),
      subs as (select distinct s.user_id from subscriptions s where s.status in ('active','trialing')),
      vw as (select distinct cv.user_id from content_views cv where cv.counted and ${this.win(p, sql`cv.started_at`)}),
      gm as (select distinct g.user_id from (${this.gamePlayers(p)}) g)
      select cu.cc as "countryCode", count(*)::int as users, count(subs.user_id)::int as subscribers,
        coalesce(sum(rev.r), 0)::bigint as "revenueCents", coalesce(sum(pts.pts), 0)::bigint as points,
        count(vw.user_id)::int as viewers, count(vw.user_id) filter (where gm.user_id is not null)::int as gamified
      from cu
        left join rev on rev.user_id = cu.id
        left join pts on pts.user_id = cu.id
        left join subs on subs.user_id = cu.id
        left join vw on vw.user_id = cu.id
        left join gm on gm.user_id = cu.id
      group by cu.cc order by users desc`, tx);
  }

  // ─── Report-builder extras (metrics no dashboard section carries) ───────────

  async reportExtras(p: DashboardParams, tx?: DBExecutor): Promise<{ totals: Row; revenueByPlatform: Row[]; violations: Row[]; licensing: Row[] }> {
    const sc = this.sc(p);
    const offender = p.countries === null ? sql`` : sql`and exists (select 1 from users u where u.id = t.offender_user_id ${sc})`;
    const [totals, revenueByPlatform, violations, licensing] = await Promise.all([
      this.one(sql`
        with active as (
          select x.user_id from (
            select cv.user_id from content_views cv where ${this.win(p, sql`cv.started_at`)}
            union select us.user_id from user_sessions us where ${this.win(p, sql`us.started_at`)}
            union select e.user_id from app_events e where e.user_id is not null and ${this.win(p, sql`e.occurred_at`)}
          ) x join users u on u.id = x.user_id where true ${sc}
        ),
        mau as (
          select x.user_id from (
            select cv.user_id from content_views cv where cv.started_at >= ${p.to}::timestamptz - interval '30 days' and cv.started_at < ${p.to}::timestamptz
            union select us.user_id from user_sessions us where us.started_at >= ${p.to}::timestamptz - interval '30 days' and us.started_at < ${p.to}::timestamptz
            union select e.user_id from app_events e where e.user_id is not null and e.occurred_at >= ${p.to}::timestamptz - interval '30 days' and e.occurred_at < ${p.to}::timestamptz
          ) x join users u on u.id = x.user_id where true ${sc}
        ),
        daily as (
          select x.user_id, x.d from (
            select cv.user_id, (cv.started_at at time zone 'UTC')::date as d from content_views cv where ${this.win(p, sql`cv.started_at`)}
            union select us.user_id, (us.started_at at time zone 'UTC')::date from user_sessions us where ${this.win(p, sql`us.started_at`)}
            union select e.user_id, (e.occurred_at at time zone 'UTC')::date from app_events e where e.user_id is not null and ${this.win(p, sql`e.occurred_at`)}
          ) x join users u on u.id = x.user_id where true ${sc}
        )
        select
          (select count(*)::int from active) as "activeUsers",
          (select count(*)::int from mau) as mau,
          (select count(*)::int from daily) as "activeUserDays",
          (select count(*)::int from users u where u.account_type = 'customer' and ${this.win(p, sql`u.created_at`)} ${sc}) as signups,
          (select count(*)::int from subscriptions s join users u on u.id = s.user_id
            where s.canceled_at is not null and ${this.win(p, sql`s.canceled_at`)} ${sc}) as cancellations,
          (select count(*)::int from subscriptions s join users u on u.id = s.user_id
            where s.started_at < ${p.from}::timestamptz and (s.canceled_at is null or s.canceled_at >= ${p.from}::timestamptz)
              and s.status <> 'trialing' ${sc}) as "subsAtStart",
          (select count(distinct lm.user_id)::int from leaderboard_monthly lm join users u on u.id = lm.user_id
            where lm.xp_earned > 0
              and lm.period_month between date_trunc('month', ${p.from}::timestamptz at time zone 'UTC')::date
                                      and date_trunc('month', ${p.to}::timestamptz at time zone 'UTC' - interval '1 microsecond')::date ${sc}) as "leaderboardUsers",
          (select count(*)::int from moderation_reports r join moderation_tickets t on t.id = r.ticket_id
            where ${this.win(p, sql`r.created_at`)} ${offender})
          + (select count(*)::int from comment_reports cr join comments c on c.id = cr.comment_id join users u on u.id = c.user_id
            where ${this.win(p, sql`cr.created_at`)} ${sc}) as reports,
          (select coalesce(avg(extract(epoch from (t.resolved_at - t.created_at)) / 3600.0), 0)::float from moderation_tickets t
            where t.resolved_at is not null and ${this.win(p, sql`t.resolved_at`)} ${offender}) as "resolutionHours",
          (select count(*)::int from moderation_tickets t
            where t.resolved_at is not null and t.resolution is not null and t.resolution <> 'no_action'
              and ${this.win(p, sql`t.resolved_at`)} ${offender}) as "actionedViolations",
          (select count(*)::int from contents c where c.status = 'published' and c.deleted_at is null and ${this.win(p, sql`c.published_at`)}) as published,
          (select count(*)::int from content_views cv join users u on u.id = cv.user_id where cv.counted and ${this.win(p, sql`cv.started_at`)} ${sc}) as views,
          (select coalesce(sum(cv.watched_seconds), 0)::bigint from content_views cv join users u on u.id = cv.user_id
            where cv.counted and ${this.win(p, sql`cv.started_at`)} ${sc}) as "watchSeconds",
          (select coalesce(sum(lt.amount), 0)::bigint from ledger_transactions lt join users u on u.id = lt.user_id
            where lt.currency = 'points' and lt.direction = 'earn' and ${this.win(p, sql`lt.created_at`)} ${sc}) as "pointsIssued",
          (select coalesce(sum(-lt.amount), 0)::bigint from ledger_transactions lt join users u on u.id = lt.user_id
            where lt.currency = 'points' and lt.direction = 'spend' and ${this.win(p, sql`lt.created_at`)} ${sc}) as "pointsSpent"`, tx),
      this.rows(sql`
        select coalesce(si.platform, si.provider, 'unknown') as platform, coalesce(sum(si.amount_cents), 0)::bigint as "revenueCents"
        from subscription_invoices si join users u on u.id = si.user_id
        where si.status = 'paid' and ${this.win(p, sql`coalesce(si.paid_at, si.billed_at)`)} ${sc}
        group by 1 order by 2 desc`, tx),
      this.rows(sql`
        select t.category, count(*)::int as count from moderation_tickets t
        where ${this.win(p, sql`t.created_at`)} ${offender} group by 1 order by 2 desc`, tx),
      this.rows(sql`
        select coalesce(license_status, 'original') as status, count(*)::int as count from contents
        where deleted_at is null group by 1 order by 2 desc`, tx),
    ]);
    return { totals, revenueByPlatform, violations, licensing };
  }
}
