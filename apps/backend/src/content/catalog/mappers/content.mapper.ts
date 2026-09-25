import {
  AdminContentSignals,
  ContentGenreRef,
  ContentRecord,
  ContentTagRef,
  PublishRegion,
} from '@db/repositories/content/content.repository';
import { ContentResponseDto } from '../dto/content-response.dto';

/** Customer-facing shape — omits operational/admin signals. */
export function toPublicContent(c: ContentRecord): ContentResponseDto {
  return {
    id: c.id,
    title: c.title,
    slug: c.slug,
    description: c.description,
    contentType: c.contentType,
    accessTier: c.accessTier,
    unlockPoints: c.unlockPoints,
    studioId: c.studioId,
    videoMediaId: c.videoMediaId,
    thumbnailMediaId: c.thumbnailMediaId,
    durationSeconds: c.durationSeconds,
    language: c.language,
    status: c.status,
    isBoosted: c.isBoosted,
    rightsRegion: c.rightsRegion,
    parentContentId: c.parentContentId,
    availableUntil: c.availableUntil,
    watchLinks: c.watchLinks,
    viewCount: c.viewCount,
    likeCount: c.likeCount,
    dislikeCount: c.dislikeCount,
    commentCount: c.commentCount,
    shareCount: c.shareCount,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

/** Boosted and now inside the boost window. */
export function isBoostActive(c: ContentRecord, now: Date = new Date()): boolean {
  if (!c.isBoosted) return false;
  if (c.boostStartsAt && new Date(c.boostStartsAt) > now) return false;
  if (c.boostedUntil && new Date(c.boostedUntil) <= now) return false;
  return true;
}

/** Admin shape — full operational signals (no cross-table enrichment). */
export function toAdminContent(c: ContentRecord): ContentResponseDto {
  return {
    ...toPublicContent(c),
    recommendation: c.recommendation,
    isSponsored: c.isSponsored,
    isAdCommercial: c.isAdCommercial,
    licenseStatus: c.licenseStatus,
    licenseExpiresAt: c.licenseExpiresAt,
    licensorName: c.licensorName,
    licenseTerms: c.licenseTerms,
    scheduledAt: c.scheduledAt,
    publishedAt: c.publishedAt,
    rejectionReason: c.rejectionReason,
    boostPriority: c.boostPriority,
    boostStartsAt: c.boostStartsAt,
    boostedUntil: c.boostedUntil,
    boostChannels: c.boostChannels,
    isBoostActive: isBoostActive(c),
  };
}

/** Views last 7d vs previous 7d; within ±10 % (or both zero) = flat. */
export function viewsTrend(views7d: number, viewsPrev7d: number): 'up' | 'flat' | 'down' {
  if (viewsPrev7d === 0) return views7d > 0 ? 'up' : 'flat';
  const change = (views7d - viewsPrev7d) / viewsPrev7d;
  if (change > 0.1) return 'up';
  if (change < -0.1) return 'down';
  return 'flat';
}

export interface AdminEnrichment {
  signals: AdminContentSignals | undefined;
  genres: ContentGenreRef[];
  tags: ContentTagRef[];
  regions: PublishRegion[];
  thumbnailUrl: string | null;
}

/** Admin shape + list/detail enrichment (names, taxonomy, regions, health signals). */
export function toEnrichedAdminContent(c: ContentRecord, e: AdminEnrichment): ContentResponseDto {
  const s = e.signals;
  return {
    ...toAdminContent(c),
    studioName: s?.studioName ?? null,
    thumbnailUrl: e.thumbnailUrl,
    genres: e.genres,
    tags: e.tags,
    publishRegions: e.regions,
    linkedGamesCount: s?.linkedGamesCount ?? 0,
    sponsorName: s?.sponsorName ?? null,
    adPlacement: s?.adPlacement ?? null,
    completionRate: s?.completionRate ?? 0,
    viewsTrend: viewsTrend(s?.views7d ?? 0, s?.viewsPrev7d ?? 0),
    revenuePer1kCents: c.viewCount > 0 ? Math.round(((s?.revenueCents ?? 0) / c.viewCount) * 1000) : 0,
    unresolvedFlags: s?.unresolvedFlags ?? 0,
    createdBy: c.createdBy ? { id: c.createdBy, name: s?.createdByName ?? null } : null,
    updatedBy: c.updatedBy ? { id: c.updatedBy, name: s?.updatedByName ?? null } : null,
  };
}
