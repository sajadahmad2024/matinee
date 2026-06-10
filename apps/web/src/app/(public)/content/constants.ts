import { Archive, Calendar, FileText, Film, Inbox, Rocket, XCircle } from "lucide-react";

import type { ContentStatus } from "./_components/status-badge";

export interface WorkflowEvent {
  date: string;
  label: string;
  by?: string;
  note?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  studioName: string;
  duration: string;
  status: ContentStatus;
  linkedGames: number;
  views: number;
  likes: number;
  isLive?: boolean;
  isFeatured?: boolean;
  scheduledAt?: string;
  // licensing
  licenseStatus?: "licensed" | "original" | "expiring" | "expired";
  licenseExpiresInDays?: number;
  licensorName?: string;
  licenseTerms?: string;
  // performance health
  viewsTrend?: "up" | "flat" | "down";
  completionRate?: number; // %
  revenuePer1k?: number; // $ per 1K impressions
  // operational
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  unresolvedFlags?: number;
  recommendation?: "promoted" | "normal" | "deprioritized";
  // metadata
  genres?: string[];
  language?: string;
  region?: string;
  uploadDate?: string;
  // ad sales / sponsorship
  sponsored?: boolean;
  sponsor?: string;
  adDurationSecs?: number;
  // workflow history (newest first)
  workflow?: WorkflowEvent[];
}

export const MOCK_VIDEOS: VideoItem[] = [
  {
    id: "1",
    title: "K-Drama Romance: Episode 1",
    thumbnail: "",
    studioName: "Seoul Studios",
    duration: "42:15",
    status: "published",
    linkedGames: 3,
    views: 124500,
    likes: 8920,
    isLive: true,
    licenseStatus: "expiring",
    licenseExpiresInDays: 45,
    licensorName: "Seoul Studios",
    licenseTerms: "12 months · $2,000 · exclusive",
    viewsTrend: "up",
    completionRate: 68,
    revenuePer1k: 2.4,
    lastModifiedBy: "Sarah K.",
    lastModifiedAt: "May 12",
    unresolvedFlags: 0,
    recommendation: "promoted",
    genres: ["Romance", "Drama"],
    language: "Korean",
    region: "KR",
    uploadDate: "2026-05-05",
    workflow: [
      { date: "May 12", label: "Published", by: "Sarah K." },
      { date: "May 10", label: "Scheduled for May 12 launch", by: "Tom R." },
      { date: "May 9", label: "Approved from drafts", by: "Tom R." },
      { date: "May 8", label: "Metadata enrichment completed (AI auto-tags applied)" },
      { date: "May 7", label: "Moved to drafts", by: "Sarah K." },
      {
        date: "May 5",
        label: "Submitted",
        by: "Seoul Studios",
        note: "License: 12 months, $2,000, exclusive · Source: Direct submission via partner portal",
      },
    ],
  },
  {
    id: "2",
    title: "Action Thrill: The Chase",
    thumbnail: "",
    studioName: "Thunder Productions",
    duration: "1:35:20",
    status: "published",
    linkedGames: 2,
    views: 89200,
    likes: 6540,
    isFeatured: true,
    licenseStatus: "licensed",
    licenseExpiresInDays: 120,
    licensorName: "Global Rights Co",
    licenseTerms: "24 months · $5,000 · non-exclusive",
    viewsTrend: "flat",
    completionRate: 54,
    revenuePer1k: 3.1,
    lastModifiedBy: "Tom R.",
    lastModifiedAt: "May 9",
    unresolvedFlags: 2,
    recommendation: "normal",
    genres: ["Action", "Thriller"],
    language: "English",
    region: "US",
    uploadDate: "2026-04-28",
    sponsored: true,
    sponsor: "Nike",
    adDurationSecs: 15,
  },
  {
    id: "3",
    title: "The Sword Master",
    thumbnail: "",
    studioName: "Wuxia Films",
    duration: "2:05:40",
    status: "published",
    linkedGames: 4,
    views: 156800,
    likes: 12400,
    isLive: true,
    licenseStatus: "original",
    viewsTrend: "up",
    completionRate: 72,
    revenuePer1k: 1.9,
    lastModifiedBy: "Mia L.",
    lastModifiedAt: "May 11",
    recommendation: "promoted",
    genres: ["Action", "Wuxia"],
    language: "Mandarin",
    region: "CN",
    uploadDate: "2026-05-02",
  },
  {
    id: "4",
    title: "Mystery Night: The Beginning",
    thumbnail: "",
    studioName: "Dark Moon Studios",
    duration: "48:30",
    status: "draft",
    linkedGames: 0,
    views: 0,
    likes: 0,
    licenseStatus: "licensed",
    licenseExpiresInDays: 200,
    licensorName: "Dark Moon Studios",
    genres: ["Mystery"],
    language: "English",
    lastModifiedBy: "Sarah K.",
    lastModifiedAt: "May 13",
  },
  {
    id: "5",
    title: "Cooking Battle: Season 2 Finale",
    thumbnail: "",
    studioName: "Food Network Asia",
    duration: "55:00",
    status: "scheduled",
    linkedGames: 2,
    views: 0,
    likes: 0,
    scheduledAt: "2026-01-25 20:00 UTC",
    licenseStatus: "licensed",
    licenseExpiresInDays: 90,
    licensorName: "Food Network Asia",
    genres: ["Reality", "Food"],
    language: "English",
    region: "SG",
  },
  {
    id: "6",
    title: "Travel Adventures: Japan",
    thumbnail: "",
    studioName: "Wanderlust Media",
    duration: "38:45",
    status: "boosted",
    linkedGames: 1,
    views: 245000,
    likes: 18900,
    licenseStatus: "expiring",
    licenseExpiresInDays: 20,
    licensorName: "Wanderlust Media",
    licenseTerms: "6 months · $1,200 · non-exclusive",
    viewsTrend: "down",
    completionRate: 41,
    revenuePer1k: 4.0,
    unresolvedFlags: 1,
    recommendation: "deprioritized",
    genres: ["Travel", "Documentary"],
    language: "English",
    region: "JP",
    uploadDate: "2026-04-15",
    sponsored: true,
    sponsor: "Japan Tourism Board",
    adDurationSecs: 20,
  },
  {
    id: "7",
    title: "Retro Classics: 90s Hits",
    thumbnail: "",
    studioName: "Vintage Vault",
    duration: "1:12:00",
    status: "archived",
    linkedGames: 0,
    views: 320000,
    likes: 21000,
    licenseStatus: "expired",
    licenseExpiresInDays: -10,
    licensorName: "Vintage Vault",
    viewsTrend: "down",
    completionRate: 60,
    genres: ["Music"],
    language: "English",
    uploadDate: "2025-11-01",
    workflow: [
      { date: "Apr 2", label: "Archived (license expired)", by: "System" },
      { date: "Nov 1 '25", label: "Published", by: "Mark T." },
    ],
  },
];

export const PENDING_VIDEOS: VideoItem[] = [
  {
    id: "p1",
    title: "New Drama Upload",
    thumbnail: "",
    studioName: "Admin User",
    duration: "45:00",
    status: "pending",
    linkedGames: 0,
    views: 0,
    likes: 0,
    licenseStatus: "licensed",
    licenseExpiresInDays: 365,
    licensorName: "Partner Studio",
    genres: ["Drama"],
    workflow: [{ date: "Today", label: "Submitted via partner portal", by: "Partner Studio" }],
  },
];

export const REJECTED_VIDEOS: VideoItem[] = [
  {
    id: "r1",
    title: "Rejected Content Sample",
    thumbnail: "",
    studioName: "Studio X",
    duration: "30:00",
    status: "rejected",
    linkedGames: 0,
    views: 0,
    likes: 0,
    unresolvedFlags: 3,
    genres: ["Other"],
  },
];

export type TabValue =
  | "requests"
  | "drafts"
  | "scheduled"
  | "boosted"
  | "all"
  | "rejected"
  | "archived";

export const CONTENT_TABS_CONFIG: { value: TabValue; label: string; icon: any; count?: number }[] = [
  { value: "requests", label: "Requests", icon: Inbox, count: 1 },
  { value: "drafts", label: "Drafts", icon: FileText, count: 2 },
  { value: "scheduled", label: "Scheduled", icon: Calendar, count: 1 },
  { value: "boosted", label: "Priority", icon: Rocket, count: 1 },
  { value: "all", label: "Live Videos", icon: Film },
  { value: "rejected", label: "Rejected", icon: XCircle, count: 1 },
  { value: "archived", label: "Archive", icon: Archive, count: 1 },
];

export const CONTENT_FUNNEL_DATA = [
  { stage: "Impressions", value: 100000 },
  { stage: "3s View", value: 72000 },
  { stage: "50% Watch", value: 45000 },
  { stage: "Game Start", value: 28000 },
  { stage: "Game Complete", value: 18000 },
  { stage: "Shared", value: 8500 },
];

export const SHARE_VELOCITY_DATA = [
  { time: "12am", shares: 120 },
  { time: "4am", shares: 85 },
  { time: "8am", shares: 210 },
  { time: "12pm", shares: 380 },
  { time: "4pm", shares: 520 },
  { time: "8pm", shares: 450 },
  { time: "Now", shares: 320 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Operational dashboard (command-centre tiles) — mock; wired to API later
// ─────────────────────────────────────────────────────────────────────────────

// A. Content Inventory — state of the library
export const CONTENT_INVENTORY = {
  activeLibrary: 1847,
  addedThisMonth: 47,
  pctUnder30Days: 31, // % of library uploaded in the last 30 days
  uploadTarget: 60,
  daysRemainingInMonth: 11,
  pipeline: { draft: 12, inReview: 8, scheduled: 5 },
  avgTimeToPublishDays: 3.2,
  freshnessPct: 44, // % of views going to <30-day content
  freshnessHealthyAbove: 40, // healthy when freshnessPct > this
};

// B. Licensing & Rights — summary tiles
export const LICENSING_SUMMARY = {
  licensed: 1200,
  original: 647,
  monthlyCost: 84200, // $ this month
  monthlyCostTrendPct: 6.4, // vs last month (+ = up)
  costPerStream: 0.0042, // $ per view on licensed content
  costPerStreamTrendPct: -3.1,
  expiring30: 7,
  expiring60: 14,
  expiring90: 23,
};

export type RenewalStatus = "renewing" | "in_negotiation" | "expiring" | "lapsed" | "auto_renew";

export interface LicenseRow {
  contentTitle: string;
  licensor: string;
  expires: string; // display date
  daysLeft: number;
  renewalStatus: RenewalStatus;
  revenueGenerated: number; // $
  revenueSource: string; // e.g. "Ads + Subs"
  licenseCost: number; // $
  // roi derived = revenueGenerated / licenseCost
}

export const LICENSE_ROWS: LicenseRow[] = [
  { contentTitle: "Neon Nights — Official Trailer", licensor: "Global Rights Co", expires: "Jun 28, 2026", daysLeft: 23, renewalStatus: "in_negotiation", revenueGenerated: 18400, revenueSource: "Ads + Subs", licenseCost: 6000 },
  { contentTitle: "K-Drama Spotlight: Seoul Stories", licensor: "Seoul Studios", expires: "Jul 15, 2026", daysLeft: 40, renewalStatus: "renewing", revenueGenerated: 31200, revenueSource: "Ads", licenseCost: 12000 },
  { contentTitle: "Marvel BTS — Set Secrets", licensor: "Global Rights Co", expires: "Jun 18, 2026", daysLeft: 13, renewalStatus: "expiring", revenueGenerated: 9400, revenueSource: "Subs", licenseCost: 8000 },
  { contentTitle: "Indie Gems Vol. 4", licensor: "ArtHouse Dist.", expires: "Sep 02, 2026", daysLeft: 89, renewalStatus: "auto_renew", revenueGenerated: 7600, revenueSource: "Ads", licenseCost: 2500 },
  { contentTitle: "Awards Night — Red Carpet", licensor: "Premiere Media", expires: "Jun 10, 2026", daysLeft: 5, renewalStatus: "expiring", revenueGenerated: 22800, revenueSource: "Ads + Sponsor", licenseCost: 9000 },
  { contentTitle: "Classic Noir Restored", licensor: "Heritage Films", expires: "May 30, 2026", daysLeft: -6, renewalStatus: "lapsed", revenueGenerated: 4200, revenueSource: "Subs", licenseCost: 5000 },
];

// C. Content Performance — tiles with trend + sparkline
export const PERFORMANCE_SUMMARY = {
  avgWatchTime: "18:42",
  avgWatchTimeTrendPct: 4.2,
  avgWatchByRegion: [
    { region: "NA", value: "20:10" },
    { region: "EU", value: "17:55" },
    { region: "APAC", value: "16:30" },
  ],
  gameConversionPct: 38.9, // viewer → player
  gameConversionTrendPct: 2.4,
  gameConversionSpark: [31, 33, 32, 35, 36, 37, 38.9],
  hitRatePct: 62, // % of this-month uploads that crossed the threshold
  hitRateThreshold: ">10K views in 30 days",
  hitRateSpark: [48, 51, 55, 53, 58, 60, 62],
  avgEngagementRatePct: 7.8, // (likes+comments+shares+saves)/views
  avgEngagementTrendPct: 0.6,
  avgEngagementSpark: [6.9, 7.1, 7.0, 7.3, 7.5, 7.6, 7.8],
  activeConcurrentViewers: 3421, // real-time in prod
};
