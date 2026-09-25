import {
  buildHeatmap,
  pct,
  shapeCommunity,
  shapeExternal,
  shapeGamification,
  shapeGraphs,
  shapeMonetization,
  shapeScreenTime,
  shapeUserAnalytics,
  weeksIn,
} from './dashboard-shapes';

describe('dashboard shapes', () => {
  it('pct / weeksIn guards', () => {
    expect(pct(1, 0)).toBe(0);
    expect(pct(1, 3)).toBe(33.3);
    expect(weeksIn('2026-09-01T00:00:00Z', '2026-09-15T00:00:00Z')).toBe(2);
    expect(weeksIn('2026-09-01T00:00:00Z', '2026-09-01T01:00:00Z')).toBeCloseTo(1 / 7);
  });

  it('user analytics: per-session metrics come from sessions, else per user-day', () => {
    const views = { starts: '10', completes: '4', avgWatchPct: 55.55, avgWatchSecs: 12.34, avgClipSecs: 30, swipes: '3', loops: 1.26, userDays: '5', liveCounted: '8', liveCompleted: '2' };
    const withSessions = shapeUserAnalytics({ views, sessions: { sessions: 2, actionsPerSession: 1.5, videosPerSession: 4 }, actions: { actions: 20 }, hit: { titles: 4, hits: 1 } }, 10000);
    expect(withSessions).toMatchObject({
      starts: 10, completes: 4, avgWatchPct: 55.6, swipeThroughPct: 30, rewatchLoops: 1.3,
      engagementPerSession: 1.5, videosPerSession: 4, videosPerDay: 2, completionLivePct: 25, hitRatePct: 25, sessionsTracked: 2,
    });
    const noSessions = shapeUserAnalytics({ views, sessions: { sessions: 0 }, actions: { actions: 20 }, hit: {} }, 10000);
    expect(noSessions.engagementPerSession).toBe(4);
    expect(noSessions.videosPerSession).toBe(2);
  });

  it('gamification: source slices grouped + sorted, buckets and weekly trends', () => {
    const g = shapeGamification({
      totals: { earned: 1000, earnerDays: 4, spent: 250, wallets: 4, b0: 2, b1: 1, b2: 1, b3: 0, rankChangeMonth: 8.7, leaderboardViews: 14, activeUsers: 7, players: 1, viewers: 4 },
      bySource: [{ source: 'quest', points: 100 }, { source: 'prediction', points: 200 }, { source: 'daily_streak', points: 600 }, { source: 'weird', points: 100 }],
      weekly: [{ weekStart: '2026-09-07', distributed: 100, redeemed: 25 }, { weekStart: '2026-09-14', distributed: 0, redeemed: 0 }],
    }, 2);
    expect(g.earnedPerUserDay).toBe(250);
    expect(g.redemptionPct).toBe(25);
    expect(g.rankChangeAvgWeek).toBe(2);
    expect(g.leaderboardChecksPerWeek).toBe(1);
    expect(g.challengeParticipationPct).toBe(25);
    expect(g.earnedBySource.map((s) => [s.name, s.value])).toEqual([['Streaks', 60], ['Challenges', 30], ['Other', 10]]);
    expect(g.balanceBuckets.map((b) => b.pct)).toEqual([50, 25, 25, 0]);
    expect(g.economyTrend[0]).toEqual({ period: 'Week 1', weekStart: '2026-09-07', distributed: 100, redeemed: 25 });
    expect(g.redemptionTrend.map((r) => r.rate)).toEqual([25, 0]);
  });

  it('heatmap is 7×24 normalised by the busiest cell', () => {
    const h = buildHeatmap([{ dow: 0, h: 21, n: 10 }, { dow: 6, h: 3, n: 5 }, { dow: 9, h: 1, n: 99 }]);
    expect(h).toHaveLength(7);
    expect(h.every((r) => r.length === 24)).toBe(true);
    expect(h[0]?.[21]).toBe(1);
    expect(h[6]?.[3]).toBe(0.5);
  });

  it('screen time buckets + re-entries', () => {
    const s = shapeScreenTime({
      sessions: { sessions: 4, avgSecs: 600.4, medianSecs: 450, b0: 1, b1: 2, b2: 1, b3: 0, b4: 0, reentries: 1.25, videos: 6, totalSecs: 2400, userDays: 2 },
      viewers: { viewers: 10, gamified: 3 },
      heatmap: [],
    });
    expect(s).toMatchObject({ viewers: 10, gamified: 3, sessionAvgSecs: 600, bgFgPerSession: 1.3, doomscrollVideos: 6, doomscrollMinutes: 20 });
    expect(s.sessionBuckets.map((b) => b.pct)).toEqual([25, 50, 25, 0, 0]);
  });

  it('monetization: channel CAC/LTV, blended ratio, spend apportioned by factor', () => {
    const m = shapeMonetization({
      totals: { revenueCents: 10000, customers: 10, activeUserDays: 50, trials: 4, trialsConverted: 1, mrrCents: 5000, lifetimeRevenueCents: 30000, payingUsers: 3 },
      channels: [
        { channel: 'paid_social', users: 5, revenueCents: 20000, spendCents: 10000, attributedUsers: 10, signups: 3 },
        { channel: 'organic', users: 5, revenueCents: 10000, spendCents: 0, attributedUsers: 0, signups: 5 },
      ],
      funnel: { signups: 10, firstSession: 8, engaged: 5, subscribed: 2, referred: 1 },
      subsWeekly: [{ date: '2026-09-07', newSubs: 2, cancellations: 1 }],
      revenueMonthly: [{ month: '2026-09', revenueCents: 12345 }],
    }, 0.5);
    expect(m).toMatchObject({ arpu: 10, arpdau: 2, trialToPaidPct: 25, mrr: 50, revenue: 100, ltv: 100 });
    expect(m.channels[0]).toEqual({ channel: 'Paid social', key: 'paid_social', ltv: 40, cac: 10, spend: 50, newUsers: 5 });
    expect(m.channels[1]).toMatchObject({ channel: 'Organic / viral', cac: 0 });
    // blended LTV = 300/10 = $30, blended CAC = $50 / 5 = $10 → 3.0
    expect(m.ltvCacRatio).toBe(3);
    expect(m.revenueTrend).toEqual([{ month: '2026-09', subscriptions: 123.45 }]);
  });

  it('community in-app + external', () => {
    const c = shapeCommunity(
      { comments: 20, topLevel: 10, replied: 4, reactions: 5, shares: 30, views: 50, viewers: 5, viewedContents: 3 },
      { mentions: 14, positive: 6, neutral: 3, negative: 1, viral: 2, impressions: 1000, emvCents: 12345, advocates: 1 },
      2,
    );
    expect(c.inApp).toEqual({ commentsPerUserWeek: 2, replyRatePct: 40, reactionToViewPct: 10, sharesPerVideo: 10 });
    expect(c.external).toEqual({ mentionsPerWeek: 7, sentiment: [60, 30, 10], viralMoments: 2, organicImpressions: 1000, earnedMediaValue: 123.45, topAdvocates: 1, mentions: 14 });
    expect(shapeExternal({}, 1).sentiment).toEqual([0, 0, 0]);
  });

  it('graphs: retention series, k-factor, velocity', () => {
    const cur = [{ n: 1, eligible: 10, retained: 5, cohort: 10 }, { n: 7, eligible: 8, retained: 2, cohort: 10 }, { n: 30, eligible: 0, retained: 0, cohort: 10 }];
    const g = shapeGraphs({
      current: cur,
      previous: [{ n: 1, eligible: 4, retained: 1, cohort: 4 }],
      kFactor: [{ month: '2026-09', referred: 3, organic: 4 }, { month: '2026-10', referred: 1, organic: 0 }],
      velocity: [{ day: '2026-09-21', weekday: 'Mon', players: '7' }],
    });
    expect(g.retention).toMatchObject({ d1: 50, d7: 25, d30: 0, cohortSize: 10 });
    expect(g.retention.series.map((p) => p.day)).toEqual(['D0', 'D1', 'D3', 'D7', 'D14', 'D30']);
    expect(g.retention.series[1]).toEqual({ day: 'D1', current: 50, previous: 25 });
    expect(g.kFactor.map((k) => k.k)).toEqual([0.75, 0]);
    expect(g.velocity).toEqual([{ day: '2026-09-21', weekday: 'Mon', players: 7 }]);
  });
});
