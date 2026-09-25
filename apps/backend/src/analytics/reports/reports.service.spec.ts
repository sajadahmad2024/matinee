import { BadRequestException } from '@nestjs/common';
import { DashboardAnalyticsRepository } from '@db/repositories/analytics/dashboard-analytics.repository';
import { DashboardAnalyticsService } from '../dashboard/dashboard-analytics.service';
import { REPORT_METRICS, REPORT_PRESETS, toCsv } from './report-catalog';
import { ReportsService, reportWindow } from './reports.service';

const now = new Date('2026-09-25T10:15:42Z');

function build() {
  const dashboard = {
    resolve: jest.fn((w: { from: string; to: string }, region?: string) => ({
      scope: { code: region ?? 'global' },
      params: { from: w.from, to: w.to, countries: null },
    })),
    strip: jest.fn().mockResolvedValue({ users: 42 }),
    userAnalytics: jest.fn().mockResolvedValue({ starts: 10, completes: 4 }),
    screenTime: jest.fn().mockResolvedValue({ sessionAvgSecs: 300 }),
    monetization: jest.fn().mockResolvedValue({ mrr: 99.5, arpu: 1.2, ltv: 30, funnel: { signups: 10, subscribed: 3 } }),
    graphs: jest.fn().mockResolvedValue({ retention: { d1: 50, d7: 20, d30: 5 } }),
  };
  const repo = {
    reportExtras: jest.fn().mockResolvedValue({
      totals: { signups: 5, activeUsers: 100, cancellations: 1, subsAtStart: 4, views: 6, activeUserDays: 210, mau: 150, actionedViolations: 5, pointsIssued: 1000, pointsSpent: 250, watchSeconds: 7200 },
      revenueByPlatform: [{ platform: 'ios', revenueCents: 1999 }],
      violations: [],
      licensing: [{ status: 'original', count: 3 }],
    }),
  };
  const svc = new ReportsService(dashboard as unknown as DashboardAnalyticsService, repo as unknown as DashboardAnalyticsRepository);
  return { svc, dashboard, repo };
}

describe('ReportsService', () => {
  it('catalog mirrors the UI groups and presets only reference known keys', () => {
    const c = build().svc.catalog();
    expect(c.groups.map((g) => g.group)).toEqual(['Users', 'Engagement', 'Monetization', 'Gamification', 'Moderation', 'Content']);
    for (const p of Object.values(REPORT_PRESETS)) {
      for (const k of p.metrics) expect(REPORT_METRICS.has(k)).toBe(true);
    }
  });

  it('reportWindow resolves ranges (to = end of current minute) and requires from/to for custom', () => {
    expect(reportWindow('7d', now)).toEqual({ from: '2026-09-18T10:16:00.000Z', to: '2026-09-25T10:16:00.000Z' });
    expect(reportWindow('ytd', now).from).toBe('2026-01-01T00:00:00.000Z');
    expect(() => reportWindow('custom', now)).toThrow(BadRequestException);
  });

  it('builds preset rows lazily (only needed sections are queried)', async () => {
    const { svc, dashboard, repo } = build();
    const r = await svc.build({ preset: 'finance', range: '30d' }, now);
    expect(r.report).toBe('Finance');
    expect(r.rows.map((x) => [x.key, x.value])).toEqual([
      ['mrr', 99.5], ['arpu', 1.2], ['ltv', 30], ['revenue_by_platform:ios', 19.99], ['conversion_rate', 30],
    ]);
    expect(dashboard.monetization).toHaveBeenCalledTimes(1);
    expect(repo.reportExtras).toHaveBeenCalledTimes(1);
    expect(dashboard.graphs).not.toHaveBeenCalled();
  });

  it('computes derived metrics', async () => {
    const { svc } = build();
    const r = await svc.build({ metrics: ['churn_rate', 'retention', 'dau_mau', 'safety_score', 'watch_time', 'violations_by_category', 'watch_rate'], range: '30d' }, now);
    const v = Object.fromEntries(r.rows.map((x) => [x.key, x.value]));
    expect(v).toMatchObject({
      churn_rate: 25, retention_d1: 50, retention_d7: 20, retention_d30: 5,
      dau_mau: 4.7, safety_score: 50, watch_time: 2, 'violations_by_category:none': 0, watch_rate: 60,
    });
  });

  it('rejects an empty selection', async () => {
    await expect(build().svc.build({ preset: 'custom' }, now)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('CSV escapes cells and guards formula injection', () => {
    const csv = toCsv([['Report', 'A, "B"']], [{ group: 'Users', key: 'k', label: '=cmd', value: 1, unit: 'count' }]);
    expect(csv).toContain('Report,"A, ""B"""');
    expect(csv).toContain('Group,Metric,Key,Value,Unit');
    expect(csv).toContain('Users,"=cmd",k,1,count');
  });
});
