import { EnvConfig } from '@config/env.config';
import { MediaRepository, MediaRecord } from '@db/repositories/media/media.repository';
import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException ,Logger } from '@nestjs/common';
import { AuthContext } from '@auth/interfaces/auth-context.interface';
import { AccountType } from '@auth/interfaces/jwt-payload.interface';
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

/**
 * Media service — the API-side of the pipeline. Responsibilities:
 *  1. Create the media_metadata row + hand back a presigned S3 PUT URL (client upload)
 *  2. Read: metadata, event history, playback descriptor
 *  3. Soft-delete (also purges S3 storage inline)
 *
 * Transcoding is OUT OF PROCESS. When the client PUTs to S3, S3 fires an ObjectCreated
 * notification into the `media-source-events` SQS queue, which triggers the transcoder
 * Lambda (see docker/dummy-transcoder/ + infra/floci/lambda.tf). The Lambda writes HLS
 * output back to S3 and updates the media_metadata row directly via `pg`. This NestJS
 * process is never in the transcode path.
 */
@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly media: MediaRepository,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    @Inject(MEDIA_DELIVERY_PROVIDER) private readonly delivery: MediaDeliveryProvider,
    private readonly config: ConfigService<EnvConfig>,
  ) {}

  private get signedTtl(): number {
    return this.config.get<number>('MEDIA_SIGNED_URL_TTL') ?? 900;
  }

  // ─── Upload (request → client PUTs to S3 → Lambda triggered by S3 event) ─────

  /** Customers may only upload avatars (image ≤ 5 MB). Admins are unrestricted.
   *  Enforced here (not in a guard) so both the API-shape check and the account-type
   *  policy live next to each other and can't drift. */
  private static readonly CUSTOMER_AVATAR_MAX_BYTES = 5 * 1024 * 1024;
  private assertUploadAllowed(input: RequestUploadDto, actor: AuthContext): void {
    if (actor.accountType === AccountType.ADMIN) {
      return;
    }
    if (input.usageType !== UsageType.AVATAR) {
      throw new ForbiddenException('Only avatar uploads are permitted');
    }
    if (input.mediaType !== MediaType.IMAGE || !input.mimeType.startsWith('image/')) {
      throw new BadRequestException('Avatar must be an image');
    }
    if (input.sizeBytes > MediaService.CUSTOMER_AVATAR_MAX_BYTES) {
      throw new BadRequestException('Avatar must be ≤ 5 MB');
    }
  }

  async requestUpload(input: RequestUploadDto, actor: AuthContext): Promise<UploadTicketDto> {
    this.assertUploadAllowed(input, actor);
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
      uploadedBy: actor.id,
      altText: input.altText,
    });

    const maxBytes = this.config.get<number>('MEDIA_MAX_UPLOAD_BYTES') ?? 10 * 1024 * 1024 * 1024;
    const upload = await this.storage.createUploadUrl({ key: storageKey, contentType: input.mimeType, maxBytes });
    return { mediaId: record.id, status: record.status, upload };
  }

  /**
   * Client's "I finished PUTting to S3" confirmation. Two jobs:
   *  1. Explicit integrity check — HEAD the S3 object; 400 if the bytes never actually landed
   *     (client-side error is caught HERE instead of silently by a stuck-pending sweep)
   *  2. For NON-VIDEO uploads (images/docs), synchronously flip to READY so `GET /playback`
   *     works immediately. Videos still need the async Lambda transcode → stay UPLOADED
   *
   * Idempotent w.r.t. the S3-event Lambda path: for videos, both this endpoint and the
   * Lambda try to move the row from PENDING → UPLOADED / → READY. Whichever wins first, the
   * other is a no-op (Lambda's `WHERE status IN (pending, uploaded)` guard, and this endpoint's
   * `if status !== PENDING && !== UPLOADED` guard).
   *
   * This is OPTIONAL for clients — a client that walks away after the PUT will still see the
   * row go READY once the Lambda-via-S3-event fires. But calling it gives faster feedback and
   * catches PUT failures at the API boundary.
   */
  async completeUpload(id: string, input: CompleteUploadDto, actor: AuthContext): Promise<MediaDto> {
    const record = await this.media.findById(id);
    if (!record) {
      throw new NotFoundException('Media not found');
    }
    // Customers can only finalize their own uploads. Admins can finalize any.
    if (actor.accountType !== AccountType.ADMIN && record.uploadedBy !== actor.id) {
      throw new ForbiddenException('You cannot finalize this upload');
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
      // Videos: don't finalize here. The transcoder Lambda (SQS-triggered by the S3
      // ObjectCreated event that fired when the client PUT completed) owns the
      // UPLOADED → PROCESSING → READY transitions. Return the current row unchanged
      // so the client can poll.
      return toMediaDto(row, null);
    }

    // Non-video (images, docs) — no transcode needed, flip straight to READY here so the
    // Lambda's later invocation short-circuits on its `status IN (pending, uploaded)` guard.
    // `delivery_prefix` = the object key itself (there's no separate HLS output layout).
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

  /**
   * Soft-delete the row and purge every storage object under its asset root (original +
   * HLS outputs + poster). Runs inline — cheap because deletePrefix batches DELETEs.
   * If your storage grows to millions of objects per asset (unlikely), move this to a
   * cleanup Lambda triggered off a "media-deleted" SQS message instead.
   */
  async remove(id: string): Promise<void> {
    const removed = await this.media.softDelete(id);
    if (!removed) {
      throw new NotFoundException('Media not found');
    }
    const assetRoot = this.assetRoot(removed);
    if (assetRoot) {
      await this.storage.deletePrefix(assetRoot);
    }
  }

  // ─── Maintenance crons (invoked by CronScheduler in the worker) ──────────────

  /**
   * Safety net for rows stuck in PROCESSING. Runs every 10 minutes (see cron.scheduler.ts).
   *
   * In v1 the worker's poll chain could break (lost message, DLQ'd poll, crash) and leave a
   * row stuck. In v2 the transcoder Lambda's SQS event source mapping retries + DLQs on its
   * own, but a Lambda that succeeds at half of its work (wrote HLS but failed the DB UPDATE)
   * still leaves a row stuck in PROCESSING. This cron catches those.
   *
   * Behaviour: rows in PROCESSING for > MEDIA_TRANSCODE_MAX_SECONDS (default 6h) are marked
   * FAILED. Under the new architecture there's nothing to "resume" — the Lambda already
   * retried up to its DLQ threshold — so we just fail loud and let ops surface it.
   */
  async reconcileStuck(): Promise<void> {
    const maxSeconds = this.config.get<number>('MEDIA_TRANSCODE_MAX_SECONDS') ?? 21_600;
    const rows = await this.media.findStuckProcessing(maxSeconds, 50);
    for (const row of rows) {
      await this.media.markFailed(row.id, 'transcode stalled — exceeded max processing time');
      this.logger.warn(`reconcile: failed stuck media ${row.id}`);
    }
    if (rows.length > 0) {
      this.logger.log(`reconcile: failed ${rows.length} stuck-processing row(s)`);
    }
  }

  /**
   * Delete rows stuck in PENDING (never got the client's PUT / never got the S3 event).
   * Runs hourly. Any row created > MEDIA_ORPHAN_AGE_SECONDS ago (default 24 h) that's still
   * PENDING gets soft-deleted + storage-purged (in case a partial upload landed).
   */
  async sweepOrphans(): Promise<void> {
    const ageSeconds = this.config.get<number>('MEDIA_ORPHAN_AGE_SECONDS') ?? 86_400;
    const orphans = await this.media.findStalePending(ageSeconds, 100);
    for (const row of orphans) {
      await this.media.softDelete(row.id);
      const assetRoot = this.assetRoot(row);
      if (assetRoot) {
        await this.storage.deletePrefix(assetRoot);
      }
    }
    if (orphans.length > 0) {
      this.logger.log(`orphan-sweep: purged ${orphans.length} stale-pending row(s)`);
    }
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
