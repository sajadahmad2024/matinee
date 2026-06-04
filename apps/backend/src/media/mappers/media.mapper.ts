import { MediaRecord } from '@db/repositories/media/media.repository';
import { MediaDto } from '../dto/media-response.dto';

/** Map a media row to its API DTO. `url` is attached by the service (delivery-aware). */
export function toMediaDto(record: MediaRecord, url: string | null = null): MediaDto {
  return {
    id: record.id,
    mediaType: record.mediaType,
    usageType: record.usageType,
    accessLevel: record.accessLevel,
    status: record.status,
    mimeType: record.mimeType,
    originalFilename: record.originalFilename,
    fileSizeBytes: record.fileSizeBytes,
    width: record.width,
    height: record.height,
    durationSeconds: record.durationSeconds,
    isHls: record.isHls,
    processingProgress: record.processingProgress,
    posterMediaId: record.posterMediaId,
    altText: record.altText,
    createdAt: record.createdAt,
    url,
  };
}
