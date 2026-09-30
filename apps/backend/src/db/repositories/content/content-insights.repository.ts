import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { SQL, sql } from 'drizzle-orm';

export interface ContentStats {
  total: number;
  byStatus: Record<'draft' | 'pending_approval' | 'scheduled' | 'published' | 'rejected' | 'archived', number>;
  boosted: number;
  sponsored: number;
  activeLibrary: number;
  addedThisMonth: number;
  addedLast30d: number;
  addedPrev30d: number;
  addedLast30dChangePct: number | null;
  pipeline: { draft: number; inReview: number; scheduled: number };
  avgTimeToPublishHours: number | null;
  expiringThisMonth: number;
  expiringNextMonth: number;
  licensed: number;
  original: number;
}

export interface LicenseListFilters {
  q?: string | undefined;
  expiresWithinDays?: number | undefined;
  renewalStatus?: string | undefined;
  licenseType?: string | undefined;
  sort?: 'expires_asc' | 'revenue_desc' | 'cost_desc' | 'roi_desc' | undefined;
  page: number;
  limit: number;
}

export interface LicenseAgreementRow {
  licenseId: string;
  contentId: string;
  title: string;
  thumbnailMediaId: string | null;
  licensorName: string;
  licenseType: string;
  startsAt: string | null;
  expiresAt: string | null;
  daysLeft: number | null;
  renewalStatus: string;
  licenseCostCents: number;
  revenueGeneratedCents: number;
  revenueSource: string | null;
  currency: string;
  roi: number | null;
  views: number;
  terms: string | null;
}

export interface LicenseSummary {
  licensedCount: number;
  originalCount: number;
  activeAgreements: number;
  totalCostCents: number;
  totalRevenueCents: number;
  monthlyCostCents: number;
  costPerStreamCents: number;
  expiringIn30: number;
  expiringIn60: number;
  expiringIn90: number;
  monthlyCostTrend: Array<{ month: string; costCents: number }>;
}

type Row = Record<string, string | number | null>;
const rowsOf = (res: unknown): Row[] => (res as { rows: Row[] }).rows;
const num = (v: string | number | null | undefined): number => Number(v ?? 0);
const numOrNull = (v: string | number | null | undefined): number | null => (v === null || v === undefined ? null : Number(v));

/**
 * Monthly cost of one licence row: cost spread evenly over its term in months (min 1;
 * open-ended terms count as 12). Expression over alias `l`.
 */
const MONTHLY_COST = sql.raw(`(l.license_cost_cents::numeric / greatest(1, case
    when l.expires_at is not null
      then round(extract(epoch from (l.expires_at - coalesce(l.starts_at, l.created_at))) / (30.44 * 86400))
    else 12 end))`);

/** Admin content dashboards: tab counts / inventory tiles and the licensing workspace. */
@Injectable()
export class ContentInsightsRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Same availability rule as the content directory (alias `c`). */
  private regionFilter(region: string | undefined): SQL {
    if (!region) return sql`true`;
    return sql`(exists (select 1 from content_regions r where r.content_id = c.id and r.region = ${region} and r.is_live)
      or (c.rights_region = 'global' and not exists (select 1 from content_regions r where r.content_id = c.id)))`;
  }

  async stats(region: string | undefined, tx?: DBExecutor): Promise<ContentStats> {
    const res = await this.exec(tx).execute(sql`
      select
        count(*) as total,
        count(*) filter (where c.status = 'draft') as draft,
        count(*) filter (where c.status = 'pending_approval') as pending,
        count(*) filter (where c.status = 'scheduled') as scheduled,
        count(*) filter (where c.status = 'published') as published,
        count(*) filter (where c.status = 'rejected') as rejected,
        count(*) filter (where c.status = 'archived') as archived,
        count(*) filter (where c.is_boosted) as boosted,
        count(*) filter (where c.is_sponsored) as sponsored,
        count(*) filter (where c.created_at >= date_trunc('month', now())) as "addedThisMonth",
        count(*) filter (where c.created_at > now() - interval '30 days') as "addedLast30d",
        count(*) filter (where c.created_at <= now() - interval '30 days' and c.created_at > now() - interval '60 days') as "addedPrev30d",
        avg(extract(epoch from (c.published_at - c.created_at)) / 3600)
          filter (where c.published_at is not null and c.published_at > now() - interval '90 days') as "avgTimeToPublishHours",
        count(*) filter (where c.license_expires_at >= now()
          and c.license_expires_at < date_trunc('month', now()) + interval '1 month') as "expiringThisMonth",
        count(*) filter (where c.license_expires_at >= date_trunc('month', now()) + interval '1 month'
          and c.license_expires_at < date_trunc('month', now()) + interval '2 months') as "expiringNextMonth",
        count(*) filter (where c.license_status in ('licensed', 'expiring')) as licensed,
        count(*) filter (where c.license_status = 'original') as original
      from contents c
      where c.deleted_at is null and ${this.regionFilter(region)}
    `);
    const r = rowsOf(res)[0] ?? {};
    const last30 = num(r['addedLast30d']);
    const prev30 = num(r['addedPrev30d']);
    const avgHours = numOrNull(r['avgTimeToPublishHours']);
    return {
      total: num(r['total']),
      byStatus: {
        draft: num(r['draft']),
        pending_approval: num(r['pending']),
        scheduled: num(r['scheduled']),
        published: num(r['published']),
        rejected: num(r['rejected']),
        archived: num(r['archived']),
      },
      boosted: num(r['boosted']),
      sponsored: num(r['sponsored']),
      activeLibrary: num(r['published']),
      addedThisMonth: num(r['addedThisMonth']),
      addedLast30d: last30,
      addedPrev30d: prev30,
      addedLast30dChangePct: prev30 > 0 ? Math.round(((last30 - prev30) / prev30) * 1000) / 10 : null,
      pipeline: { draft: num(r['draft']), inReview: num(r['pending']), scheduled: num(r['scheduled']) },
      avgTimeToPublishHours: avgHours === null ? null : Math.round(avgHours * 10) / 10,
      expiringThisMonth: num(r['expiringThisMonth']),
      expiringNextMonth: num(r['expiringNextMonth']),
      licensed: num(r['licensed']),
      original: num(r['original']),
    };
  }

  async listLicenses(f: LicenseListFilters, tx?: DBExecutor): Promise<{ items: LicenseAgreementRow[]; total: number }> {
    const q = f.q?.trim();
    const like = q ? `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%` : null;
    const where = sql`l.is_active and c.deleted_at is null
      ${like ? sql`and (c.title ilike ${like} or l.licensor_name ilike ${like})` : sql``}
      ${f.expiresWithinDays !== undefined
        ? sql`and l.expires_at is not null and l.expires_at <= now() + make_interval(days => ${f.expiresWithinDays})`
        : sql``}
      ${f.renewalStatus ? sql`and l.renewal_status = ${f.renewalStatus}` : sql``}
      ${f.licenseType ? sql`and l.license_type = ${f.licenseType}` : sql``}`;
    const roi = sql.raw(`case when l.license_cost_cents > 0
      then round(l.revenue_generated_cents::numeric / l.license_cost_cents, 2) end`);
    const order =
      f.sort === 'revenue_desc'
        ? sql`l.revenue_generated_cents desc`
        : f.sort === 'cost_desc'
          ? sql`l.license_cost_cents desc`
          : f.sort === 'roi_desc'
            ? sql`${roi} desc nulls last`
            : sql`l.expires_at asc nulls last`;
    const db = this.exec(tx);
    const [items, count] = await Promise.all([
      db.execute(sql`
        select l.id as "licenseId", c.id as "contentId", c.title, c.thumbnail_media_id as "thumbnailMediaId",
               l.licensor_name as "licensorName", l.license_type as "licenseType",
               l.starts_at as "startsAt", l.expires_at as "expiresAt",
               case when l.expires_at is null then null
                    else ceil(extract(epoch from (l.expires_at - now())) / 86400)::int end as "daysLeft",
               l.renewal_status as "renewalStatus", l.license_cost_cents as "licenseCostCents",
               l.revenue_generated_cents as "revenueGeneratedCents", l.revenue_source as "revenueSource",
               l.currency, ${roi} as roi, c.view_count as views, l.terms
          from content_licenses l
          join contents c on c.id = l.content_id
         where ${where}
         order by ${order}, l.id
         limit ${f.limit} offset ${(f.page - 1) * f.limit}`),
      db.execute(sql`select count(*)::int as n from content_licenses l join contents c on c.id = l.content_id where ${where}`),
    ]);
    return {
      items: rowsOf(items).map((r) => ({
        licenseId: String(r['licenseId']),
        contentId: String(r['contentId']),
        title: String(r['title']),
        thumbnailMediaId: r['thumbnailMediaId'] === null ? null : String(r['thumbnailMediaId']),
        licensorName: String(r['licensorName']),
        licenseType: String(r['licenseType']),
        startsAt: r['startsAt'] === null ? null : String(r['startsAt']),
        expiresAt: r['expiresAt'] === null ? null : String(r['expiresAt']),
        daysLeft: numOrNull(r['daysLeft']),
        renewalStatus: String(r['renewalStatus']),
        licenseCostCents: num(r['licenseCostCents']),
        revenueGeneratedCents: num(r['revenueGeneratedCents']),
        revenueSource: r['revenueSource'] === null ? null : String(r['revenueSource']),
        currency: String(r['currency']),
        roi: numOrNull(r['roi']),
        views: num(r['views']),
        terms: r['terms'] === null ? null : String(r['terms']),
      })),
      total: num(rowsOf(count)[0]?.['n']),
    };
  }

  async licenseSummary(tx?: DBExecutor): Promise<LicenseSummary> {
    const db = this.exec(tx);
    const [totalsRes, trendRes] = await Promise.all([
      db.execute(sql`
        select
          (select count(*) from contents c where c.deleted_at is null and c.license_status in ('licensed', 'expiring')) as "licensedCount",
          (select count(*) from contents c where c.deleted_at is null and c.license_status = 'original') as "originalCount",
          count(*) as "activeAgreements",
          coalesce(sum(l.license_cost_cents), 0) as "totalCostCents",
          coalesce(sum(l.revenue_generated_cents), 0) as "totalRevenueCents",
          coalesce(sum(${MONTHLY_COST}), 0) as "monthlyCostCents",
          coalesce(sum(c.view_count), 0) as "licensedViews",
          count(*) filter (where l.expires_at between now() and now() + interval '30 days') as "expiringIn30",
          count(*) filter (where l.expires_at between now() and now() + interval '60 days') as "expiringIn60",
          count(*) filter (where l.expires_at between now() and now() + interval '90 days') as "expiringIn90"
        from content_licenses l
        join contents c on c.id = l.content_id and c.deleted_at is null
        where l.is_active`),
      // Licences in force during each of the last 6 months (replaced licences end at their update).
      db.execute(sql`
        select to_char(m.month, 'YYYY-MM') as month,
               coalesce(sum(${MONTHLY_COST}), 0) as "costCents"
          from generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') as m(month)
          left join content_licenses l
            on coalesce(l.starts_at, l.created_at) < m.month + interval '1 month'
           and coalesce(case when l.is_active then l.expires_at else least(l.expires_at, l.updated_at) end, 'infinity') >= m.month
         group by m.month
         order by m.month`),
    ]);
    const t = rowsOf(totalsRes)[0] ?? {};
    const views = num(t['licensedViews']);
    const totalCost = num(t['totalCostCents']);
    return {
      licensedCount: num(t['licensedCount']),
      originalCount: num(t['originalCount']),
      activeAgreements: num(t['activeAgreements']),
      totalCostCents: totalCost,
      totalRevenueCents: num(t['totalRevenueCents']),
      monthlyCostCents: Math.round(num(t['monthlyCostCents'])),
      costPerStreamCents: views > 0 ? Math.round((totalCost / views) * 100) / 100 : 0,
      expiringIn30: num(t['expiringIn30']),
      expiringIn60: num(t['expiringIn60']),
      expiringIn90: num(t['expiringIn90']),
      monthlyCostTrend: rowsOf(trendRes).map((r) => ({ month: String(r['month']), costCents: Math.round(num(r['costCents'])) })),
    };
  }
}
