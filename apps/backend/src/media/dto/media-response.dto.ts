import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccessLevel, MediaStatus, MediaType, UsageType } from '../constants/media.constant';

/** The asset descriptor returned across the API; other modules store only `id`. */
export class MediaDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: MediaType }) mediaType!: MediaType;
  @ApiProperty({ enum: UsageType }) usageType!: UsageType;
  @ApiProperty({ enum: AccessLevel }) accessLevel!: AccessLevel;
  @ApiProperty({ enum: MediaStatus }) status!: MediaStatus;
  @ApiPropertyOptional({ nullable: true }) mimeType!: string | null;
  @ApiPropertyOptional({ nullable: true }) originalFilename!: string | null;
  @ApiPropertyOptional({ nullable: true }) fileSizeBytes!: number | null;
  @ApiPropertyOptional({ nullable: true }) width!: number | null;
  @ApiPropertyOptional({ nullable: true }) height!: number | null;
  @ApiPropertyOptional({ nullable: true }) durationSeconds!: string | null;
  @ApiProperty() isHls!: boolean;
  @ApiPropertyOptional({ nullable: true, description: 'Live transcode progress 0–100; null when not transcoding' })
  processingProgress!: number | null;
  @ApiPropertyOptional({ nullable: true }) posterMediaId!: string | null;
  @ApiPropertyOptional({ nullable: true }) altText!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiPropertyOptional({ nullable: true, description: 'Ready-to-use URL for PUBLIC assets; null for protected (use /playback)' })
  url!: string | null;
}

/** The presigned target the client uploads bytes to (direct-to-storage). */
export class UploadTargetDto {
  @ApiProperty() url!: string;
  @ApiProperty({ example: 'PUT' }) method!: string;
  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } }) headers!: Record<string, string>;
  @ApiProperty() expiresInSeconds!: number;
}

/** Response to an upload request: the new media id + where to PUT the bytes. */
export class UploadTicketDto {
  @ApiProperty({ description: 'Persist this; send it to other modules for association' }) mediaId!: string;
  @ApiProperty({ enum: MediaStatus }) status!: MediaStatus;
  @ApiProperty({ type: UploadTargetDto }) upload!: UploadTargetDto;
}

/** One lifecycle transition (status-by-status audit). */
export class MediaStatusEventDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: MediaStatus }) status!: MediaStatus;
  @ApiPropertyOptional({ nullable: true }) detail!: string | null;
  @ApiPropertyOptional({ nullable: true, description: 'Transcode progress 0–100 for this event' }) progress!: number | null;
  @ApiProperty() createdAt!: string;
}

/** Signed playback descriptor for a ready asset. */
export class PlaybackDto {
  @ApiProperty({ enum: ['hls', 'file'] }) kind!: 'hls' | 'file';
  @ApiProperty() url!: string;
  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' }, description: 'Signed cookies to send on CDN requests (HLS); empty otherwise' })
  cookies!: Record<string, string>;
  @ApiProperty() expiresInSeconds!: number;
}
