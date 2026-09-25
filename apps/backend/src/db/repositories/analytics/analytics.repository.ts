import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { contents, contentViews } from '@db/drizzle/schema';
import { eq, sql, type SQL } from 'drizzle-orm';

export interface DashboardOverview {
  totalCustomers: number;
  activeCustomers: number;
  activeSubscriptions: number;
  mrrCents: number;
  grossRevenueCents: number;
  pointsIssued: number;
  pointsSpent: number;
  pointsOutstanding: number;
  publishedContent: number;
  totalRedemptions: number;
  activeQuests: number;
  openPredictions: number;
  openAuctions: number;
  openModerationTickets: number;
}

/** Half-open analytics window `[from, to)` as ISO-8601 timestamps. */
export interface AnalyticsWindow {
  from: string;
  to: string;
}

export interface ContentAnalytics {
  viewCount: number;
  uniqueViewerCount: number;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  shareCount: number;
  sessions: number;
  distinctViewers: number;
  avgCompletion: number;
  totalWatchSeconds: number;
  daily: Array<{ date: string; views: number; uniqueViewers: number; watchSeconds: number; avgCompletion: number }>;
  from: string;
  to: string;
  periodChange: { views: number; prevViews: number; viewsPct: number; watchSeconds: number; prevWatchSeconds: number; watchSecondsPct: number };
  retention: Array<{ percent: number; viewers: number; ratio: number }>;
  trafficSources: Array<{ source: string; views: number }>;
  demographics: {
    gender: Array<{ gender: string; views: number; viewers: number }>;
    device: Array<{ device: string; views: number; viewers: number }>;
  };
  geo: Array<{ countryCode: string; views: number; watchSeconds: number }>;
  games: {
    predictions: number;
    predictionEntries: number;
    auctions: number;
    bids: number;
    quests: number;
    questParticipants: number;
    questCompletions: number;
  };
  bts: { children: Array<{ id: string; title: string; contentType: string; views: number }>; parentViewers: number; childViewers: number; ctr: number };
}

export interface ContentLibraryParams extends AnalyticsWindow {
  region: string | null;
  hitThreshold: number;
}

export interface ContentLibraryAnalytics {
  from: string;
  to: string;
  region: string | null;
  totals: {
    views: number;
    uniqueViewers: number;
    watchSeconds: number;
    avgWatchSeconds: number;
    avgCompletion: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
  };
  byRegion: Array<{ region: string; views: number; watchSeconds: number; avgWatchSeconds: number }>;
  hitRate: { threshold: number; publishedTitles: number; hits: number; percent: number };
  gameConversion: { viewers: number; players: number; percent: number };
  funnel: { viewers: number; engaged: number; gamePlayers: number; unlockers: number };
  revenueAttribution: { licenseRevenueCents: number; sponsorshipRevenueCents: number; unlockPointsSpent: number };
  btsUpsell: { parentViewers: number; btsViewers: number; ctr: number };
  sentiment: { likes: number; dislikes: number; positiveRatio: number };
  shareVelocity: { last24h: number; prev24h: number; changePct: number };
  topContent: Array<{ id: string; title: string; contentType: string; views: number; uniqueViewers: number; watchSeconds: number; avgCompletion: number }>;
}

export const TREND_METRICS = ['signups', 'active_users', 'views', 'watch_seconds', 'points_earned', 'points_spent', 'revenue'] as const;
export type TrendMetric = (typeof TREND_METRICS)[number];
export const TREND_INTERVALS = ['day', 'week', 'month'] as const;
export type TrendInterval = (typeof TREND_INTERVALS)[number];

export interface TrendsParams extends AnalyticsWindow {
  interval: TrendInterval;
  region: string | null;
}

export interface TrendPoint {
  bucket: string;
  value: number;
}

type Row = Record<string, unknown>;

/** pg returns bigint / numeric as strings — normalise to number. */
const num = (v: unknown): number => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};
/** Percent change `cur` vs `prev`, 1 dp. `prev = 0` → 100 when there's growth, else 0. */
const pctChange = (cur: number, prev: number): number => {
  if (prev === 0) {
    return cur > 0 ? 100 : 0;
  }
  return Math.round(((cur - prev) / prev) * 1000) / 10;
};
/** Ratio 0..1 rounded to 4 dp (0 when denominator is 0). */
const ratio = (a: number, b: number): number => (b > 0 ? Math.round((a / b) * 10000) / 10000 : 0);
/** Percentage 0..100 rounded to 1 dp. */
const pct = (a: number, b: number): number => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** One round-trip of correlated subqueries — the dashboard "critical KPIs". */
  async overview(tx?: DBExecutor): Promise<DashboardOverview> {
    const res = await this.exec(tx).execute(sql`
      select
        (select count(*)::int from users where account_type='customer' and deleted_at is null) as "totalCustomers",
        (select count(*)::int from users where account_type='customer' and last_login_at > now() - interval '30 days') as "activeCustomers",
        (select count(*)::int from subscriptions where status in ('active','trialing')) as "activeSubscriptions",
        (select coalesce(sum(amount_cents),0)::bigint from subscriptions where status in ('active','trialing')) as "mrrCents",
        (select coalesce(sum(amount_cents),0)::bigint from subscription_invoices where status='paid') as "grossRevenueCents",
        (select coalesce(sum(amount),0)::bigint from ledger_transactions where currency='points' and direction='earn') as "pointsIssued",
        (select coalesce(sum(-amount),0)::bigint from ledger_transactions where currency='points' and direction='spend') as "pointsSpent",
        (select coalesce(sum(points_balance),0)::bigint from wallets) as "pointsOutstanding",
        (select count(*)::int from contents where status='published' and deleted_at is null) as "publishedContent",
        (select count(*)::int from reward_redemptions where status in ('pending','confirmed','fulfilled')) as "totalRedemptions",
        (select count(*)::int from quests where status='active') as "activeQuests",
        (select count(*)::int from predictions where status='open') as "openPredictions",
        (select count(*)::int from auctions where status='open') as "openAuctions",
        (select count(*)::int from moderation_tickets where status in ('open','in_review','escalated')) as "openModerationTickets"
    `);
    const row = (res as unknown as { rows: Record<string, string | number>[] }).rows[0]!;
    const n = (v: string | number | undefined) => Number(v ?? 0);
    return {
      totalCustomers: n(row['totalCustomers']), activeCustomers: n(row['activeCustomers']),
      activeSubscriptions: n(row['activeSubscriptions']), mrrCents: n(row['mrrCents']), grossRevenueCents: n(row['grossRevenueCents']),
      pointsIssued: n(row['pointsIssued']), pointsSpent: n(row['pointsSpent']), pointsOutstanding: n(row['pointsOutstanding']),
      publishedContent: n(row['publishedContent']), totalRedemptions: n(row['totalRedemptions']),
      activeQuests: n(row['activeQuests']), openPredictions: n(row['openPredictions']), openAuctions: n(row['openAuctions']),
      openModerationTickets: n(row['openModerationTickets']),
    };
  }

  /** User analytics — totals, growth, region/status breakdowns. */
  async users(tx?: DBExecutor): Promise<Record<string, unknown>> {
    const db = this.exec(tx);
    const totals = (await db.execute(sql`
      select
        (select count(*)::int from users where account_type='customer' and deleted_at is null) as "totalCustomers",
        (select count(*)::int from users where account_type='customer' and created_at > now()-interval '7 days') as "newLast7d",
        (select count(*)::int from users where account_type='customer' and created_at > now()-interval '30 days') as "newLast30d",
        (select count(*)::int from users where account_type='customer' and last_login_at > now()-interval '30 days') as "activeLast30d"
    `) as unknown as { rows: Record<string, number>[] }).rows[0];
    const byRegion = (await db.execute(sql`select coalesce(region,'unknown') as region, count(*)::int as count from users where account_type='customer' and deleted_at is null group by region order by count desc`) as unknown as { rows: unknown[] }).rows;
    const byStatus = (await db.execute(sql`select status, count(*)::int as count from users where account_type='customer' and deleted_at is null group by status`) as unknown as { rows: unknown[] }).rows;
    return { ...totals, byRegion, byStatus };
  }

  /** Subscription analytics — active/MRR + plan and region breakdowns + revenue. */
  async subscriptions(tx?: DBExecutor): Promise<Record<string, unknown>> {
    const db = this.exec(tx);
    const totals = (await db.execute(sql`
      select
        (select count(*)::int from subscriptions where status in ('active','trialing')) as "active",
        (select count(*)::int from subscriptions where status='trialing') as "trialing",
        (select count(*)::int from subscriptions where status='canceled') as "canceled",
        (select coalesce(sum(amount_cents),0)::bigint from subscriptions where status in ('active','trialing')) as "mrrCents",
        (select coalesce(sum(amount_cents),0)::bigint from subscription_invoices where status='paid') as "grossRevenueCents"
    `) as unknown as { rows: Record<string, number>[] }).rows[0];
    const byPlan = (await db.execute(sql`select sp.name as "planName", count(*)::int as count, coalesce(sum(s.amount_cents),0)::bigint as "mrrCents" from subscriptions s left join subscription_plans sp on sp.id=s.plan_id where s.status in ('active','trialing') group by sp.name order by count desc`) as unknown as { rows: unknown[] }).rows;
    const byRegion = (await db.execute(sql`select coalesce(region,'unknown') as region, count(*)::int as count, coalesce(sum(amount_cents),0)::bigint as "mrrCents" from subscriptions where status in ('active','trialing') group by region order by "mrrCents" desc`) as unknown as { rows: unknown[] }).rows;
    return { ...totals, byPlan, byRegion };
  }

  /** Game analytics — per game type instance + participation counts. */
  async games(tx?: DBExecutor): Promise<Record<string, unknown>> {
    const res = (await this.exec(tx).execute(sql`
      select
        (select count(*)::int from quests) as "questsTotal",
        (select count(*)::int from quests where status='active') as "questsActive",
        (select count(*)::int from quest_participations) as "questParticipants",
        (select count(*)::int from predictions) as "predictionsTotal",
        (select count(*)::int from predictions where status='open') as "predictionsOpen",
        (select count(*)::int from prediction_entries) as "predictionEntries",
        (select count(*)::int from auctions) as "auctionsTotal",
        (select count(*)::int from auctions where status='open') as "auctionsOpen",
        (select count(*)::int from bids) as "bidsTotal",
        (select count(*)::int from user_streaks where current_streak > 0) as "activeStreakers"
    `) as unknown as { rows: Record<string, number>[] }).rows[0];
    return res ?? {};
  }

  /** Realtime pulse — live-ish counters for the dashboard. */
  async realtime(tx?: DBExecutor): Promise<Record<string, unknown>> {
    const res = (await this.exec(tx).execute(sql`
      select
        (select count(distinct user_id)::int from content_views where last_heartbeat_at > now()-interval '5 minutes') as "liveViewers",
        (select count(*)::int from content_views where counted and started_at > now()-interval '1 hour') as "viewsLastHour",
        (select count(*)::int from users where account_type='customer' and created_at > date_trunc('day', now())) as "signupsToday",
        (select coalesce(sum(amount),0)::bigint from ledger_transactions where currency='points' and direction='earn' and created_at > date_trunc('day', now())) as "pointsEarnedToday"
    `) as unknown as { rows: Record<string, number>[] }).rows[0];
    return res ?? {};
  }

  /** Licensing rollup across the catalog — status breakdown + soon-expiring titles. */
  async licensing(tx?: DBExecutor): Promise<Record<string, unknown>> {
    const db = this.exec(tx);
    const byStatus = (await db.execute(sql`select coalesce(license_status,'original') as status, count(*)::int as count from contents where deleted_at is null group by license_status order by count desc`) as unknown as { rows: unknown[] }).rows;
    const expiringSoon = (await db.execute(sql`
      select id, title, licensor_name as "licensorName", license_expires_at as "expiresAt", license_status as "licenseStatus"
      from contents
      where deleted_at is null and license_expires_at is not null and license_expires_at <= now() + interval '30 days'
      order by license_expires_at asc limit 50`) as unknown as { rows: unknown[] }).rows;
    return { byStatus, expiringSoon };
  }


  private async rows(db: DBExecutor, query: SQL): Promise<Row[]> {
    return ((await db.execute(query)) as unknown as { rows: Row[] }).rows;
  }

  private async one(db: DBExecutor, query: SQL): Promise<Row> {
    return (await this.rows(db, query))[0] ?? {};
  }

  /**
   * Per-content analytics. Lifetime counters (denormalized + all sessions) plus window-scoped
   * blocks over `[from, to)`: period change, retention, traffic sources, demographics, geo, BTS.
   * `games` is lifetime (quest participations carry no timestamp).
   */
  async content(contentId: string, window: AnalyticsWindow, tx?: DBExecutor): Promise<ContentAnalytics | null> {
    const db = this.exec(tx);
    const { from, to } = window;
    const cRows = await db
      .select({ viewCount: contents.viewCount, uniqueViewerCount: contents.uniqueViewerCount, likeCount: contents.likeCount, dislikeCount: contents.dislikeCount, commentCount: contents.commentCount, shareCount: contents.shareCount })
      .from(contents)
      .where(eq(contents.id, contentId))
      .limit(1);
    const c = cRows[0];
    if (!c) {
      return null;
    }
    const inWindow = sql`cv.content_id = ${contentId} and cv.counted and cv.started_at >= ${from}::timestamptz and cv.started_at < ${to}::timestamptz`;

    const [aggRows, daily, period, retentionRows, sourceRows, genderRows, deviceRows, geoRows, games, childRows, btsRow] = await Promise.all([
      db
        .select({
          sessions: sql<number>`count(*)::int`,
          distinctViewers: sql<number>`count(distinct ${contentViews.userId})::int`,
          avgCompletion: sql<number>`coalesce(avg(${contentViews.completionPercent}),0)::float`,
          totalWatchSeconds: sql<number>`coalesce(sum(${contentViews.watchedSeconds}),0)::bigint`,
        })
        .from(contentViews)
        .where(eq(contentViews.contentId, contentId)),
      // Daily series (UTC days, zero-filled, newest first) from the raw view sessions —
      // content_daily_stats has no rollup job populating it yet.
      this.rows(db, sql`
        with days as (
          select generate_series(
            date_trunc('day', ${from}::timestamptz at time zone 'UTC'),
            ${to}::timestamptz at time zone 'UTC' - interval '1 microsecond',
            interval '1 day'
          ) as d
        ),
        agg as (
          select date_trunc('day', cv.started_at at time zone 'UTC') as d, count(*)::int as views,
            count(distinct cv.user_id)::int as "uniqueViewers", coalesce(sum(cv.watched_seconds),0)::bigint as "watchSeconds",
            coalesce(avg(cv.completion_percent),0)::float as "avgCompletion"
          from content_views cv where ${inWindow} group by 1
        )
        select to_char(days.d, 'YYYY-MM-DD') as date, coalesce(agg.views,0) as views, coalesce(agg."uniqueViewers",0) as "uniqueViewers",
          coalesce(agg."watchSeconds",0) as "watchSeconds", coalesce(agg."avgCompletion",0) as "avgCompletion"
        from days left join agg on agg.d = days.d order by days.d desc`),
      // Window vs the previous window of equal length.
      this.one(db, sql`
        with w as (select ${from}::timestamptz as f, ${to}::timestamptz as t)
        select
          count(*) filter (where cv.started_at >= w.f)::int as views,
          coalesce(sum(cv.watched_seconds) filter (where cv.started_at >= w.f),0)::bigint as "watchSeconds",
          count(*) filter (where cv.started_at < w.f)::int as "prevViews",
          coalesce(sum(cv.watched_seconds) filter (where cv.started_at < w.f),0)::bigint as "prevWatchSeconds"
        from w join content_views cv
          on cv.content_id = ${contentId} and cv.started_at >= w.f - (w.t - w.f) and cv.started_at < w.t`),
      // Retention: share of viewers whose furthest playhead reached each 10 % bucket of the
      // duration (falls back to completion_percent when the duration is unknown).
      this.rows(db, sql`
        with d as (select coalesce(duration_seconds,0) as dur from contents where id = ${contentId}),
        v as (
          select cv.user_id, max(cv.max_position_seconds) as mp, max(cv.completion_percent) as cp
          from content_views cv where ${inWindow} group by cv.user_id
        )
        select b.pct::int as percent,
          count(v.user_id) filter (where case when d.dur > 0 then v.mp >= d.dur * b.pct / 100.0 else v.cp >= b.pct end)::int as viewers
        from generate_series(0,100,10) as b(pct) cross join d left join v on true
        group by b.pct order by b.pct`),
      this.rows(db, sql`
        select coalesce(cv.source,'unknown') as source, count(*)::int as views
        from content_views cv where ${inWindow} group by 1 order by views desc`),
      this.rows(db, sql`
        select coalesce(u.gender,'unknown') as gender, count(*)::int as views, count(distinct cv.user_id)::int as viewers
        from content_views cv join users u on u.id = cv.user_id where ${inWindow} group by 1 order by views desc`),
      this.rows(db, sql`
        select coalesce(cv.device,'unknown') as device, count(*)::int as views, count(distinct cv.user_id)::int as viewers
        from content_views cv where ${inWindow} group by 1 order by views desc`),
      this.rows(db, sql`
        select coalesce(u.country_code,'unknown') as "countryCode", count(*)::int as views, coalesce(sum(cv.watched_seconds),0)::bigint as "watchSeconds"
        from content_views cv join users u on u.id = cv.user_id where ${inWindow} group by 1 order by views desc limit 100`),
      this.one(db, sql`
        select
          (select count(*)::int from predictions where content_id = ${contentId}) as predictions,
          (select count(*)::int from prediction_entries pe join predictions p on p.id = pe.prediction_id where p.content_id = ${contentId}) as "predictionEntries",
          (select count(*)::int from auctions where content_id = ${contentId}) as auctions,
          (select count(*)::int from bids b join auctions a on a.id = b.auction_id where a.content_id = ${contentId}) as bids,
          (select count(*)::int from quest_contents where content_id = ${contentId}) as quests,
          (select count(distinct qp.user_id)::int from quest_participations qp join quest_contents qc on qc.quest_id = qp.quest_id where qc.content_id = ${contentId}) as "questParticipants",
          (select count(distinct qp.user_id)::int from quest_participations qp join quest_contents qc on qc.quest_id = qp.quest_id where qc.content_id = ${contentId} and qp.is_completed) as "questCompletions"`),
      this.rows(db, sql`
        select c.id, c.title, c.content_type as "contentType",
          (select count(*)::int from content_views cv
            where cv.content_id = c.id and cv.counted and cv.started_at >= ${from}::timestamptz and cv.started_at < ${to}::timestamptz) as views
        from contents c where c.parent_content_id = ${contentId} and c.deleted_at is null
        order by views desc, c.created_at asc`),
      // BTS click-through: parent viewers in the window who also viewed any child in the window.
      this.one(db, sql`
        with pv as (select distinct cv.user_id from content_views cv where ${inWindow}),
        kv as (
          select distinct cv.user_id from content_views cv join contents k on k.id = cv.content_id
          where k.parent_content_id = ${contentId} and k.deleted_at is null
            and cv.counted and cv.started_at >= ${from}::timestamptz and cv.started_at < ${to}::timestamptz
        )
        select (select count(*)::int from pv) as "parentViewers",
               (select count(*)::int from pv join kv using (user_id)) as "childViewers"`),
    ]);

    const agg = aggRows[0];
    const totalViewers = num(retentionRows[0]?.['viewers']);
    const views = num(period['views']);
    const prevViews = num(period['prevViews']);
    const watchSeconds = num(period['watchSeconds']);
    const prevWatchSeconds = num(period['prevWatchSeconds']);
    const parentViewers = num(btsRow['parentViewers']);
    const childViewers = num(btsRow['childViewers']);

    return {
      viewCount: c.viewCount, uniqueViewerCount: c.uniqueViewerCount, likeCount: c.likeCount,
      dislikeCount: c.dislikeCount, commentCount: c.commentCount, shareCount: c.shareCount,
      sessions: num(agg?.sessions), distinctViewers: num(agg?.distinctViewers), avgCompletion: num(agg?.avgCompletion), totalWatchSeconds: num(agg?.totalWatchSeconds),
      daily: daily.map((d) => ({ date: String(d['date']), views: num(d['views']), uniqueViewers: num(d['uniqueViewers']), watchSeconds: num(d['watchSeconds']), avgCompletion: Math.round(num(d['avgCompletion']) * 100) / 100 })),
      from,
      to,
      periodChange: {
        views, prevViews, viewsPct: pctChange(views, prevViews),
        watchSeconds, prevWatchSeconds, watchSecondsPct: pctChange(watchSeconds, prevWatchSeconds),
      },
      retention: retentionRows.map((r) => ({ percent: num(r['percent']), viewers: num(r['viewers']), ratio: ratio(num(r['viewers']), totalViewers) })),
      trafficSources: sourceRows.map((r) => ({ source: String(r['source']), views: num(r['views']) })),
      demographics: {
        gender: genderRows.map((r) => ({ gender: String(r['gender']), views: num(r['views']), viewers: num(r['viewers']) })),
        device: deviceRows.map((r) => ({ device: String(r['device']), views: num(r['views']), viewers: num(r['viewers']) })),
      },
      geo: geoRows.map((r) => ({ countryCode: String(r['countryCode']), views: num(r['views']), watchSeconds: num(r['watchSeconds']) })),
      games: {
        predictions: num(games['predictions']), predictionEntries: num(games['predictionEntries']),
        auctions: num(games['auctions']), bids: num(games['bids']),
        quests: num(games['quests']), questParticipants: num(games['questParticipants']), questCompletions: num(games['questCompletions']),
      },
      bts: {
        children: childRows.map((r) => ({ id: String(r['id']), title: String(r['title']), contentType: String(r['contentType']), views: num(r['views']) })),
        parentViewers,
        childViewers,
        ctr: ratio(childViewers, parentViewers),
      },
    };
  }

  /**
   * Catalog-wide content analytics over `[from, to)`. Viewer-side blocks are filtered by the
   * viewer's `users.region` when `region` is set. Licence / sponsorship revenue is the active
   * agreements' booked revenue (not windowed, not region-attributable).
   */
  async contentLibrary(p: ContentLibraryParams, tx?: DBExecutor): Promise<ContentLibraryAnalytics> {
    const db = this.exec(tx);
    const { from, to, region, hitThreshold } = p;
    const regionFilter = region !== null ? sql`and u.region = ${region}` : sql``;
    const win = (col: SQL) => sql`${col} >= ${from}::timestamptz and ${col} < ${to}::timestamptz`;
    // Views in the window by users in the region.
    const viewsCte = sql`
      rv as (
        select cv.content_id, cv.user_id, cv.watched_seconds, cv.completion_percent, coalesce(u.region,'unknown') as region
        from content_views cv join users u on u.id = cv.user_id
        where cv.counted and ${win(sql`cv.started_at`)} ${regionFilter}
      )`;

    const [totals, byRegion, hit, conv, revenue, bts, shareVel, top] = await Promise.all([
      this.one(db, sql`
        with ${viewsCte},
        rx as (
          select r.user_id, r.reaction from content_reactions r join users u on u.id = r.user_id
          where ${win(sql`r.created_at`)} ${regionFilter}
        ),
        rc as (
          select c.user_id from comments c join users u on u.id = c.user_id
          where c.deleted_at is null and ${win(sql`c.created_at`)} ${regionFilter}
        ),
        rs as (
          select s.user_id from content_shares s join users u on u.id = s.user_id
          where ${win(sql`s.created_at`)} ${regionFilter}
        )
        select
          (select count(*)::int from rv) as views,
          (select count(distinct user_id)::int from rv) as "uniqueViewers",
          (select coalesce(sum(watched_seconds),0)::bigint from rv) as "watchSeconds",
          (select coalesce(avg(completion_percent),0)::float from rv) as "avgCompletion",
          (select count(*)::int from rx where reaction = 'like') as likes,
          (select count(*)::int from rx where reaction = 'dislike') as dislikes,
          (select count(*)::int from rc) as comments,
          (select count(*)::int from rs) as shares,
          (select count(*)::int from (
            select user_id from rv
            intersect
            select user_id from (select user_id from rx union select user_id from rc union select user_id from rs) e
          ) x) as engaged,
          (select count(*)::int from (
            select user_id from rv
            intersect
            select cu.user_id from content_unlocks cu where ${win(sql`cu.unlocked_at`)}
          ) x) as unlockers,
          (select coalesce(sum(cu.points_spent),0)::bigint from content_unlocks cu join users u on u.id = cu.user_id
            where ${win(sql`cu.unlocked_at`)} ${regionFilter}) as "unlockPointsSpent"`),
      this.rows(db, sql`
        with ${viewsCte}
        select region, count(*)::int as views, coalesce(sum(watched_seconds),0)::bigint as "watchSeconds"
        from rv group by region order by views desc`),
      this.one(db, sql`
        with ${viewsCte},
        pc as (
          select c.id, (select count(*) from rv where rv.content_id = c.id) as views
          from contents c where c.status = 'published' and c.deleted_at is null
        )
        select count(*)::int as "publishedTitles", count(*) filter (where views >= ${hitThreshold})::int as hits from pc`),
      // Viewers who joined a game (prediction / auction / quest) linked to a content they viewed.
      this.one(db, sql`
        with ${viewsCte},
        v as (select distinct user_id, content_id from rv),
        players as (
          select v.user_id from v
            join predictions p on p.content_id = v.content_id
            join prediction_entries pe on pe.prediction_id = p.id and pe.user_id = v.user_id
          union
          select v.user_id from v
            join auctions a on a.content_id = v.content_id
            join bids b on b.auction_id = a.id and b.user_id = v.user_id
          union
          select v.user_id from v
            join quest_contents qc on qc.content_id = v.content_id
            join quest_participations qp on qp.quest_id = qc.quest_id and qp.user_id = v.user_id
        )
        select (select count(distinct user_id)::int from v) as viewers, (select count(*)::int from players) as players`),
      this.one(db, sql`
        select
          (select coalesce(sum(revenue_generated_cents),0)::bigint from content_licenses where is_active) as "licenseRevenueCents",
          (select coalesce(sum(revenue_cents),0)::bigint from content_sponsorships where is_active) as "sponsorshipRevenueCents"`),
      // BTS upsell: viewers of primary titles that have children → who also viewed one of its children.
      this.one(db, sql`
        with ${viewsCte},
        pv as (
          select distinct rv.user_id, rv.content_id as parent_id from rv join contents p on p.id = rv.content_id
          where p.parent_content_id is null
            and exists (select 1 from contents k where k.parent_content_id = p.id and k.deleted_at is null)
        ),
        kv as (
          select distinct rv.user_id, k.parent_content_id as parent_id from rv join contents k on k.id = rv.content_id
          where k.parent_content_id is not null and k.deleted_at is null
        )
        select (select count(distinct user_id)::int from pv) as "parentViewers",
               (select count(distinct pv.user_id)::int from pv join kv using (user_id, parent_id)) as "btsViewers"`),
      this.one(db, sql`
        select
          count(*) filter (where s.created_at >= ${to}::timestamptz - interval '24 hours')::int as "last24h",
          count(*) filter (where s.created_at < ${to}::timestamptz - interval '24 hours')::int as "prev24h"
        from content_shares s join users u on u.id = s.user_id
        where s.created_at >= ${to}::timestamptz - interval '48 hours' and s.created_at < ${to}::timestamptz ${regionFilter}`),
      this.rows(db, sql`
        with ${viewsCte}
        select c.id, c.title, c.content_type as "contentType", count(*)::int as views,
          count(distinct rv.user_id)::int as "uniqueViewers", coalesce(sum(rv.watched_seconds),0)::bigint as "watchSeconds",
          coalesce(avg(rv.completion_percent),0)::float as "avgCompletion"
        from rv join contents c on c.id = rv.content_id
        where c.deleted_at is null
        group by c.id, c.title, c.content_type
        order by views desc, c.id limit 10`),
    ]);

    const views = num(totals['views']);
    const watchSeconds = num(totals['watchSeconds']);
    const likes = num(totals['likes']);
    const dislikes = num(totals['dislikes']);
    const comments = num(totals['comments']);
    const shares = num(totals['shares']);
    const viewers = num(conv['viewers']);
    const players = num(conv['players']);
    const publishedTitles = num(hit['publishedTitles']);
    const hits = num(hit['hits']);
    const parentViewers = num(bts['parentViewers']);
    const btsViewers = num(bts['btsViewers']);
    const last24h = num(shareVel['last24h']);
    const prev24h = num(shareVel['prev24h']);
    const round2 = (v: number) => Math.round(v * 100) / 100;

    return {
      from,
      to,
      region,
      totals: {
        views,
        uniqueViewers: num(totals['uniqueViewers']),
        watchSeconds,
        avgWatchSeconds: views > 0 ? round2(watchSeconds / views) : 0,
        avgCompletion: round2(num(totals['avgCompletion'])),
        likes,
        comments,
        shares,
        engagementRate: pct(likes + comments + shares, views),
      },
      byRegion: byRegion.map((r) => {
        const v = num(r['views']);
        const ws = num(r['watchSeconds']);
        return { region: String(r['region']), views: v, watchSeconds: ws, avgWatchSeconds: v > 0 ? round2(ws / v) : 0 };
      }),
      hitRate: { threshold: hitThreshold, publishedTitles, hits, percent: pct(hits, publishedTitles) },
      gameConversion: { viewers, players, percent: pct(players, viewers) },
      funnel: { viewers, engaged: num(totals['engaged']), gamePlayers: players, unlockers: num(totals['unlockers']) },
      revenueAttribution: {
        licenseRevenueCents: num(revenue['licenseRevenueCents']),
        sponsorshipRevenueCents: num(revenue['sponsorshipRevenueCents']),
        unlockPointsSpent: num(totals['unlockPointsSpent']),
      },
      btsUpsell: { parentViewers, btsViewers, ctr: ratio(btsViewers, parentViewers) },
      sentiment: { likes, dislikes, positiveRatio: ratio(likes, likes + dislikes) },
      shareVelocity: { last24h, prev24h, changePct: pctChange(last24h, prev24h) },
      topContent: top.map((r) => ({
        id: String(r['id']), title: String(r['title']), contentType: String(r['contentType']),
        views: num(r['views']), uniqueViewers: num(r['uniqueViewers']), watchSeconds: num(r['watchSeconds']),
        avgCompletion: round2(num(r['avgCompletion'])),
      })),
    };
  }

  /**
   * Zero-filled time series for one metric. Buckets are UTC `date_trunc(interval)` from the
   * bucket containing `from` up to `to` (exclusive); data is filtered to `[from, to)`.
   */
  async trend(metric: TrendMetric, p: TrendsParams, tx?: DBExecutor): Promise<TrendPoint[]> {
    const { from, to, interval, region } = p;
    const regionFilter = region !== null ? sql`and u.region = ${region}` : sql``;
    const bucket = (col: SQL) => sql`date_trunc(${interval}, ${col} at time zone 'UTC')`;
    const win = (col: SQL) => sql`${col} >= ${from}::timestamptz and ${col} < ${to}::timestamptz`;

    let source: SQL;
    switch (metric) {
      case 'signups':
        source = sql`select ${bucket(sql`u.created_at`)} as b, count(*)::bigint as v from users u
          where u.account_type = 'customer' and ${win(sql`u.created_at`)} ${regionFilter} group by 1`;
        break;
      case 'active_users':
        source = sql`select ${bucket(sql`cv.started_at`)} as b, count(distinct cv.user_id)::bigint as v
          from content_views cv join users u on u.id = cv.user_id where cv.counted and ${win(sql`cv.started_at`)} ${regionFilter} group by 1`;
        break;
      case 'views':
        source = sql`select ${bucket(sql`cv.started_at`)} as b, count(*)::bigint as v
          from content_views cv join users u on u.id = cv.user_id where cv.counted and ${win(sql`cv.started_at`)} ${regionFilter} group by 1`;
        break;
      case 'watch_seconds':
        source = sql`select ${bucket(sql`cv.started_at`)} as b, coalesce(sum(cv.watched_seconds),0)::bigint as v
          from content_views cv join users u on u.id = cv.user_id where cv.counted and ${win(sql`cv.started_at`)} ${regionFilter} group by 1`;
        break;
      case 'points_earned':
        source = sql`select ${bucket(sql`lt.created_at`)} as b, coalesce(sum(lt.amount),0)::bigint as v
          from ledger_transactions lt join users u on u.id = lt.user_id
          where lt.currency = 'points' and lt.direction = 'earn' and ${win(sql`lt.created_at`)} ${regionFilter} group by 1`;
        break;
      case 'points_spent':
        source = sql`select ${bucket(sql`lt.created_at`)} as b, coalesce(sum(-lt.amount),0)::bigint as v
          from ledger_transactions lt join users u on u.id = lt.user_id
          where lt.currency = 'points' and lt.direction = 'spend' and ${win(sql`lt.created_at`)} ${regionFilter} group by 1`;
        break;
      case 'revenue':
        source = sql`select ${bucket(sql`coalesce(si.paid_at, si.billed_at)`)} as b, coalesce(sum(si.amount_cents),0)::bigint as v
          from subscription_invoices si join users u on u.id = si.user_id
          where si.status = 'paid' and ${win(sql`coalesce(si.paid_at, si.billed_at)`)} ${regionFilter} group by 1`;
        break;
    }

    const rows = await this.rows(this.exec(tx), sql`
      with s as (
        select generate_series(
          date_trunc(${interval}, ${from}::timestamptz at time zone 'UTC'),
          ${to}::timestamptz at time zone 'UTC' - interval '1 microsecond',
          ('1 ' || ${interval})::interval
        ) as b
      ),
      m as (${source})
      select to_char(s.b, 'YYYY-MM-DD') as bucket, coalesce(m.v, 0)::bigint as value
      from s left join m on m.b = s.b order by s.b`);
    return rows.map((r) => ({ bucket: String(r['bucket']), value: num(r['value']) }));
  }
}
