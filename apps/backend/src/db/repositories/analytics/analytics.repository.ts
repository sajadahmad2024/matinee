import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { contents, contentViews, contentDailyStats } from '@db/drizzle/schema';
import { desc, eq, sql } from 'drizzle-orm';

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
}

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
        (select count(*)::int from content_views where started_at > now()-interval '1 hour') as "viewsLastHour",
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

  /** Per-content analytics — denormalized counters + live view aggregates + a daily trend. */
  async content(contentId: string, tx?: DBExecutor): Promise<ContentAnalytics | null> {
    const db = this.exec(tx);
    const cRows = await db
      .select({ viewCount: contents.viewCount, uniqueViewerCount: contents.uniqueViewerCount, likeCount: contents.likeCount, dislikeCount: contents.dislikeCount, commentCount: contents.commentCount, shareCount: contents.shareCount })
      .from(contents)
      .where(eq(contents.id, contentId))
      .limit(1);
    if (!cRows[0]) {
      return null;
    }
    const aggRows = await db
      .select({
        sessions: sql<number>`count(*)::int`,
        distinctViewers: sql<number>`count(distinct ${contentViews.userId})::int`,
        avgCompletion: sql<number>`coalesce(avg(${contentViews.completionPercent}),0)::float`,
        totalWatchSeconds: sql<number>`coalesce(sum(${contentViews.watchedSeconds}),0)::bigint`,
      })
      .from(contentViews)
      .where(eq(contentViews.contentId, contentId));
    const agg = aggRows[0]!;
    const daily = await db
      .select({ date: contentDailyStats.statDate, views: contentDailyStats.views, uniqueViewers: contentDailyStats.uniqueViewers, watchSeconds: contentDailyStats.watchSeconds, avgCompletion: contentDailyStats.avgCompletion })
      .from(contentDailyStats)
      .where(eq(contentDailyStats.contentId, contentId))
      .orderBy(desc(contentDailyStats.statDate))
      .limit(30);
    return {
      viewCount: cRows[0].viewCount, uniqueViewerCount: cRows[0].uniqueViewerCount, likeCount: cRows[0].likeCount,
      dislikeCount: cRows[0].dislikeCount, commentCount: cRows[0].commentCount, shareCount: cRows[0].shareCount,
      sessions: agg.sessions, distinctViewers: agg.distinctViewers, avgCompletion: Number(agg.avgCompletion), totalWatchSeconds: Number(agg.totalWatchSeconds),
      daily: daily.map((d) => ({ date: d.date, views: d.views, uniqueViewers: d.uniqueViewers, watchSeconds: Number(d.watchSeconds), avgCompletion: Number(d.avgCompletion) })),
    };
  }
}
