import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import {
  AdSalesRepository,
  AdvertiserRecord,
  CampaignInput,
  CampaignRecord,
  CampaignStatus,
  Delivery,
  LedgerTotals,
} from '@db/repositories/ads/ad-sales.repository';
import { SubscriptionRepository } from '@db/repositories/subscriptions/subscription.repository';
import { MediaStatus, MediaType } from '@media/constants/media.constant';
import { MediaService } from '@media/media.service';
import { resolveWindow } from './ads.service';
import {
  AttachContentsDto,
  CampaignQueryDto,
  CommercialServeDto,
  CreateAdvertiserDto,
  CreateCampaignDto,
  CreateLedgerEntryDto,
  InventoryQueryDto,
  LedgerQueryDto,
  StatementQueryDto,
  UpdateAdvertiserDto,
  UpdateCampaignDto,
  AdvertiserQueryDto,
  AdWindowRegionQueryDto,
} from './dto/ad-sales.dto';

const DAY_MS = 86_400_000;
/** Assumed slot spacing for fill-rate when no campaign is live (matches DEFAULT_FEED_FREQUENCY). */
const FILL_RATE_FREQUENCY = 5;

const ratio = (part: number, whole: number): number => (whole > 0 ? Math.round((part / whole) * 10_000) / 10_000 : 0);
const isUniqueViolation = (err: unknown): boolean => {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === '23505' || e?.cause?.code === '23505';
};

/**
 * Platform-level Ad Sales: advertisers, campaigns (feed commercials + sponsorship groups), the
 * ad-sales ledger, performance, home summary, inventory, and customer commercial serving.
 * Doc: apps/documentation/docs/backend/ads/ad-sales-management.md
 */
@Injectable()
export class AdSalesService {
  constructor(
    private readonly repo: AdSalesRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly media: MediaService,
    private readonly cache: CacheService,
  ) {}

  private page(total: number, page: number, limit: number): PaginationDetailsDto {
    return { pageNo: page, pageSize: limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  /** Feed commercials are read inside the cached feed — bust it when campaigns change. */
  private bustFeed(): Promise<void> {
    return this.cache.invalidateTag('content');
  }

  private delivery(d: Delivery) {
    return { ...d, ctr: ratio(d.clicks, d.impressions), completionRate: ratio(d.completes, d.impressions) };
  }

  private async logoUrls(ids: Array<string | null>): Promise<Map<string, string | null>> {
    const records = await this.media.findRecords(ids.filter((v): v is string => typeof v === 'string'));
    return new Map([...records.entries()].map(([id, r]) => [id, this.media.urlOf(r)]));
  }

  // ─── Advertisers ────────────────────────────────────────────────────────────

  private async requireAdvertiser(id: string): Promise<AdvertiserRecord> {
    const a = await this.repo.getAdvertiser(id);
    if (!a) throw new NotFoundException('Advertiser not found');
    return a;
  }

  private async assertImage(mediaId: string | null | undefined): Promise<void> {
    if (!mediaId) return;
    const m = (await this.media.findRecords([mediaId])).get(mediaId);
    if (!m) throw new BadRequestException('logoMediaId not found');
    if (m.mediaType !== MediaType.IMAGE) throw new BadRequestException('logoMediaId must be an image');
  }

  async listAdvertisers(q: AdvertiserQueryDto) {
    const { items, total } = await this.repo.listAdvertisers({ q: q.q, status: q.status, page: q.page, limit: q.limit });
    const logos = await this.logoUrls(items.map((a) => a.logoMediaId));
    return {
      items: items.map((a) => ({ ...a, logoUrl: a.logoMediaId ? (logos.get(a.logoMediaId) ?? null) : null })),
      pagination: this.page(total, q.page, q.limit),
    };
  }

  async getAdvertiser(id: string) {
    const a = await this.requireAdvertiser(id);
    const [totals, logos, campaigns] = await Promise.all([
      this.repo.ledgerTotals({ advertiserId: id }),
      this.logoUrls([a.logoMediaId]),
      this.repo.listCampaigns({ advertiserId: id, page: 1, limit: 100 }),
    ]);
    return {
      ...a,
      logoUrl: a.logoMediaId ? (logos.get(a.logoMediaId) ?? null) : null,
      totals,
      campaigns: campaigns.items.map((c) => this.toCampaignDto(c, c.delivery, c.advertiserName, c.linkedContents)),
    };
  }

  async createAdvertiser(adminId: string, dto: CreateAdvertiserDto) {
    await this.assertImage(dto.logoMediaId);
    try {
      return await this.repo.createAdvertiser(dto, adminId);
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictException(`Advertiser "${dto.name}" already exists`);
      throw err;
    }
  }

  async updateAdvertiser(id: string, dto: UpdateAdvertiserDto) {
    await this.requireAdvertiser(id);
    await this.assertImage(dto.logoMediaId);
    try {
      const a = await this.repo.updateAdvertiser(id, dto);
      if (!a) throw new NotFoundException('Advertiser not found');
      await this.bustFeed();
      return a;
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictException(`Advertiser "${dto.name ?? ''}" already exists`);
      throw err;
    }
  }

  async removeAdvertiser(id: string) {
    await this.requireAdvertiser(id);
    if ((await this.repo.countOpenCampaigns(id)) > 0) {
      throw new ConflictException('Advertiser has scheduled/active/paused campaigns — end them first');
    }
    await this.repo.softDeleteAdvertiser(id);
    return { message: 'Advertiser archived' };
  }

  // ─── Campaigns ──────────────────────────────────────────────────────────────

  private toCampaignDto(c: CampaignRecord, d?: Delivery, advertiserName?: string, linkedContents?: number) {
    return {
      ...c,
      ...(advertiserName !== undefined ? { advertiserName } : {}),
      ...(linkedContents !== undefined ? { linkedContents } : {}),
      ...(d ? { delivery: this.delivery(d), budgetUsed: c.budgetCents ? ratio(d.deliveredCents, c.budgetCents) : null } : {}),
    };
  }

  private async requireCampaign(id: string): Promise<CampaignRecord> {
    const c = await this.repo.getCampaign(id);
    if (!c) throw new NotFoundException('Campaign not found');
    return c;
  }

  /** Field rules shared by create/update (applied to the merged result). */
  private async validateCampaign(c: Partial<CampaignRecord> & { type: string }): Promise<void> {
    if (c.startsAt && c.endsAt && new Date(c.endsAt) <= new Date(c.startsAt)) {
      throw new BadRequestException('endsAt must be after startsAt');
    }
    if (c.skippableAfterSeconds != null && c.durationSeconds != null && c.skippableAfterSeconds > c.durationSeconds) {
      throw new BadRequestException('skippableAfterSeconds cannot exceed durationSeconds');
    }
    if (c.pricingModel === 'cpm' && !c.cpmCents) throw new BadRequestException('cpm pricing needs cpmCents > 0');
    if (c.pricingModel === 'cpc' && !c.cpcCents) throw new BadRequestException('cpc pricing needs cpcCents > 0');
    if (c.type === 'sponsorship' && c.creativeMediaId) {
      throw new BadRequestException('Sponsorship campaigns use the videos’ sponsorship ads — no commercial creative');
    }
    if (c.creativeMediaId) {
      const m = (await this.media.findRecords([c.creativeMediaId])).get(c.creativeMediaId);
      if (!m) throw new BadRequestException('creativeMediaId not found');
      if (m.mediaType !== MediaType.VIDEO) throw new BadRequestException('creativeMediaId must be a video');
    }
  }

  private campaignFields(dto: UpdateCampaignDto): CampaignInput {
    const out: CampaignInput = {};
    const keys = [
      'name', 'startsAt', 'endsAt', 'regions', 'creativeMediaId', 'clickUrl', 'ctaLabel', 'durationSeconds',
      'skippableAfterSeconds', 'feedFrequency', 'weight', 'frequencyCapPerUserDay', 'pricingModel', 'flatFeeCents',
      'cpmCents', 'cpcCents', 'budgetCents', 'dailyBudgetCents', 'impressionGoal', 'currency', 'notes',
    ] as const;
    for (const k of keys) {
      const v = (dto as Record<string, unknown>)[k];
      if (v !== undefined) (out as Record<string, unknown>)[k] = v;
    }
    return out;
  }

  async listCampaigns(q: CampaignQueryDto) {
    const { items, total } = await this.repo.listCampaigns({
      advertiserId: q.advertiserId,
      type: q.type,
      status: q.status,
      region: q.region,
      q: q.q,
      activeFrom: q.from,
      activeTo: q.to,
      page: q.page,
      limit: q.limit,
    });
    return {
      items: items.map((c) => this.toCampaignDto(c, c.delivery, c.advertiserName, c.linkedContents)),
      pagination: this.page(total, q.page, q.limit),
    };
  }

  async getCampaign(id: string) {
    const c = await this.requireCampaign(id);
    const [advertiser, delivery, contents, ledger] = await Promise.all([
      this.repo.getAdvertiser(c.advertiserId),
      this.repo.campaignDelivery(id, null, null),
      this.repo.linkedContents(id),
      this.repo.ledgerTotals({ campaignId: id }),
    ]);
    return {
      ...this.toCampaignDto(c, delivery, advertiser?.name ?? '', contents.length),
      contents,
      ledger,
    };
  }

  async createCampaign(adminId: string, dto: CreateCampaignDto) {
    const advertiser = dto.advertiserId
      ? await this.requireAdvertiser(dto.advertiserId)
      : await this.repo.findOrCreateAdvertiser(dto.advertiserName!, adminId);
    if (advertiser.status === 'archived') throw new BadRequestException('Advertiser is archived');
    const fields = this.campaignFields(dto);
    await this.validateCampaign({ ...fields, type: dto.type });
    const c = await this.repo.createCampaign(
      { ...fields, advertiserId: advertiser.id, name: dto.name, type: dto.type, currency: fields.currency ?? advertiser.currency },
      adminId,
    );
    return this.toCampaignDto(c, undefined, advertiser.name, 0);
  }

  async updateCampaign(id: string, dto: UpdateCampaignDto) {
    const current = await this.requireCampaign(id);
    if (current.status === 'ended') throw new ConflictException('Ended campaigns cannot be edited');
    const fields = this.campaignFields(dto);
    await this.validateCampaign({ ...current, ...fields });
    if (['active', 'scheduled'].includes(current.status) && current.type === 'commercial' && fields.creativeMediaId === null) {
      throw new BadRequestException('A live commercial needs a creative');
    }
    const c = await this.repo.updateCampaign(id, fields);
    await this.bustFeed();
    return this.toCampaignDto(c!);
  }

  /** draft/paused/scheduled → active (in flight) or scheduled (future start). Books flat fee once. */
  async activateCampaign(adminId: string, id: string) {
    const c = await this.requireCampaign(id);
    if (c.status === 'active') throw new ConflictException('Campaign is already active');
    if (c.status === 'ended') throw new ConflictException('Ended campaigns cannot be reactivated — duplicate it instead');
    if (!c.startsAt || !c.endsAt) throw new BadRequestException('Set startsAt and endsAt before activating');
    if (new Date(c.endsAt).getTime() <= Date.now()) throw new BadRequestException('endsAt is in the past');
    if (c.type === 'commercial') {
      if (!c.creativeMediaId) throw new BadRequestException('A commercial needs a creative video');
      const m = (await this.media.findRecords([c.creativeMediaId])).get(c.creativeMediaId);
      if (!m || m.status !== MediaStatus.READY) throw new BadRequestException('Creative video is not ready yet');
    }
    const advertiser = await this.requireAdvertiser(c.advertiserId);
    if (advertiser.status !== 'active') throw new BadRequestException(`Advertiser is ${advertiser.status}`);
    const next: CampaignStatus = new Date(c.startsAt).getTime() > Date.now() ? 'scheduled' : 'active';
    const updated = await this.repo.transaction(async (tx) => {
      const u = await this.repo.setCampaignStatus(id, next, ['draft', 'paused', 'scheduled'], null, tx);
      if (!u) throw new ConflictException('Campaign status changed — reload');
      if (c.pricingModel === 'flat' && c.flatFeeCents > 0 && !(await this.repo.hasAutoBooking(id, tx))) {
        await this.repo.createLedgerEntry(
          {
            advertiserId: c.advertiserId,
            campaignId: id,
            kind: 'booked',
            amountCents: c.flatFeeCents,
            currency: c.currency,
            note: `Flat fee — ${c.name}`,
            metadata: { auto: true },
            createdBy: adminId,
          },
          tx,
        );
      }
      return u;
    });
    await this.bustFeed();
    return this.toCampaignDto(updated);
  }

  async pauseCampaign(id: string) {
    await this.requireCampaign(id);
    const c = await this.repo.setCampaignStatus(id, 'paused', ['active', 'scheduled']);
    if (!c) throw new ConflictException('Only active or scheduled campaigns can be paused');
    await this.bustFeed();
    return this.toCampaignDto(c);
  }

  async resumeCampaign(adminId: string, id: string) {
    const c = await this.requireCampaign(id);
    if (c.status !== 'paused') throw new ConflictException('Only paused campaigns can be resumed');
    return this.activateCampaign(adminId, id);
  }

  async endCampaign(id: string, reason?: string) {
    await this.requireCampaign(id);
    const c = await this.repo.setCampaignStatus(id, 'ended', ['draft', 'scheduled', 'active', 'paused'], reason ?? 'manual');
    if (!c) throw new ConflictException('Campaign already ended');
    await this.bustFeed();
    return this.toCampaignDto(c);
  }

  async removeCampaign(id: string) {
    const c = await this.requireCampaign(id);
    if (['active', 'scheduled'].includes(c.status)) throw new ConflictException('Pause or end the campaign before deleting');
    await this.repo.softDeleteCampaign(id);
    await this.bustFeed();
    return { message: 'Campaign deleted' };
  }

  async attachContents(id: string, dto: AttachContentsDto) {
    const c = await this.requireCampaign(id);
    if (c.type !== 'sponsorship') throw new BadRequestException('Only sponsorship campaigns group videos');
    if (c.status === 'ended') throw new ConflictException('Campaign has ended');
    const result = await this.repo.attachContents(id, c.advertiserId, dto.contentIds);
    await this.bustFeed();
    return { campaignId: id, ...result, contents: await this.repo.linkedContents(id) };
  }

  async campaignPerformance(id: string, q: AdWindowRegionQueryDto) {
    const c = await this.requireCampaign(id);
    const window = resolveWindow(q);
    const [totals, daily, lifetime] = await Promise.all([
      this.repo.campaignDelivery(id, window.from, window.to),
      this.repo.campaignDaily(id, window.from, window.to),
      this.repo.campaignDelivery(id, null, null),
    ]);
    const flightDays = c.startsAt && c.endsAt ? Math.max(1, (new Date(c.endsAt).getTime() - new Date(c.startsAt).getTime()) / DAY_MS) : null;
    const elapsedDays = c.startsAt ? Math.max(0, Math.min(flightDays ?? Infinity, (Date.now() - new Date(c.startsAt).getTime()) / DAY_MS)) : null;
    return {
      ...window,
      campaignId: id,
      status: c.status,
      totals: this.delivery(totals),
      lifetime: this.delivery(lifetime),
      pacing: {
        budgetCents: c.budgetCents,
        budgetUsed: c.budgetCents ? ratio(lifetime.deliveredCents, c.budgetCents) : null,
        impressionGoal: c.impressionGoal,
        goalUsed: c.impressionGoal ? ratio(lifetime.impressions, c.impressionGoal) : null,
        flightElapsed: flightDays && elapsedDays !== null ? ratio(elapsedDays, flightDays) : null,
      },
      daily: daily.map((d) => ({ ...this.delivery(d), day: d.day })),
    };
  }

  // ─── Ledger ─────────────────────────────────────────────────────────────────

  async listLedger(q: LedgerQueryDto) {
    const { items, total } = await this.repo.listLedger({
      advertiserId: q.advertiserId,
      campaignId: q.campaignId,
      kind: q.kind,
      from: q.from,
      to: q.to,
      page: q.page,
      limit: q.limit,
    });
    const totals = await this.repo.ledgerTotals({ advertiserId: q.advertiserId, campaignId: q.campaignId }, q.from, q.to);
    return { items, totals, pagination: this.page(total, q.page, q.limit) };
  }

  async createLedgerEntry(adminId: string, dto: CreateLedgerEntryDto) {
    const advertiser = await this.requireAdvertiser(dto.advertiserId);
    if (dto.campaignId) {
      const c = await this.requireCampaign(dto.campaignId);
      if (c.advertiserId !== advertiser.id) throw new BadRequestException('Campaign belongs to another advertiser');
    }
    if (dto.dueDate && dto.entryDate && dto.dueDate < dto.entryDate) throw new BadRequestException('dueDate is before entryDate');
    const id = await this.repo.createLedgerEntry({
      advertiserId: advertiser.id,
      campaignId: dto.campaignId,
      kind: dto.kind,
      amountCents: dto.amountCents,
      currency: dto.currency ?? advertiser.currency,
      entryDate: dto.entryDate,
      invoiceNumber: dto.invoiceNumber,
      dueDate: dto.dueDate,
      reference: dto.reference,
      note: dto.note,
      createdBy: adminId,
    });
    const { items } = await this.repo.listLedger({ advertiserId: advertiser.id, page: 1, limit: 100 });
    return items.find((e) => e.id === id)!;
  }

  /** Opening balance (before `from`), entries in [from, to], closing balance. */
  async statement(advertiserId: string, q: StatementQueryDto) {
    const advertiser = await this.requireAdvertiser(advertiserId);
    const to = q.to ?? new Date().toISOString().slice(0, 10);
    const from = q.from ?? `${to.slice(0, 7)}-01`;
    if (from > to) throw new BadRequestException('from must be on or before to');
    const dayBefore = new Date(new Date(`${from}T00:00:00Z`).getTime() - DAY_MS).toISOString().slice(0, 10);
    const [opening, period, entries] = await Promise.all([
      this.repo.ledgerTotals({ advertiserId }, undefined, dayBefore),
      this.repo.ledgerTotals({ advertiserId }, from, to),
      this.repo.listLedger({ advertiserId, from, to, page: 1, limit: 100 }),
    ]);
    return {
      advertiser: { id: advertiser.id, name: advertiser.name, billingEmail: advertiser.billingEmail, currency: advertiser.currency },
      from,
      to,
      openingBalanceCents: opening.balanceCents,
      period,
      closingBalanceCents: opening.balanceCents + period.balanceCents,
      entries: [...entries.items].reverse(),
    };
  }

  // ─── Home + inventory ───────────────────────────────────────────────────────

  async summary(q: AdWindowRegionQueryDto) {
    const window = resolveWindow(q);
    const [s, ledger, outstanding] = await Promise.all([
      this.repo.summary(window.from, window.to, q.region),
      this.repo.ledgerTotals({}, window.from.slice(0, 10), window.to.slice(0, 10)),
      this.repo.ledgerTotals({}),
    ]);
    const byKind = (kind: string) => s.delivery.find((d) => d.kind === kind) ?? { impressions: 0, clicks: 0, completes: 0, deliveredCents: 0 };
    const commercial = byKind('commercial');
    const sponsorship = byKind('sponsorship');
    const impressions = commercial.impressions + sponsorship.impressions;
    const clicks = commercial.clicks + sponsorship.clicks;
    const slots = s.contentViews / FILL_RATE_FREQUENCY;
    const c = s.counts as Record<string, unknown>;
    return {
      ...window,
      region: q.region ?? null,
      revenue: {
        recognizedCents: ledger.revenueCents,
        bookedCents: ledger.bookedCents,
        accruedCents: ledger.accruedCents,
        creditCents: ledger.creditCents,
        deliveredCents: commercial.deliveredCents + sponsorship.deliveredCents,
        outstandingCents: outstanding.balanceCents,
      },
      delivery: {
        impressions,
        clicks,
        ctr: ratio(clicks, impressions),
        ecpmCents: impressions > 0 ? Math.round((ledger.revenueCents / impressions) * 1000) : 0,
        fillRate: slots > 0 ? Math.min(1, ratio(commercial.impressions, slots)) : 0,
        commercial: { ...commercial, ctr: ratio(commercial.clicks, commercial.impressions) },
        sponsorship: { ...sponsorship, ctr: ratio(sponsorship.clicks, sponsorship.impressions) },
      },
      counts: {
        activeAdvertisers: Number(c['activeAdvertisers'] ?? 0),
        activeCommercials: Number(c['activeCommercials'] ?? 0),
        activeSponsorshipCampaigns: Number(c['activeSponsorshipCampaigns'] ?? 0),
        liveSponsoredVideos: Number(c['liveSponsoredVideos'] ?? 0),
      },
      topAdvertisers: s.topAdvertisers.map((a) => ({ ...a, ctr: ratio(a.clicks, a.impressions) })),
    };
  }

  async inventory(q: InventoryQueryDto) {
    const window = resolveWindow(q);
    const inv = await this.repo.inventory(window.from, window.to, q.region, q.top ?? 10);
    const days = Math.max(1, (new Date(window.to).getTime() - new Date(window.from).getTime()) / DAY_MS);
    const totalViews = inv.daily.reduce((a, d) => a + d.views, 0);
    const avgDailyViews = Math.round(totalViews / days);
    return {
      ...window,
      region: q.region ?? null,
      avgDailyViews,
      projected30dViews: avgDailyViews * 30,
      projected30dCommercialSlots: Math.round((avgDailyViews * 30) / FILL_RATE_FREQUENCY),
      commercialImpressions: inv.commercialImpressions,
      daily: inv.daily,
      topTitles: inv.topTitles,
    };
  }

  // ─── Customer serving ───────────────────────────────────────────────────────

  /** Commercial descriptor for a feed slot; `skip` when ad-free, capped or no longer live. */
  async serveCommercial(userId: string, campaignId: string): Promise<CommercialServeDto> {
    const skip = (reason: 'ad_free' | 'frequency_cap' | 'not_live'): CommercialServeDto => ({
      campaignId,
      skip: true,
      skipReason: reason,
      advertiser: null,
      creative: null,
      clickUrl: null,
      ctaLabel: null,
      durationSeconds: null,
      skippableAfterSeconds: null,
    });
    const live = (await this.repo.liveCommercials(undefined)).find((l) => l.campaign.id === campaignId);
    if (!live) {
      if (!(await this.repo.getCampaign(campaignId))) throw new NotFoundException('Campaign not found');
      return skip('not_live');
    }
    if ((await this.subscriptions.getActiveForUser(userId)) !== null) return skip('ad_free');
    const cap = live.campaign.frequencyCapPerUserDay;
    if (cap && (await this.repo.userImpressionsToday(campaignId, userId)) >= cap) return skip('frequency_cap');
    const logos = await this.logoUrls([live.advertiserLogoMediaId]);
    return {
      campaignId,
      skip: false,
      skipReason: null,
      advertiser: { name: live.advertiserName, logoUrl: live.advertiserLogoMediaId ? (logos.get(live.advertiserLogoMediaId) ?? null) : null },
      creative: live.campaign.creativeMediaId ? await this.media.getPlayback(live.campaign.creativeMediaId) : null,
      clickUrl: live.campaign.clickUrl,
      ctaLabel: live.campaign.ctaLabel,
      durationSeconds: live.campaign.durationSeconds,
      skippableAfterSeconds: live.campaign.skippableAfterSeconds,
    };
  }

  /** Worker sweep: lifecycle transitions + daily accrual. Returns counts for logging. */
  async maintenance(): Promise<{ changed: number; accrued: number }> {
    const changed = await this.repo.sweepLifecycle();
    const accrued = await this.repo.accrueDaily();
    if (changed.length > 0) await this.bustFeed();
    return { changed: changed.length, accrued };
  }

  /** Ledger totals helper for other services. */
  ledgerTotals(scope: { advertiserId?: string; campaignId?: string }): Promise<LedgerTotals> {
    return this.repo.ledgerTotals(scope);
  }
}
