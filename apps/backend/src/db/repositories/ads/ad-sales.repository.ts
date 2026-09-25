import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { adCampaigns, adLedgerEntries, advertisers, contentSponsorships } from '@db/drizzle/schema';
import { and, eq, inArray, isNull, sql, SQL } from 'drizzle-orm';

export type AdvertiserStatus = 'active' | 'paused' | 'archived';
export type CampaignType = 'commercial' | 'sponsorship';
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'ended';
export type PricingModel = 'flat' | 'cpm' | 'cpc';
export type LedgerKind = 'booked' | 'accrued' | 'invoiced' | 'paid' | 'credit';

export interface AdvertiserRecord {
  id: string;
  name: string;
  logoMediaId: string | null;
  website: string | null;
  contactName: string | null;
  contactEmail: string | null;
  billingEmail: string | null;
  currency: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdvertiserInput {
  name?: string | undefined;
  logoMediaId?: string | null | undefined;
  website?: string | null | undefined;
  contactName?: string | null | undefined;
  contactEmail?: string | null | undefined;
  billingEmail?: string | null | undefined;
  currency?: string | undefined;
  status?: AdvertiserStatus | undefined;
  notes?: string | null | undefined;
}

export interface CampaignRecord {
  id: string;
  advertiserId: string;
  name: string;
  type: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  regions: string[];
  creativeMediaId: string | null;
  clickUrl: string | null;
  ctaLabel: string | null;
  durationSeconds: number | null;
  skippableAfterSeconds: number | null;
  feedFrequency: number;
  weight: number;
  frequencyCapPerUserDay: number | null;
  pricingModel: string;
  flatFeeCents: number;
  cpmCents: number;
  cpcCents: number;
  budgetCents: number | null;
  dailyBudgetCents: number | null;
  impressionGoal: number | null;
  currency: string;
  endedReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CampaignInput = Partial<Omit<CampaignRecord, 'id' | 'status' | 'endedReason' | 'createdAt' | 'updatedAt'>>;

/** Delivery counters for a campaign over a window (or lifetime). */
export interface Delivery {
  impressions: number;
  uniqueViewers: number;
  clicks: number;
  skips: number;
  completes: number;
  /** CPM/CPC value delivered (cents). */
  deliveredCents: number;
}

export interface LedgerRecord {
  id: string;
  advertiserId: string;
  advertiserName: string | null;
  campaignId: string | null;
  campaignName: string | null;
  kind: string;
  amountCents: number;
  currency: string;
  entryDate: string;
  invoiceNumber: string | null;
  dueDate: string | null;
  reference: string | null;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface LedgerTotals {
  bookedCents: number;
  accruedCents: number;
  invoicedCents: number;
  paidCents: number;
  creditCents: number;
  /** booked + accrued − credit */
  revenueCents: number;
  /** booked + accrued − paid − credit */
  balanceCents: number;
}

/** A live commercial campaign ready for feed insertion. */
export interface LiveCommercial {
  campaign: CampaignRecord;
  advertiserName: string;
  advertiserLogoMediaId: string | null;
}

type Row = Record<string, unknown>;
const rowsOf = (r: unknown): Row[] => (r as { rows: Row[] }).rows;
const num = (v: unknown): number => Number(v ?? 0);
const likeTerm = (q: string): string => `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;

/** Delivered CPM/CPC value (cents) of an aggregated events row aliased `ev`, priced by campaign `c`. */
const DELIVERED = sql.raw(
  `(round(coalesce(ev.impressions, 0) * c.cpm_cents / 1000.0) + coalesce(ev.clicks, 0) * c.cpc_cents)`,
);

/** Event counts per campaign in [from, to) (nulls = unbounded). Sponsorship events carry campaign_id too. */
function campaignEventCounts(from: string | SQL | null, to: string | SQL | null): SQL {
  return sql`
    select e.campaign_id,
           count(*) filter (where e.event_type = 'impression') as impressions,
           count(distinct e.user_id) filter (where e.event_type = 'impression') as unique_viewers,
           count(*) filter (where e.event_type = 'click') as clicks,
           count(*) filter (where e.event_type = 'skip') as skips,
           count(*) filter (where e.event_type = 'complete') as completes
      from ad_events e
     where e.campaign_id is not null
       and ${from ? sql`e.occurred_at >= ${from}::timestamptz` : sql`true`}
       and ${to ? sql`e.occurred_at < ${to}::timestamptz` : sql`true`}
     group by e.campaign_id`;
}

/**
 * Ad Sales: advertisers, campaigns (feed commercials + sponsorship groups), the ad-sales ledger,
 * campaign lifecycle and daily revenue accrual.
 * Doc: apps/documentation/docs/backend/ads/ad-sales-management.md
 */
@Injectable()
export class AdSalesRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  transaction<T>(fn: (tx: DBExecutor) => Promise<T>): Promise<T> {
    return this.dbService.transaction(fn);
  }

  // ─── Advertisers ────────────────────────────────────────────────────────────

  private mapAdvertiser(r: typeof advertisers.$inferSelect): AdvertiserRecord {
    return {
      id: r.id,
      name: r.name,
      logoMediaId: r.logoMediaId,
      website: r.website,
      contactName: r.contactName,
      contactEmail: r.contactEmail,
      billingEmail: r.billingEmail,
      currency: r.currency,
      status: r.status,
      notes: r.notes,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async getAdvertiser(id: string, tx?: DBExecutor): Promise<AdvertiserRecord | null> {
    const rows = await this.exec(tx)
      .select()
      .from(advertisers)
      .where(and(eq(advertisers.id, id), isNull(advertisers.deletedAt)))
      .limit(1);
    return rows[0] ? this.mapAdvertiser(rows[0]) : null;
  }

  async findAdvertiserByName(name: string, tx?: DBExecutor): Promise<AdvertiserRecord | null> {
    const rows = await this.exec(tx)
      .select()
      .from(advertisers)
      .where(and(sql`lower(${advertisers.name}) = lower(${name.trim()})`, isNull(advertisers.deletedAt)))
      .limit(1);
    return rows[0] ? this.mapAdvertiser(rows[0]) : null;
  }

  /** Case-insensitive find-or-create (per-video sponsor names). */
  async findOrCreateAdvertiser(name: string, createdBy: string | undefined, tx?: DBExecutor): Promise<AdvertiserRecord> {
    const existing = await this.findAdvertiserByName(name, tx);
    if (existing) return existing;
    const rows = await this.exec(tx)
      .insert(advertisers)
      .values({ name: name.trim(), ...(createdBy ? { createdBy } : {}) })
      .onConflictDoNothing()
      .returning();
    if (rows[0]) return this.mapAdvertiser(rows[0]);
    return (await this.findAdvertiserByName(name, tx))!;
  }

  async createAdvertiser(input: AdvertiserInput & { name: string }, createdBy: string, tx?: DBExecutor): Promise<AdvertiserRecord> {
    const rows = await this.exec(tx)
      .insert(advertisers)
      .values({ ...this.advertiserPatch(input), name: input.name.trim(), createdBy })
      .returning();
    return this.mapAdvertiser(rows[0]!);
  }

  private advertiserPatch(input: AdvertiserInput): Partial<typeof advertisers.$inferInsert> {
    const out: Partial<typeof advertisers.$inferInsert> = {};
    if (input.name !== undefined) out.name = input.name.trim();
    if (input.logoMediaId !== undefined) out.logoMediaId = input.logoMediaId;
    if (input.website !== undefined) out.website = input.website;
    if (input.contactName !== undefined) out.contactName = input.contactName;
    if (input.contactEmail !== undefined) out.contactEmail = input.contactEmail;
    if (input.billingEmail !== undefined) out.billingEmail = input.billingEmail;
    if (input.currency !== undefined) out.currency = input.currency.toUpperCase();
    if (input.status !== undefined) out.status = input.status;
    if (input.notes !== undefined) out.notes = input.notes;
    return out;
  }

  async updateAdvertiser(id: string, input: AdvertiserInput, tx?: DBExecutor): Promise<AdvertiserRecord | null> {
    const rows = await this.exec(tx)
      .update(advertisers)
      .set({ ...this.advertiserPatch(input), updatedAt: sql`now()` })
      .where(and(eq(advertisers.id, id), isNull(advertisers.deletedAt)))
      .returning();
    return rows[0] ? this.mapAdvertiser(rows[0]) : null;
  }

  async softDeleteAdvertiser(id: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .update(advertisers)
      .set({ deletedAt: sql`now()`, status: 'archived', updatedAt: sql`now()` })
      .where(and(eq(advertisers.id, id), isNull(advertisers.deletedAt)))
      .returning({ id: advertisers.id });
    return rows.length > 0;
  }

  /** Campaigns of an advertiser that are still running (blocks deletion). */
  async countOpenCampaigns(advertiserId: string, tx?: DBExecutor): Promise<number> {
    const rows = await this.exec(tx)
      .select({ n: sql<number>`count(*)::int` })
      .from(adCampaigns)
      .where(and(eq(adCampaigns.advertiserId, advertiserId), isNull(adCampaigns.deletedAt), inArray(adCampaigns.status, ['scheduled', 'active', 'paused'])));
    return rows[0]?.n ?? 0;
  }

  /** Advertiser directory with campaign counts and ledger totals. */
  async listAdvertisers(
    f: { q?: string | undefined; status?: string | undefined; page: number; limit: number },
    tx?: DBExecutor,
  ): Promise<{ items: Array<AdvertiserRecord & { campaigns: number; activeCampaigns: number; totals: LedgerTotals }>; total: number }> {
    const q = f.q?.trim();
    const where = sql`a.deleted_at is null
      ${f.status ? sql`and a.status = ${f.status}` : sql``}
      ${q ? sql`and (a.name ilike ${likeTerm(q)} or a.contact_email ilike ${likeTerm(q)} or a.contact_name ilike ${likeTerm(q)})` : sql``}`;
    const db = this.exec(tx);
    const [page, count] = await Promise.all([
      db.execute(sql`
        select a.id, a.name, a.logo_media_id as "logoMediaId", a.website, a.contact_name as "contactName",
               a.contact_email as "contactEmail", a.billing_email as "billingEmail", a.currency, a.status, a.notes,
               a.created_at as "createdAt", a.updated_at as "updatedAt",
               (select count(*) from ad_campaigns c where c.advertiser_id = a.id and c.deleted_at is null) as campaigns,
               (select count(*) from ad_campaigns c where c.advertiser_id = a.id and c.deleted_at is null and c.status = 'active') as "activeCampaigns",
               ${this.ledgerTotalsSelect(sql`l.advertiser_id = a.id`)}
          from advertisers a
         where ${where}
         order by a.name asc
         limit ${f.limit} offset ${(f.page - 1) * f.limit}`),
      db.execute(sql`select count(*)::int as n from advertisers a where ${where}`),
    ]);
    return {
      items: rowsOf(page).map((r) => ({
        id: String(r['id']),
        name: String(r['name']),
        logoMediaId: (r['logoMediaId'] as string | null) ?? null,
        website: (r['website'] as string | null) ?? null,
        contactName: (r['contactName'] as string | null) ?? null,
        contactEmail: (r['contactEmail'] as string | null) ?? null,
        billingEmail: (r['billingEmail'] as string | null) ?? null,
        currency: String(r['currency']),
        status: String(r['status']),
        notes: (r['notes'] as string | null) ?? null,
        createdAt: String(r['createdAt']),
        updatedAt: String(r['updatedAt']),
        campaigns: num(r['campaigns']),
        activeCampaigns: num(r['activeCampaigns']),
        totals: this.mapTotals(r),
      })),
      total: num(rowsOf(count)[0]?.['n']),
    };
  }

  // ─── Campaigns ──────────────────────────────────────────────────────────────

  private mapCampaign(r: typeof adCampaigns.$inferSelect): CampaignRecord {
    return {
      id: r.id,
      advertiserId: r.advertiserId,
      name: r.name,
      type: r.type,
      status: r.status,
      startsAt: r.startsAt,
      endsAt: r.endsAt,
      regions: r.regions,
      creativeMediaId: r.creativeMediaId,
      clickUrl: r.clickUrl,
      ctaLabel: r.ctaLabel,
      durationSeconds: r.durationSeconds,
      skippableAfterSeconds: r.skippableAfterSeconds,
      feedFrequency: r.feedFrequency,
      weight: r.weight,
      frequencyCapPerUserDay: r.frequencyCapPerUserDay,
      pricingModel: r.pricingModel,
      flatFeeCents: r.flatFeeCents,
      cpmCents: r.cpmCents,
      cpcCents: r.cpcCents,
      budgetCents: r.budgetCents,
      dailyBudgetCents: r.dailyBudgetCents,
      impressionGoal: r.impressionGoal,
      currency: r.currency,
      endedReason: r.endedReason,
      notes: r.notes,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  private campaignPatch(input: CampaignInput): Partial<typeof adCampaigns.$inferInsert> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
      if (v !== undefined) out[k] = v;
    }
    return out as Partial<typeof adCampaigns.$inferInsert>;
  }

  async getCampaign(id: string, tx?: DBExecutor): Promise<CampaignRecord | null> {
    const rows = await this.exec(tx)
      .select()
      .from(adCampaigns)
      .where(and(eq(adCampaigns.id, id), isNull(adCampaigns.deletedAt)))
      .limit(1);
    return rows[0] ? this.mapCampaign(rows[0]) : null;
  }

  async createCampaign(input: CampaignInput & { advertiserId: string; name: string; type: CampaignType }, createdBy: string, tx?: DBExecutor): Promise<CampaignRecord> {
    const rows = await this.exec(tx)
      .insert(adCampaigns)
      .values({ ...this.campaignPatch(input), advertiserId: input.advertiserId, name: input.name, type: input.type, createdBy })
      .returning();
    return this.mapCampaign(rows[0]!);
  }

  async updateCampaign(id: string, input: CampaignInput, tx?: DBExecutor): Promise<CampaignRecord | null> {
    const rows = await this.exec(tx)
      .update(adCampaigns)
      .set({ ...this.campaignPatch(input), updatedAt: sql`now()` })
      .where(and(eq(adCampaigns.id, id), isNull(adCampaigns.deletedAt)))
      .returning();
    return rows[0] ? this.mapCampaign(rows[0]) : null;
  }

  /** Guarded status transition: only from one of `from`. */
  async setCampaignStatus(
    id: string,
    to: CampaignStatus,
    from: CampaignStatus[],
    endedReason: string | null = null,
    tx?: DBExecutor,
  ): Promise<CampaignRecord | null> {
    const rows = await this.exec(tx)
      .update(adCampaigns)
      .set({ status: to, endedReason: to === 'ended' ? endedReason : null, updatedAt: sql`now()` })
      .where(and(eq(adCampaigns.id, id), isNull(adCampaigns.deletedAt), inArray(adCampaigns.status, from)))
      .returning();
    return rows[0] ? this.mapCampaign(rows[0]) : null;
  }

  async softDeleteCampaign(id: string, tx?: DBExecutor): Promise<boolean> {
    const run = async (db: DBExecutor) => {
      const rows = await db
        .update(adCampaigns)
        .set({ deletedAt: sql`now()`, updatedAt: sql`now()` })
        .where(and(eq(adCampaigns.id, id), isNull(adCampaigns.deletedAt)))
        .returning({ id: adCampaigns.id });
      if (rows.length > 0) {
        await db.update(contentSponsorships).set({ campaignId: null }).where(eq(contentSponsorships.campaignId, id));
      }
      return rows.length > 0;
    };
    return tx ? run(tx) : this.dbService.transaction(run);
  }

  /** Campaign list with lifetime delivery + spend. */
  async listCampaigns(
    f: {
      advertiserId?: string | undefined;
      type?: string | undefined;
      status?: string[] | undefined;
      region?: string | undefined;
      q?: string | undefined;
      activeFrom?: string | undefined;
      activeTo?: string | undefined;
      page: number;
      limit: number;
    },
    tx?: DBExecutor,
  ): Promise<{ items: Array<CampaignRecord & { advertiserName: string; linkedContents: number; delivery: Delivery }>; total: number }> {
    const q = f.q?.trim();
    const where = sql`c.deleted_at is null
      ${f.advertiserId ? sql`and c.advertiser_id = ${f.advertiserId}` : sql``}
      ${f.type ? sql`and c.type = ${f.type}` : sql``}
      ${f.status?.length ? sql`and c.status in (${sql.join(f.status.map((s) => sql`${s}`), sql`, `)})` : sql``}
      ${f.region ? sql`and (cardinality(c.regions) = 0 or ${f.region} = any(c.regions))` : sql``}
      ${q ? sql`and (c.name ilike ${likeTerm(q)} or a.name ilike ${likeTerm(q)})` : sql``}
      ${f.activeFrom ? sql`and (c.ends_at is null or c.ends_at > ${f.activeFrom}::timestamptz)` : sql``}
      ${f.activeTo ? sql`and (c.starts_at is null or c.starts_at < ${f.activeTo}::timestamptz)` : sql``}`;
    const db = this.exec(tx);
    const [page, count] = await Promise.all([
      db.execute(sql`
        select c.id, a.name as "advertiserName",
               (select count(*) from content_sponsorships s where s.campaign_id = c.id) as "linkedContents",
               coalesce(ev.impressions, 0) as impressions, coalesce(ev.unique_viewers, 0) as "uniqueViewers",
               coalesce(ev.clicks, 0) as clicks, coalesce(ev.skips, 0) as skips, coalesce(ev.completes, 0) as completes,
               ${DELIVERED} as "deliveredCents"
          from ad_campaigns c
          join advertisers a on a.id = c.advertiser_id
          left join (${campaignEventCounts(null, null)}) ev on ev.campaign_id = c.id
         where ${where}
         order by (c.status = 'active') desc, c.starts_at desc nulls last, c.created_at desc
         limit ${f.limit} offset ${(f.page - 1) * f.limit}`),
      db.execute(sql`select count(*)::int as n from ad_campaigns c join advertisers a on a.id = c.advertiser_id where ${where}`),
    ]);
    const meta = rowsOf(page);
    const ids = meta.map((r) => String(r['id']));
    const records = ids.length
      ? await db.select().from(adCampaigns).where(inArray(adCampaigns.id, ids))
      : [];
    const byId = new Map(records.map((r) => [r.id, this.mapCampaign(r)]));
    return {
      items: meta.map((r) => ({
        ...byId.get(String(r['id']))!,
        advertiserName: String(r['advertiserName']),
        linkedContents: num(r['linkedContents']),
        delivery: this.mapDelivery(r),
      })),
      total: num(rowsOf(count)[0]?.['n']),
    };
  }

  private mapDelivery(r: Row): Delivery {
    return {
      impressions: num(r['impressions']),
      uniqueViewers: num(r['uniqueViewers']),
      clicks: num(r['clicks']),
      skips: num(r['skips']),
      completes: num(r['completes']),
      deliveredCents: num(r['deliveredCents']),
    };
  }

  /** Delivery for one campaign in [from, to) (nulls = lifetime). */
  async campaignDelivery(id: string, from: string | null, to: string | null, tx?: DBExecutor): Promise<Delivery> {
    const res = await this.exec(tx).execute(sql`
      select coalesce(ev.impressions, 0) as impressions, coalesce(ev.unique_viewers, 0) as "uniqueViewers",
             coalesce(ev.clicks, 0) as clicks, coalesce(ev.skips, 0) as skips, coalesce(ev.completes, 0) as completes,
             ${DELIVERED} as "deliveredCents"
        from ad_campaigns c
        left join (${campaignEventCounts(from, to)}) ev on ev.campaign_id = c.id
       where c.id = ${id}`);
    return this.mapDelivery(rowsOf(res)[0] ?? {});
  }

  /** UTC-day series for one campaign, zero-filled. */
  async campaignDaily(id: string, from: string, to: string, tx?: DBExecutor): Promise<Array<Delivery & { day: string }>> {
    const res = await this.exec(tx).execute(sql`
      with days as (
        select generate_series(date_trunc('day', ${from}::timestamptz at time zone 'UTC'),
                               date_trunc('day', (${to}::timestamptz - interval '1 microsecond') at time zone 'UTC'),
                               interval '1 day') as day
      ), ev as (
        select date_trunc('day', occurred_at at time zone 'UTC') as day,
               count(*) filter (where event_type = 'impression') as impressions,
               count(distinct user_id) filter (where event_type = 'impression') as unique_viewers,
               count(*) filter (where event_type = 'click') as clicks,
               count(*) filter (where event_type = 'skip') as skips,
               count(*) filter (where event_type = 'complete') as completes
          from ad_events
         where campaign_id = ${id} and occurred_at >= ${from}::timestamptz and occurred_at < ${to}::timestamptz
         group by 1
      )
      select to_char(d.day, 'YYYY-MM-DD') as day, coalesce(ev.impressions, 0) as impressions,
             coalesce(ev.unique_viewers, 0) as "uniqueViewers", coalesce(ev.clicks, 0) as clicks,
             coalesce(ev.skips, 0) as skips, coalesce(ev.completes, 0) as completes,
             round(coalesce(ev.impressions, 0) * c.cpm_cents / 1000.0) + coalesce(ev.clicks, 0) * c.cpc_cents as "deliveredCents"
        from days d cross join ad_campaigns c
        left join ev on ev.day = d.day
       where c.id = ${id}
       order by d.day asc`);
    return rowsOf(res).map((r) => ({ day: String(r['day']), ...this.mapDelivery(r) }));
  }

  /** Link content sponsorships (active ones of the given contents) to a sponsorship campaign. */
  async attachContents(campaignId: string, advertiserId: string, contentIds: string[], tx?: DBExecutor): Promise<{ linked: string[]; missing: string[] }> {
    const run = async (db: DBExecutor) => {
      await db.update(contentSponsorships).set({ campaignId: null }).where(eq(contentSponsorships.campaignId, campaignId));
      if (contentIds.length === 0) return { linked: [], missing: [] };
      const rows = await db
        .update(contentSponsorships)
        .set({ campaignId, advertiserId, updatedAt: sql`now()` })
        .where(and(inArray(contentSponsorships.contentId, contentIds), eq(contentSponsorships.isActive, true), eq(contentSponsorships.adFormat, 'sponsored')))
        .returning({ id: contentSponsorships.id, contentId: contentSponsorships.contentId });
      // Past events of those sponsorships now count toward the campaign.
      if (rows.length > 0) {
        await db.execute(sql`update ad_events set campaign_id = ${campaignId}
          where sponsorship_id in (${sql.join(rows.map((r) => sql`${r.id}`), sql`, `)})`);
      }
      const linked = [...new Set(rows.map((r) => r.contentId))];
      return { linked, missing: contentIds.filter((id) => !linked.includes(id)) };
    };
    return tx ? run(tx) : this.dbService.transaction(run);
  }

  async linkedContents(campaignId: string, tx?: DBExecutor): Promise<Array<{ sponsorshipId: string; contentId: string; title: string; placement: string; isActive: boolean }>> {
    const res = await this.exec(tx).execute(sql`
      select s.id as "sponsorshipId", s.content_id as "contentId", c.title, s.placement, s.is_active as "isActive"
        from content_sponsorships s join contents c on c.id = s.content_id
       where s.campaign_id = ${campaignId} order by c.title`);
    return rowsOf(res).map((r) => ({
      sponsorshipId: String(r['sponsorshipId']),
      contentId: String(r['contentId']),
      title: String(r['title']),
      placement: String(r['placement']),
      isActive: Boolean(r['isActive']),
    }));
  }

  // ─── Serving ────────────────────────────────────────────────────────────────

  /**
   * Live commercial campaigns for the feed: active, in flight, region match, creative present,
   * and not over total budget / today's budget / impression goal. Rotation order = oldest first.
   */
  async liveCommercials(region: string | undefined, tx?: DBExecutor): Promise<LiveCommercial[]> {
    const res = await this.exec(tx).execute(sql`
      select c.id, a.name as "advertiserName", a.logo_media_id as "advertiserLogoMediaId"
        from ad_campaigns c
        join advertisers a on a.id = c.advertiser_id and a.deleted_at is null and a.status = 'active'
        left join (${campaignEventCounts(null, null)}) ev on ev.campaign_id = c.id
        left join (${campaignEventCounts(sql`(date_trunc('day', now() at time zone 'UTC') at time zone 'UTC')`, null)}) td on td.campaign_id = c.id
       where c.deleted_at is null and c.type = 'commercial' and c.status = 'active'
         and c.creative_media_id is not null
         and (c.starts_at is null or c.starts_at <= now()) and (c.ends_at is null or c.ends_at > now())
         ${region ? sql`and (cardinality(c.regions) = 0 or ${region} = any(c.regions))` : sql``}
         and (c.budget_cents is null or ${DELIVERED} < c.budget_cents)
         and (c.impression_goal is null or coalesce(ev.impressions, 0) < c.impression_goal)
         and (c.daily_budget_cents is null
              or round(coalesce(td.impressions, 0) * c.cpm_cents / 1000.0) + coalesce(td.clicks, 0) * c.cpc_cents < c.daily_budget_cents)
       order by c.starts_at asc nulls first, c.created_at asc
       limit 20`);
    const meta = rowsOf(res);
    if (meta.length === 0) return [];
    const records = await this.exec(tx).select().from(adCampaigns).where(inArray(adCampaigns.id, meta.map((r) => String(r['id']))));
    const byId = new Map(records.map((r) => [r.id, this.mapCampaign(r)]));
    return meta.map((r) => ({
      campaign: byId.get(String(r['id']))!,
      advertiserName: String(r['advertiserName']),
      advertiserLogoMediaId: (r['advertiserLogoMediaId'] as string | null) ?? null,
    }));
  }

  /** Is the campaign live for serving right now (same rules as `liveCommercials`, no region)? */
  async isLiveCommercial(id: string, tx?: DBExecutor): Promise<boolean> {
    const live = await this.liveCommercials(undefined, tx);
    return live.some((l) => l.campaign.id === id);
  }

  /** A user's impressions of a campaign today (UTC) — frequency cap. */
  async userImpressionsToday(campaignId: string, userId: string, tx?: DBExecutor): Promise<number> {
    const res = await this.exec(tx).execute(sql`
      select count(*)::int as n from ad_events
       where campaign_id = ${campaignId} and user_id = ${userId} and event_type = 'impression'
         and occurred_at >= date_trunc('day', now() at time zone 'UTC') at time zone 'UTC'`);
    return num(rowsOf(res)[0]?.['n']);
  }

  /** Which of these ids are existing (non-deleted) commercial campaigns. */
  async commercialCampaignIds(ids: string[], tx?: DBExecutor): Promise<Set<string>> {
    const unique = [...new Set(ids)];
    if (unique.length === 0) return new Set();
    const rows = await this.exec(tx)
      .select({ id: adCampaigns.id })
      .from(adCampaigns)
      .where(and(inArray(adCampaigns.id, unique), eq(adCampaigns.type, 'commercial'), isNull(adCampaigns.deletedAt)));
    return new Set(rows.map((r) => r.id));
  }

  // ─── Lifecycle + accrual (worker) ───────────────────────────────────────────

  /**
   * scheduled → active at starts_at; active/paused → ended at ends_at; active → ended when the
   * total budget or impression goal is exhausted. Returns the changed campaigns.
   */
  async sweepLifecycle(tx?: DBExecutor): Promise<Array<{ id: string; status: string; endedReason: string | null }>> {
    const db = this.exec(tx);
    const activated = rowsOf(await db.execute(sql`
      update ad_campaigns set status = 'active', updated_at = now()
       where deleted_at is null and status = 'scheduled' and starts_at is not null and starts_at <= now()
         and (ends_at is null or ends_at > now())
      returning id, status, ended_reason as "endedReason"`));
    const expired = rowsOf(await db.execute(sql`
      update ad_campaigns set status = 'ended', ended_reason = 'ends_at', updated_at = now()
       where deleted_at is null and status in ('scheduled', 'active', 'paused') and ends_at is not null and ends_at <= now()
      returning id, status, ended_reason as "endedReason"`));
    const exhausted = rowsOf(await db.execute(sql`
      update ad_campaigns c set status = 'ended',
             ended_reason = case when c.impression_goal is not null and coalesce(ev.impressions, 0) >= c.impression_goal
                                 then 'impression_goal' else 'budget' end,
             updated_at = now()
        from (${campaignEventCounts(null, null)}) ev
       where ev.campaign_id = c.id and c.deleted_at is null and c.status = 'active'
         and ((c.budget_cents is not null and ${DELIVERED} >= c.budget_cents)
              or (c.impression_goal is not null and coalesce(ev.impressions, 0) >= c.impression_goal))
      returning c.id, c.status, c.ended_reason as "endedReason"`));
    return [...activated, ...expired, ...exhausted].map((r) => ({
      id: String(r['id']),
      status: String(r['status']),
      endedReason: (r['endedReason'] as string | null) ?? null,
    }));
  }

  /**
   * One `accrued` ledger entry per CPM/CPC campaign per completed UTC day (last `days` days),
   * from that day's events. Idempotent (unique per campaign + day). Returns rows written.
   */
  async accrueDaily(days = 7, tx?: DBExecutor): Promise<number> {
    const res = await this.exec(tx).execute(sql`
      with d as (
        select generate_series((now() at time zone 'UTC')::date - ${days}::int,
                               (now() at time zone 'UTC')::date - 1, interval '1 day')::date as day
      ), ev as (
        select e.campaign_id, (e.occurred_at at time zone 'UTC')::date as day,
               count(*) filter (where e.event_type = 'impression') as impressions,
               count(*) filter (where e.event_type = 'click') as clicks
          from ad_events e
         where e.campaign_id is not null
           and e.occurred_at >= ((now() at time zone 'UTC')::date - ${days}::int)::timestamp at time zone 'UTC'
           and e.occurred_at < ((now() at time zone 'UTC')::date)::timestamp at time zone 'UTC'
         group by 1, 2
      ), vals as (
        select c.id as campaign_id, c.advertiser_id, c.currency, d.day,
               round(coalesce(ev.impressions, 0) * c.cpm_cents / 1000.0) + coalesce(ev.clicks, 0) * c.cpc_cents as amount,
               coalesce(ev.impressions, 0) as impressions, coalesce(ev.clicks, 0) as clicks
          from ad_campaigns c
          cross join d
          left join ev on ev.campaign_id = c.id and ev.day = d.day
         where c.deleted_at is null and c.pricing_model in ('cpm', 'cpc')
      )
      insert into ad_ledger_entries (advertiser_id, campaign_id, kind, amount_cents, currency, entry_date, note, metadata)
      select advertiser_id, campaign_id, 'accrued', amount, currency, day,
             'Delivered ' || impressions || ' impressions, ' || clicks || ' clicks',
             jsonb_build_object('impressions', impressions, 'clicks', clicks, 'auto', true)
        from vals where amount > 0
      on conflict (campaign_id, entry_date) where kind = 'accrued' do nothing
      returning id`);
    return rowsOf(res).length;
  }

  // ─── Ledger ─────────────────────────────────────────────────────────────────

  private ledgerTotalsSelect(match: SQL, window: SQL = sql`true`): SQL {
    return sql`
      (select coalesce(sum(amount_cents) filter (where kind = 'booked'), 0) from ad_ledger_entries l where ${match} and ${window}) as "bookedCents",
      (select coalesce(sum(amount_cents) filter (where kind = 'accrued'), 0) from ad_ledger_entries l where ${match} and ${window}) as "accruedCents",
      (select coalesce(sum(amount_cents) filter (where kind = 'invoiced'), 0) from ad_ledger_entries l where ${match} and ${window}) as "invoicedCents",
      (select coalesce(sum(amount_cents) filter (where kind = 'paid'), 0) from ad_ledger_entries l where ${match} and ${window}) as "paidCents",
      (select coalesce(sum(amount_cents) filter (where kind = 'credit'), 0) from ad_ledger_entries l where ${match} and ${window}) as "creditCents"`;
  }

  private mapTotals(r: Row): LedgerTotals {
    const booked = num(r['bookedCents']);
    const accrued = num(r['accruedCents']);
    const paid = num(r['paidCents']);
    const credit = num(r['creditCents']);
    return {
      bookedCents: booked,
      accruedCents: accrued,
      invoicedCents: num(r['invoicedCents']),
      paidCents: paid,
      creditCents: credit,
      revenueCents: booked + accrued - credit,
      balanceCents: booked + accrued - paid - credit,
    };
  }

  /** Ledger totals for an advertiser / campaign / everything, optionally within [from, to] (entry_date, inclusive). */
  async ledgerTotals(
    scope: { advertiserId?: string | undefined; campaignId?: string | undefined },
    from?: string,
    to?: string,
    tx?: DBExecutor,
  ): Promise<LedgerTotals> {
    const match = sql`true ${scope.advertiserId ? sql`and l.advertiser_id = ${scope.advertiserId}` : sql``}
      ${scope.campaignId ? sql`and l.campaign_id = ${scope.campaignId}` : sql``}`;
    const window = sql`true ${from ? sql`and l.entry_date >= ${from}::date` : sql``} ${to ? sql`and l.entry_date <= ${to}::date` : sql``}`;
    const res = await this.exec(tx).execute(sql`select ${this.ledgerTotalsSelect(match, window)}`);
    return this.mapTotals(rowsOf(res)[0] ?? {});
  }

  async createLedgerEntry(
    e: {
      advertiserId: string;
      campaignId?: string | null | undefined;
      kind: LedgerKind;
      amountCents: number;
      currency: string;
      entryDate?: string | undefined;
      invoiceNumber?: string | undefined;
      dueDate?: string | undefined;
      reference?: string | undefined;
      note?: string | undefined;
      metadata?: Record<string, unknown> | undefined;
      createdBy?: string | undefined;
    },
    tx?: DBExecutor,
  ): Promise<string> {
    const rows = await this.exec(tx)
      .insert(adLedgerEntries)
      .values({
        advertiserId: e.advertiserId,
        kind: e.kind,
        amountCents: e.amountCents,
        currency: e.currency,
        ...(e.campaignId ? { campaignId: e.campaignId } : {}),
        ...(e.entryDate ? { entryDate: e.entryDate } : {}),
        ...(e.invoiceNumber ? { invoiceNumber: e.invoiceNumber } : {}),
        ...(e.dueDate ? { dueDate: e.dueDate } : {}),
        ...(e.reference ? { reference: e.reference } : {}),
        ...(e.note ? { note: e.note } : {}),
        ...(e.metadata ? { metadata: e.metadata } : {}),
        ...(e.createdBy ? { createdBy: e.createdBy } : {}),
      })
      .returning({ id: adLedgerEntries.id });
    return rows[0]!.id;
  }

  /** Has this campaign already booked its flat fee automatically? */
  async hasAutoBooking(campaignId: string, tx?: DBExecutor): Promise<boolean> {
    const res = await this.exec(tx).execute(sql`
      select 1 from ad_ledger_entries where campaign_id = ${campaignId} and kind = 'booked' and metadata->>'auto' = 'true' limit 1`);
    return rowsOf(res).length > 0;
  }

  async listLedger(
    f: {
      advertiserId?: string | undefined;
      campaignId?: string | undefined;
      kind?: string[] | undefined;
      from?: string | undefined;
      to?: string | undefined;
      page: number;
      limit: number;
    },
    tx?: DBExecutor,
  ): Promise<{ items: LedgerRecord[]; total: number }> {
    const where = sql`true
      ${f.advertiserId ? sql`and l.advertiser_id = ${f.advertiserId}` : sql``}
      ${f.campaignId ? sql`and l.campaign_id = ${f.campaignId}` : sql``}
      ${f.kind?.length ? sql`and l.kind in (${sql.join(f.kind.map((k) => sql`${k}`), sql`, `)})` : sql``}
      ${f.from ? sql`and l.entry_date >= ${f.from}::date` : sql``}
      ${f.to ? sql`and l.entry_date <= ${f.to}::date` : sql``}`;
    const db = this.exec(tx);
    const [page, count] = await Promise.all([
      db.execute(sql`
        select l.id, l.advertiser_id as "advertiserId", a.name as "advertiserName", l.campaign_id as "campaignId",
               c.name as "campaignName", l.kind, l.amount_cents as "amountCents", l.currency,
               l.entry_date::text as "entryDate", l.invoice_number as "invoiceNumber", l.due_date::text as "dueDate",
               l.reference, l.note, l.created_by as "createdBy", l.created_at as "createdAt"
          from ad_ledger_entries l
          left join advertisers a on a.id = l.advertiser_id
          left join ad_campaigns c on c.id = l.campaign_id
         where ${where}
         order by l.entry_date desc, l.created_at desc
         limit ${f.limit} offset ${(f.page - 1) * f.limit}`),
      db.execute(sql`select count(*)::int as n from ad_ledger_entries l where ${where}`),
    ]);
    return {
      items: rowsOf(page).map((r) => ({
        id: String(r['id']),
        advertiserId: String(r['advertiserId']),
        advertiserName: (r['advertiserName'] as string | null) ?? null,
        campaignId: (r['campaignId'] as string | null) ?? null,
        campaignName: (r['campaignName'] as string | null) ?? null,
        kind: String(r['kind']),
        amountCents: num(r['amountCents']),
        currency: String(r['currency']),
        entryDate: String(r['entryDate']),
        invoiceNumber: (r['invoiceNumber'] as string | null) ?? null,
        dueDate: (r['dueDate'] as string | null) ?? null,
        reference: (r['reference'] as string | null) ?? null,
        note: (r['note'] as string | null) ?? null,
        createdBy: (r['createdBy'] as string | null) ?? null,
        createdAt: String(r['createdAt']),
      })),
      total: num(rowsOf(count)[0]?.['n']),
    };
  }

  // ─── Home summary + inventory ───────────────────────────────────────────────

  /** Ad Sales home: delivery (commercial vs sponsorship) in a window, top advertisers. */
  async summary(from: string, to: string, region: string | undefined, tx?: DBExecutor) {
    const db = this.exec(tx);
    const regionFilter = region ? sql`and e.region = ${region}` : sql``;
    const [delivery, top, counts, views] = await Promise.all([
      db.execute(sql`
        select coalesce(c.type, 'sponsorship') as kind,
               count(*) filter (where e.event_type = 'impression') as impressions,
               count(*) filter (where e.event_type = 'click') as clicks,
               count(*) filter (where e.event_type = 'complete') as completes,
               coalesce(sum(case when e.event_type = 'impression' then coalesce(c.cpm_cents, s.cpm_cents, 0) / 1000.0
                                 when e.event_type = 'click' then coalesce(c.cpc_cents, s.cpc_cents, 0) else 0 end), 0) as delivered
          from ad_events e
          left join ad_campaigns c on c.id = e.campaign_id
          left join content_sponsorships s on s.id = e.sponsorship_id
         where e.occurred_at >= ${from}::timestamptz and e.occurred_at < ${to}::timestamptz ${regionFilter}
         group by 1`),
      db.execute(sql`
        select a.id, a.name,
               count(*) filter (where e.event_type = 'impression') as impressions,
               count(*) filter (where e.event_type = 'click') as clicks
          from ad_events e
          left join ad_campaigns c on c.id = e.campaign_id
          left join content_sponsorships s on s.id = e.sponsorship_id
          join advertisers a on a.id = coalesce(c.advertiser_id, s.advertiser_id)
         where e.occurred_at >= ${from}::timestamptz and e.occurred_at < ${to}::timestamptz ${regionFilter}
         group by a.id, a.name
         order by impressions desc
         limit 10`),
      db.execute(sql`
        select (select count(*) from advertisers where deleted_at is null and status = 'active') as "activeAdvertisers",
               (select count(*) from ad_campaigns where deleted_at is null and status = 'active' and type = 'commercial') as "activeCommercials",
               (select count(*) from ad_campaigns where deleted_at is null and status = 'active' and type = 'sponsorship') as "activeSponsorshipCampaigns",
               (select count(*) from content_sponsorships where is_active and ad_format = 'sponsored'
                   and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())) as "liveSponsoredVideos"`),
      db.execute(sql`
        select count(*) as views from content_views cv
          ${region ? sql`join users u on u.id = cv.user_id` : sql``}
         where cv.counted and cv.started_at >= ${from}::timestamptz and cv.started_at < ${to}::timestamptz
           ${region ? sql`and u.region = ${region}` : sql``}`),
    ]);
    return {
      delivery: rowsOf(delivery).map((r) => ({
        kind: String(r['kind']),
        impressions: num(r['impressions']),
        clicks: num(r['clicks']),
        completes: num(r['completes']),
        deliveredCents: Math.round(num(r['delivered'])),
      })),
      topAdvertisers: rowsOf(top).map((r) => ({
        advertiserId: String(r['id']),
        name: String(r['name']),
        impressions: num(r['impressions']),
        clicks: num(r['clicks']),
      })),
      counts: rowsOf(counts)[0] ?? {},
      contentViews: num(rowsOf(views)[0]?.['views']),
    };
  }

  /** Sellable inventory: daily counted views, top titles, commercial impressions per day. */
  async inventory(from: string, to: string, region: string | undefined, top = 10, tx?: DBExecutor) {
    const db = this.exec(tx);
    const userJoin = region ? sql`join users u on u.id = cv.user_id` : sql``;
    const userWhere = region ? sql`and u.region = ${region}` : sql``;
    const [daily, titles, commercial] = await Promise.all([
      db.execute(sql`
        select to_char(date_trunc('day', cv.started_at at time zone 'UTC'), 'YYYY-MM-DD') as day, count(*) as views
          from content_views cv ${userJoin}
         where cv.counted and cv.started_at >= ${from}::timestamptz and cv.started_at < ${to}::timestamptz ${userWhere}
         group by 1 order by 1`),
      db.execute(sql`
        select c.id, c.title, count(*) as views,
               exists (select 1 from content_sponsorships s where s.content_id = c.id and s.is_active and s.ad_format = 'sponsored'
                         and (s.starts_at is null or s.starts_at <= now()) and (s.ends_at is null or s.ends_at > now())) as sponsored
          from content_views cv join contents c on c.id = cv.content_id ${userJoin}
         where cv.counted and cv.started_at >= ${from}::timestamptz and cv.started_at < ${to}::timestamptz ${userWhere}
           and c.deleted_at is null and not c.is_ad_commercial
         group by c.id, c.title order by views desc limit ${top}`),
      db.execute(sql`
        select count(*) filter (where e.event_type = 'impression') as impressions
          from ad_events e join ad_campaigns c on c.id = e.campaign_id and c.type = 'commercial'
         where e.sponsorship_id is null and e.occurred_at >= ${from}::timestamptz and e.occurred_at < ${to}::timestamptz
           ${region ? sql`and e.region = ${region}` : sql``}`),
    ]);
    return {
      daily: rowsOf(daily).map((r) => ({ day: String(r['day']), views: num(r['views']) })),
      topTitles: rowsOf(titles).map((r) => ({
        contentId: String(r['id']),
        title: String(r['title']),
        views: num(r['views']),
        sponsored: Boolean(r['sponsored']),
      })),
      commercialImpressions: num(rowsOf(commercial)[0]?.['impressions']),
    };
  }
}
