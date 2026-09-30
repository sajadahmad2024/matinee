import type { AdCounts } from '@db/repositories/ads/ad-event.repository';
import type { LiveCommercial } from '@db/repositories/ads/ad-sales.repository';
import type { SponsorshipRow } from '@db/repositories/content/content-extras.repository';
import type { ContentResponseDto } from '../content/catalog/dto/content-response.dto';

/** Feature flag that turns feed commercial insertion on. */
export const AD_COMMERCIALS_FLAG = 'feature.ad_commercials_enabled';
/** Slot interval when no live commercial sets `feedFrequency`. */
export const DEFAULT_FEED_FREQUENCY = 5;

/** Flag values are free JSON: accept `true`, `"true"` and `{ enabled: true }`. */
export function isFlagOn(value: unknown): boolean {
  if (value === true || value === 'true') return true;
  if (value && typeof value === 'object' && (value as Record<string, unknown>)['enabled'] === true) return true;
  return false;
}

const ratio = (part: number, whole: number): number => (whole > 0 ? Math.round((part / whole) * 10_000) / 10_000 : 0);

export interface AdMetrics extends AdCounts {
  ctr: number;
  skipRate: number;
  completionRate: number;
  ecpmCents: number;
}

/** Derive ratios (0..1, 4 dp) + eCPM from raw counts. */
export function adMetrics(c: AdCounts): AdMetrics {
  return {
    ...c,
    ctr: ratio(c.clicks, c.impressions),
    skipRate: ratio(c.skips, c.impressions),
    completionRate: ratio(c.completes, c.impressions),
    ecpmCents: c.impressions > 0 ? Math.round((c.revenueCents / c.impressions) * 1000) : 0,
  };
}

/** Feed-card sponsor/commercial descriptor. */
export interface FeedAd {
  /** Legacy commercial sponsorship (null for campaign commercials). */
  sponsorshipId: string | null;
  /** Ad Sales commercial campaign — fetch the creative with GET /v1/ads/commercials/:campaignId. */
  campaignId: string | null;
  sponsorName: string;
  bannerUrl: string | null;
  clickUrl: string | null;
  ctaLabel: string | null;
  adDurationSeconds: number;
  skippableAfterSeconds: number | null;
}

export function toFeedAd(s: SponsorshipRow, bannerUrl: string | null): FeedAd {
  return {
    sponsorshipId: s.id,
    campaignId: null,
    sponsorName: s.sponsorName,
    bannerUrl,
    clickUrl: s.clickUrl,
    ctaLabel: s.ctaLabel,
    adDurationSeconds: s.adDurationSeconds,
    skippableAfterSeconds: s.skippableAfterSeconds,
  };
}

/** Feed descriptor for a live commercial campaign (advertiser name + logo). */
export function toCampaignFeedAd(l: LiveCommercial, logoUrl: string | null): FeedAd {
  return {
    sponsorshipId: null,
    campaignId: l.campaign.id,
    sponsorName: l.advertiserName,
    bannerUrl: logoUrl,
    clickUrl: l.campaign.clickUrl,
    ctaLabel: l.campaign.ctaLabel,
    adDurationSeconds: l.campaign.durationSeconds ?? 0,
    skippableAfterSeconds: l.campaign.skippableAfterSeconds,
  };
}

/**
 * Feed slot item for a commercial campaign. Same shape as a content card so the feed stays one
 * list: `isCommercial: true`, `contentType: 'commercial'`, `id` = campaign id. The creative's
 * signed playback comes from GET /v1/ads/commercials/:campaignId (the feed itself is cached).
 */
export function toCommercialFeedItem(l: LiveCommercial, logoUrl: string | null): ContentResponseDto {
  const c = l.campaign;
  return {
    id: c.id,
    title: c.name,
    slug: `commercial-${c.id}`,
    description: null,
    contentType: 'commercial',
    accessTier: 'free',
    unlockPoints: null,
    studioId: null,
    videoMediaId: c.creativeMediaId,
    thumbnailMediaId: null,
    durationSeconds: c.durationSeconds,
    language: null,
    status: 'published',
    isBoosted: false,
    rightsRegion: 'global',
    parentContentId: null,
    availableUntil: c.endsAt,
    watchLinks: [],
    viewCount: 0,
    likeCount: 0,
    dislikeCount: 0,
    commentCount: 0,
    shareCount: 0,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    studioName: null,
    genres: [],
    tags: [],
    thumbnailUrl: null,
    sponsored: true,
    sponsorName: l.advertiserName,
    isCommercial: true,
    ad: toCampaignFeedAd(l, logoUrl),
  };
}

/** Rotation list honouring campaign `weight` (each campaign repeated `weight` times, round-robin). */
export function weightedRotation<T extends { campaign: { weight: number } }>(spots: T[]): T[] {
  const out: T[] = [];
  const max = Math.max(0, ...spots.map((s) => s.campaign.weight));
  for (let round = 0; round < max; round++) {
    for (const s of spots) if (s.campaign.weight > round) out.push(s);
  }
  return out;
}

/** Smallest `feedFrequency` among the live commercials (default 5). */
export function commercialFrequency(frequencies: Array<number | null>): number {
  const set = frequencies.filter((f): f is number => typeof f === 'number' && f >= 1);
  return set.length > 0 ? Math.min(...set) : DEFAULT_FEED_FREQUENCY;
}

/**
 * Insert a commercial after every `frequency`-th ORGANIC item, counted globally across pages:
 * the organic item at global index g (0-based, `offset` = index of the page's first item) is
 * followed by commercial slot k = (g + 1) / frequency − 1 when (g + 1) % frequency === 0.
 * Slots rotate through `commercials` (slot k → commercials[k mod n]).
 */
export function interleaveCommercials<T>(organic: T[], commercials: T[], offset: number, frequency: number): T[] {
  if (commercials.length === 0 || frequency < 1) return organic;
  const out: T[] = [];
  organic.forEach((item, i) => {
    out.push(item);
    const g = offset + i + 1;
    if (g % frequency === 0) {
      const slot = g / frequency - 1;
      const spot = commercials[slot % commercials.length];
      if (spot !== undefined) out.push(spot);
    }
  });
  return out;
}
