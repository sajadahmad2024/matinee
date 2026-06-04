import { EnvConfig } from '@config/env.config';
import { MediaRepository, MediaRecord } from '@db/repositories/media/media.repository';
import { QueueService } from '@queue/queue.service';
import { JobName, QueueName } from '@queue/queue.constant';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import {
  AccessLevel,
  MEDIA_DELIVERY_PROVIDER,
  MediaStatus,
  MediaType,
  STORAGE_PROVIDER,
  UsageType,
} from './constants/media.constant';
import { StorageProvider } from './providers/storage.provider';
import { MediaDeliveryProvider } from './providers/delivery.provider';
import { MediaDto, MediaStatusEventDto, PlaybackDto, UploadTicketDto } from './dto/media-response.dto';
import { RequestUploadDto } from './dto/request-upload.dto';
import { CompleteUploadDto } from './dto/complete-upload.dto';
import { toMediaDto } from './mappers/media.mapper';
import { MediaCleanupJob } from './interfaces/media-jobs.interface';

@Injectable()
export class MediaService {
  constructor(
    private readonly media: MediaRepository,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    @Inject(MEDIA_DELIVERY_PROVIDER) private readonly delivery: MediaDeliveryProvider,
    private readonly queue: QueueService,
    private readonly config: ConfigService<EnvConfig>,
  ) {}

  private get signedTtl(): number {
    return this.config.get<number>('MEDIA_SIGNED_URL_TTL') ?? 900;
  }

  // ─── Upload (request → client PUTs to storage → complete) ─────────────────────

  async requestUpload(input: RequestUploadDto, uploaderId?: string): Promise<UploadTicketDto> {
    const accessLevel = input.accessLevel ?? this.defaultAccess(input.usageType);
    const assetRoot = `media/${input.usageType}/${randomUUID()}`;
    const storageKey = `${assetRoot}/original/${this.safeName(input.filename)}`;

    const record = await this.media.create({
      mediaType: input.mediaType,
      usageType: input.usageType,
      accessLevel,
      storageProvider: this.storage.name,
      storageBucket: this.storage.bucket || undefined,
      storageKey,
      cdnProvider: this.delivery.name,
      originalFilename: input.filename,
      mimeType: input.mimeType,
      fileSizeBytes: input.sizeBytes,
      uploadedBy: uploaderId,
      altText: input.altText,
    });

    const maxBytes = this.config.get<number>('MEDIA_MAX_UPLOAD_BYTES') ?? 10 * 1024 * 1024 * 1024;
    const upload = await this.storage.createUploadUrl({ key: storageKey, contentType: input.mimeType, maxBytes });
    return { mediaId: record.id, status: record.status, upload };
  }

  async completeUpload(id: string, input: CompleteUploadDto): Promise<MediaDto> {
    const record = await this.media.findById(id);
    if (!record) {
      throw new NotFoundException('Media not found');
    }
    if (record.status !== MediaStatus.PENDING && record.status !== MediaStatus.UPLOADED) {
      throw new BadRequestException(`Media is already ${record.status}`);
    }
    if (!record.storageKey) {
      throw new BadRequestException('Media has no storage key');
    }
    const head = await this.storage.headObject(record.storageKey);
    if (!head.exists) {
      throw new BadRequestException('No uploaded object found for this media — upload first');
    }

    const updated = await this.media.markUploaded(id, {
      fileSizeBytes: input.sizeBytes ?? head.size,
      checksum: input.checksum ?? head.etag,
      mimeType: head.contentType ?? record.mimeType ?? undefined,
    });
    const row = updated ?? record;

    if (record.mediaType === MediaType.VIDEO) {
      // Async hand-off to the worker (SQS); the worker owns the processing → ready
      // transitions. Returns status `uploaded` — poll /events or GET for progress.
      await this.queue.send(QueueName.MEDIA, JobName.TRANSCODE_VIDEO, { mediaId: id });
      return toMediaDto(row, null);
    }

    // Non-video → immediately servable; delivery prefix = the object key itself.
    const ready = (await this.media.markReady(id, { deliveryPrefix: row.storageKey ?? undefined, isHls: false })) ?? row;
    return toMediaDto(ready, this.resolveUrl(ready));
  }

  // ─── Read / serve ─────────────────────────────────────────────────────────────

  async getById(id: string): Promise<MediaDto> {
    const record = await this.requireRecord(id);
    return toMediaDto(record, this.resolveUrl(record));
  }

  /** Full status-by-status history of an asset (admin visibility / debugging). */
  async getEvents(id: string): Promise<MediaStatusEventDto[]> {
    await this.requireRecord(id);
    const events = await this.media.findEvents(id);
    return events.map((e) => ({ id: e.id, status: e.status, detail: e.detail, progress: e.progress, createdAt: e.createdAt }));
  }

  async getPlayback(id: string): Promise<PlaybackDto> {
    const record = await this.requireRecord(id);
    if (record.status !== MediaStatus.READY) {
      throw new BadRequestException(`Media is not ready (status: ${record.status})`);
    }
    const ttl = this.signedTtl;
    const isPublic = record.accessLevel === AccessLevel.PUBLIC;

    if (record.isHls && record.hlsMasterKey) {
      const url = this.delivery.publicUrl(record.hlsMasterKey);
      const cookies = isPublic ? {} : await this.delivery.signedCookies(record.deliveryPrefix ?? '', ttl);
      return { kind: 'hls', url, cookies, expiresInSeconds: ttl };
    }

    const key = record.storageKey ?? '';
    const url = isPublic ? this.delivery.publicUrl(key) : await this.delivery.signedUrl(key, ttl);
    return { kind: 'file', url, cookies: {}, expiresInSeconds: ttl };
  }

  async remove(id: string): Promise<void> {
    const removed = await this.media.softDelete(id);
    if (!removed) {
      throw new NotFoundException('Media not found');
    }
    const job: MediaCleanupJob = {
      mediaId: id,
      storageKey: removed.storageKey,
      deliveryPrefix: this.assetRoot(removed),
    };
    await this.queue.send(QueueName.MEDIA, JobName.MEDIA_CLEANUP, job);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private async requireRecord(id: string): Promise<MediaRecord> {
    const record = await this.media.findById(id);
    if (!record) {
      throw new NotFoundException('Media not found');
    }
    return record;
  }

  /** Ready PUBLIC assets get a direct URL; protected/private return null (use /playback). */
  private resolveUrl(record: MediaRecord): string | null {
    if (record.status !== MediaStatus.READY || record.accessLevel !== AccessLevel.PUBLIC) {
      return null;
    }
    const key = record.isHls ? record.hlsMasterKey : record.storageKey;
    return key ? this.delivery.publicUrl(key) : null;
  }

  private defaultAccess(usage: UsageType): AccessLevel {
    switch (usage) {
      case UsageType.CONTENT_VIDEO:
      case UsageType.CONTENT_TRAILER:
        return AccessLevel.PROTECTED;
      case UsageType.CONTENT_THUMBNAIL:
      case UsageType.AVATAR:
      case UsageType.STUDIO_LOGO:
      case UsageType.BANNER:
        return AccessLevel.PUBLIC;
      case UsageType.DOCUMENT:
        return AccessLevel.PRIVATE;
      default:
        return AccessLevel.PROTECTED;
    }
  }

  /** The asset's root prefix (everything under it: original + hls + poster). */
  private assetRoot(record: MediaRecord): string {
    if (record.storageKey) {
      return record.storageKey.replace(/\/original\/[^/]*$/, '/');
    }
    return record.deliveryPrefix ?? '';
  }

  private safeName(filename: string): string {
    const base = filename.split(/[\\/]/).pop() ?? 'file';
    return base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200) || 'file';
  }
}
