import { NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { DashboardAnalyticsRepository } from '@db/repositories/analytics/dashboard-analytics.repository';
import { MarketingRepository } from '@db/repositories/analytics/marketing.repository';
import { AnalyticsService } from '../analytics.service';
import { MarketingService, monthStart } from './marketing.service';

function build() {
  const repo = {
    upsertSpend: jest.fn().mockImplementation((v: unknown) => Promise.resolve(v)),
    deleteSpend: jest.fn().mockResolvedValue(false),
    ingestMentions: jest.fn().mockImplementation((items: unknown[]) => Promise.resolve(items.length)),
    updateMention: jest.fn().mockResolvedValue(null),
  };
  const svc = new MarketingService(repo as unknown as MarketingRepository, {} as DashboardAnalyticsRepository, {} as AnalyticsService, {} as CacheService);
  return { svc, repo };
}

describe('MarketingService', () => {
  it('normalises months and defaults', async () => {
    expect(monthStart('2026-09')).toBe('2026-09-01');
    expect(monthStart('2026-09-01')).toBe('2026-09-01');
    const { svc, repo } = build();
    await svc.upsertSpend({ channel: 'search', periodMonth: '2026-09', spendCents: 100 });
    expect(repo.upsertSpend).toHaveBeenCalledWith({ channel: 'search', periodMonth: '2026-09-01', spendCents: 100, currency: 'USD', newUsers: 0 });
  });

  it('dedupes a batch on (platform, externalId), keeping the last occurrence', async () => {
    const { svc, repo } = build();
    const res = await svc.ingestMentions({
      mentions: [
        { platform: 'x', externalId: '1', impressions: 1 },
        { platform: 'x', externalId: '1', impressions: 2 },
        { platform: 'reddit', externalId: '1' },
        { platform: 'x' },
      ],
    });
    expect(res).toEqual({ ingested: 3 });
    const items = repo.ingestMentions.mock.calls[0]![0] as Array<{ platform: string; impressions: number }>;
    expect(items.map((i) => `${i.platform}:${i.impressions}`)).toEqual(['x:2', 'reddit:0', 'x:0']);
  });

  it('404s on unknown rows', async () => {
    const { svc } = build();
    await expect(svc.deleteSpend('id')).rejects.toBeInstanceOf(NotFoundException);
    await expect(svc.updateMention('id', { sentiment: 'neutral' })).rejects.toBeInstanceOf(NotFoundException);
  });
});
