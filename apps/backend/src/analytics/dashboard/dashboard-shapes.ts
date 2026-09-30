/**
 * Pure shaping: raw repository aggregates → the admin UI payloads
 * (apps/web/src/app/(public)/dashboard/constants.ts). Unit tested; no I/O.
 */
import { num, type Row } from '@db/repositories/analytics/dashboard-analytics.repository';

export const round = (v: number, dp = 1): number => {
  const f = 10 ** dp;
  return Math.round(v * f) / f;
};
/** a / b as a 0..100 percentage (dp decimals); 0 when b is 0. */
export const pct = (a: number, b: number, dp = 1): number => (b > 0 ? round((a / b) * 100, dp) : 0);
/** a / b rounded; 0 when b is 0. */
export const per = (a: number, b: number, dp = 1): number => (b > 0 ? round(a / b, dp) : 0);
const dollars = (cents: number): number => round(cents / 100, 2);

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
/** Weeks spanned by the window (fractional; floor 1/7 so a 1-day window still normalises). */
export const weeksIn = (from: string, to: string): number => Math.max((Date.parse(to) - Date.parse(from)) / WEEK_MS, 1 / 7);

// ─── Types (mirror the UI) ────────────────────────────────────────────────────

export interface StripData { users: number; subscribers: number; onlineNow: number; playingNow: number }

export interface UserAnalyticsData {
  starts: number; completes: number; avgWatchPct: number; avgWatchSecs: number; avgClipSecs: number;
  swipeThroughPct: number; rewatchLoops: number; engagementPerSession: number; videosPerSession: number;
  videosPerDay: number; completionLivePct: number; hitRatePct: number;
  hitThreshold: number; sessionsTracked: number;
}

export interface GamificationData {
  earnedPerUserDay: number; redemptionPct: number; pointsOutstanding: number; streakAvgDays: number;
  streakLongestDays: number; leaderboardChecksPerWeek: number; rankChangeAvgWeek: number;
  challengeParticipationPct: number; challengeCompletionPct: number;
  earnedBySource: Array<{ name: string; value: number; points: number; color: string }>;
  balanceBuckets: Array<{ bucket: string; pct: number }>;
  economyTrend: Array<{ period: string; weekStart: string; distributed: number; redeemed: number }>;
  redemptionTrend: Array<{ week: string; weekStart: string; rate: number }>;
}

export interface ScreenTimeData {
  viewers: number; gamified: number; sessionAvgSecs: number; sessionMedianSecs: number;
  sessionBuckets: Array<{ bucket: string; pct: number }>;
  heatmap: number[][];
  bgFgPerSession: number; doomscrollVideos: number; doomscrollMinutes: number;
  sessionsTracked: number;
}

export interface MonetizationData {
  arpu: number; arpdau: number; trialToPaidPct: number; ltvCacRatio: number; mrr: number; revenue: number;
  /** Lifetime paid revenue ÷ paying users ($). */
  ltv: number;
  funnel: { signups: number; firstSession: number; engaged: number; subscribed: number; referred: number };
  channels: Array<{ channel: string; key: string; ltv: number; cac: number; spend: number; newUsers: number }>;
  subsTrend: Array<{ date: string; newSubs: number; cancellations: number }>;
  revenueTrend: Array<{ month: string; subscriptions: number }>;
}

export interface CommunityExternal {
  mentionsPerWeek: number; sentiment: [number, number, number]; viralMoments: number;
  organicImpressions: number; earnedMediaValue: number; topAdvocates: number; mentions: number;
}

export interface CommunityData {
  inApp: { commentsPerUserWeek: number; replyRatePct: number; reactionToViewPct: number; sharesPerVideo: number };
  external: CommunityExternal;
}

export interface GraphsData {
  retention: { d1: number; d7: number; d30: number; cohortSize: number; series: Array<{ day: string; current: number; previous: number }> };
  kFactor: Array<{ month: string; k: number; referred: number; organic: number }>;
  velocity: Array<{ day: string; weekday: string; players: number }>;
}

// ─── Shapers ──────────────────────────────────────────────────────────────────

export function shapeStrip(r: Row): StripData {
  return { users: num(r['users']), subscribers: num(r['subscribers']), onlineNow: num(r['onlineNow']), playingNow: num(r['playingNow']) };
}

export function shapeUserAnalytics(raw: { views: Row; sessions: Row; actions: Row; hit: Row }, hitThreshold: number): UserAnalyticsData {
  const v = raw.views;
  const starts = num(v['starts']);
  const userDays = num(v['userDays']);
  const sessions = num(raw.sessions['sessions']);
  return {
    starts,
    completes: num(v['completes']),
    avgWatchPct: round(num(v['avgWatchPct'])),
    avgWatchSecs: round(num(v['avgWatchSecs'])),
    avgClipSecs: round(num(v['avgClipSecs'])),
    swipeThroughPct: pct(num(v['swipes']), starts),
    rewatchLoops: round(num(v['loops'])),
    engagementPerSession: sessions > 0 ? round(num(raw.sessions['actionsPerSession'])) : per(num(raw.actions['actions']), userDays),
    videosPerSession: sessions > 0 ? round(num(raw.sessions['videosPerSession'])) : per(starts, userDays),
    videosPerDay: per(starts, userDays),
    completionLivePct: pct(num(v['liveCompleted']), num(v['liveCounted'])),
    hitRatePct: pct(num(raw.hit['hits']), num(raw.hit['titles'])),
    hitThreshold,
    sessionsTracked: sessions,
  };
}

/** ledger source_type → UI slice (label, colour). */
const SOURCE_GROUPS: Record<string, { name: string; color: string }> = {
  daily_streak: { name: 'Streaks', color: 'hsl(38, 92%, 50%)' },
  content_share: { name: 'Sharing', color: 'hsl(270, 91%, 65%)' },
  referral: { name: 'Referrals', color: 'hsl(142, 71%, 45%)' },
  quest: { name: 'Challenges', color: 'hsl(0, 84%, 60%)' },
  prediction: { name: 'Challenges', color: 'hsl(0, 84%, 60%)' },
  bid: { name: 'Challenges', color: 'hsl(0, 84%, 60%)' },
  bid_refund: { name: 'Challenges', color: 'hsl(0, 84%, 60%)' },
  badge: { name: 'Badges', color: 'hsl(217, 91%, 60%)' },
};
const OTHER_SOURCE = { name: 'Other', color: 'hsl(215, 16%, 47%)' };

export function shapeGamification(raw: { totals: Row; bySource: Row[]; weekly: Row[] }, weeks: number): GamificationData {
  const t = raw.totals;
  const earned = num(t['earned']);
  const groups = new Map<string, { name: string; color: string; points: number }>();
  for (const r of raw.bySource) {
    const g = SOURCE_GROUPS[String(r['source'])] ?? OTHER_SOURCE;
    const cur = groups.get(g.name) ?? { ...g, points: 0 };
    cur.points += num(r['points']);
    groups.set(g.name, cur);
  }
  const totalBySource = [...groups.values()].reduce((s, g) => s + g.points, 0);
  const wallets = num(t['wallets']);
  return {
    earnedPerUserDay: per(earned, num(t['earnerDays']), 0),
    redemptionPct: pct(num(t['spent']), earned),
    pointsOutstanding: num(t['outstanding']),
    streakAvgDays: round(num(t['streakAvg'])),
    streakLongestDays: num(t['streakLongest']),
    leaderboardChecksPerWeek: per(num(t['leaderboardViews']), num(t['activeUsers']) * weeks),
    rankChangeAvgWeek: round(num(t['rankChangeMonth']) / 4.35, 0),
    challengeParticipationPct: pct(num(t['players']), num(t['viewers'])),
    challengeCompletionPct: pct(num(t['questCompletions']), num(t['questParticipations'])),
    earnedBySource: [...groups.values()]
      .sort((a, b) => b.points - a.points)
      .map((g) => ({ name: g.name, value: pct(g.points, totalBySource), points: g.points, color: g.color })),
    balanceBuckets: [
      { bucket: '0–500', pct: pct(num(t['b0']), wallets) },
      { bucket: '500–2K', pct: pct(num(t['b1']), wallets) },
      { bucket: '2K–10K', pct: pct(num(t['b2']), wallets) },
      { bucket: '10K+', pct: pct(num(t['b3']), wallets) },
    ],
    economyTrend: raw.weekly.map((w, i) => ({
      period: `Week ${i + 1}`, weekStart: String(w['weekStart']), distributed: num(w['distributed']), redeemed: num(w['redeemed']),
    })),
    redemptionTrend: raw.weekly.map((w, i) => ({
      week: `W${i + 1}`, weekStart: String(w['weekStart']), rate: pct(num(w['redeemed']), num(w['distributed'])),
    })),
  };
}

/** 7 (Mon..Sun) × 24 (UTC hour) intensity grid normalised to 0..1 by the busiest cell. */
export function buildHeatmap(rows: Row[]): number[][] {
  const grid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
  let max = 0;
  for (const r of rows) {
    const d = num(r['dow']);
    const h = num(r['h']);
    const row = grid[d];
    if (row && h >= 0 && h < 24) {
      row[h] = (row[h] ?? 0) + num(r['n']);
      max = Math.max(max, row[h] ?? 0);
    }
  }
  return grid.map((row) => row.map((n) => (max > 0 ? round(n / max, 2) : 0)));
}

export function shapeScreenTime(raw: { sessions: Row; viewers: Row; heatmap: Row[] }): ScreenTimeData {
  const s = raw.sessions;
  const n = num(s['sessions']);
  return {
    viewers: num(raw.viewers['viewers']),
    gamified: num(raw.viewers['gamified']),
    sessionAvgSecs: Math.round(num(s['avgSecs'])),
    sessionMedianSecs: Math.round(num(s['medianSecs'])),
    sessionBuckets: [
      { bucket: '<5m', pct: pct(num(s['b0']), n) },
      { bucket: '5–15m', pct: pct(num(s['b1']), n) },
      { bucket: '15–30m', pct: pct(num(s['b2']), n) },
      { bucket: '30–60m', pct: pct(num(s['b3']), n) },
      { bucket: '>60m', pct: pct(num(s['b4']), n) },
    ],
    heatmap: buildHeatmap(raw.heatmap),
    bgFgPerSession: round(num(s['reentries'])),
    doomscrollVideos: round(num(s['videos'])),
    doomscrollMinutes: per(num(s['totalSecs']) / 60, num(s['userDays'])),
    sessionsTracked: n,
  };
}

const CHANNEL_LABELS: Record<string, string> = {
  organic: 'Organic / viral',
  referral: 'Referral',
  paid_social: 'Paid social',
  influencer: 'Influencer',
  search: 'Search',
  other: 'Other',
};

/**
 * `factor` = scope share of all customers. Marketing spend has no region, so for a
 * non-global scope it's apportioned by that share.
 */
export function shapeMonetization(
  raw: { totals: Row; channels: Row[]; funnel: Row; subsWeekly: Row[]; revenueMonthly: Row[] },
  factor: number,
): MonetizationData {
  const t = raw.totals;
  const revenueCents = num(t['revenueCents']);
  let blendedRev = 0;
  let blendedUsers = 0;
  let blendedSpend = 0;
  let blendedNew = 0;
  const channels = raw.channels.map((c) => {
    const key = String(c['channel']);
    const users = num(c['users']);
    const rev = num(c['revenueCents']);
    const spend = num(c['spendCents']) * factor;
    const attributed = num(c['attributedUsers']) * factor;
    const newUsers = attributed > 0 ? attributed : num(c['signups']);
    blendedRev += rev;
    blendedUsers += users;
    blendedSpend += spend;
    if (spend > 0) {
      blendedNew += newUsers;
    }
    return {
      channel: CHANNEL_LABELS[key] ?? key,
      key,
      ltv: users > 0 ? dollars(rev / users) : 0,
      cac: newUsers > 0 ? dollars(spend / newUsers) : 0,
      spend: dollars(spend),
      newUsers: Math.round(newUsers),
    };
  });
  const ltv = blendedUsers > 0 ? blendedRev / blendedUsers : 0;
  const cac = blendedNew > 0 ? blendedSpend / blendedNew : 0;
  const f = raw.funnel;
  return {
    arpu: dollars(revenueCents / Math.max(num(t['customers']), 1)),
    arpdau: num(t['activeUserDays']) > 0 ? dollars(revenueCents / num(t['activeUserDays'])) : 0,
    trialToPaidPct: pct(num(t['trialsConverted']), num(t['trials'])),
    ltvCacRatio: cac > 0 ? round(ltv / cac) : 0,
    mrr: dollars(num(t['mrrCents'])),
    revenue: dollars(revenueCents),
    ltv: num(t['payingUsers']) > 0 ? dollars(num(t['lifetimeRevenueCents']) / num(t['payingUsers'])) : 0,
    funnel: {
      signups: num(f['signups']), firstSession: num(f['firstSession']), engaged: num(f['engaged']),
      subscribed: num(f['subscribed']), referred: num(f['referred']),
    },
    channels,
    subsTrend: raw.subsWeekly.map((w) => ({ date: String(w['date']), newSubs: num(w['newSubs']), cancellations: num(w['cancellations']) })),
    revenueTrend: raw.revenueMonthly.map((m) => ({ month: String(m['month']), subscriptions: dollars(num(m['revenueCents'])) })),
  };
}

export function shapeExternal(totals: Row, weeks: number): CommunityExternal {
  const pos = num(totals['positive']);
  const neu = num(totals['neutral']);
  const neg = num(totals['negative']);
  const rated = pos + neu + neg;
  const mentions = num(totals['mentions']);
  return {
    mentionsPerWeek: per(mentions, weeks, 0),
    sentiment: [pct(pos, rated, 0), pct(neu, rated, 0), pct(neg, rated, 0)],
    viralMoments: num(totals['viral']),
    organicImpressions: num(totals['impressions']),
    earnedMediaValue: dollars(num(totals['emvCents'])),
    topAdvocates: num(totals['advocates']),
    mentions,
  };
}

export function shapeCommunity(inApp: Row, social: Row, weeks: number): CommunityData {
  return {
    inApp: {
      commentsPerUserWeek: per(num(inApp['comments']), num(inApp['viewers']) * weeks),
      replyRatePct: pct(num(inApp['replied']), num(inApp['topLevel'])),
      reactionToViewPct: pct(num(inApp['reactions']), num(inApp['views'])),
      sharesPerVideo: per(num(inApp['shares']), num(inApp['viewedContents'])),
    },
    external: shapeExternal(social, weeks),
  };
}

export const RETENTION_OFFSETS = [1, 3, 7, 14, 30] as const;

export function shapeGraphs(raw: { current: Row[]; previous: Row[]; kFactor: Row[]; velocity: Row[] }): GraphsData {
  const rate = (rows: Row[], n: number): number => {
    const r = rows.find((x) => num(x['n']) === n);
    return r ? pct(num(r['retained']), num(r['eligible'])) : 0;
  };
  const cohortSize = num(raw.current[0]?.['cohort']);
  const prevSize = num(raw.previous[0]?.['cohort']);
  return {
    retention: {
      d1: rate(raw.current, 1),
      d7: rate(raw.current, 7),
      d30: rate(raw.current, 30),
      cohortSize,
      series: [
        { day: 'D0', current: cohortSize > 0 ? 100 : 0, previous: prevSize > 0 ? 100 : 0 },
        ...RETENTION_OFFSETS.map((n) => ({ day: `D${n}`, current: rate(raw.current, n), previous: rate(raw.previous, n) })),
      ],
    },
    kFactor: raw.kFactor.map((m) => {
      const referred = num(m['referred']);
      const organic = num(m['organic']);
      return { month: String(m['month']), k: per(referred, organic, 2), referred, organic };
    }),
    velocity: raw.velocity.map((d) => ({ day: String(d['day']), weekday: String(d['weekday']), players: num(d['players']) })),
  };
}
