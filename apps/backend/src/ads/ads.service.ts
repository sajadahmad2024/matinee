import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import { AdEventInsert, AdEventRepository } from '@db/repositories/ads/ad-event.repository';
import { AdSalesRepository } from '@db/repositories/ads/ad-sales.repository';
import { ContentExtrasRepository, SponsorshipRow } from '@db/repositories/content/content-extras.repository';
import { ContentRepository } from '@db/repositories/content/content.repository';
import { SubscriptionRepository } from '@db/repositories/subscriptions/subscription.repository';
import { MediaStatus } from '@media/constants/media.constant';
import { MediaService } from '@media/media.service';
import { adMetrics } from './ad.mapper';
import {
  AdDescriptorDto,
  AdPerformanceItemDto,
  AdPerformanceQueryDto,
  AdWindowQueryDto,
  ContentAdsDto,
  TrackAdEventsDto,
  TrackAdEventsResultDto,
} from './dto/ads.dto';

const ROLL_PLACEMENTS = ['pre-roll', 'mid-roll', 'post-roll'];
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_WINDOW_DAYS = 366;
const ADS_TTL = 60;
const MAX_PAST_MS = 7 * DAY_MS;
const MAX_FUTURE_MS = 5 * 60 * 1000;

/** Resolve `[from, to)` — default last 30 days ending at the next full minute (includes events just recorded), ≤ 366 days. */
export function resolveWindow(q: { from?: string | undefined; to?: string | undefined }, now: Date = new Date()): { from: string; to: string } {
  const toDate = q.to ? new Date(q.to) : new Date(Math.ceil((now.getTime() + 1) / 60_000) * 60_000);
  const fromDate = q.from ? new Date(q.from) : new Date(toDate.getTime() - 30 * DAY_MS);
  if (fromDate >= toDate) throw new BadRequestException('from must be before to');
  if (toDate.getTime() - fromDate.getTime() > MAX_WINDOW_DAYS * DAY_MS) {
    throw new BadRequestException(`Window may not exceed ${MAX_WINDOW_DAYS} days`);
  }
  return { from: fromDate.toISOString(), to: toDate.toISOString() };
}

/**
 * Ad serving (per-content sponsor descriptor), event tracking (impression/click/skip/complete,
 * deduped per view) and admin performance reporting. Feed commercial insertion lives in
 * ContentService.feed (shared helpers in ad.mapper).
 */
@Injectable()
export class AdsService {
  constructor(
    private readonly events: AdEventRepository,
    private readonly extras: ContentExtrasRepository,
    private readonly content: ContentRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly media: MediaService,
    private readonly cache: CacheService,
    private readonly sales: AdSalesRepository,
  ) {}

  // ─── Serving ────────────────────────────────────────────────────────────────

  private async descriptor(s: SponsorshipRow): Promise<AdDescriptorDto> {
    const ids = [s.bannerMediaId, s.creativeMediaId].filter((v): v is string => typeof v === 'string');
    const records = await this.media.findRecords(ids);
    const banner = s.bannerMediaId ? records.get(s.bannerMediaId) : undefined;
    const creative = s.creativeMediaId ? records.get(s.creativeMediaId) : undefined;
    return {
      sponsorshipId: s.id,
      adFormat: s.adFormat,
      placement: s.placement,
      sponsorName: s.sponsorName,
      bannerUrl: banner ? this.media.urlOf(banner) : null,
      clickUrl: s.clickUrl,
      ctaLabel: s.ctaLabel,
      adDurationSeconds: s.adDurationSeconds,
      skippableAfterSeconds: s.skippableAfterSeconds,
      midRollAtSeconds: s.midRollAtSeconds,
      overlay:
        s.placement === 'overlay'
          ? { startSeconds: s.overlayStartSeconds ?? 0, durationSeconds: s.overlayDurationSeconds ?? null }
          : null,
      creative: creative && creative.status === MediaStatus.READY ? await this.media.getPlayback(creative.id) : null,
      startsAt: s.startsAt,
      endsAt: s.endsAt,
    };
  }

  /** Live `sponsored` ad for a published content; subscribers get no roll ads (overlay kept). */
  async forContent(userId: string, contentId: string): Promise<ContentAdsDto> {
    const ads = await this.cache.getOrSetTagged(`content:ads:${contentId}`, ['content'], ADS_TTL, async () => {
      const c = await this.content.findById(contentId);
      if (!c || c.status !== 'published') throw new NotFoundException('Content not found');
      const s = await this.extras.getLiveSponsorship(contentId);
      return s && s.adFormat === 'sponsored' ? [await this.descriptor(s)] : [];
    });
    const adFree = (await this.subscriptions.getActiveForUser(userId)) !== null;
    return {
      contentId,
      adFree,
      ads: adFree ? ads.filter((a) => !ROLL_PLACEMENTS.includes(a.placement)) : ads,
    };
  }

  // ─── Tracking ───────────────────────────────────────────────────────────────

  async track(userId: string, dto: TrackAdEventsDto, now: Date = new Date()): Promise<TrackAdEventsResultDto> {
    const [sponsorships, campaigns, region] = await Promise.all([
      this.events.sponsorshipContents(dto.events.map((e) => e.sponsorshipId).filter((v): v is string => typeof v === 'string')),
      this.sales.commercialCampaignIds(dto.events.map((e) => e.campaignId).filter((v): v is string => typeof v === 'string')),
      this.content.viewerRegion(userId),
    ]);
    const rejectedSponsorships = new Set<string>();
    const rejectedCampaigns = new Set<string>();
    const seen = new Set<string>();
    const rows: AdEventInsert[] = [];
    let rejected = 0;
    let batchDupes = 0;
    for (const e of dto.events) {
      const at = e.occurredAt ? new Date(e.occurredAt) : now;
      const outOfRange = at.getTime() < now.getTime() - MAX_PAST_MS || at.getTime() > now.getTime() + MAX_FUTURE_MS;
      const sponsorship = e.sponsorshipId ? sponsorships.get(e.sponsorshipId) : undefined;
      const campaignOk = e.campaignId ? campaigns.has(e.campaignId) : false;
      const valid = !outOfRange && (e.sponsorshipId && e.campaignId ? false : e.sponsorshipId ? !!sponsorship : campaignOk);
      if (!valid) {
        rejected++;
        if (e.sponsorshipId) rejectedSponsorships.add(e.sponsorshipId);
        if (e.campaignId) rejectedCampaigns.add(e.campaignId);
        continue;
      }
      const target = e.sponsorshipId ? `s:${e.sponsorshipId}` : `c:${e.campaignId}`;
      const key = `${target}|${e.viewId}|${e.type}`;
      if (seen.has(key)) {
        batchDupes++;
        continue;
      }
      seen.add(key);
      rows.push({
        sponsorshipId: e.sponsorshipId ?? null,
        contentId: sponsorship?.contentId ?? null,
        campaignId: sponsorship ? sponsorship.campaignId : (e.campaignId ?? null),
        userId,
        viewKey: e.viewId,
        eventType: e.type,
        positionSeconds: e.positionSeconds,
        region,
        occurredAt: at.toISOString(),
      });
    }
    const accepted = await this.events.insertEvents(rows);
    return {
      accepted,
      duplicates: batchDupes + (rows.length - accepted),
      rejected,
      rejectedSponsorshipIds: [...rejectedSponsorships],
      rejectedCampaignIds: [...rejectedCampaigns],
    };
  }

  // ─── Reporting ──────────────────────────────────────────────────────────────

  private page(total: number, page: number, limit: number): PaginationDetailsDto {
    return { pageNo: page, pageSize: limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async performance(q: AdPerformanceQueryDto) {
    const window = resolveWindow(q);
    const { items, total, totals } = await this.events.performance({
      ...window,
      contentId: q.contentId,
      adFormat: q.adFormat,
      active: q.active,
      q: q.q,
      sort: q.sort,
      page: q.page,
      limit: q.limit,
    });
    const rows: AdPerformanceItemDto[] = items.map((r) => ({
      sponsorshipId: r.sponsorshipId,
      advertiserId: r.advertiserId,
      campaignId: r.campaignId,
      contentId: r.contentId,
      contentTitle: r.contentTitle,
      sponsorName: r.sponsorName,
      adFormat: r.adFormat,
      placement: r.placement,
      isActive: r.isActive,
      isLive: r.isLive,
      startsAt: r.startsAt,
      endsAt: r.endsAt,
      currency: r.currency,
      ...adMetrics(r),
    }));
    return { ...window, totals: adMetrics(totals), items: rows, pagination: this.page(total, q.page, q.limit) };
  }

  async sponsorshipPerformance(sponsorshipId: string, q: AdWindowQueryDto) {
    const window = resolveWindow(q);
    const [{ items }, daily] = await Promise.all([
      this.events.performance({ ...window, sponsorshipId, page: 1, limit: 1 }),
      this.events.daily(sponsorshipId, window.from, window.to),
    ]);
    const r = items[0];
    if (!r) throw new NotFoundException('Sponsorship not found');
    return {
      ...window,
      sponsorshipId: r.sponsorshipId,
      contentId: r.contentId,
      contentTitle: r.contentTitle,
      sponsorName: r.sponsorName,
      adFormat: r.adFormat,
      placement: r.placement,
      isActive: r.isActive,
      isLive: r.isLive,
      startsAt: r.startsAt,
      endsAt: r.endsAt,
      currency: r.currency,
      ...adMetrics(r),
      daily,
    };
  }
}
