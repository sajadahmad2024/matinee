import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { AnalyticsRepository, TREND_METRICS } from '@db/repositories/analytics/analytics.repository';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AnalyticsService, DEFAULT_HIT_THRESHOLD } from './analytics.service';
import { ContentLibraryQueryDto, TrendsQueryDto } from './dto/analytics.dto';

const DAY_MS = 24 * 60 * 60 * 1000;

function build() {
  const repo = {
    content: jest.fn().mockResolvedValue({ viewCount: 1 }),
    contentLibrary: jest.fn().mockResolvedValue({ totals: {} }),
    trend: jest.fn().mockImplementation((metric: string) => Promise.resolve([{ bucket: '2026-09-01', value: metric.length }])),
  };
  const cache = {
    getOrSet: jest.fn((_key: string, _ttl: number, fn: () => Promise<unknown>) => fn()),
  };
  const svc = new AnalyticsService(repo as unknown as AnalyticsRepository, cache as unknown as CacheService);
  return { svc, repo, cache };
}

describe('AnalyticsService', () => {
  describe('resolveWindow', () => {
    const now = new Date('2026-09-25T10:15:42.123Z');

    it('defaults to the last 30 days ending now (floored to the minute)', () => {
      const { svc } = build();
      const w = svc.resolveWindow({}, now);
      expect(w.to).toBe('2026-09-25T10:15:00.000Z');
      expect(new Date(w.to).getTime() - new Date(w.from).getTime()).toBe(30 * DAY_MS);
    });

    it('derives from = to - 30 days when only to is given', () => {
      const { svc } = build();
      expect(svc.resolveWindow({ to: '2026-09-01T00:00:00Z' }, now)).toEqual({
        from: '2026-08-02T00:00:00.000Z',
        to: '2026-09-01T00:00:00.000Z',
      });
    });

    it('accepts an explicit window of exactly 366 days', () => {
      const { svc } = build();
      const w = svc.resolveWindow({ from: '2025-01-01T00:00:00Z', to: '2026-01-02T00:00:00Z' }, now);
      expect(w.from).toBe('2025-01-01T00:00:00.000Z');
    });

    it('rejects from >= to', () => {
      const { svc } = build();
      expect(() => svc.resolveWindow({ from: '2026-09-02T00:00:00Z', to: '2026-09-01T00:00:00Z' }, now)).toThrow(BadRequestException);
      expect(() => svc.resolveWindow({ from: '2026-09-01T00:00:00Z', to: '2026-09-01T00:00:00Z' }, now)).toThrow(BadRequestException);
    });

    it('rejects windows longer than 366 days', () => {
      const { svc } = build();
      expect(() => svc.resolveWindow({ from: '2025-01-01T00:00:00Z', to: '2026-01-03T00:00:00Z' }, now)).toThrow(BadRequestException);
    });
  });

  describe('content', () => {
    it('passes the resolved window to the repository', async () => {
      const { svc, repo } = build();
      await svc.content('c1', { from: '2026-09-01T00:00:00Z', to: '2026-09-10T00:00:00Z' });
      expect(repo.content).toHaveBeenCalledWith('c1', { from: '2026-09-01T00:00:00.000Z', to: '2026-09-10T00:00:00.000Z' });
    });

    it('throws NotFound when the content does not exist', async () => {
      const { svc, repo } = build();
      repo.content.mockResolvedValueOnce(null);
      await expect(svc.content('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('contentLibrary', () => {
    const window = { from: '2026-09-01T00:00:00Z', to: '2026-09-10T00:00:00Z' };

    it('defaults hitThreshold and region, caches 60 s with a param-derived key', async () => {
      const { svc, repo, cache } = build();
      await svc.contentLibrary(window);
      expect(repo.contentLibrary).toHaveBeenCalledWith({
        from: '2026-09-01T00:00:00.000Z',
        to: '2026-09-10T00:00:00.000Z',
        region: null,
        hitThreshold: DEFAULT_HIT_THRESHOLD,
      });
      const [key, ttl] = cache.getOrSet.mock.calls[0]!;
      expect(ttl).toBe(60);
      expect(key).toBe('analytics:content-library:*:2026-09-01T00:00:00.000Z:2026-09-10T00:00:00.000Z:1000');
    });

    it('passes region + threshold through and keys the cache on them', async () => {
      const { svc, repo, cache } = build();
      await svc.contentLibrary({ ...window, region: ' EU ', hitThreshold: 50 });
      expect(repo.contentLibrary).toHaveBeenCalledWith(expect.objectContaining({ region: 'EU', hitThreshold: 50 }));
      expect(cache.getOrSet.mock.calls[0]![0]).toContain(':EU:');
      expect(cache.getOrSet.mock.calls[0]![0]).toMatch(/:50$/);
    });

    it('validates the window before touching cache or DB', () => {
      const { svc, repo, cache } = build();
      expect(() => svc.contentLibrary({ from: '2026-09-10T00:00:00Z', to: '2026-09-01T00:00:00Z' })).toThrow(BadRequestException);
      expect(cache.getOrSet).not.toHaveBeenCalled();
      expect(repo.contentLibrary).not.toHaveBeenCalled();
    });
  });

  describe('trends', () => {
    const window = { from: '2026-09-01T00:00:00Z', to: '2026-09-10T00:00:00Z' };

    it('defaults to all metrics, day interval, no region', async () => {
      const { svc, repo } = build();
      const res = await svc.trends(window);
      expect(res.interval).toBe('day');
      expect(res.region).toBeNull();
      expect(Object.keys(res.series)).toEqual([...TREND_METRICS]);
      expect(repo.trend).toHaveBeenCalledTimes(TREND_METRICS.length);
      expect(repo.trend).toHaveBeenCalledWith('views', {
        from: '2026-09-01T00:00:00.000Z',
        to: '2026-09-10T00:00:00.000Z',
        interval: 'day',
        region: null,
      });
    });

    it('only queries requested metrics (deduped, canonical order) and keys the cache on params', async () => {
      const { svc, repo, cache } = build();
      const res = await svc.trends({ ...window, metrics: ['revenue', 'signups', 'revenue'], interval: 'week', region: 'NA' });
      expect(Object.keys(res.series)).toEqual(['signups', 'revenue']);
      expect(res.series.revenue).toEqual([{ bucket: '2026-09-01', value: 'revenue'.length }]);
      expect(repo.trend).toHaveBeenCalledTimes(2);
      expect(repo.trend).toHaveBeenCalledWith('signups', expect.objectContaining({ interval: 'week', region: 'NA' }));
      const [key, ttl] = cache.getOrSet.mock.calls[0]!;
      expect(ttl).toBe(60);
      expect(key).toBe('analytics:trends:signups,revenue:week:NA:2026-09-01T00:00:00.000Z:2026-09-10T00:00:00.000Z');
    });

    it('rejects windows longer than 366 days', () => {
      const { svc } = build();
      expect(() => svc.trends({ from: '2024-01-01T00:00:00Z', to: '2026-01-01T00:00:00Z' })).toThrow(BadRequestException);
    });
  });

  describe('query DTOs', () => {
    it('parses metrics CSV and rejects unknown metrics / intervals', async () => {
      const ok = plainToInstance(TrendsQueryDto, { metrics: 'views, signups', interval: 'week', from: '2026-09-01T00:00:00Z' });
      expect(ok.metrics).toEqual(['views', 'signups']);
      expect(await validate(ok)).toHaveLength(0);

      const bad = plainToInstance(TrendsQueryDto, { metrics: 'views,bogus', interval: 'year', to: 'not-a-date' });
      const props = (await validate(bad)).map((e) => e.property).sort();
      expect(props).toEqual(['interval', 'metrics', 'to']);
    });

    it('coerces hitThreshold to a positive integer', async () => {
      const ok = plainToInstance(ContentLibraryQueryDto, { hitThreshold: '250', region: 'NA' });
      expect(ok.hitThreshold).toBe(250);
      expect(await validate(ok)).toHaveLength(0);
      const bad = plainToInstance(ContentLibraryQueryDto, { hitThreshold: '0' });
      expect((await validate(bad)).map((e) => e.property)).toEqual(['hitThreshold']);
    });
  });
});
