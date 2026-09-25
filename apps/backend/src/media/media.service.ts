import { EnvConfig } from '@config/env.config';
import { MediaRepository, MediaRecord } from '@db/repositories/media/media.repository';
import { BadRequestException, ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
import { UpdateMediaMetadataDto } from './dto/update-media-metadata.dto';
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
   * Client's "I finished PUTting to S3" confirmation. Jobs:
   *  1. Integrity — HEAD the object; 400 if the bytes never landed.
   *  2. Size — a presigned PUT can't cap Content-Length, so the landed size is checked against
   *     the size declared at request time (and MEDIA_MAX_UPLOAD_BYTES); oversize objects are
   *     deleted and the row FAILED. This is what actually enforces the customer 5 MB avatar cap.
   *  3. Non-video (images/docs) → READY synchronously. Videos stay UPLOADED; the transcoder
   *     Lambda (triggered by the same PUT's S3 event) owns UPLOADED → PROCESSING → READY.
   *
   * Race-safe with the Lambda: every transition is status-guarded in the repository, so
   * whichever side loses the race gets `null` and we simply return the current row. Calling
   * this after the Lambda already finished is an idempotent success, not an error.
   */
  async completeUpload(id: string, input: CompleteUploadDto, actor: AuthContext): Promise<MediaDto> {
    const record = await this.requireRecord(id);
    // Customers can only finalize their own uploads. Admins can finalize any.
    if (actor.accountType !== AccountType.ADMIN && record.uploadedBy !== actor.id) {
      throw new ForbiddenException('You cannot finalize this upload');
    }
    // Client-probed metadata fills empty columns only, whatever the status (idempotent).
    await this.media.fillProbe(id, {
      durationSeconds: input.durationSeconds,
      width: input.width,
      height: input.height,
    });
    if (record.status === MediaStatus.PROCESSING || record.status === MediaStatus.READY) {
      return this.currentDto(id); // Lambda got there first — idempotent
    }
    if (record.status !== MediaStatus.PENDING && record.status !== MediaStatus.UPLOADED) {
      throw new BadRequestException(`Media is ${record.status}`);
    }
    if (!record.storageKey) {
      throw new BadRequestException('Media has no storage key');
    }
    const head = await this.storage.headObject(record.storageKey);
    if (!head.exists) {
      throw new BadRequestException('No uploaded object found for this media — upload first');
    }

    const limit = this.maxAllowedBytes(record);
    if (head.size !== undefined && head.size > limit) {
      await this.storage.deleteObject(record.storageKey);
      await this.media.markFailed(id, `uploaded object is ${head.size} bytes, limit ${limit}`);
      throw new BadRequestException(`Uploaded file is larger than allowed (${head.size} > ${limit} bytes)`);
    }

    const uploaded = await this.media.markUploaded(id, {
      // The landed object is authoritative; the client's numbers are only a fallback.
      fileSizeBytes: head.size ?? input.sizeBytes,
      checksum: head.etag ?? input.checksum,
      mimeType: head.contentType ?? record.mimeType ?? undefined,
    });
    if (!uploaded) {
      return this.currentDto(id); // lost the race to the Lambda
    }

    if (uploaded.mediaType === MediaType.VIDEO) {
      return toMediaDto(uploaded, null); // Lambda finalizes; client polls GET /:id
    }

    // Non-video: no transcode — the original object is the deliverable.
    const ready = await this.media.markReady(id, { deliveryPrefix: uploaded.storageKey ?? undefined, isHls: false });
    return ready ? toMediaDto(ready, this.resolveUrl(ready)) : this.currentDto(id);
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

  /** Batch-resolve direct URLs (ready + public only; others map to null). Used for list thumbnails. */
  async publicUrls(ids: string[]): Promise<Map<string, string | null>> {
    const unique = [...new Set(ids)];
    const records = await this.media.findByIds(unique);
    return new Map(records.map((r) => [r.id, this.resolveUrl(r)]));
  }

  /** Key of the poster frame the transcoder writes next to the HLS output, if the video is ready. */
  private posterKey(video: MediaRecord): string | null {
    if (video.status !== MediaStatus.READY || !video.isHls || !video.deliveryPrefix) {
      return null;
    }
    const prefix = video.deliveryPrefix.endsWith('/') ? video.deliveryPrefix : `${video.deliveryPrefix}/`;
    return `${prefix}poster.jpg`;
  }

  /** Short-lived URL to preview the transcoder poster of a video (admin thumbnail picker). */
  async posterPreviewUrl(videoMediaId: string): Promise<string | null> {
    const video = await this.media.findById(videoMediaId);
    const key = video ? this.posterKey(video) : null;
    return key ? this.delivery.signedUrl(key, this.signedTtl) : null;
  }

  /**
   * Register the transcoder poster of a video as its own public image media row, so it can be
   * used as a content thumbnail. Returns the new media id.
   */
  async registerPosterAsThumbnail(videoMediaId: string, actorId: string): Promise<MediaDto> {
    const video = await this.requireRecord(videoMediaId);
    const key = this.posterKey(video);
    if (!key) {
      throw new BadRequestException('Video has no transcoder poster yet (must be a ready HLS video)');
    }
    const created = await this.media.create({
      mediaType: MediaType.IMAGE,
      usageType: UsageType.CONTENT_THUMBNAIL,
      accessLevel: AccessLevel.PUBLIC,
      storageProvider: this.storage.name,
      storageBucket: this.config.get<string>('MEDIA_OUTPUT_BUCKET') || undefined,
      storageKey: key,
      cdnProvider: this.delivery.name,
      originalFilename: 'poster.jpg',
      mimeType: 'image/jpeg',
      uploadedBy: actorId,
      metadata: { derivedFrom: videoMediaId, kind: 'transcoder_poster' },
    });
    const ready = await this.media.markReady(created.id, { deliveryPrefix: key, isHls: false });
    const record = ready ?? created;
    return toMediaDto(record, this.resolveUrl(record));
  }

  /** Batch lookup of media rows (content enrichment: video dimensions, statuses). */
  async findRecords(ids: string[]): Promise<Map<string, MediaRecord>> {
    const records = await this.media.findByIds([...new Set(ids)]);
    return new Map(records.map((r) => [r.id, r]));
  }

  /** Public URL of a ready public media (null otherwise). */
  urlOf(record: MediaRecord): string | null {
    return this.resolveUrl(record);
  }

  /** Admin override of duration / resolution / alt text. */
  async updateMetadata(id: string, dto: UpdateMediaMetadataDto): Promise<MediaDto> {
    const updated = await this.media.updateMetadata(id, {
      durationSeconds: dto.durationSeconds,
      width: dto.width,
      height: dto.height,
      altText: dto.altText,
    });
    if (!updated) {
      throw new NotFoundException('Media not found');
    }
    return toMediaDto(updated, this.resolveUrl(updated));
  }

  /**
   * Playback via the media id (`GET /v1/media/:id/playback`). Admins: any media. Everyone else is
   * refused for content videos — those must go through `GET /v1/content/:id/playback`, which
   * enforces publish state, availability and exclusive unlocks.
   */
  async getPlaybackFor(id: string, actor: AuthContext): Promise<PlaybackDto> {
    if (actor.accountType !== AccountType.ADMIN) {
      const record = await this.requireRecord(id);
      const contentUsage = record.usageType === UsageType.CONTENT_VIDEO || record.usageType === UsageType.CONTENT_TRAILER;
      if (contentUsage || (await this.media.isContentVideo(id))) {
        throw new ForbiddenException('Content videos must be played via GET /v1/content/:id/playback');
      }
    }
    return this.getPlayback(id);
  }

  /** Signed playback descriptor — NO access checks (callers enforce entitlement). */
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
   * Fail rows stuck in PROCESSING for > MEDIA_TRANSCODE_STUCK_SECONDS (default 15 min).
   *
   * The Lambda's SQS retries re-claim a PROCESSING row with the same message id, so a row is
   * only "stuck" when every retry died without finishing (e.g. timeouts, or the message went
   * to the DLQ). Raise the threshold when a long-running transcoder (MediaConvert) is wired in.
   * `markFailed` never overwrites READY, so racing a Lambda that just finished is safe.
   */
  async reconcileStuck(): Promise<void> {
    const stuckSeconds = this.config.get<number>('MEDIA_TRANSCODE_STUCK_SECONDS') ?? 900;
    const rows = await this.media.findStuckProcessing(stuckSeconds, 50);
    let failed = 0;
    for (const row of rows) {
      if (await this.media.markFailed(row.id, `transcode stalled — no progress for ${stuckSeconds}s`)) {
        failed++;
        this.logger.warn(`reconcile: failed stuck media ${row.id}`);
      }
    }
    if (failed > 0) {
      this.logger.log(`reconcile: failed ${failed} stuck-processing row(s)`);
    }
  }

  /**
   * Clean up rows stuck in PENDING for > MEDIA_ORPHAN_AGE_SECONDS (default 24 h) — the
   * client asked for an upload URL and never PUT. If bytes DID land (the S3 event was lost or
   * its processing failed), the file is kept and the row FAILED for ops to re-trigger, rather
   * than destroying a real upload.
   */
  async sweepOrphans(): Promise<void> {
    const ageSeconds = this.config.get<number>('MEDIA_ORPHAN_AGE_SECONDS') ?? 86_400;
    const orphans = await this.media.findStalePending(ageSeconds, 100);
    let purged = 0;
    for (const row of orphans) {
      const head = row.storageKey ? await this.storage.headObject(row.storageKey) : { exists: false };
      if (head.exists) {
        await this.media.markFailed(row.id, 'upload landed but was never processed — re-trigger transcode');
        this.logger.warn(`orphan-sweep: media ${row.id} has bytes but no processing — marked failed, file kept`);
        continue;
      }
      await this.media.softDelete(row.id);
      const assetRoot = this.assetRoot(row);
      if (assetRoot) {
        await this.storage.deletePrefix(assetRoot);
      }
      purged++;
    }
    if (purged > 0) {
      this.logger.log(`orphan-sweep: purged ${purged} stale-pending row(s)`);
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private async currentDto(id: string): Promise<MediaDto> {
    const current = await this.requireRecord(id);
    return toMediaDto(current, this.resolveUrl(current));
  }

  /** Upload cap for a row: the size declared at request time, bounded by MEDIA_MAX_UPLOAD_BYTES. */
  private maxAllowedBytes(record: MediaRecord): number {
    const globalMax = this.config.get<number>('MEDIA_MAX_UPLOAD_BYTES') ?? 10 * 1024 * 1024 * 1024;
    return record.fileSizeBytes !== null ? Math.min(record.fileSizeBytes, globalMax) : globalMax;
  }

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
