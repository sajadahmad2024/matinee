/*
 * UI demo build only: mock of the generated `AdminContentApi` — same method names, request shapes
 * and `{ data }` envelopes, answered in memory (`_demo/content-data`), with the content workflow's
 * status rules. No request is ever sent.
 */
import type {
  AdminContentControllerListV1Request,
  AdminContentInsightsControllerLicensesV1Request,
  ArchiveContentDto,
  BoostContentDto,
  ContentFullDto,
  ContentResponseDto,
  ContentStatsDto,
  CreateContentDto,
  LicenseAgreementDto,
  LicenseDto,
  LicenseResponseDto,
  LicenseSummaryDto,
  RecommendedActionDto,
  RegionsResponseDto,
  RejectContentDto,
  ScheduleContentDto,
  SetRegionsDto,
  SponsorshipDto,
  SponsorshipResponseDto,
  UpdateContentDto,
} from "@/app/_libs/api/generated";

import { genres, people, studios, tags } from "./admin-content-library-api";
import {
  ALL_DEMO_REGIONS,
  type DemoRegion,
  demoContents,
  findContent,
  historyOf,
  licenses,
  logHistory,
  regionsOf,
  sponsorships,
} from "./_demo/content-data";
import { badRequest, conflict, daysFromNow, newId, notFound, nowIso, ok, paginate, slugify } from "./_demo/core";
import { mediaUrl } from "./_demo/media-store";

const DAY_MS = 86_400_000;
const daysUntil = (iso?: string | null) =>
  iso ? Math.ceil((new Date(iso).getTime() - Date.now()) / DAY_MS) : null;

const requireContent = (id: string) => {
  const content = findContent(id);
  if (!content) throw notFound("Content");
  return content;
};

function regionsResponse(regions: DemoRegion[], off: DemoRegion[]): RegionsResponseDto {
  return {
    regions,
    liveRegions: regions.filter((r) => !off.includes(r)),
    items: regions.map((region) => ({
      region: region as RegionsResponseDto["items"][number]["region"],
      live: !off.includes(region),
    })),
  };
}

/** A content row as the API returns it: thumbnail from its media id, live regions from its status. */
const out = (c: ContentResponseDto): ContentResponseDto => {
  const regions = regionsOf.get(c.id) ?? { regions: ALL_DEMO_REGIONS, off: [] };
  const published = c.status === "published";
  return {
    ...c,
    thumbnailUrl: mediaUrl(c.thumbnailMediaId) ?? c.thumbnailUrl ?? null,
    publishRegions: regions.regions.map((region) => ({
      region: region as NonNullable<ContentResponseDto["publishRegions"]>[number]["region"],
      live: published && !regions.off.includes(region),
    })),
  };
};

const touch = (c: ContentResponseDto, action: string, patch: Partial<ContentResponseDto> = {}) => {
  Object.assign(c, patch, { updatedAt: nowIso() });
  logHistory(c.id, action);
  return ok(out(c));
};

const inRegion = (c: ContentResponseDto, region?: string) =>
  !region || (regionsOf.get(c.id)?.regions ?? ALL_DEMO_REGIONS).includes(region as DemoRegion);

/** The editable fields of a create / update body, with their names resolved from the taxonomy. */
function contentFields(dto: CreateContentDto | UpdateContentDto): Partial<ContentResponseDto> {
  const { genreIds, primaryGenreId, tagIds, tagNames, cast, studioName, watchLinks, recommendation, ...rest } = dto;
  const fields = Object.fromEntries(
    Object.entries(rest).filter(([, v]) => v !== undefined),
  ) as Partial<ContentResponseDto>;
  if (dto.title) fields.slug = slugify(dto.title);
  if (dto.studioId !== undefined) {
    fields.studioName = studios.find((s) => s.id === dto.studioId)?.name ?? studioName ?? null;
  }
  if (genreIds) {
    fields.genres = genreIds.map((id, i) => {
      const g = genres.find((x) => x.id === id);
      return { id, name: g?.name ?? id, slug: g?.slug ?? id, isPrimary: primaryGenreId ? id === primaryGenreId : i === 0 };
    });
  }
  if (tagIds || tagNames) {
    fields.tags = [
      ...(tagIds ?? []).map((id) => {
        const t = tags.find((x) => x.id === id);
        return { id, name: t?.name ?? id, slug: t?.slug ?? id };
      }),
      ...(tagNames ?? []).map((name) => ({ id: newId("t"), name, slug: slugify(name) })),
    ];
  }
  if (cast) {
    fields.cast = cast.map((m, i) => {
      const p = people.find((x) => x.id === m.personId);
      return {
        personId: m.personId,
        name: p?.name ?? m.personId,
        slug: p?.slug ?? m.personId,
        photoMediaId: p?.photoMediaId ?? null,
        role: (m.role ?? "actor") as NonNullable<ContentResponseDto["cast"]>[number]["role"],
        characterName: m.characterName ?? null,
        billingOrder: m.billingOrder ?? i + 1,
      };
    });
  }
  if (watchLinks) fields.watchLinks = watchLinks as ContentResponseDto["watchLinks"];
  if (recommendation) fields.recommendation = recommendation;
  return fields;
}

const SORTS: Record<string, (a: ContentResponseDto, b: ContentResponseDto) => number> = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
  most_viewed: (a, b) => b.viewCount - a.viewCount,
  least_viewed: (a, b) => a.viewCount - b.viewCount,
  recently_updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  scheduled_asc: (a, b) => (a.scheduledAt ?? "9").localeCompare(b.scheduledAt ?? "9"),
  license_expiry_asc: (a, b) => (a.licenseExpiresAt ?? "9").localeCompare(b.licenseExpiresAt ?? "9"),
  title_asc: (a, b) => a.title.localeCompare(b.title),
};

const between = (iso: string | null | undefined, from?: string, to?: string) =>
  (!from || (!!iso && iso >= from)) && (!to || (!!iso && iso <= to));

function licenseAgreement(c: ContentResponseDto, l: LicenseResponseDto): LicenseAgreementDto {
  return {
    licenseId: l.id,
    contentId: c.id,
    title: c.title,
    thumbnailUrl: mediaUrl(c.thumbnailMediaId),
    licensorName: l.licensorName,
    licenseType: l.licenseType as unknown as LicenseAgreementDto["licenseType"],
    startsAt: l.startsAt ?? null,
    expiresAt: l.expiresAt ?? null,
    daysLeft: daysUntil(l.expiresAt),
    renewalStatus: l.renewalStatus,
    licenseCostCents: l.licenseCostCents,
    revenueGeneratedCents: l.revenueGeneratedCents,
    revenueSource: l.revenueSource ?? null,
    currency: l.currency,
    roi: l.licenseCostCents ? Math.round((l.revenueGeneratedCents / l.licenseCostCents) * 100) / 100 : null,
    views: c.viewCount,
    terms: l.terms ?? null,
  };
}

export const adminContentApi = {
  // Library ────────────────────────────────────────────────────────────────

  async adminContentControllerListV1(params: AdminContentControllerListV1Request = {}) {
    const q = params?.q?.toLowerCase().trim();
    const scheduledFilter = !!(params?.scheduledFrom || params?.scheduledTo);
    const rows = demoContents
      .filter(
        (c) =>
          (!q || c.title.toLowerCase().includes(q)) &&
          (!params?.status?.length || params.status.includes(c.status)) &&
          (!params?.contentType || c.contentType === (params.contentType as string)) &&
          (!params?.studioId || c.studioId === params.studioId) &&
          (!params?.parentContentId || c.parentContentId === params.parentContentId) &&
          (params?.hasParent === undefined || !!c.parentContentId === params.hasParent) &&
          (params?.isBoosted === undefined || c.isBoosted === params.isBoosted) &&
          (params?.isSponsored === undefined || !!c.isSponsored === params.isSponsored) &&
          (!params?.licenseStatus?.length || params.licenseStatus.includes(c.licenseStatus ?? "original")) &&
          inRegion(c, params?.region) &&
          between(c.createdAt, params?.createdFrom, params?.createdTo) &&
          (!scheduledFilter || between(c.scheduledAt, params?.scheduledFrom, params?.scheduledTo)),
      )
      .sort(SORTS[params?.sort ?? "newest"] ?? SORTS.newest);
    const { items, pagination } = paginate(rows, params?.page, params?.limit);
    return ok({ items: items.map(out), pagination });
  },

  async adminContentControllerGetV1({ id }: { id: string }) {
    return ok(out(requireContent(id)));
  },

  async adminContentControllerFullV1({ id }: { id: string }) {
    const c = requireContent(id);
    const regions = regionsOf.get(id) ?? { regions: ALL_DEMO_REGIONS, off: [] };
    const sponsorship = sponsorships.get(id) ?? null;
    const impressions = sponsorship ? Math.round(c.viewCount * 0.7) : 0;
    const full: ContentFullDto = {
      content: out(c),
      license: licenses.get(id) ?? null,
      sponsorship,
      adPerformance: sponsorship
        ? {
            impressions,
            uniqueViewers: Math.round(impressions / 1.3),
            clicks: Math.round(impressions * 0.012),
            ctr: 0.012,
            skips: Math.round(impressions * 0.35),
            skipRate: 0.35,
            completes: Math.round(impressions * 0.52),
            completionRate: 0.52,
            revenueCents: sponsorship.revenueCents,
            ecpmCents: impressions ? Math.round((sponsorship.revenueCents / impressions) * 1000) : 0,
          }
        : null,
      regions: regionsResponse(regions.regions, regions.off),
      history: [...(historyOf.get(id) ?? [])].reverse(),
      linkedGames: {
        total: c.linkedGamesCount ?? 0,
        predictions: [],
        auctions: [],
        quests: c.linkedGamesCount ? [{ id: "q1", title: "Marvel Marathon Week", status: "active" }] : [],
      },
    };
    return ok(full);
  },

  async adminContentControllerCreateV1({ createContentDto: dto }: { createContentDto: CreateContentDto }) {
    if (!dto.title?.trim()) throw badRequest("title should not be empty");
    const id = newId("c");
    const now = nowIso();
    const created: ContentResponseDto = {
      id,
      title: dto.title,
      slug: slugify(dto.title),
      contentType: "trailer" as ContentResponseDto["contentType"],
      accessTier: "free" as ContentResponseDto["accessTier"],
      status: "draft",
      isBoosted: false,
      rightsRegion: "global",
      watchLinks: [],
      viewCount: 0,
      likeCount: 0,
      dislikeCount: 0,
      commentCount: 0,
      shareCount: 0,
      licenseStatus: "original",
      genres: [],
      tags: [],
      cast: [],
      createdBy: { id: "demo-admin", name: "John Doe" },
      updatedBy: { id: "demo-admin", name: "John Doe" },
      createdAt: now,
      updatedAt: now,
      ...contentFields(dto),
    };
    demoContents.unshift(created);
    regionsOf.set(id, { regions: [...ALL_DEMO_REGIONS], off: [] });
    logHistory(id, "created");
    return ok(out(created));
  },

  async adminContentControllerUpdateV1({ id, updateContentDto: dto }: { id: string; updateContentDto: UpdateContentDto }) {
    return touch(requireContent(id), "updated", contentFields(dto));
  },

  async adminContentControllerRemoveV1({ id }: { id: string }) {
    requireContent(id);
    demoContents.splice(demoContents.findIndex((c) => c.id === id), 1);
    return ok({ message: "Content deleted" });
  },

  // Workflow ───────────────────────────────────────────────────────────────

  async adminContentControllerSubmitV1({ id }: { id: string }) {
    const c = requireContent(id);
    if (!["draft", "rejected"].includes(c.status)) throw conflict(`Cannot submit a ${c.status} video`);
    return touch(c, "submitted", { status: "pending_approval", rejectionReason: null });
  },

  async adminContentControllerPublishV1({ id }: { id: string }) {
    const c = requireContent(id);
    if (c.status === "published") throw conflict("Already published");
    return touch(c, "published", { status: "published", publishedAt: nowIso(), scheduledAt: null });
  },

  async adminContentControllerScheduleV1({ id, scheduleContentDto: dto }: { id: string; scheduleContentDto: ScheduleContentDto }) {
    const c = requireContent(id);
    if (new Date(dto.scheduledAt).getTime() <= Date.now()) throw badRequest("scheduledAt must be in the future");
    return touch(c, "scheduled", { status: "scheduled", scheduledAt: dto.scheduledAt });
  },

  async adminContentControllerUnscheduleV1({ id }: { id: string }) {
    const c = requireContent(id);
    if (c.status !== "scheduled") throw conflict("Only scheduled videos can be unscheduled");
    return touch(c, "unscheduled", { status: "pending_approval", scheduledAt: null });
  },

  async adminContentControllerRejectV1({ id, rejectContentDto: dto }: { id: string; rejectContentDto: RejectContentDto }) {
    return touch(requireContent(id), "rejected", { status: "rejected", rejectionReason: dto.reason });
  },

  async adminContentControllerArchiveV1({ id, archiveContentDto: dto }: { id: string; archiveContentDto: ArchiveContentDto }) {
    const c = requireContent(id);
    // `archived: false` restores — back to published if it had gone live, else to draft
    if (dto?.archived === false) {
      return touch(c, "unarchived", { status: c.publishedAt ? "published" : "draft" });
    }
    return touch(c, "archived", { status: "archived", isBoosted: false, isBoostActive: false });
  },

  async adminContentControllerBoostV1({ id, boostContentDto: dto }: { id: string; boostContentDto: BoostContentDto }) {
    const c = requireContent(id);
    const on = dto?.boosted !== false;
    if (on && c.status !== "published") throw conflict("Only published videos can be boosted");
    return touch(c, "boosted", {
      isBoosted: on,
      isBoostActive: on,
      boostPriority: on ? (dto?.priority ?? 1) : 0,
      boostStartsAt: on ? (dto?.startsAt ?? nowIso()) : null,
      boostedUntil: on ? (dto?.until ?? null) : null,
      boostChannels: on ? ((dto?.channels ?? ["homepage"]) as ContentResponseDto["boostChannels"]) : [],
    });
  },

  // Licensing, sponsorship, regions ────────────────────────────────────────

  async adminContentExtrasControllerSetLicenseV1({ id, licenseDto: dto }: { id: string; licenseDto: LicenseDto }) {
    const c = requireContent(id);
    const now = nowIso();
    const license: LicenseResponseDto = {
      id: licenses.get(id)?.id ?? newId("lic"),
      contentId: id,
      licensorName: dto.licensorName,
      licenseType: (dto.licenseType ?? "exclusive") as LicenseResponseDto["licenseType"],
      startsAt: dto.startsAt ?? null,
      expiresAt: dto.expiresAt ?? null,
      renewalStatus: (dto.renewalStatus ?? "renewing") as LicenseResponseDto["renewalStatus"],
      licenseCostCents: dto.licenseCostCents ?? 0,
      currency: dto.currency ?? "USD",
      revenueGeneratedCents: dto.revenueGeneratedCents ?? 0,
      revenueSource: dto.revenueSource ?? null,
      terms: dto.terms ?? null,
      isActive: true,
      createdBy: "demo-admin",
      createdAt: licenses.get(id)?.createdAt ?? now,
      updatedAt: now,
    };
    licenses.set(id, license);
    const left = daysUntil(license.expiresAt);
    Object.assign(c, {
      licensorName: license.licensorName,
      licenseExpiresAt: license.expiresAt,
      licenseStatus: left !== null && left < 0 ? "expired" : left !== null && left <= 30 ? "expiring" : "licensed",
    });
    return ok(license);
  },

  async adminContentExtrasControllerRemoveLicenseV1({ id }: { id: string }) {
    const c = requireContent(id);
    licenses.delete(id);
    Object.assign(c, { licensorName: null, licenseExpiresAt: null, licenseStatus: "original" });
    return ok({ message: "License removed" });
  },

  async adminContentExtrasControllerSetSponsorshipV1({ id, sponsorshipDto: dto }: { id: string; sponsorshipDto: SponsorshipDto }) {
    const c = requireContent(id);
    const now = nowIso();
    const sponsorship: SponsorshipResponseDto = {
      id: sponsorships.get(id)?.id ?? newId("sp"),
      contentId: id,
      sponsorName: dto.sponsorName,
      bannerMediaId: dto.bannerMediaId ?? null,
      bannerUrl: mediaUrl(dto.bannerMediaId),
      adDurationSeconds: dto.adDurationSeconds ?? 15,
      placement: (dto.placement ?? "pre-roll") as SponsorshipResponseDto["placement"],
      revenueCents: dto.revenueCents ?? 0,
      currency: dto.currency ?? "USD",
      startsAt: dto.startsAt ?? null,
      endsAt: dto.endsAt ?? null,
      isActive: true,
      createdBy: "demo-admin",
      createdAt: sponsorships.get(id)?.createdAt ?? now,
      updatedAt: now,
      adFormat: (dto.adFormat ?? "sponsored") as SponsorshipResponseDto["adFormat"],
      feedFrequency: dto.feedFrequency ?? null,
      skippableAfterSeconds: dto.skippableAfterSeconds ?? null,
      creativeMediaId: dto.creativeMediaId ?? null,
      clickUrl: dto.clickUrl ?? null,
      ctaLabel: dto.ctaLabel ?? null,
      midRollAtSeconds: dto.midRollAtSeconds ?? null,
      overlayStartSeconds: dto.overlayStartSeconds ?? null,
      overlayDurationSeconds: dto.overlayDurationSeconds ?? null,
      cpmCents: dto.cpmCents ?? null,
      cpcCents: dto.cpcCents ?? null,
    };
    sponsorships.set(id, sponsorship);
    Object.assign(c, { isSponsored: true, sponsorName: sponsorship.sponsorName, adPlacement: sponsorship.placement });
    return ok(sponsorship);
  },

  async adminContentExtrasControllerRemoveSponsorshipV1({ id }: { id: string }) {
    const c = requireContent(id);
    sponsorships.delete(id);
    Object.assign(c, { isSponsored: false, sponsorName: null, adPlacement: null });
    return ok({ message: "Sponsorship removed" });
  },

  async adminContentExtrasControllerSetRegionsV1({ id, setRegionsDto: dto }: { id: string; setRegionsDto: SetRegionsDto }) {
    requireContent(id);
    const regions = dto.regions as unknown as DemoRegion[];
    const off = (dto.offRegions ?? []) as unknown as DemoRegion[];
    regionsOf.set(id, { regions, off });
    return ok(regionsResponse(regions, off));
  },

  // Insights ───────────────────────────────────────────────────────────────

  async adminContentInsightsControllerStatsV1(params: { region?: string } = {}) {
    const rows = demoContents.filter((c) => inRegion(c, params?.region));
    const count = (status: string) => rows.filter((c) => c.status === status).length;
    const addedWithin = (from: number, to: number) =>
      rows.filter((c) => {
        const age = (Date.now() - new Date(c.createdAt).getTime()) / DAY_MS;
        return age >= from && age < to;
      }).length;
    const last30 = addedWithin(0, 30);
    const prev30 = addedWithin(30, 60);
    const expiring = (from: number, to: number) =>
      [...licenses.values()].filter((l) => {
        const left = daysUntil(l.expiresAt);
        return left !== null && left >= from && left < to;
      }).length;
    const stats: ContentStatsDto = {
      total: rows.length,
      byStatus: {
        draft: count("draft"),
        pending_approval: count("pending_approval"),
        scheduled: count("scheduled"),
        published: count("published"),
        rejected: count("rejected"),
        archived: count("archived"),
      },
      boosted: rows.filter((c) => c.isBoosted).length,
      sponsored: rows.filter((c) => c.isSponsored).length,
      activeLibrary: count("published"),
      addedThisMonth: addedWithin(0, new Date().getDate()),
      addedLast30d: last30,
      addedPrev30d: prev30,
      addedLast30dChangePct: prev30 ? Math.round(((last30 - prev30) / prev30) * 100) : null,
      pipeline: { draft: count("draft"), inReview: count("pending_approval"), scheduled: count("scheduled") },
      avgTimeToPublishHours: 26,
      expiringThisMonth: expiring(0, 30),
      expiringNextMonth: expiring(30, 60),
      expiringWithin30d: expiring(0, 30),
      licensed: rows.filter((c) => licenses.has(c.id)).length,
      original: rows.filter((c) => !licenses.has(c.id)).length,
      byRegion: ALL_DEMO_REGIONS.map((region) => {
        const published = demoContents.filter((c) => inRegion(c, region) && c.status === "published");
        const views = published.reduce((s, c) => s + c.viewCount, 0);
        return {
          region: region as ContentStatsDto["byRegion"][number]["region"],
          total: demoContents.filter((c) => inRegion(c, region)).length,
          published: published.length,
          live: published.length,
          views30d: Math.round(views * 0.4),
          watchSeconds30d: Math.round(views * 0.4 * 95),
        };
      }),
    };
    return ok(stats);
  },

  async adminContentInsightsControllerRecommendedActionsV1(_params: { region?: string } = {}) {
    const pending = demoContents.filter((c) => c.status === "pending_approval").length;
    const rejected = demoContents.filter((c) => c.status === "rejected").length;
    const expiring = [...licenses.values()].filter((l) => (daysUntil(l.expiresAt) ?? 99) <= 30).length;
    const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
    const actions = [
      { key: "pending_review", count: pending, severity: "high", title: `${plural(pending, "video")} awaiting review`, detail: "Approve or reject submissions so they can go live.", cta: "Review now" },
      { key: "licenses_expiring", count: expiring, severity: "medium", title: `${plural(expiring, "license")} expiring within 30 days`, detail: "Renew or plan removal before they lapse.", cta: "View licenses" },
      { key: "rejected_followup", count: rejected, severity: "low", title: `${plural(rejected, "rejected video")} need follow-up`, detail: "Fix the issues and resubmit, or archive.", cta: "View rejected" },
    ].filter((a) => a.count > 0) as RecommendedActionDto[];
    return ok(actions);
  },

  async adminContentInsightsControllerLicensesV1(params: AdminContentInsightsControllerLicensesV1Request = {}) {
    const q = params?.q?.toLowerCase().trim();
    const rows = [...licenses.entries()]
      .map(([contentId, l]) => {
        const c = findContent(contentId);
        return c ? licenseAgreement(c, l) : null;
      })
      .filter((a): a is LicenseAgreementDto => !!a)
      .filter(
        (a) =>
          (!q || a.title.toLowerCase().includes(q) || a.licensorName.toLowerCase().includes(q)) &&
          (!params?.expiresWithinDays || (a.daysLeft ?? Infinity) <= params.expiresWithinDays) &&
          (!params?.renewalStatus || a.renewalStatus === (params.renewalStatus as string)) &&
          (!params?.licenseType || (a.licenseType as string) === (params.licenseType as string)),
      )
      .sort((a, b) =>
        params?.sort === "revenue_desc"
          ? b.revenueGeneratedCents - a.revenueGeneratedCents
          : params?.sort === "cost_desc"
            ? b.licenseCostCents - a.licenseCostCents
            : params?.sort === "roi_desc"
              ? (b.roi ?? 0) - (a.roi ?? 0)
              : (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity),
      );
    return ok(paginate(rows, params?.page, params?.limit));
  },

  async adminContentInsightsControllerLicenseSummaryV1() {
    const all = [...licenses.values()];
    const totalCost = all.reduce((s, l) => s + l.licenseCostCents, 0);
    const views = demoContents.filter((c) => licenses.has(c.id)).reduce((s, c) => s + c.viewCount, 0);
    const within = (days: number) => all.filter((l) => (daysUntil(l.expiresAt) ?? Infinity) <= days).length;
    const summary: LicenseSummaryDto = {
      licensedCount: all.length,
      originalCount: demoContents.length - all.length,
      activeAgreements: all.filter((l) => l.isActive).length,
      totalCostCents: totalCost,
      totalRevenueCents: all.reduce((s, l) => s + l.revenueGeneratedCents, 0),
      monthlyCostCents: Math.round(totalCost / 12),
      costPerStreamCents: views ? Math.round(totalCost / views) : 0,
      prevCostPerStreamCents: views ? Math.round((totalCost / views) * 1.08) : 0,
      expiringIn30: within(30),
      expiringIn60: within(60),
      expiringIn90: within(90),
      monthlyCostTrend: Array.from({ length: 6 }, (_, i) => ({
        month: daysFromNow(-30 * (5 - i)).slice(0, 7),
        costCents: Math.round((totalCost / 12) * (0.85 + 0.05 * i)),
      })),
    };
    return ok(summary);
  },
};
