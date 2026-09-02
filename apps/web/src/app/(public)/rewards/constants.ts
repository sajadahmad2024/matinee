import type { MacroRegion } from "@/app/_libs/regions";

import { MOCK_VIDEOS } from "../content/constants";

// ─────────────────────────────────────────────────────────────────────────────
// Bidding for Experiences — fully configured in this module.
// ─────────────────────────────────────────────────────────────────────────────

export type ExperienceStatus = "draft" | "scheduled" | "live" | "ended" | "archived";

export interface ExperienceReward {
  id: string;
  title: string; // e.g. "A Day on Set with the Director"
  description: string;
  image: string; // banner
  geofence: string[]; // ISO country codes, e.g. ["GB"] — first launch UK
  status: ExperienceStatus;
  minBid: number; // starting/threshold bid (pts)
  minIncrement: number; // pts
  winners: number; // 1..n (multi-winner rewards need the threshold)
  bidOpenAt: string; // ISO — bidding window (time limit, adjustable per reward)
  bidCloseAt: string; // ISO
  experienceAt: string; // when the experience happens — independent of bidCloseAt
  bidders: number;
  totalBids: number;
  topBid?: number;
  leaderboard: { user: string; bid: number; at: string }[]; // top bids only (user-facing shows leading points, not ranks-for-everyone)
  notifications: {
    outbid: boolean; // notify user when outbid
    closingReminders: number[]; // hours before close, e.g. [36, 24]
    winnerEmailSubject: string; // automated winner communication
    winnerEmailBody: string;
  };
  winner?: { user: string; bid: number };
  region: MacroRegion; // analytics rollup region
}

// Live-experience close times are anchored to "now" so the urgency accent and the
// settle flow always demo, whenever the mock is viewed.
const HOUR = 3_600_000;
const hoursFromNow = (h: number) => new Date(Date.now() + h * HOUR).toISOString();

export const MOCK_EXPERIENCES: ExperienceReward[] = [
  {
    id: "exp-1",
    title: "VIP Premiere Night — Meet the Cast",
    description:
      "Two tickets to the London premiere of the season finale, red-carpet access and a meet-and-greet with the lead cast after the screening.",
    image: "",
    geofence: ["GB"],
    status: "live",
    minBid: 500,
    minIncrement: 25,
    winners: 1,
    bidOpenAt: "2026-08-15T09:00:00Z",
    bidCloseAt: hoursFromNow(10), // closes <24h — demos the urgency accent
    experienceAt: "2026-10-14T18:00:00Z",
    bidders: 412,
    totalBids: 1873,
    topBid: 12400,
    leaderboard: [
      { user: "@filmfan_22", bid: 12400, at: "2026-09-02T11:40:00Z" },
      { user: "@cinephile_88", bid: 12100, at: "2026-09-02T10:05:00Z" },
      { user: "@kdrama_queen", bid: 11750, at: "2026-09-01T22:18:00Z" },
      { user: "@lateshow_max", bid: 10900, at: "2026-09-01T16:44:00Z" },
      { user: "@bingewatcher", bid: 10275, at: "2026-08-31T20:02:00Z" },
    ],
    notifications: {
      outbid: true,
      closingReminders: [36, 24],
      winnerEmailSubject: "You won: VIP Premiere Night 🎬",
      winnerEmailBody:
        "Congratulations! Your bid won the VIP Premiere Night experience. Our team will contact you within 48 hours to arrange tickets and logistics.",
    },
    region: "EU",
  },
  {
    id: "exp-2",
    title: "A Day on Set with the Director",
    description:
      "Spend a full shooting day on set with the director of 'Seoul Nights' — watch scenes come together and join the crew lunch.",
    image: "",
    geofence: ["GB"],
    status: "live",
    minBid: 1000,
    minIncrement: 50,
    winners: 2,
    bidOpenAt: "2026-08-20T09:00:00Z",
    bidCloseAt: hoursFromNow(-6), // bidding closed, still live — demos Settle & award
    experienceAt: "2027-01-15T09:00:00Z", // bidding closes long before the experience
    bidders: 268,
    totalBids: 941,
    topBid: 9350,
    leaderboard: [
      { user: "@director_dan", bid: 9350, at: "2026-09-02T08:15:00Z" },
      { user: "@setlife_sam", bid: 9100, at: "2026-09-01T19:30:00Z" },
      { user: "@filmschool_fi", bid: 8825, at: "2026-09-01T14:12:00Z" },
      { user: "@grip_and_gaff", bid: 8300, at: "2026-08-30T21:47:00Z" },
    ],
    notifications: {
      outbid: true,
      closingReminders: [36, 24],
      winnerEmailSubject: "You won: A Day on Set with the Director",
      winnerEmailBody:
        "Congratulations! Your bid won A Day on Set with the Director. We'll email travel and scheduling details shortly.",
    },
    region: "EU",
  },
  {
    id: "exp-3",
    title: "Awards Night — Backstage Pass",
    description:
      "Backstage access at the Winter Streaming Awards: green-room tour, photo ops and seats in the industry block.",
    image: "",
    geofence: ["GB"],
    status: "scheduled",
    minBid: 750,
    minIncrement: 25,
    winners: 1,
    bidOpenAt: "2026-10-05T09:00:00Z",
    bidCloseAt: "2026-11-04T18:00:00Z",
    experienceAt: "2026-12-12T19:00:00Z",
    bidders: 0,
    totalBids: 0,
    leaderboard: [],
    notifications: {
      outbid: true,
      closingReminders: [36, 24],
      winnerEmailSubject: "You won: Awards Night Backstage Pass",
      winnerEmailBody:
        "Congratulations! Your bid won the Awards Night Backstage Pass. Our team will be in touch with event details.",
    },
    region: "EU",
  },
  {
    id: "exp-4",
    title: "Script Table-Read with the Writers",
    description:
      "Join the writers' room for a table-read of an upcoming episode and a Q&A over dinner — quarterly flagship reward.",
    image: "",
    geofence: ["GB"],
    status: "scheduled",
    minBid: 600,
    minIncrement: 25,
    winners: 4,
    bidOpenAt: "2026-11-10T09:00:00Z",
    bidCloseAt: "2026-12-01T18:00:00Z",
    experienceAt: "2027-01-28T17:00:00Z",
    bidders: 0,
    totalBids: 0,
    leaderboard: [],
    notifications: {
      outbid: true,
      closingReminders: [48, 24],
      winnerEmailSubject: "You won: Script Table-Read with the Writers",
      winnerEmailBody:
        "Congratulations! Your bid won a seat at the writers' table-read. Dates and venue details follow by email.",
    },
    region: "EU",
  },
  {
    id: "exp-5",
    title: "Signed Poster & Props Drop",
    description:
      "A crate of signed posters and screen-used props from season one — shipped to the winner's door.",
    image: "",
    geofence: ["GB"],
    status: "ended",
    minBid: 500,
    minIncrement: 25,
    winners: 1,
    bidOpenAt: "2026-07-10T09:00:00Z",
    bidCloseAt: "2026-08-10T18:00:00Z",
    experienceAt: "2026-09-01T12:00:00Z",
    bidders: 534,
    totalBids: 2140,
    topBid: 18200,
    leaderboard: [
      { user: "@cinephile_88", bid: 18200, at: "2026-08-10T17:58:00Z" },
      { user: "@filmfan_22", bid: 17900, at: "2026-08-10T17:55:00Z" },
      { user: "@prop_hunter", bid: 16450, at: "2026-08-10T16:20:00Z" },
    ],
    notifications: {
      outbid: true,
      closingReminders: [36, 24],
      winnerEmailSubject: "You won: Signed Poster & Props Drop",
      winnerEmailBody:
        "Congratulations! Your bid won the Signed Poster & Props Drop. Please confirm your shipping address.",
    },
    winner: { user: "@cinephile_88", bid: 18200 },
    region: "EU",
  },
  {
    id: "exp-6",
    title: "Fan Screening Takeover (Draft)",
    description:
      "Rent-a-cinema fan screening for the winner and 20 friends — pending venue confirmation before scheduling.",
    image: "",
    geofence: ["GB"],
    status: "draft",
    minBid: 800,
    minIncrement: 50,
    winners: 1,
    bidOpenAt: "2027-01-05T09:00:00Z",
    bidCloseAt: "2027-02-05T18:00:00Z",
    experienceAt: "2027-03-20T18:00:00Z",
    bidders: 0,
    totalBids: 0,
    leaderboard: [],
    notifications: {
      outbid: true,
      closingReminders: [36, 24],
      winnerEmailSubject: "You won: Fan Screening Takeover",
      winnerEmailBody:
        "Congratulations! Your bid won the Fan Screening Takeover. We'll coordinate the venue and guest list with you.",
    },
    region: "EU",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Unlock Content — configured in Content Management; tracked & linked here.
// Rows reference real MOCK_VIDEOS ids so the linkage is honest even in mock form.
// ─────────────────────────────────────────────────────────────────────────────

export type UnlockStatus = "live" | "scheduled" | "off";

export interface UnlockContentRow {
  contentId: string; // MOCK_VIDEOS id — row links to /content/details/{id}
  title: string;
  unlockCost: number; // pts
  status: UnlockStatus;
  unlocks: number;
  pointsSpent: number;
  trend: { direction: "up" | "down" | "flat"; label: string };
  region: MacroRegion;
}

const videoTitle = (id: string) => MOCK_VIDEOS.find((v) => v.id === id)?.title ?? `Video ${id}`;

export const MOCK_UNLOCK_CONTENT: UnlockContentRow[] = [
  {
    contentId: "1",
    title: videoTitle("1"),
    unlockCost: 250,
    status: "live",
    unlocks: 4820,
    pointsSpent: 1205000,
    trend: { direction: "up", label: "+18%" },
    region: "APAC",
  },
  {
    contentId: "2",
    title: videoTitle("2"),
    unlockCost: 150,
    status: "live",
    unlocks: 3140,
    pointsSpent: 471000,
    trend: { direction: "up", label: "+7%" },
    region: "NA",
  },
  {
    contentId: "3",
    title: videoTitle("3"),
    unlockCost: 400,
    status: "live",
    unlocks: 1275,
    pointsSpent: 510000,
    trend: { direction: "flat", label: "0%" },
    region: "EU",
  },
  {
    contentId: "5",
    title: videoTitle("5"),
    unlockCost: 200,
    status: "scheduled",
    unlocks: 0,
    pointsSpent: 0,
    trend: { direction: "flat", label: "—" },
    region: "LATAM",
  },
  {
    contentId: "6",
    title: videoTitle("6"),
    unlockCost: 300,
    status: "off",
    unlocks: 860,
    pointsSpent: 258000,
    trend: { direction: "down", label: "-12%" },
    region: "MEA",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Master analytics — region-scoped by deterministic scaling of the global
// baseline (APAC-heavy mix mirrors the dashboard's regional split).
// ─────────────────────────────────────────────────────────────────────────────

export interface RewardsAnalytics {
  activeRewards: number;
  biddingLive: number;
  unlockLive: number;
  scheduledNextQuarter: number;
  pointsRedeemed: number;
  pointsRedeemedTrend: { direction: "up" | "down" | "flat"; label: string };
  activeBidders: number;
  totalBidsPeriod: number;
  topWinningBid: number;
  avgWinningBid: number;
}

const GLOBAL_REWARDS_ANALYTICS: RewardsAnalytics = {
  activeRewards: 5, // 2 bidding live + 3 unlock live
  biddingLive: 2,
  unlockLive: 3,
  scheduledNextQuarter: 3,
  pointsRedeemed: 2612000,
  pointsRedeemedTrend: { direction: "up", label: "+14%" },
  activeBidders: 680,
  totalBidsPeriod: 2814,
  topWinningBid: 18200,
  avgWinningBid: 14300,
};

// Share of activity per macro-region (mirrors dashboard regional weighting).
const REGION_FACTOR: Record<MacroRegion, number> = {
  APAC: 0.45,
  NA: 0.25,
  EU: 0.15,
  LATAM: 0.1,
  MEA: 0.05,
};

export function rewardsAnalyticsForRegion(region: "global" | MacroRegion): RewardsAnalytics {
  if (region === "global") return GLOBAL_REWARDS_ANALYTICS;
  const f = REGION_FACTOR[region];
  const g = GLOBAL_REWARDS_ANALYTICS;
  const liveExperiences = MOCK_EXPERIENCES.filter(
    (e) => e.status === "live" && e.region === region,
  ).length;
  const liveUnlocks = MOCK_UNLOCK_CONTENT.filter(
    (u) => u.status === "live" && u.region === region,
  ).length;
  return {
    activeRewards: liveExperiences + liveUnlocks,
    biddingLive: liveExperiences,
    unlockLive: liveUnlocks,
    scheduledNextQuarter: MOCK_EXPERIENCES.filter(
      (e) => e.status === "scheduled" && e.region === region,
    ).length,
    pointsRedeemed: Math.round(g.pointsRedeemed * f),
    pointsRedeemedTrend: g.pointsRedeemedTrend,
    activeBidders: Math.round(g.activeBidders * f),
    totalBidsPeriod: Math.round(g.totalBidsPeriod * f),
    // winning-bid stats aren't volume metrics — vary mildly by market depth
    topWinningBid: Math.round((g.topWinningBid * (0.7 + f)) / 100) * 100,
    avgWinningBid: Math.round((g.avgWinningBid * (0.7 + f)) / 100) * 100,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Small shared helpers
// ─────────────────────────────────────────────────────────────────────────────

/** "GB" → "🇬🇧" via regional indicator symbols. */
export function flagEmoji(iso: string): string {
  return iso
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

export function formatPoints(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString();
}
