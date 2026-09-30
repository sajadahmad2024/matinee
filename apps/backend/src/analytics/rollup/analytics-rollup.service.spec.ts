import { BadRequestException } from '@nestjs/common';
import { AnalyticsRollupRepository } from '@db/repositories/analytics/analytics-rollup.repository';
import { AnalyticsRollupService } from './analytics-rollup.service';

function build() {
  const repo = {
    rollupContentDaily: jest.fn().mockResolvedValue(5),
    getCoverage: jest.fn().mockResolvedValue({ coveredFrom: '2026-09-01', coveredThrough: '2026-09-23', lastRunAt: null }),
    setCoverage: jest.fn().mockResolvedValue(undefined),
  };
  return { svc: new AnalyticsRollupService(repo as unknown as AnalyticsRollupRepository), repo };
}
const now = new Date('2026-09-25T12:00:00Z');

describe('AnalyticsRollupService', () => {
  it('rollupRecent rolls yesterday + today and advances the watermark', async () => {
    const { svc, repo } = build();
    const res = await svc.rollupRecent(now);
    expect(repo.rollupContentDaily).toHaveBeenCalledWith('2026-09-24', '2026-09-25');
    expect(repo.setCoverage).toHaveBeenCalledWith('content_daily', '2026-09-01', '2026-09-24');
    expect(res).toEqual({ from: '2026-09-24', to: '2026-09-25', rows: 5, coverage: { coveredFrom: '2026-09-01', coveredThrough: '2026-09-24' } });
  });

  it('clamps future `to` to today and validates the range', async () => {
    const { svc, repo } = build();
    await svc.rollupContentDaily('2026-09-20', '2026-12-31', now);
    expect(repo.rollupContentDaily).toHaveBeenCalledWith('2026-09-20', '2026-09-25');
    await expect(svc.rollupContentDaily('2026-09-26', '2026-09-27', now)).rejects.toBeInstanceOf(BadRequestException);
    await expect(svc.rollupContentDaily('2026-01-01', '2026-09-25', now)).rejects.toBeInstanceOf(BadRequestException);
  });
});
