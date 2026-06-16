import { ContentRecord } from '@db/repositories/content/content.repository';
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
    viewCount: c.viewCount,
    likeCount: c.likeCount,
    dislikeCount: c.dislikeCount,
    commentCount: c.commentCount,
    shareCount: c.shareCount,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

/** Admin shape — full operational signals. */
export function toAdminContent(c: ContentRecord): ContentResponseDto {
  return {
    ...toPublicContent(c),
    recommendation: c.recommendation,
    isSponsored: c.isSponsored,
    isAdCommercial: c.isAdCommercial,
    licenseStatus: c.licenseStatus,
    licenseExpiresAt: c.licenseExpiresAt,
    scheduledAt: c.scheduledAt,
    publishedAt: c.publishedAt,
    rejectionReason: c.rejectionReason,
  };
}
