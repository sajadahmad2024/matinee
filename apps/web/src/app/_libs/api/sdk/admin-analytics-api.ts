/*
 * UI demo build only: mock of the generated `AdminAnalyticsApi` — library analytics, per-video
 * analytics and the real-time pulse, generated from the demo content library. No request is ever
 * sent.
 */
import type {
  ContentAnalyticsDto,
  ContentLibraryAnalyticsDto,
  RealtimeAnalyticsDto,
} from "@/app/_libs/api/generated";

import { ALL_DEMO_REGIONS, demoContents, findContent } from "./_demo/content-data";
import { daysFromNow, notFound, ok } from "./_demo/core";

const DAY_MS = 86_400_000;
/** A gentle wave, so charts aren't flat. */
const wave = (i: number) => 0.75 + 0.5 * Math.abs(Math.sin(i * 1.3));

const windowDays = (from?: string, to?: string) => {
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(end.getTime() - 29 * DAY_MS);
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1);
  return { start, end, days: Math.min(days, 180) };
};

const isoDay = (start: Date, i: number) => new Date(start.getTime() + i * DAY_MS).toISOString().slice(0, 10);

export const adminAnalyticsApi = {
  async adminAnalyticsControllerRealtimeV1(_params: { region?: string } = {}) {
    const realtime: RealtimeAnalyticsDto = {
      liveViewers: 1_284,
      viewsLastHour: 9_420,
      signupsToday: 312,
      pointsEarnedToday: 48_650,
    };
    return ok(realtime);
  },

  async adminAnalyticsControllerContentLibraryV1(
    params: { from?: string; to?: string; region?: string; hitThreshold?: number } = {},
  ) {
    const { start, end, days } = windowDays(params?.from, params?.to);
    const published = demoContents.filter((c) => c.status === "published");
    const views = Math.round(published.reduce((s, c) => s + c.viewCount, 0) * (days / 60));
    const threshold = params?.hitThreshold ?? 50_000;
    const hits = published.filter((c) => c.viewCount >= threshold).length;
    const analytics: ContentLibraryAnalyticsDto = {
      from: start.toISOString(),
      to: end.toISOString(),
      region: params?.region ?? null,
      totals: {
        views,
        uniqueViewers: Math.round(views * 0.62),
        watchSeconds: views * 96,
        avgWatchSeconds: 96,
        avgCompletion: 0.61,
        likes: Math.round(views * 0.08),
        comments: Math.round(views * 0.01),
        shares: Math.round(views * 0.02),
        saves: Math.round(views * 0.015),
        engagementRate: 0.112,
        avgDurationSeconds: 158,
      },
      previous: { avgWatchSeconds: 88, engagementRate: 0.104, gameConversionPct: 17.2, hitRatePct: 38, btsCtr: 0.09 },
      daily: Array.from({ length: days }, (_, i) => ({
        date: isoDay(start, i),
        gameConversionPct: Math.round(18 * wave(i) * 10) / 10,
        hitRatePct: Math.round(40 * wave(i + 2)),
        engagementRate: Math.round(0.11 * wave(i + 4) * 1000) / 1000,
      })),
      dailyHitThreshold: Math.round(threshold / 30),
      byRegion: ALL_DEMO_REGIONS.map((region, i) => {
        const share = [0.34, 0.24, 0.26, 0.1, 0.06][i] ?? 0.1;
        const regionViews = Math.round(views * share);
        return { region, views: regionViews, watchSeconds: regionViews * 96, avgWatchSeconds: 90 + i * 3 };
      }),
      hitRate: {
        threshold,
        publishedTitles: published.length,
        hits,
        percent: published.length ? Math.round((hits / published.length) * 100) : 0,
      },
      gameConversion: { viewers: Math.round(views * 0.62), players: Math.round(views * 0.62 * 0.19), percent: 19 },
      funnel: {
        viewers: Math.round(views * 0.62),
        engaged: Math.round(views * 0.31),
        gamePlayers: Math.round(views * 0.118),
        unlockers: Math.round(views * 0.03),
        impressions: Math.round(views * 1.6),
        watched3s: Math.round(views * 0.9),
        watched50pct: Math.round(views * 0.55),
        gameStarted: Math.round(views * 0.13),
        gameCompleted: Math.round(views * 0.08),
        shared: Math.round(views * 0.02),
      },
      revenueAttribution: {
        licenseRevenueCents: 4_000_000,
        sponsorshipRevenueCents: 740_000,
        adsRevenueCents: 1_260_000,
        subsRevenueCents: 2_310_000,
        unlockPointsSpent: 184_200,
      },
      btsUpsell: { parentViewers: 113_000, btsViewers: 11_900, ctr: 0.105 },
      sentiment: { likes: Math.round(views * 0.08), dislikes: Math.round(views * 0.004), positiveRatio: 0.95, positivePct: 71, neutralPct: 22, negativePct: 7 },
      shareVelocity: {
        last24h: 1_942,
        prev24h: 1_610,
        changePct: 20.6,
        hourly: Array.from({ length: 24 }, (_, h) => ({ hour: `${String(h).padStart(2, "0")}:00`, shares: Math.round(80 * wave(h)) })),
      },
      topContent: [...published]
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 5)
        .map((c) => ({
          id: c.id,
          title: c.title,
          contentType: c.contentType,
          views: c.viewCount,
          uniqueViewers: Math.round(c.viewCount * 0.64),
          watchSeconds: c.viewCount * 96,
          avgCompletion: 0.62,
        })),
    };
    return ok(analytics);
  },

  async adminAnalyticsControllerContentV1(params: { id: string; from?: string; to?: string }) {
    const c = findContent(params.id);
    if (!c) throw notFound("Content");
    const { start, end, days } = windowDays(params?.from, params?.to);
    const total = c.viewCount;
    const daily = Array.from({ length: days }, (_, i) => {
      const views = Math.round((total / days) * wave(i));
      return { date: isoDay(start, i), views, uniqueViewers: Math.round(views * 0.66), watchSeconds: views * 92, avgCompletion: 0.6 };
    });
    const children = demoContents.filter((x) => x.parentContentId === c.id);
    const analytics: ContentAnalyticsDto = {
      viewCount: total,
      uniqueViewerCount: Math.round(total * 0.66),
      likeCount: c.likeCount,
      dislikeCount: c.dislikeCount,
      commentCount: c.commentCount,
      shareCount: c.shareCount,
      sessions: Math.round(total * 1.2),
      distinctViewers: Math.round(total * 0.66),
      avgCompletion: total ? 0.62 : 0,
      totalWatchSeconds: total * 92,
      daily,
      dailySource: { rollupFrom: daysFromNow(-days), rollupThrough: end.toISOString() },
      from: start.toISOString(),
      to: end.toISOString(),
      periodChange: { views: total, prevViews: Math.round(total * 0.84), viewsPct: total ? 19 : 0, watchSeconds: total * 92, prevWatchSeconds: Math.round(total * 0.84 * 92), watchSecondsPct: total ? 19 : 0 },
      engagementRate: total ? 0.114 : 0,
      prevEngagementRate: total ? 0.106 : 0,
      retention: [0, 10, 25, 50, 75, 90, 100].map((percent) => {
        const ratio = Math.max(0.2, 1 - percent * 0.0075);
        return { percent, viewers: Math.round(total * 0.66 * ratio), ratio: Math.round(ratio * 100) / 100 };
      }),
      trafficSources: (["feed", "search", "share", "notification", "profile", "deeplink"] as const).map((source, i) => ({
        source: source as ContentAnalyticsDto["trafficSources"][number]["source"],
        views: Math.round(total * ([0.52, 0.16, 0.12, 0.09, 0.07, 0.04][i] ?? 0)),
      })),
      demographics: {
        gender: [
          { gender: "male", views: Math.round(total * 0.54), viewers: Math.round(total * 0.36) },
          { gender: "female", views: Math.round(total * 0.42), viewers: Math.round(total * 0.28) },
          { gender: "other", views: Math.round(total * 0.04), viewers: Math.round(total * 0.02) },
        ],
        device: [
          { device: "mobile", views: Math.round(total * 0.78), viewers: Math.round(total * 0.52) },
          { device: "tablet", views: Math.round(total * 0.12), viewers: Math.round(total * 0.08) },
          { device: "tv", views: Math.round(total * 0.1), viewers: Math.round(total * 0.06) },
        ],
        age: (["13-17", "18-24", "25-34", "35-44", "45+"] as const).map((range, i) => ({
          range: range as ContentAnalyticsDto["demographics"]["age"][number]["range"],
          pct: [6, 31, 36, 18, 9][i] ?? 0,
        })),
      },
      geo: [
        ["IN", 0.38],
        ["US", 0.22],
        ["GB", 0.11],
        ["AE", 0.08],
        ["SG", 0.06],
      ].map(([countryCode, share]) => ({
        countryCode: countryCode as string,
        views: Math.round(total * (share as number)),
        watchSeconds: Math.round(total * (share as number) * 92),
        revenueCents: Math.round(total * (share as number) * 2),
      })),
      games: {
        predictions: c.linkedGamesCount ? 1 : 0,
        predictionEntries: c.linkedGamesCount ? 44 : 0,
        auctions: 0,
        bids: 0,
        quests: c.linkedGamesCount ? 1 : 0,
        questParticipants: c.linkedGamesCount ? 48 : 0,
        questCompletions: c.linkedGamesCount ? 32 : 0,
        participants: c.linkedGamesCount ? 92 : 0,
        participationPct: c.linkedGamesCount ? 4.2 : 0,
        prevParticipationPct: c.linkedGamesCount ? 3.6 : 0,
        pointsDistributed: c.linkedGamesCount ? 6_400 : 0,
      },
      bts: {
        children: children.map((x) => ({ id: x.id, title: x.title, contentType: x.contentType, views: x.viewCount })),
        parentViewers: Math.round(total * 0.66),
        childViewers: children.reduce((s, x) => s + Math.round(x.viewCount * 0.66), 0),
        ctr: children.length ? 0.105 : 0,
        prevCtr: children.length ? 0.094 : 0,
      },
    };
    return ok(analytics);
  },
};
