import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CacheService } from '@cache/cache.service';
import { AdSalesRepository, CampaignRecord } from '@db/repositories/ads/ad-sales.repository';
import { SubscriptionRepository } from '@db/repositories/subscriptions/subscription.repository';
import { MediaService } from '@media/media.service';
import { toCommercialFeedItem, weightedRotation } from './ad.mapper';
import { AdSalesService } from './ad-sales.service';
import { CreateCampaignDto, CreateLedgerEntryDto } from './dto/ad-sales.dto';

const future = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

function campaign(over: Partial<CampaignRecord> = {}): CampaignRecord {
  return {
    id: 'c1', advertiserId: 'a1', name: 'Summer', type: 'commercial', status: 'draft', startsAt: future(-1), endsAt: future(10),
    regions: [], creativeMediaId: 'm1', clickUrl: null, ctaLabel: null, durationSeconds: 15, skippableAfterSeconds: 5,
    feedFrequency: 5, weight: 1, frequencyCapPerUserDay: null, pricingModel: 'flat', flatFeeCents: 50000, cpmCents: 0,
    cpcCents: 0, budgetCents: null, dailyBudgetCents: null, impressionGoal: null, currency: 'USD', endedReason: null,
    notes: null, createdAt: 'x', updatedAt: 'x', ...over,
  };
}

function build(c: CampaignRecord | null = campaign()) {
  const repo = {
    getCampaign: jest.fn().mockResolvedValue(c),
    getAdvertiser: jest.fn().mockResolvedValue({ id: 'a1', name: 'Nike', status: 'active', currency: 'USD', logoMediaId: null }),
    findOrCreateAdvertiser: jest.fn().mockResolvedValue({ id: 'a2', name: 'Coke', status: 'active', currency: 'EUR' }),
    createCampaign: jest.fn((input: Record<string, unknown>) => Promise.resolve(campaign(input as Partial<CampaignRecord>))),
    setCampaignStatus: jest.fn((_id: string, to: string) => Promise.resolve(campaign({ ...(c ?? {}), status: to }))),
    hasAutoBooking: jest.fn().mockResolvedValue(false),
    createLedgerEntry: jest.fn().mockResolvedValue('l1'),
    transaction: jest.fn((fn: (tx: unknown) => unknown) => fn('tx')),
    attachContents: jest.fn().mockResolvedValue({ linked: ['k1'], missing: [] }),
    linkedContents: jest.fn().mockResolvedValue([]),
    liveCommercials: jest.fn().mockResolvedValue([]),
    userImpressionsToday: jest.fn().mockResolvedValue(0),
    ledgerTotals: jest.fn(),
    listLedger: jest.fn().mockResolvedValue({ items: [{ id: 'l1' }], total: 1 }),
    countOpenCampaigns: jest.fn().mockResolvedValue(0),
    softDeleteAdvertiser: jest.fn(),
  };
  const subscriptions = { getActiveForUser: jest.fn().mockResolvedValue(null) };
  const media = {
    findRecords: jest.fn((ids: string[]) => Promise.resolve(new Map(ids.map((id) => [id, { id, mediaType: 'video', status: 'ready' }])))),
    urlOf: jest.fn().mockReturnValue('https://cdn/x'),
    getPlayback: jest.fn().mockResolvedValue({ kind: 'hls', url: 'https://cdn/m.m3u8', cookies: {}, expiresInSeconds: 900 }),
  };
  const cache = { invalidateTag: jest.fn() };
  const svc = new AdSalesService(
    repo as unknown as AdSalesRepository,
    subscriptions as unknown as SubscriptionRepository,
    media as unknown as MediaService,
    cache as unknown as CacheService,
  );
  return { svc, repo, subscriptions, media, cache };
}

describe('AdSalesService campaigns', () => {
  it('create: find-or-creates the advertiser by name and inherits its currency', async () => {
    const { svc, repo } = build();
    await svc.createCampaign('admin', { advertiserName: 'Coke', name: 'Spot', type: 'commercial' } as CreateCampaignDto);
    expect(repo.findOrCreateAdvertiser).toHaveBeenCalledWith('Coke', 'admin');
    expect(repo.createCampaign).toHaveBeenCalledWith(expect.objectContaining({ advertiserId: 'a2', currency: 'EUR', type: 'commercial' }), 'admin');
  });

  it('create: validates dates, pricing and creative kind', async () => {
    const { svc, media } = build();
    await expect(svc.createCampaign('a', { advertiserId: 'a1', name: 'X1', type: 'commercial', startsAt: future(2), endsAt: future(1) } as CreateCampaignDto)).rejects.toThrow(/endsAt/);
    await expect(svc.createCampaign('a', { advertiserId: 'a1', name: 'X1', type: 'commercial', pricingModel: 'cpm' } as CreateCampaignDto)).rejects.toThrow(/cpmCents/);
    await expect(svc.createCampaign('a', { advertiserId: 'a1', name: 'X1', type: 'sponsorship', creativeMediaId: 'm1' } as CreateCampaignDto)).rejects.toThrow(/Sponsorship/);
    media.findRecords.mockResolvedValueOnce(new Map([['m9', { id: 'm9', mediaType: 'image', status: 'ready' }]]));
    await expect(svc.createCampaign('a', { advertiserId: 'a1', name: 'X1', type: 'commercial', creativeMediaId: 'm9' } as CreateCampaignDto)).rejects.toThrow(/video/);
  });

  it('activate in flight → active and books the flat fee once (auto)', async () => {
    const { svc, repo } = build();
    const r = await svc.activateCampaign('admin', 'c1');
    expect(r.status).toBe('active');
    expect(repo.createLedgerEntry).toHaveBeenCalledWith(expect.objectContaining({ kind: 'booked', amountCents: 50000, metadata: { auto: true } }), 'tx');
    repo.hasAutoBooking.mockResolvedValueOnce(true);
    repo.getCampaign.mockResolvedValueOnce(campaign({ status: 'paused' }));
    await svc.activateCampaign('admin', 'c1');
    expect(repo.createLedgerEntry).toHaveBeenCalledTimes(1);
  });

  it('activate with a future start → scheduled; rejects missing creative / not-ready / past end', async () => {
    const future1 = build(campaign({ startsAt: future(2) }));
    expect((await future1.svc.activateCampaign('a', 'c1')).status).toBe('scheduled');
    await expect(build(campaign({ creativeMediaId: null })).svc.activateCampaign('a', 'c1')).rejects.toThrow(/creative/);
    await expect(build(campaign({ endsAt: future(-0.5), startsAt: future(-2) })).svc.activateCampaign('a', 'c1')).rejects.toThrow(/past/);
    const notReady = build();
    notReady.media.findRecords.mockResolvedValueOnce(new Map([['m1', { id: 'm1', mediaType: 'video', status: 'processing' }]]));
    await expect(notReady.svc.activateCampaign('a', 'c1')).rejects.toThrow(/not ready/);
    await expect(build(campaign({ status: 'ended' })).svc.activateCampaign('a', 'c1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('resume only from paused; attach only on sponsorship campaigns', async () => {
    await expect(build(campaign({ status: 'active' })).svc.resumeCampaign('a', 'c1')).rejects.toBeInstanceOf(ConflictException);
    await expect(build().svc.attachContents('c1', { contentIds: ['k1'] })).rejects.toThrow(/sponsorship campaigns/);
    const s = build(campaign({ type: 'sponsorship', creativeMediaId: null }));
    await expect(s.svc.attachContents('c1', { contentIds: ['k1'] })).resolves.toMatchObject({ linked: ['k1'] });
    expect(s.repo.attachContents).toHaveBeenCalledWith('c1', 'a1', ['k1']);
  });

  it('delete refuses running campaigns', async () => {
    await expect(build(campaign({ status: 'active' })).svc.removeCampaign('c1')).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('AdSalesService ledger + advertisers', () => {
  it('ledger entry: campaign must belong to the advertiser; currency defaults to advertiser', async () => {
    const { svc, repo } = build(campaign({ advertiserId: 'other' }));
    await expect(svc.createLedgerEntry('a', { advertiserId: 'a1', campaignId: 'c1', kind: 'paid', amountCents: 10 } as CreateLedgerEntryDto)).rejects.toThrow(/another advertiser/);
    const ok = build();
    await ok.svc.createLedgerEntry('a', { advertiserId: 'a1', kind: 'paid', amountCents: 10 } as CreateLedgerEntryDto);
    expect(ok.repo.createLedgerEntry).toHaveBeenCalledWith(expect.objectContaining({ currency: 'USD', kind: 'paid' }));
    expect(repo.createLedgerEntry).not.toHaveBeenCalled();
  });

  it('statement: closing = opening + period balance', async () => {
    const { svc, repo } = build();
    repo.ledgerTotals
      .mockResolvedValueOnce({ balanceCents: 1000 })
      .mockResolvedValueOnce({ balanceCents: 250, bookedCents: 500, paidCents: 250 });
    const s = await svc.statement('a1', { from: '2026-09-01', to: '2026-09-30' });
    expect(s).toMatchObject({ openingBalanceCents: 1000, closingBalanceCents: 1250, from: '2026-09-01', to: '2026-09-30' });
    expect(repo.ledgerTotals).toHaveBeenNthCalledWith(1, { advertiserId: 'a1' }, undefined, '2026-08-31');
  });

  it('cannot archive an advertiser with running campaigns', async () => {
    const { svc, repo } = build();
    repo.countOpenCampaigns.mockResolvedValueOnce(2);
    await expect(svc.removeAdvertiser('a1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('invoiced entries need an invoice number (DTO)', async () => {
    const dto = plainToInstance(CreateLedgerEntryDto, { advertiserId: '0190a000-0000-7000-8000-000000000001', kind: 'invoiced', amountCents: 5 });
    expect((await validate(dto)).map((e) => e.property)).toContain('invoiceNumber');
    const acc = plainToInstance(CreateLedgerEntryDto, { advertiserId: '0190a000-0000-7000-8000-000000000001', kind: 'accrued', amountCents: 5 });
    expect((await validate(acc)).map((e) => e.property)).toContain('kind');
  });
});

describe('AdSalesService serving', () => {
  const live = { campaign: campaign({ status: 'active', frequencyCapPerUserDay: 2 }), advertiserName: 'Nike', advertiserLogoMediaId: 'logo' };

  it('serves a live commercial with signed creative + advertiser', async () => {
    const { svc, repo } = build();
    repo.liveCommercials.mockResolvedValue([live]);
    await expect(svc.serveCommercial('u1', 'c1')).resolves.toMatchObject({
      skip: false, advertiser: { name: 'Nike', logoUrl: 'https://cdn/x' }, creative: { kind: 'hls' }, skippableAfterSeconds: 5,
    });
  });

  it('skip reasons: not_live, ad_free, frequency_cap; unknown → 404', async () => {
    const a = build();
    await expect(a.svc.serveCommercial('u1', 'c1')).resolves.toMatchObject({ skip: true, skipReason: 'not_live' });
    a.repo.getCampaign.mockResolvedValueOnce(null);
    await expect(a.svc.serveCommercial('u1', 'zz')).rejects.toBeInstanceOf(NotFoundException);
    const b = build();
    b.repo.liveCommercials.mockResolvedValue([live]);
    b.subscriptions.getActiveForUser.mockResolvedValueOnce({ id: 's' });
    await expect(b.svc.serveCommercial('u1', 'c1')).resolves.toMatchObject({ skip: true, skipReason: 'ad_free' });
    b.repo.userImpressionsToday.mockResolvedValueOnce(2);
    await expect(b.svc.serveCommercial('u1', 'c1')).resolves.toMatchObject({ skip: true, skipReason: 'frequency_cap' });
  });
});

describe('ad mapper', () => {
  it('weightedRotation interleaves by weight', () => {
    const a = { campaign: { weight: 2, id: 'a' } };
    const b = { campaign: { weight: 1, id: 'b' } };
    expect(weightedRotation([a, b]).map((x) => x.campaign.id)).toEqual(['a', 'b', 'a']);
  });
  it('toCommercialFeedItem shapes a feed card', () => {
    const item = toCommercialFeedItem({ campaign: campaign(), advertiserName: 'Nike', advertiserLogoMediaId: null }, 'https://logo');
    expect(item).toMatchObject({ id: 'c1', isCommercial: true, contentType: 'commercial', sponsored: true, ad: { campaignId: 'c1', sponsorName: 'Nike', bannerUrl: 'https://logo' } });
  });
  it('rejects bad campaign input (DTO)', async () => {
    const dto = plainToInstance(CreateCampaignDto, { name: 'X', type: 'banner', regions: ['XX'], clickUrl: 'http://x' });
    const props = (await validate(dto)).map((e) => e.property);
    expect(props).toEqual(expect.arrayContaining(['type', 'regions', 'clickUrl', 'advertiserId']));
    expect(BadRequestException).toBeDefined();
  });
});
