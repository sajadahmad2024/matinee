/*
 * UI demo build only: the content library behind the content screens, the quest video picker and
 * View details. Titles link to the taxonomy in `admin-content-library-api.ts`.
 */
import type {
  ContentHistoryEntryDto,
  ContentResponseDto,
  LicenseResponseDto,
  SponsorshipResponseDto,
} from "@/app/_libs/api/generated";

import { genres, people, studios, tags } from "../admin-content-library-api";
import { daysFromNow, hoursAgo, slugify } from "./core";
import { DEMO_CREATIVE_PREFIX } from "./media-store";

export type DemoRegion = "NA" | "EU" | "APAC" | "LATAM" | "MEA";
export const ALL_DEMO_REGIONS: DemoRegion[] = ["NA", "EU", "APAC", "LATAM", "MEA"];

interface Seed {
  id: string;
  title: string;
  type: "trailer" | "bts" | "clip";
  status: string;
  studio: string;
  genres: string[];
  tags: string[];
  cast: string[];
  views: number;
  durationSeconds: number;
  /** Days ago it was created. */
  created: number;
  regions?: DemoRegion[];
  parent?: string;
  boosted?: boolean;
  exclusive?: boolean;
  scheduledIn?: number;
  rejectionReason?: string;
  license?: {
    licensor: string;
    expiresIn: number;
    costCents: number;
    revenueCents: number;
    type?: "exclusive" | "non_exclusive";
    renewal?: string;
  };
  sponsor?: { name: string; placement: "pre-roll" | "mid-roll" | "post-roll" | "overlay"; revenueCents: number };
}

const SEEDS: Seed[] = [
  { id: "c1", title: "Avengers: Endgame — Official Trailer", type: "trailer", status: "published", studio: "st1", genres: ["g1", "g5"], tags: ["t1", "t5"], cast: ["pp1", "pp6"], views: 182_400, durationSeconds: 150, created: 60, boosted: true, license: { licensor: "Disney Media Distribution", expiresIn: 24, costCents: 1_200_000, revenueCents: 2_150_000, renewal: "in_negotiation" }, sponsor: { name: "Nike", placement: "pre-roll", revenueCents: 480_000 } },
  { id: "c2", title: "The Batman — Official Trailer", type: "trailer", status: "published", studio: "st3", genres: ["g1", "g4"], tags: ["t1", "t5"], cast: ["pp6"], views: 140_200, durationSeconds: 165, created: 52, license: { licensor: "Warner Bros. Distribution", expiresIn: 140, costCents: 900_000, revenueCents: 1_310_000, type: "non_exclusive", renewal: "auto_renew" } },
  { id: "c3", title: "Dune: Part Two — Trailer 3", type: "trailer", status: "published", studio: "st3", genres: ["g5", "g2"], tags: ["t2", "t6"], cast: ["pp5", "pp6"], views: 121_900, durationSeconds: 195, created: 45, sponsor: { name: "Samsung", placement: "mid-roll", revenueCents: 260_000 } },
  { id: "c4", title: "Oppenheimer — Final Trailer", type: "trailer", status: "published", studio: "st3", genres: ["g2", "g4"], tags: ["t2"], cast: ["pp3", "pp1"], views: 98_300, durationSeconds: 175, created: 40, license: { licensor: "Universal Pictures", expiresIn: 12, costCents: 650_000, revenueCents: 540_000, renewal: "expiring" } },
  { id: "c5", title: "Barbie — Teaser", type: "trailer", status: "published", studio: "st3", genres: ["g3"], tags: ["t1"], cast: ["pp8"], views: 87_650, durationSeconds: 140, created: 34 },
  { id: "c6", title: "Stree 2 — Official Trailer", type: "trailer", status: "published", studio: "st4", genres: ["g3", "g4"], tags: ["t4"], cast: ["pp2"], views: 76_120, durationSeconds: 160, created: 28, regions: ["APAC", "MEA"], boosted: true },
  { id: "c7", title: "Kalki 2898 AD — Glimpse", type: "clip", status: "published", studio: "st2", genres: ["g1", "g5"], tags: ["t4", "t1"], cast: ["pp2"], views: 69_480, durationSeconds: 130, created: 21, regions: ["APAC", "MEA", "EU"], exclusive: true },
  { id: "c8", title: "Laapataa Ladies — Trailer", type: "trailer", status: "published", studio: "st2", genres: ["g2", "g3"], tags: ["t4", "t2"], cast: ["pp7"], views: 51_230, durationSeconds: 145, created: 16, regions: ["APAC"] },
  { id: "c9", title: "Making of Endgame — Behind the Scenes", type: "bts", status: "published", studio: "st1", genres: ["g7"], tags: ["t3"], cast: ["pp1"], views: 22_410, durationSeconds: 420, created: 14, parent: "c1" },
  { id: "c10", title: "Pathaan 2 — First Look", type: "clip", status: "scheduled", studio: "st2", genres: ["g1"], tags: ["t4", "t6"], cast: ["pp4", "pp2"], views: 0, durationSeconds: 95, created: 6, scheduledIn: 3, regions: ["APAC", "MEA"] },
  { id: "c11", title: "Squid Game 3 — Teaser", type: "trailer", status: "pending_approval", studio: "st5", genres: ["g4", "g2"], tags: ["t6"], cast: [], views: 0, durationSeconds: 110, created: 3 },
  { id: "c12", title: "Dune: Building Arrakis — BTS", type: "bts", status: "draft", studio: "st3", genres: ["g7"], tags: ["t3"], cast: ["pp5"], views: 0, durationSeconds: 360, created: 2, parent: "c3" },
  { id: "c13", title: "Jawan — Extended Clip", type: "clip", status: "rejected", studio: "st4", genres: ["g1"], tags: ["t4"], cast: ["pp4"], views: 0, durationSeconds: 240, created: 9, rejectionReason: "Audio is out of sync after 1:20 — please re-export and resubmit." },
  { id: "c14", title: "Spring Festival Highlights", type: "clip", status: "archived", studio: "st6", genres: ["g7"], tags: ["t7"], cast: [], views: 8_240, durationSeconds: 300, created: 120 },
];

const byId = <T extends { id: string }>(rows: T[], id: string) => rows.find((r) => r.id === id);

export const licenses = new Map<string, LicenseResponseDto>();
export const sponsorships = new Map<string, SponsorshipResponseDto>();
export const regionsOf = new Map<string, { regions: DemoRegion[]; off: DemoRegion[] }>();
export const historyOf = new Map<string, ContentHistoryEntryDto[]>();

const admin = { id: "demo-admin", name: "John Doe" };

type CastRole = NonNullable<ContentResponseDto["cast"]>[number]["role"];
type PublishRegion = NonNullable<ContentResponseDto["publishRegions"]>[number]["region"];

function toContent(s: Seed): ContentResponseDto {
  const studio = byId(studios, s.studio);
  const published = s.status === "published" || s.status === "archived";
  return {
    id: s.id,
    title: s.title,
    slug: slugify(s.title),
    description: `${s.title} — streaming now on the platform.`,
    contentType: s.type as ContentResponseDto["contentType"],
    accessTier: (s.exclusive ? "exclusive" : "free") as ContentResponseDto["accessTier"],
    unlockPoints: s.exclusive ? 200 : null,
    studioId: studio?.id ?? null,
    studioName: studio?.name ?? null,
    videoMediaId: `${DEMO_CREATIVE_PREFIX}${s.id}`,
    thumbnailMediaId: null,
    thumbnailUrl: null,
    durationSeconds: s.durationSeconds,
    durationSource: "media" as ContentResponseDto["durationSource"],
    language: "en",
    status: s.status,
    isBoosted: !!s.boosted,
    isBoostActive: !!s.boosted,
    boostPriority: s.boosted ? 1 : 0,
    boostChannels: s.boosted ? (["homepage", "notifications"] as ContentResponseDto["boostChannels"]) : [],
    rightsRegion: "global",
    parentContentId: s.parent ?? null,
    availableUntil: null,
    watchLinks: [],
    viewCount: s.views,
    likeCount: Math.round(s.views * 0.08),
    dislikeCount: Math.round(s.views * 0.004),
    commentCount: Math.round(s.views * 0.01),
    shareCount: Math.round(s.views * 0.02),
    completionRate: published ? 0.62 : 0,
    viewsTrend: (s.views > 90_000 ? "up" : "flat") as ContentResponseDto["viewsTrend"],
    recommendation: "normal",
    isSponsored: !!s.sponsor,
    sponsorName: s.sponsor?.name ?? null,
    adPlacement: (s.sponsor?.placement ?? null) as ContentResponseDto["adPlacement"],
    licenseStatus: s.license ? (s.license.expiresIn <= 30 ? "expiring" : "licensed") : "original",
    licenseExpiresAt: s.license ? daysFromNow(s.license.expiresIn) : null,
    licensorName: s.license?.licensor ?? null,
    scheduledAt: s.scheduledIn !== undefined ? daysFromNow(s.scheduledIn) : null,
    publishedAt: published ? daysFromNow(-s.created + 1) : null,
    rejectionReason: s.rejectionReason ?? null,
    genres: s.genres.map((id, i) => {
      const g = byId(genres, id);
      return { id, name: g?.name ?? id, slug: g?.slug ?? id, isPrimary: i === 0 };
    }),
    tags: s.tags.map((id) => {
      const t = byId(tags, id);
      return { id, name: t?.name ?? id, slug: t?.slug ?? id };
    }),
    cast: s.cast.map((id, i) => {
      const p = byId(people, id);
      return {
        personId: id,
        name: p?.name ?? id,
        slug: p?.slug ?? id,
        photoMediaId: null,
        role: (p?.knownFor ?? "actor") as CastRole,
        characterName: null,
        billingOrder: i + 1,
      };
    }),
    publishRegions: (s.regions ?? ALL_DEMO_REGIONS).map((region) => ({
      region: region as PublishRegion,
      live: published,
    })),
    linkedGamesCount: ["c1", "c2", "c3"].includes(s.id) ? 1 : 0,
    unresolvedFlags: 0,
    createdBy: admin,
    updatedBy: admin,
    createdAt: daysFromNow(-s.created),
    updatedAt: daysFromNow(-Math.max(0, s.created - 2)),
  };
}

export const demoContents: ContentResponseDto[] = SEEDS.map(toContent);

const historyRow = (contentId: string, n: number, action: string, at: string): ContentHistoryEntryDto => ({
  id: `${contentId}-h${n}`,
  contentId,
  changedBy: admin.id,
  changedByName: admin.name,
  changedByRole: "Super Admin",
  action: action as ContentHistoryEntryDto["action"],
  changes: {},
  note: null,
  createdAt: at,
});

for (const s of SEEDS) {
  regionsOf.set(s.id, { regions: s.regions ?? [...ALL_DEMO_REGIONS], off: [] });
  historyOf.set(s.id, [
    historyRow(s.id, 1, "created", daysFromNow(-s.created)),
    ...(s.status === "published" ? [historyRow(s.id, 2, "published", daysFromNow(-s.created + 1))] : []),
  ]);
  if (s.license) {
    licenses.set(s.id, {
      id: `lic-${s.id}`,
      contentId: s.id,
      licensorName: s.license.licensor,
      licenseType: (s.license.type ?? "exclusive") as LicenseResponseDto["licenseType"],
      startsAt: daysFromNow(-s.created - 30),
      expiresAt: daysFromNow(s.license.expiresIn),
      renewalStatus: (s.license.renewal ?? "renewing") as LicenseResponseDto["renewalStatus"],
      licenseCostCents: s.license.costCents,
      currency: "USD",
      revenueGeneratedCents: s.license.revenueCents,
      revenueSource: "ads",
      terms: "Worldwide streaming rights; no download.",
      isActive: true,
      createdBy: admin.id,
      createdAt: daysFromNow(-s.created),
      updatedAt: daysFromNow(-s.created),
    });
  }
  if (s.sponsor) {
    sponsorships.set(s.id, {
      id: `sp-${s.id}`,
      contentId: s.id,
      sponsorName: s.sponsor.name,
      bannerMediaId: null,
      bannerUrl: null,
      adDurationSeconds: 15,
      placement: s.sponsor.placement as SponsorshipResponseDto["placement"],
      revenueCents: s.sponsor.revenueCents,
      currency: "USD",
      startsAt: daysFromNow(-s.created),
      endsAt: daysFromNow(30),
      isActive: true,
      createdBy: admin.id,
      createdAt: daysFromNow(-s.created),
      updatedAt: daysFromNow(-s.created),
      adFormat: "sponsored" as SponsorshipResponseDto["adFormat"],
      feedFrequency: null,
      skippableAfterSeconds: 5,
      creativeMediaId: null,
      clickUrl: null,
      ctaLabel: null,
      midRollAtSeconds: s.sponsor.placement === "mid-roll" ? 60 : null,
      overlayStartSeconds: null,
      overlayDurationSeconds: null,
      cpmCents: null,
      cpcCents: null,
    });
  }
}

export const findContent = (id: string) => demoContents.find((c) => c.id === id);

/** A history row for a workflow write. */
export function logHistory(contentId: string, action: string) {
  const rows = historyOf.get(contentId) ?? [];
  rows.push(historyRow(contentId, rows.length + 1, action, hoursAgo(0)));
  historyOf.set(contentId, rows);
}
