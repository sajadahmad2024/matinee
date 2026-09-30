import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { AdEventRepository } from '@db/repositories/ads/ad-event.repository';
import { ContentExtrasRepository } from '@db/repositories/content/content-extras.repository';
import { ContentRepository } from '@db/repositories/content/content.repository';
import { SubscriptionRepository } from '@db/repositories/subscriptions/subscription.repository';
import { MediaService } from '@media/media.service';
import { adMetrics, commercialFrequency, interleaveCommercials, isFlagOn } from './ad.mapper';
import { AdsService, resolveWindow } from './ads.service';

const S1 = '0190a000-0000-7000-8000-0000000000a1';
const S2 = '0190a000-0000-7000-8000-0000000000a2';

function sponsorship(over: Record<string, unknown> = {}) {
  return {
    id: S1, contentId: 'c1', sponsorName: 'Nike', bannerMediaId: null, creativeMediaId: null, adDurationSeconds: 15,
    placement: 'pre-roll', adFormat: 'sponsored', skippableAfterSeconds: 5, midRollAtSeconds: null,
    overlayStartSeconds: null, overlayDurationSeconds: null, clickUrl: 'https://nike.com', ctaLabel: 'Shop',
    startsAt: null, endsAt: null, ...over,
  };
}

function build() {
  const events = {
    sponsorshipContents: jest.fn().mockResolvedValue(new Map([[S1, { contentId: 'c1', campaignId: null }]])),
    insertEvents: jest.fn((rows: unknown[]) => Promise.resolve(rows.length)),
    performance: jest.fn(),
    daily: jest.fn(),
  };
  const extras = { getLiveSponsorship: jest.fn().mockResolvedValue(sponsorship()) };
  const content = {
    findById: jest.fn().mockResolvedValue({ id: 'c1', status: 'published' }),
    viewerRegion: jest.fn().mockResolvedValue('EU'),
  };
  const subscriptions = { getActiveForUser: jest.fn().mockResolvedValue(null) };
  const media = { findRecords: jest.fn().mockResolvedValue(new Map()), urlOf: jest.fn(), getPlayback: jest.fn() };
  const cache = { getOrSetTagged: jest.fn((_k: string, _t: string[], _ttl: number, fn: () => Promise<unknown>) => fn()) };
  const svc = new AdsService(
    events as unknown as AdEventRepository,
    extras as unknown as ContentExtrasRepository,
    content as unknown as ContentRepository,
    subscriptions as unknown as SubscriptionRepository,
    media as unknown as MediaService,
    cache as unknown as CacheService,
    { commercialCampaignIds: jest.fn().mockResolvedValue(new Set(['camp-1'])) } as never,
  );
  return { svc, events, extras, content, subscriptions };
}

describe('ad.mapper', () => {
  it('interleaves a commercial after every N organic items, globally across pages', () => {
    expect(interleaveCommercials(['a', 'b', 'c', 'd', 'e'], ['X', 'Y'], 0, 2)).toEqual(['a', 'b', 'X', 'c', 'd', 'Y', 'e']);
    // page 2 of size 3 with N=2: global indices 3,4,5 → slots after g=4 (slot 1 → Y) and g=6 (slot 2 → X)
    expect(interleaveCommercials(['d', 'e', 'f'], ['X', 'Y'], 3, 2)).toEqual(['d', 'Y', 'e', 'f', 'X']);
    expect(interleaveCommercials(['a', 'b'], [], 0, 1)).toEqual(['a', 'b']);
  });

  it('frequency = smallest feedFrequency, default 5', () => {
    expect(commercialFrequency([null, 8, 3])).toBe(3);
    expect(commercialFrequency([null])).toBe(5);
  });

  it('flag parsing', () => {
    expect(isFlagOn(true)).toBe(true);
    expect(isFlagOn({ enabled: true })).toBe(true);
    expect(isFlagOn('true')).toBe(true);
    expect(isFlagOn(false)).toBe(false);
    expect(isFlagOn(undefined)).toBe(false);
  });

  it('metrics ratios + eCPM', () => {
    expect(adMetrics({ impressions: 200, uniqueViewers: 150, clicks: 6, skips: 50, completes: 120, revenueCents: 1000 })).toMatchObject({
      ctr: 0.03, skipRate: 0.25, completionRate: 0.6, ecpmCents: 5000,
    });
    expect(adMetrics({ impressions: 0, uniqueViewers: 0, clicks: 0, skips: 0, completes: 0, revenueCents: 0 }).ctr).toBe(0);
  });
});

describe('AdsService', () => {
  it('serves the live sponsored ad; subscribers keep only overlays', async () => {
    const { svc, subscriptions, extras } = build();
    await expect(svc.forContent('u1', 'c1')).resolves.toMatchObject({
      adFree: false,
      ads: [expect.objectContaining({ sponsorshipId: S1, placement: 'pre-roll', skippableAfterSeconds: 5, overlay: null })],
    });
    subscriptions.getActiveForUser.mockResolvedValue({ id: 'sub' });
    await expect(svc.forContent('u1', 'c1')).resolves.toMatchObject({ adFree: true, ads: [] });
    extras.getLiveSponsorship.mockResolvedValue(sponsorship({ placement: 'overlay', overlayStartSeconds: 3 }));
    const overlay = await svc.forContent('u1', 'c1');
    expect(overlay.ads[0]?.overlay).toEqual({ startSeconds: 3, durationSeconds: null });
  });

  it('commercial sponsorships are not served per content; unpublished → 404', async () => {
    const { svc, extras, content } = build();
    extras.getLiveSponsorship.mockResolvedValue(sponsorship({ adFormat: 'commercial' }));
    await expect(svc.forContent('u1', 'c1')).resolves.toMatchObject({ ads: [] });
    content.findById.mockResolvedValue({ id: 'c1', status: 'draft' });
    await expect(svc.forContent('u1', 'c1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('track: collapses batch duplicates, rejects unknown/out-of-range, counts DB duplicates', async () => {
    const { svc, events } = build();
    events.insertEvents.mockImplementationOnce((rows: unknown[]) => Promise.resolve(rows.length - 1));
    const now = new Date('2026-09-25T12:00:00Z');
    const res = await svc.track(
      'u1',
      {
        events: [
          { sponsorshipId: S1, type: 'impression', viewId: 'v1' },
          { sponsorshipId: S1, type: 'impression', viewId: 'v1' },
          { sponsorshipId: S1, type: 'click', viewId: 'v1', occurredAt: '2026-09-25T11:59:00Z' },
          { sponsorshipId: S2, type: 'click', viewId: 'v1' },
          { sponsorshipId: S1, type: 'skip', viewId: 'v1', occurredAt: '2026-09-01T00:00:00Z' },
        ],
      },
      now,
    );
    expect(res).toEqual({ accepted: 1, duplicates: 2, rejected: 2, rejectedSponsorshipIds: [S2, S1], rejectedCampaignIds: [] });
    const rows = events.insertEvents.mock.calls[0]?.[0] as Array<{ contentId: string; region: string }>;
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ contentId: 'c1', region: 'EU', viewKey: 'v1', eventType: 'impression' });
  });

  it('resolveWindow validates order and span', () => {
    expect(() => resolveWindow({ from: '2026-02-01T00:00:00Z', to: '2026-01-01T00:00:00Z' })).toThrow(BadRequestException);
    expect(() => resolveWindow({ from: '2024-01-01T00:00:00Z', to: '2026-01-01T00:00:00Z' })).toThrow(/366/);
    const w = resolveWindow({}, new Date('2026-09-25T12:00:30Z'));
    expect(w.to).toBe('2026-09-25T12:01:00.000Z');
    expect(w.from).toBe('2026-08-26T12:01:00.000Z');
  });
});
