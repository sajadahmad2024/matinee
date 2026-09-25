import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { adEvents, contentSponsorships } from '@db/drizzle/schema';
import { inArray, sql, SQL } from 'drizzle-orm';

export type AdEventType = 'impression' | 'click' | 'skip' | 'complete';

export interface AdEventInsert {
  sponsorshipId?: string | null | undefined;
  contentId?: string | null | undefined;
  /** Feed commercial campaign, or the campaign a sponsorship belongs to. */
  campaignId?: string | null | undefined;
  userId: string;
  viewKey: string;
  eventType: AdEventType;
  positionSeconds?: number | undefined;
  region?: string | null | undefined;
  occurredAt?: string | undefined;
}

export interface AdPerformanceFilters {
  from: string;
  to: string;
  contentId?: string | undefined;
  sponsorshipId?: string | undefined;
  adFormat?: string | undefined;
  active?: boolean | undefined;
  q?: string | undefined;
  sort?: 'impressions_desc' | 'clicks_desc' | 'ctr_desc' | 'revenue_desc' | 'newest' | undefined;
  page: number;
  limit: number;
}

/** Raw counts for one sponsorship (ratios are derived by the service). */
export interface AdPerformanceRow {
  sponsorshipId: string;
  advertiserId: string | null;
  campaignId: string | null;
  contentId: string;
  contentTitle: string;
  sponsorName: string;
  adFormat: string;
  placement: string;
  isActive: boolean;
  isLive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  currency: string;
  impressions: number;
  uniqueViewers: number;
  clicks: number;
  skips: number;
  completes: number;
  revenueCents: number;
}

export interface AdCounts {
  impressions: number;
  uniqueViewers: number;
  clicks: number;
  skips: number;
  completes: number;
  revenueCents: number;
}

export interface AdDailyRow {
  day: string;
  impressions: number;
  clicks: number;
  skips: number;
  completes: number;
}

const likeTerm = (q: string): string => `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
const num = (v: unknown): number => Number(v ?? 0);

/** Ad event tracking (impression/click/skip/complete) + sponsorship performance reporting. */
@Injectable()
export class AdEventRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Sponsorship → { content, campaign } for event validation (unknown ids are dropped). */
  async sponsorshipContents(ids: string[], tx?: DBExecutor): Promise<Map<string, { contentId: string; campaignId: string | null }>> {
    const unique = [...new Set(ids)];
    if (unique.length === 0) {
      return new Map();
    }
    const rows = await this.exec(tx)
      .select({ id: contentSponsorships.id, contentId: contentSponsorships.contentId, campaignId: contentSponsorships.campaignId })
      .from(contentSponsorships)
      .where(inArray(contentSponsorships.id, unique));
    return new Map(rows.map((r) => [r.id, { contentId: r.contentId, campaignId: r.campaignId }]));
  }

  /** Insert, skipping duplicates per (sponsorship | campaign, user, view, type). Returns the number inserted. */
  async insertEvents(events: AdEventInsert[], tx?: DBExecutor): Promise<number> {
    if (events.length === 0) {
      return 0;
    }
    const rows = await this.exec(tx)
      .insert(adEvents)
      .values(
        events.map((e) => ({
          sponsorshipId: e.sponsorshipId ?? null,
          contentId: e.contentId ?? null,
          campaignId: e.campaignId ?? null,
          userId: e.userId,
          viewKey: e.viewKey,
          eventType: e.eventType,
          ...(e.positionSeconds !== undefined ? { positionSeconds: e.positionSeconds } : {}),
          ...(e.region ? { region: e.region } : {}),
          ...(e.occurredAt ? { occurredAt: e.occurredAt } : {}),
        })),
      )
      // two partial dedupe indexes (sponsorship events / campaign-only events) — skip any conflict
      .onConflictDoNothing()
      .returning({ id: adEvents.id });
    return rows.length;
  }

  /** Event counts per sponsorship in `[from, to)` (null window = lifetime). */
  private eventCounts(from: string | null, to: string | null): SQL {
    return sql`
      select e.sponsorship_id,
             count(*) filter (where e.event_type = 'impression') as impressions,
             count(distinct e.user_id) filter (where e.event_type = 'impression') as unique_viewers,
             count(*) filter (where e.event_type = 'click') as clicks,
             count(*) filter (where e.event_type = 'skip') as skips,
             count(*) filter (where e.event_type = 'complete') as completes
        from ad_events e
       where e.sponsorship_id is not null
         and ${from ? sql`e.occurred_at >= ${from}::timestamptz` : sql`true`}
         and ${to ? sql`e.occurred_at < ${to}::timestamptz` : sql`true`}
       group by e.sponsorship_id`;
  }

  private revenueExpr(): SQL {
    return sql`(s.revenue_cents
      + round(coalesce(ev.impressions, 0) * coalesce(s.cpm_cents, 0) / 1000.0)
      + coalesce(ev.clicks, 0) * coalesce(s.cpc_cents, 0))`;
  }

  private filterWhere(f: AdPerformanceFilters): SQL {
    const q = f.q?.trim();
    return sql`c.deleted_at is null
      ${f.contentId ? sql`and s.content_id = ${f.contentId}` : sql``}
      ${f.sponsorshipId ? sql`and s.id = ${f.sponsorshipId}` : sql``}
      ${f.adFormat ? sql`and s.ad_format = ${f.adFormat}` : sql``}
      ${f.active !== undefined ? sql`and s.is_active = ${f.active}` : sql``}
      ${q ? sql`and (s.sponsor_name ilike ${likeTerm(q)} or c.title ilike ${likeTerm(q)})` : sql``}`;
  }

  private orderBy(sort: AdPerformanceFilters['sort']): SQL {
    switch (sort) {
      case 'clicks_desc':
        return sql`clicks desc, s.created_at desc`;
      case 'ctr_desc':
        return sql`(case when coalesce(ev.impressions, 0) = 0 then 0 else ev.clicks::numeric / ev.impressions end) desc, s.created_at desc`;
      case 'revenue_desc':
        return sql`"revenueCents" desc, s.created_at desc`;
      case 'newest':
        return sql`s.created_at desc`;
      case 'impressions_desc':
      case undefined:
      default:
        return sql`impressions desc, s.created_at desc`;
    }
  }

  /** Per-sponsorship performance page + totals over the whole filtered set. */
  async performance(f: AdPerformanceFilters, tx?: DBExecutor): Promise<{ items: AdPerformanceRow[]; total: number; totals: AdCounts }> {
    const db = this.exec(tx);
    const base = sql`
      from content_sponsorships s
      join contents c on c.id = s.content_id
      left join (${this.eventCounts(f.from, f.to)}) ev on ev.sponsorship_id = s.id
      where ${this.filterWhere(f)}`;
    const [page, agg] = await Promise.all([
      db.execute(sql`
        select s.id as "sponsorshipId", s.advertiser_id as "advertiserId", s.campaign_id as "campaignId",
               s.content_id as "contentId", c.title as "contentTitle",
               s.sponsor_name as "sponsorName", s.ad_format as "adFormat", s.placement, s.is_active as "isActive",
               (s.is_active and (s.starts_at is null or s.starts_at <= now()) and (s.ends_at is null or s.ends_at > now())) as "isLive",
               s.starts_at as "startsAt", s.ends_at as "endsAt", s.currency,
               coalesce(ev.impressions, 0) as impressions, coalesce(ev.unique_viewers, 0) as "uniqueViewers",
               coalesce(ev.clicks, 0) as clicks, coalesce(ev.skips, 0) as skips, coalesce(ev.completes, 0) as completes,
               ${this.revenueExpr()} as "revenueCents"
        ${base}
        order by ${this.orderBy(f.sort)}
        limit ${f.limit} offset ${(f.page - 1) * f.limit}`),
      db.execute(sql`
        select count(*) as n,
               coalesce(sum(ev.impressions), 0) as impressions, coalesce(sum(ev.unique_viewers), 0) as "uniqueViewers",
               coalesce(sum(ev.clicks), 0) as clicks, coalesce(sum(ev.skips), 0) as skips,
               coalesce(sum(ev.completes), 0) as completes, coalesce(sum(${this.revenueExpr()}), 0) as "revenueCents"
        ${base}`),
    ]);
    const rows = (page as unknown as { rows: Record<string, unknown>[] }).rows;
    const t = (agg as unknown as { rows: Record<string, unknown>[] }).rows[0] ?? {};
    return {
      items: rows.map((r) => ({
        sponsorshipId: String(r['sponsorshipId']),
        advertiserId: (r['advertiserId'] as string | null) ?? null,
        campaignId: (r['campaignId'] as string | null) ?? null,
        contentId: String(r['contentId']),
        contentTitle: String(r['contentTitle']),
        sponsorName: String(r['sponsorName']),
        adFormat: String(r['adFormat']),
        placement: String(r['placement']),
        isActive: Boolean(r['isActive']),
        isLive: Boolean(r['isLive']),
        startsAt: (r['startsAt'] as string | null) ?? null,
        endsAt: (r['endsAt'] as string | null) ?? null,
        currency: String(r['currency']),
        impressions: num(r['impressions']),
        uniqueViewers: num(r['uniqueViewers']),
        clicks: num(r['clicks']),
        skips: num(r['skips']),
        completes: num(r['completes']),
        revenueCents: num(r['revenueCents']),
      })),
      total: num(t['n']),
      totals: {
        impressions: num(t['impressions']),
        uniqueViewers: num(t['uniqueViewers']),
        clicks: num(t['clicks']),
        skips: num(t['skips']),
        completes: num(t['completes']),
        revenueCents: num(t['revenueCents']),
      },
    };
  }

  /** Lifetime counts for one sponsorship (admin content editor). */
  async lifetime(sponsorshipId: string, tx?: DBExecutor): Promise<AdCounts> {
    const res = await this.exec(tx).execute(sql`
      select coalesce(ev.impressions, 0) as impressions, coalesce(ev.unique_viewers, 0) as "uniqueViewers",
             coalesce(ev.clicks, 0) as clicks, coalesce(ev.skips, 0) as skips, coalesce(ev.completes, 0) as completes,
             ${this.revenueExpr()} as "revenueCents"
        from content_sponsorships s
        left join (${this.eventCounts(null, null)}) ev on ev.sponsorship_id = s.id
       where s.id = ${sponsorshipId}`);
    const r = (res as unknown as { rows: Record<string, unknown>[] }).rows[0] ?? {};
    return {
      impressions: num(r['impressions']),
      uniqueViewers: num(r['uniqueViewers']),
      clicks: num(r['clicks']),
      skips: num(r['skips']),
      completes: num(r['completes']),
      revenueCents: num(r['revenueCents']),
    };
  }

  /** UTC-day series for one sponsorship, zero-filled, oldest first. */
  async daily(sponsorshipId: string, from: string, to: string, tx?: DBExecutor): Promise<AdDailyRow[]> {
    const res = await this.exec(tx).execute(sql`
      with days as (
        select generate_series(
          date_trunc('day', ${from}::timestamptz at time zone 'UTC'),
          date_trunc('day', (${to}::timestamptz - interval '1 microsecond') at time zone 'UTC'),
          interval '1 day') as day
      ), ev as (
        select date_trunc('day', occurred_at at time zone 'UTC') as day,
               count(*) filter (where event_type = 'impression') as impressions,
               count(*) filter (where event_type = 'click') as clicks,
               count(*) filter (where event_type = 'skip') as skips,
               count(*) filter (where event_type = 'complete') as completes
          from ad_events
         where sponsorship_id = ${sponsorshipId}
           and occurred_at >= ${from}::timestamptz and occurred_at < ${to}::timestamptz
         group by 1
      )
      select to_char(d.day, 'YYYY-MM-DD') as day, coalesce(ev.impressions, 0) as impressions,
             coalesce(ev.clicks, 0) as clicks, coalesce(ev.skips, 0) as skips, coalesce(ev.completes, 0) as completes
        from days d left join ev on ev.day = d.day
       order by d.day asc`);
    return (res as unknown as { rows: Record<string, unknown>[] }).rows.map((r) => ({
      day: String(r['day']),
      impressions: num(r['impressions']),
      clicks: num(r['clicks']),
      skips: num(r['skips']),
      completes: num(r['completes']),
    }));
  }
}
