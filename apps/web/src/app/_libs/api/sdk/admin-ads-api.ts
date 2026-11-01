/*
 * UI demo build only: mock of the generated `AdminAdSalesApi` — same method names, request shapes
 * and `{ data }` envelopes, answered in memory with the backend's rank and status rules and error
 * messages (`apps/backend/src/ads/ad-sales.service.ts`). No request is ever sent.
 */
import {
  AD_RANK_MAX,
  campaignRegions,
  isMacroRegion,
} from "@/app/(public)/ads/_libs/ad-config";
import {
  type AdCampaignDetailDto,
  type AdCampaignDto,
  AdCampaignDtoPricingModelEnum as AdPricingModelEnum,
  AdCampaignDtoStatusEnum as AdCampaignStatusEnum,
  AdCampaignDtoTypeEnum as AdCampaignTypeEnum,
  type AdCampaignPerformanceDto,
  type AdminAdSalesControllerCampaignPerformanceV1Request,
  type AdminAdSalesControllerListCampaignsV1Request,
  type AdminAdSalesControllerRankBoardV1Request,
  type AdminAdSalesControllerSummaryV1Request,
  type AdSalesCommercialRowDto,
  type AdSalesSummaryDto,
  type CreateAdCampaignDto,
  type DeliveryDto,
  type RankBoardDto,
  type RankBookingDto,
  type RegionRanksDto,
  type SwapRanksDto,
  type UpdateAdCampaignDto,
} from "@/app/_libs/api/generated";
import { MACRO_REGIONS, type MacroRegion } from "@/app/_libs/regions";

import { badRequest, conflict, notFound as notFoundOf, ok, paginate } from "./_demo/core";
import { DEMO_CREATIVE_PREFIX } from "./_demo/media-store";

type AdCampaignStatus = AdCampaignDto["status"];

const DAY_MS = 86_400_000;
const ratio = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * 10_000) / 10_000 : 0;
const notFound = () => notFoundOf("Campaign");

/** Midnight UTC `days` from today (negative = past); `endOfDay` gives 23:59. */
const dayFromNow = (days: number, endOfDay = false) => {
  const d = new Date();
  d.setUTCHours(endOfDay ? 23 : 0, endOfDay ? 59 : 0, 0, 0);
  return new Date(d.getTime() + days * DAY_MS).toISOString();
};

// ─── Seed ────────────────────────────────────────────────────────────────────

const NO_DELIVERY: DeliveryDto = {
  impressions: 0,
  uniqueViewers: 0,
  clicks: 0,
  skips: 0,
  completes: 0,
  deliveredCents: 0,
  ctr: 0,
  completionRate: 0,
};

/** Delivery counters from an impression count and the two rates (0..1). */
const delivery = (impressions: number, ctr: number, completionRate: number): DeliveryDto => {
  const clicks = Math.round(impressions * ctr);
  const completes = Math.round(impressions * completionRate);
  return {
    impressions,
    uniqueViewers: Math.round(impressions / 1.4),
    clicks,
    skips: Math.round((impressions - completes) * 0.6),
    completes,
    deliveredCents: 0,
    ctr: ratio(clicks, impressions),
    completionRate: ratio(completes, impressions),
  };
};

interface SeedInput {
  id: string;
  name: string;
  advertiserName: string;
  caption: string;
  durationSeconds: number;
  ctaLabel: string;
  clickUrl: string;
  regions: MacroRegion[];
  ranks: RegionRanksDto;
  /** Flight in days from today. */
  starts: number;
  ends: number;
  status: AdCampaignStatus;
  delivery?: DeliveryDto;
}

const seed = (s: SeedInput): AdCampaignDto => ({
  id: s.id,
  advertiserId: `adv-${s.advertiserName.toLowerCase().replace(/\W+/g, "-")}`,
  advertiserName: s.advertiserName,
  name: s.name,
  type: AdCampaignTypeEnum.Commercial,
  status: s.status,
  startsAt: dayFromNow(s.starts),
  endsAt: dayFromNow(s.ends, true),
  regions: s.regions,
  ranks: s.status === AdCampaignStatusEnum.Ended ? {} : s.ranks,
  caption: s.caption,
  creativeMediaId: `${DEMO_CREATIVE_PREFIX}${s.id}`,
  clickUrl: s.clickUrl,
  ctaLabel: s.ctaLabel,
  durationSeconds: s.durationSeconds,
  skippableAfterSeconds: 5,
  frequencyCapPerUserDay: null,
  pricingModel: AdPricingModelEnum.Flat,
  flatFeeCents: 0,
  cpmCents: 0,
  cpcCents: 0,
  budgetCents: null,
  dailyBudgetCents: null,
  impressionGoal: null,
  currency: "USD",
  endedReason: s.status === AdCampaignStatusEnum.Ended ? "ends_at" : null,
  notes: null,
  linkedContents: 0,
  delivery: s.delivery ?? NO_DELIVERY,
  budgetUsed: null,
  createdAt: dayFromNow(s.starts - 7),
  updatedAt: dayFromNow(s.starts - 7),
});

let campaigns: AdCampaignDto[] = [
  seed({
    id: "ad-001",
    name: "Air Max Day — Run Free",
    advertiserName: "Nike",
    caption: "Air Max Day is here. Lighter, faster, made to run free. 🏃",
    durationSeconds: 15,
    ctaLabel: "Shop now",
    clickUrl: "https://nike.com/airmax",
    regions: ["NA", "EU"],
    ranks: { NA: 1, EU: 1 },
    starts: -20,
    ends: 10,
    status: AdCampaignStatusEnum.Active,
    delivery: delivery(1_184_320, 0.014, 0.38),
  }),
  seed({
    id: "ad-002",
    name: "Coke Summer Refresh",
    advertiserName: "Coca-Cola",
    caption: "Summer tastes better ice-cold. Grab a Coke and refresh your day.",
    durationSeconds: 20,
    ctaLabel: "Learn more",
    clickUrl: "https://coca-cola.com/summer",
    regions: ["NA"],
    ranks: { NA: 2 },
    starts: -14,
    ends: 8,
    status: AdCampaignStatusEnum.Active,
    delivery: delivery(1_020_400, 0.009, 0.54),
  }),
  seed({
    id: "ad-003",
    name: "Galaxy Fold — Unfold More",
    advertiserName: "Samsung",
    caption: "Unfold more. The new Galaxy Fold, built for how you watch.",
    durationSeconds: 30,
    ctaLabel: "Shop now",
    clickUrl: "https://samsung.com/fold",
    regions: ["APAC"],
    ranks: { APAC: 1 },
    starts: -10,
    ends: 20,
    status: AdCampaignStatusEnum.Active,
    delivery: delivery(640_780, 0.021, 0.47),
  }),
  seed({
    id: "ad-004",
    name: "Stranger Worlds S5 Teaser",
    advertiserName: "Netflix",
    caption: "The Upside Down is calling. Stranger Worlds S5 — streaming soon.",
    durationSeconds: 25,
    ctaLabel: "Watch now",
    clickUrl: "https://netflix.com/strangerworlds",
    regions: [],
    ranks: { NA: 3, EU: 2, APAC: 2, LATAM: 1, MEA: 1 },
    starts: -6,
    ends: 9,
    status: AdCampaignStatusEnum.Active,
    delivery: delivery(890_150, 0.032, 0.66),
  }),
  seed({
    id: "ad-005",
    name: "Wrapped Early Access",
    advertiserName: "Spotify",
    caption: "Your year in music, early. Get Wrapped before anyone else.",
    durationSeconds: 12,
    ctaLabel: "Install",
    clickUrl: "https://spotify.com/wrapped",
    regions: ["EU", "LATAM"],
    ranks: { EU: 3, LATAM: 2 },
    starts: 5,
    ends: 33,
    status: AdCampaignStatusEnum.Scheduled,
  }),
  seed({
    id: "ad-006",
    name: "Wings Energy Drop",
    advertiserName: "Red Bull",
    caption: "New flavour, same wings. Try the Wings Energy Drop today.",
    durationSeconds: 15,
    ctaLabel: "Learn more",
    clickUrl: "https://redbull.com/wings",
    regions: ["NA"],
    ranks: { NA: 4 },
    starts: 3,
    ends: 18,
    status: AdCampaignStatusEnum.Scheduled,
  }),
  seed({
    id: "ad-007",
    name: "Stay Anywhere — Autumn",
    advertiserName: "Airbnb",
    caption: "Cosy cabins, city lofts, lakeside stays. Find your autumn escape.",
    durationSeconds: 22,
    ctaLabel: "Learn more",
    clickUrl: "https://airbnb.com/autumn",
    regions: ["EU"],
    ranks: { EU: 4 },
    starts: -30,
    ends: 12,
    status: AdCampaignStatusEnum.Paused,
    delivery: delivery(312_400, 0.007, 0.42),
  }),
  seed({
    id: "ad-008",
    name: "Back to School Kicks",
    advertiserName: "Nike",
    caption: "Fresh kicks for a fresh term. Shop Back to School now.",
    durationSeconds: 15,
    ctaLabel: "Shop now",
    clickUrl: "https://nike.com/school",
    regions: ["NA", "EU"],
    ranks: { NA: 1, EU: 1 },
    starts: -60,
    ends: -30,
    status: AdCampaignStatusEnum.Ended,
    delivery: delivery(1_812_900, 0.018, 0.51),
  }),
  seed({
    id: "ad-009",
    name: "Holiday Lights Teaser",
    advertiserName: "IKEA",
    caption: "Light up the season. Holiday collection drops soon.",
    durationSeconds: 18,
    ctaLabel: "Learn more",
    clickUrl: "https://ikea.com/holiday",
    regions: ["EU"],
    ranks: { EU: 5 },
    starts: 14,
    ends: 44,
    status: AdCampaignStatusEnum.Draft,
  }),
];

// ─── Rank rules ──────────────────────────────────────────────────────────────

const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) =>
  new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);

/** Bookings that hold a rank: every non-ended commercial with a flight. */
const rankBookings = (
  region: MacroRegion,
  from: string,
  to: string,
  exclude: string[] = [],
): RankBookingDto[] =>
  campaigns
    .filter(
      (c) =>
        !exclude.includes(c.id) &&
        c.status !== AdCampaignStatusEnum.Ended &&
        c.startsAt &&
        c.endsAt &&
        c.ranks?.[region] !== undefined &&
        overlaps(from, to, c.startsAt, c.endsAt),
    )
    .map((c) => ({
      campaignId: c.id,
      campaignName: c.name,
      advertiserName: c.advertiserName ?? "",
      status: c.status,
      rank: c.ranks[region]!,
      startsAt: c.startsAt!,
      endsAt: c.endsAt!,
    }))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

const assertRanksFree = (
  ranks: RegionRanksDto,
  startsAt: string,
  endsAt: string,
  exclude: string[] = [],
) => {
  for (const [region, rank] of Object.entries(ranks)) {
    if (!isMacroRegion(region) || rank === undefined) continue;
    const holder = rankBookings(region, startsAt, endsAt, exclude).find((b) => b.rank === rank);
    if (holder) {
      throw conflict(
        `Rank ${rank} in ${region} is held by ${holder.advertiserName} — ${holder.campaignName} (until ${holder.endsAt.slice(0, 10)}). Pick another rank or change the dates.`,
      );
    }
  }
};

/** One rank per targeted region (backend `resolveRanks`); dropped regions lose their booking. */
const resolveRanks = (
  regions: string[],
  requested: RegionRanksDto | undefined,
  current: RegionRanksDto = {},
) => {
  const map: RegionRanksDto = { ...current, ...requested };
  const wanted = campaignRegions(regions);
  const missing = wanted.filter((r) => map[r] === undefined);
  if (missing.length) {
    throw badRequest(
      `Pick a feed rank (1–${AD_RANK_MAX}) for every targeted region: ${missing.join(", ")}`,
    );
  }
  return Object.fromEntries(wanted.map((r) => [r, map[r]])) as RegionRanksDto;
};

const assertBookable = (c: Partial<AdCampaignDto>) => {
  if (!c.startsAt || !c.endsAt) throw badRequest("A feed ad needs a start and end date");
  if (new Date(c.endsAt).getTime() <= Date.now()) throw badRequest("endsAt is in the past");
  if (!c.creativeMediaId) throw badRequest("A feed ad needs a creative video");
  return { startsAt: c.startsAt, endsAt: c.endsAt };
};

const requireCampaign = (id: string) => {
  const c = campaigns.find((x) => x.id === id);
  if (!c) throw notFound();
  return c;
};

const save = (next: AdCampaignDto) => {
  const updated = { ...next, updatedAt: new Date().toISOString() };
  campaigns = campaigns.map((c) => (c.id === next.id ? updated : c));
  return updated;
};

const startStatus = (startsAt: string | null): AdCampaignStatus =>
  startsAt && new Date(startsAt).getTime() > Date.now()
    ? AdCampaignStatusEnum.Scheduled
    : AdCampaignStatusEnum.Active;

/** Only the fields the backend's `campaignFields` copies from a create/update body. */
const campaignFields = (dto: UpdateAdCampaignDto): Partial<AdCampaignDto> => {
  const { ranks: _ranks, ...rest } = dto;
  return Object.fromEntries(
    Object.entries(rest).filter(([, v]) => v !== undefined),
  ) as Partial<AdCampaignDto>;
};

// ─── Delivery series (performance, platform stats) ───────────────────────────

/** Relative audience size per macro-region. */
const REGION_WEIGHT: Record<MacroRegion, number> = { NA: 0.38, EU: 0.27, APAC: 0.19, LATAM: 0.1, MEA: 0.06 };

const windowDays = (from: string, to: string) =>
  Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / DAY_MS));

/** A day's share of a total: a gentle wave, so charts aren't flat. */
const dayShare = (i: number, days: number) => (0.75 + 0.5 * Math.abs(Math.sin(i * 1.3))) / days;

const scaleDelivery = (d: DeliveryDto, factor: number): DeliveryDto => {
  const scaled = (n: number) => Math.round(n * factor);
  const impressions = scaled(d.impressions);
  const clicks = scaled(d.clicks);
  const completes = scaled(d.completes);
  return {
    impressions,
    uniqueViewers: scaled(d.uniqueViewers),
    clicks,
    skips: scaled(d.skips),
    completes,
    deliveredCents: scaled(d.deliveredCents),
    ctr: ratio(clicks, impressions),
    completionRate: ratio(completes, impressions),
  };
};

const commercialRow = (c: AdCampaignDto): AdSalesCommercialRowDto => ({
  id: c.id,
  name: c.name,
  advertiserName: c.advertiserName ?? "",
  impressions: c.delivery?.impressions ?? 0,
  clicks: c.delivery?.clicks ?? 0,
  ctr: c.delivery?.ctr ?? 0,
  completionRate: c.delivery?.completionRate ?? 0,
});

const NEEDS_REVIEW_RULE = { minImpressions: 100_000, maxCtr: 0.01 };

// ─── SDK ─────────────────────────────────────────────────────────────────────

export const adminAdSalesApi = {
  async adminAdSalesControllerListCampaignsV1(params: AdminAdSalesControllerListCampaignsV1Request) {
    const { page = 1, limit = 20, type, status, region, q, advertiserId } = params ?? {};
    const needle = q?.trim().toLowerCase();
    const inRegion = region && isMacroRegion(region) ? region : undefined;
    const rows = campaigns
      .filter(
        (c) =>
          (!type || c.type === type) &&
          (!advertiserId || c.advertiserId === advertiserId) &&
          (!status?.length || status.includes(c.status)) &&
          (!inRegion || campaignRegions(c.regions).includes(inRegion)) &&
          (!needle ||
            c.name.toLowerCase().includes(needle) ||
            (c.advertiserName ?? "").toLowerCase().includes(needle)),
      )
      .map((c) => (inRegion ? { ...c, rank: c.ranks?.[inRegion] ?? null } : c))
      .sort((a, b) =>
        inRegion
          ? (a.rank ?? Infinity) - (b.rank ?? Infinity) ||
            new Date(a.startsAt ?? 0).getTime() - new Date(b.startsAt ?? 0).getTime()
          : Number(b.status === AdCampaignStatusEnum.Active) -
              Number(a.status === AdCampaignStatusEnum.Active) ||
            new Date(b.startsAt ?? 0).getTime() - new Date(a.startsAt ?? 0).getTime(),
      );
    return ok(paginate(rows, page, limit));
  },

  async adminAdSalesControllerGetCampaignV1({ id }: { id: string }) {
    const c = requireCampaign(id);
    const detail: AdCampaignDetailDto = {
      ...c,
      contents: [],
      ledger: {
        bookedCents: 0,
        accruedCents: 0,
        invoicedCents: 0,
        paidCents: 0,
        creditCents: 0,
        revenueCents: 0,
        balanceCents: 0,
      },
    };
    return ok(detail);
  },

  async adminAdSalesControllerCampaignPerformanceV1(params: AdminAdSalesControllerCampaignPerformanceV1Request) {
    const c = requireCampaign(params.id);
    const lifetime = c.delivery ?? NO_DELIVERY;
    const from = params.from ?? c.startsAt ?? dayFromNow(-30);
    const to = params.to ?? dayFromNow(0, true);
    const days = windowDays(from, to);
    const started = c.startsAt ? new Date(c.startsAt).getTime() : Date.now();
    const daily = Array.from({ length: days }, (_, i) => {
      const day = new Date(new Date(from).getTime() + i * DAY_MS);
      const live = day.getTime() >= started && c.status !== AdCampaignStatusEnum.Draft;
      return { ...scaleDelivery(lifetime, live ? dayShare(i, days) : 0), day: day.toISOString().slice(0, 10) };
    });
    const totals = scaleDelivery(lifetime, daily.reduce((s, d) => s + d.impressions, 0) / Math.max(1, lifetime.impressions));
    const regions = campaignRegions(c.regions);
    const weightSum = regions.reduce((s, r) => s + REGION_WEIGHT[r], 0) || 1;
    const flight =
      c.startsAt && c.endsAt
        ? Math.min(1, Math.max(0, (Date.now() - new Date(c.startsAt).getTime()) / (new Date(c.endsAt).getTime() - new Date(c.startsAt).getTime())))
        : null;
    const performance: AdCampaignPerformanceDto = {
      from,
      to,
      campaignId: c.id,
      status: c.status as AdCampaignPerformanceDto["status"],
      totals,
      lifetime,
      pacing: { budgetCents: null, budgetUsed: null, impressionGoal: null, goalUsed: null, flightElapsed: flight },
      daily,
      frequency: (["1", "2", "3", "4+"] as const).map((seen, i) => {
        const share = [0.52, 0.27, 0.13, 0.08][i] ?? 0;
        return {
          seen: seen as AdCampaignPerformanceDto["frequency"][number]["seen"],
          users: Math.round(lifetime.uniqueViewers * share),
          share,
        };
      }),
      byRegion: regions.map((region) => {
        const share = REGION_WEIGHT[region] / weightSum;
        const impressions = Math.round(totals.impressions * share);
        const clicks = Math.round(totals.clicks * share);
        return { region, impressions, clicks, ctr: ratio(clicks, impressions), share: Math.round(share * 1000) / 1000 };
      }),
    };
    return ok(performance);
  },

  async adminAdSalesControllerSummaryV1(params: AdminAdSalesControllerSummaryV1Request) {
    const from = params?.from ?? dayFromNow(-30);
    const to = params?.to ?? dayFromNow(0, true);
    const region = params?.region && isMacroRegion(params.region) ? params.region : undefined;
    const commercials = campaigns.filter(
      (c) =>
        c.type === AdCampaignTypeEnum.Commercial &&
        (!region || campaignRegions(c.regions).includes(region)),
    );
    const total = (key: keyof DeliveryDto) =>
      commercials.reduce((s, c) => s + (c.delivery?.[key] ?? 0), 0);
    const impressions = total("impressions");
    const clicks = total("clicks");
    const commercial = {
      kind: AdCampaignTypeEnum.Commercial as unknown as AdSalesSummaryDto["delivery"]["commercial"]["kind"],
      impressions,
      uniqueViewers: total("uniqueViewers"),
      clicks,
      completes: total("completes"),
      deliveredCents: total("deliveredCents"),
      ctr: ratio(clicks, impressions),
    };
    const advertisers = new Map<string, { advertiserId: string; name: string; impressions: number; clicks: number }>();
    for (const c of commercials) {
      const row = advertisers.get(c.advertiserId) ?? { advertiserId: c.advertiserId, name: c.advertiserName ?? "", impressions: 0, clicks: 0 };
      row.impressions += c.delivery?.impressions ?? 0;
      row.clicks += c.delivery?.clicks ?? 0;
      advertisers.set(c.advertiserId, row);
    }
    const delivered = commercials.filter((c) => (c.delivery?.impressions ?? 0) > 0);
    const days = windowDays(from, to);
    const summary: AdSalesSummaryDto = {
      from,
      to,
      region: (region ?? null) as AdSalesSummaryDto["region"],
      revenue: { recognizedCents: 0, bookedCents: 0, accruedCents: 0, creditCents: 0, deliveredCents: commercial.deliveredCents, outstandingCents: 0 },
      delivery: {
        impressions,
        clicks,
        ctr: commercial.ctr,
        ecpmCents: 0,
        fillRate: 0,
        commercial,
        sponsorship: { ...commercial, kind: AdCampaignTypeEnum.Sponsorship as unknown as typeof commercial.kind, impressions: 0, uniqueViewers: 0, clicks: 0, completes: 0, deliveredCents: 0, ctr: 0 },
      },
      counts: {
        activeAdvertisers: new Set(commercials.filter((c) => c.status === AdCampaignStatusEnum.Active).map((c) => c.advertiserId)).size,
        activeCommercials: commercials.filter((c) => c.status === AdCampaignStatusEnum.Active).length,
        activeSponsorshipCampaigns: 0,
        liveSponsoredVideos: 0,
      },
      topAdvertisers: [...advertisers.values()]
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 5)
        .map((a) => ({ ...a, ctr: ratio(a.clicks, a.impressions) })),
      daily: Array.from({ length: days }, (_, i) => ({
        day: new Date(new Date(from).getTime() + i * DAY_MS).toISOString().slice(0, 10),
        impressions: Math.round(impressions * dayShare(i, days)),
      })),
      topCommercials: [...delivered].sort((a, b) => (b.delivery?.impressions ?? 0) - (a.delivery?.impressions ?? 0)).slice(0, 5).map(commercialRow),
      needsReview: delivered
        .filter((c) => (c.delivery?.impressions ?? 0) >= NEEDS_REVIEW_RULE.minImpressions && (c.delivery?.ctr ?? 0) < NEEDS_REVIEW_RULE.maxCtr)
        .map(commercialRow),
      needsReviewRule: NEEDS_REVIEW_RULE,
      byRegion: MACRO_REGIONS.filter(({ code }) => !region || code === region).map(({ code }, i) => {
        const regionImpressions = Math.round(impressions * (region ? 1 : REGION_WEIGHT[code]));
        const regionClicks = Math.round(regionImpressions * Math.max(0.001, commercial.ctr + ((i % 3) - 1) * 0.003));
        return { region: code as AdSalesSummaryDto["byRegion"][number]["region"], impressions: regionImpressions, clicks: regionClicks, ctr: ratio(regionClicks, regionImpressions) };
      }),
    };
    return ok(summary);
  },

  async adminAdSalesControllerRankBoardV1(params: AdminAdSalesControllerRankBoardV1Request) {
    const region = params.region as MacroRegion;
    const from = params.from ?? dayFromNow(0);
    const to = params.to ?? dayFromNow(30, true);
    const bookings = rankBookings(region, from, to);
    const ranks = Array.from({ length: AD_RANK_MAX }, (_, i) => ({
      rank: i + 1,
      bookings: bookings.filter((b) => b.rank === i + 1),
    }));
    const board: RankBoardDto = {
      region: region as RankBoardDto["region"],
      from,
      to,
      ranks,
      nextFreeRank: ranks.find((r) => !r.bookings.length)?.rank ?? null,
    };
    return ok(board);
  },

  async adminAdSalesControllerSwapRanksV1({ swapRanksDto }: { swapRanksDto: SwapRanksDto }) {
    const region = swapRanksDto.region as MacroRegion;
    const [a, b] = swapRanksDto.campaignIds.map(requireCampaign) as [AdCampaignDto, AdCampaignDto];
    for (const c of [a, b]) {
      if (c.status === AdCampaignStatusEnum.Ended) throw conflict(`"${c.name}" has ended — its rank is already free`);
      if (c.ranks?.[region] === undefined) throw badRequest(`"${c.name}" has no rank in ${region}`);
    }
    const rankA = a.ranks[region]!;
    const rankB = b.ranks[region]!;
    if (rankA === rankB) throw badRequest("Both ads already have the same rank");
    assertRanksFree({ [region]: rankB }, a.startsAt!, a.endsAt!, [a.id, b.id]);
    assertRanksFree({ [region]: rankA }, b.startsAt!, b.endsAt!, [a.id, b.id]);
    save({ ...a, ranks: { ...a.ranks, [region]: rankB } });
    save({ ...b, ranks: { ...b.ranks, [region]: rankA } });
    return ok({
      region: swapRanksDto.region,
      swapped: [
        { campaignId: a.id, name: a.name, rank: rankB },
        { campaignId: b.id, name: b.name, rank: rankA },
      ],
    });
  },

  async adminAdSalesControllerCreateCampaignV1({ createAdCampaignDto: dto }: { createAdCampaignDto: CreateAdCampaignDto }) {
    const fields = campaignFields(dto);
    if (fields.startsAt && fields.endsAt && new Date(fields.endsAt) <= new Date(fields.startsAt)) {
      throw badRequest("endsAt must be after startsAt");
    }
    const ranks = resolveRanks(fields.regions ?? [], dto.ranks);
    const flight = assertBookable(fields);
    assertRanksFree(ranks, flight.startsAt, flight.endsAt);
    const now = new Date().toISOString();
    const created: AdCampaignDto = {
      ...seed({
        id: `ad-${Date.now()}`,
        name: dto.name,
        advertiserName: dto.advertiserName?.trim() ?? "",
        caption: "",
        durationSeconds: 0,
        ctaLabel: "",
        clickUrl: "",
        regions: [],
        ranks,
        starts: 0,
        ends: 0,
        status: startStatus(flight.startsAt),
      }),
      ...fields,
      ranks,
      createdAt: now,
      updatedAt: now,
    };
    campaigns = [created, ...campaigns];
    return ok(created);
  },

  async adminAdSalesControllerUpdateCampaignV1({ id, updateAdCampaignDto: dto }: { id: string; updateAdCampaignDto: UpdateAdCampaignDto }) {
    const current = requireCampaign(id);
    if (current.status === AdCampaignStatusEnum.Ended) throw conflict("Ended campaigns cannot be edited");
    const fields = campaignFields(dto);
    const merged = { ...current, ...fields };
    if (merged.startsAt && merged.endsAt && new Date(merged.endsAt) <= new Date(merged.startsAt)) {
      throw badRequest("endsAt must be after startsAt");
    }
    if (current.status === AdCampaignStatusEnum.Active && fields.startsAt !== undefined && fields.startsAt !== current.startsAt) {
      throw conflict("The ad has already started — its start date cannot be changed");
    }
    const ranks = resolveRanks(merged.regions, dto.ranks, current.ranks);
    const flight = assertBookable(merged);
    assertRanksFree(ranks, flight.startsAt, flight.endsAt, [id]);
    return ok(save({ ...merged, ranks }));
  },

  async adminAdSalesControllerActivateV1({ id }: { id: string }) {
    const c = requireCampaign(id);
    if (c.status === AdCampaignStatusEnum.Active) throw conflict("Campaign is already active");
    if (c.status === AdCampaignStatusEnum.Ended) throw conflict("Ended campaigns cannot be reactivated — duplicate it instead");
    if (!c.startsAt || !c.endsAt) throw badRequest("Set startsAt and endsAt before activating");
    if (new Date(c.endsAt).getTime() <= Date.now()) throw badRequest("endsAt is in the past");
    if (!c.creativeMediaId) throw badRequest("A commercial needs a creative video");
    assertRanksFree(c.ranks, c.startsAt, c.endsAt, [c.id]);
    return ok(save({ ...c, status: startStatus(c.startsAt) }));
  },

  async adminAdSalesControllerPauseV1({ id }: { id: string }) {
    const c = requireCampaign(id);
    if (c.status !== AdCampaignStatusEnum.Active && c.status !== AdCampaignStatusEnum.Scheduled) {
      throw conflict("Only active or scheduled campaigns can be paused");
    }
    return ok(save({ ...c, status: AdCampaignStatusEnum.Paused }));
  },

  async adminAdSalesControllerResumeV1({ id }: { id: string }) {
    const c = requireCampaign(id);
    if (c.status !== AdCampaignStatusEnum.Paused) throw conflict("Only paused campaigns can be resumed");
    return adminAdSalesApi.adminAdSalesControllerActivateV1({ id });
  },

  async adminAdSalesControllerEndV1({ id }: { id: string; campaignEndDto?: unknown }) {
    const c = requireCampaign(id);
    if (c.status === AdCampaignStatusEnum.Ended) throw conflict("Campaign already ended");
    return ok(save({ ...c, status: AdCampaignStatusEnum.Ended, endedReason: "manual", ranks: {} }));
  },
};
