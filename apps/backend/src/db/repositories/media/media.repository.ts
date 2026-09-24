import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { mediaMetadata, mediaStatusEvents } from '@db/drizzle/schema';
import { and, asc, eq, inArray, isNull, lt, notInArray, sql } from 'drizzle-orm';
import { AccessLevel, MediaStatus, MediaType, UsageType } from '@media/constants/media.constant';

/** A row of `media_metadata` as used by the media layer. */
export interface MediaRecord {
  id: string;
  mediaType: MediaType;
  usageType: UsageType;
  accessLevel: AccessLevel;
  status: MediaStatus;
  storageProvider: string;
  storageBucket: string | null;
  storageKey: string | null;
  storageRegion: string | null;
  cdnProvider: string | null;
  deliveryPrefix: string | null;
  originalFilename: string | null;
  mimeType: string | null;
  fileSizeBytes: number | null;
  checksum: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: string | null;
  isHls: boolean;
  hlsMasterKey: string | null;
  posterMediaId: string | null;
  processingProvider: string | null;
  processingJobId: string | null;
  processingProgress: number | null;
  processingError: string | null;
  uploadedBy: string | null;
  altText: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMediaInput {
  mediaType: MediaType;
  usageType: UsageType;
  accessLevel: AccessLevel;
  storageProvider: string;
  storageBucket?: string | undefined;
  storageKey: string;
  storageRegion?: string | undefined;
  cdnProvider?: string | undefined;
  originalFilename?: string | undefined;
  mimeType?: string | undefined;
  fileSizeBytes?: number | undefined;
  uploadedBy?: string | undefined;
  altText?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

/** One lifecycle transition (append-only audit). */
export interface MediaStatusEvent {
  id: string;
  status: MediaStatus;
  detail: string | null;
  progress: number | null;
  createdAt: string;
}

@Injectable()
export class MediaRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Run `fn` in the caller's transaction, or open one — keeps a transition + its audit event atomic. */
  private inTx<T>(tx: DBExecutor | undefined, fn: (tx: DBExecutor) => Promise<T>): Promise<T> {
    return tx ? fn(tx) : this.dbService.transaction(fn);
  }

  /** Append a status-transition event (same executor → atomic with the transition). */
  async logEvent(
    mediaId: string,
    status: MediaStatus,
    detail?: string | undefined,
    progress?: number | undefined,
    tx?: DBExecutor,
  ): Promise<void> {
    await this.exec(tx)
      .insert(mediaStatusEvents)
      .values({
        mediaId,
        status,
        ...(detail ? { detail: detail.slice(0, 500) } : {}),
        ...(progress !== undefined ? { progress } : {}),
      });
  }

  async findEvents(mediaId: string, tx?: DBExecutor): Promise<MediaStatusEvent[]> {
    const rows = await this.exec(tx)
      .select()
      .from(mediaStatusEvents)
      .where(eq(mediaStatusEvents.mediaId, mediaId))
      .orderBy(asc(mediaStatusEvents.createdAt));
    return rows.map((r) => ({
      id: r.id,
      status: r.status as MediaStatus,
      detail: r.detail,
      progress: r.progress,
      createdAt: r.createdAt,
    }));
  }

  async create(input: CreateMediaInput, tx?: DBExecutor): Promise<MediaRecord> {
    const rows = await this.exec(tx)
      .insert(mediaMetadata)
      .values({
        mediaType: input.mediaType,
        usageType: input.usageType,
        accessLevel: input.accessLevel,
        status: MediaStatus.PENDING,
        storageProvider: input.storageProvider,
        ...(input.storageBucket ? { storageBucket: input.storageBucket } : {}),
        storageKey: input.storageKey,
        ...(input.storageRegion ? { storageRegion: input.storageRegion } : {}),
        ...(input.cdnProvider ? { cdnProvider: input.cdnProvider } : {}),
        ...(input.originalFilename ? { originalFilename: input.originalFilename } : {}),
        ...(input.mimeType ? { mimeType: input.mimeType } : {}),
        ...(input.fileSizeBytes !== undefined ? { fileSizeBytes: input.fileSizeBytes } : {}),
        ...(input.uploadedBy ? { uploadedBy: input.uploadedBy } : {}),
        ...(input.altText ? { altText: input.altText } : {}),
        ...(input.metadata ? { metadata: input.metadata } : {}),
      })
      .returning();
    const record = this.map(rows[0])!;
    await this.logEvent(record.id, MediaStatus.PENDING, 'upload requested', undefined, tx);
    return record;
  }

  async findById(id: string, tx?: DBExecutor): Promise<MediaRecord | null> {
    const rows = await this.exec(tx)
      .select()
      .from(mediaMetadata)
      .where(and(eq(mediaMetadata.id, id), isNull(mediaMetadata.deletedAt)));
    return this.map(rows[0]);
  }

  /**
   * PENDING/UPLOADED → UPLOADED (bytes verified in storage). Status-guarded: returns `null`
   * when the row has already moved on (e.g. the transcoder Lambda finished first), so a late
   * `/complete` can never regress READY back to UPLOADED.
   */
  async markUploaded(
    id: string,
    data: { fileSizeBytes?: number | undefined; checksum?: string | undefined; mimeType?: string | undefined },
    tx?: DBExecutor,
  ): Promise<MediaRecord | null> {
    return this.inTx(tx, async (t) => {
      const updated = await t
        .update(mediaMetadata)
        .set({
          status: MediaStatus.UPLOADED,
          uploadCompletedAt: sql`now()`,
          ...(data.fileSizeBytes !== undefined ? { fileSizeBytes: data.fileSizeBytes } : {}),
          ...(data.checksum ? { checksum: data.checksum } : {}),
          ...(data.mimeType ? { mimeType: data.mimeType } : {}),
          updatedAt: sql`now()`,
        })
        .where(
          and(
            eq(mediaMetadata.id, id),
            isNull(mediaMetadata.deletedAt),
            inArray(mediaMetadata.status, [MediaStatus.PENDING, MediaStatus.UPLOADED]),
          ),
        )
        .returning({ id: mediaMetadata.id });
      if (updated.length === 0) {
        return null;
      }
      await this.logEvent(id, MediaStatus.UPLOADED, 'object verified in storage', undefined, t);
      return this.findById(id, t);
    });
  }

  async markProcessing(id: string, data: { provider: string; jobId: string }, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .update(mediaMetadata)
      .set({
        status: MediaStatus.PROCESSING,
        processingProvider: data.provider,
        processingJobId: data.jobId,
        processingProgress: 0,
        updatedAt: sql`now()`,
      })
      .where(eq(mediaMetadata.id, id));
    await this.logEvent(id, MediaStatus.PROCESSING, data.jobId ? `transcode job ${data.jobId}` : 'transcode queued', 0, tx);
  }

  /** Record a live transcode progress update (no status change). */
  async updateProgress(id: string, progress: number, detail?: string | undefined, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .update(mediaMetadata)
      .set({ processingProgress: progress, updatedAt: sql`now()` })
      .where(eq(mediaMetadata.id, id));
    await this.logEvent(id, MediaStatus.PROCESSING, detail ?? `transcoding ${progress}%`, progress, tx);
  }

  /**
   * → READY. Status-guarded (only from PENDING/UPLOADED/PROCESSING, never on a deleted row):
   * returns `null` when the transition didn't happen.
   */
  async markReady(
    id: string,
    data: {
      hlsMasterKey?: string | undefined;
      deliveryPrefix?: string | undefined;
      isHls?: boolean | undefined;
      width?: number | undefined;
      height?: number | undefined;
      durationSeconds?: string | undefined;
    },
    tx?: DBExecutor,
  ): Promise<MediaRecord | null> {
    return this.inTx(tx, async (t) => {
      const updated = await t
        .update(mediaMetadata)
        .set({
          status: MediaStatus.READY,
          processedAt: sql`now()`,
          ...(data.hlsMasterKey ? { hlsMasterKey: data.hlsMasterKey } : {}),
          ...(data.deliveryPrefix ? { deliveryPrefix: data.deliveryPrefix } : {}),
          ...(data.isHls !== undefined ? { isHls: data.isHls } : {}),
          ...(data.width !== undefined ? { width: data.width } : {}),
          ...(data.height !== undefined ? { height: data.height } : {}),
          ...(data.durationSeconds ? { durationSeconds: data.durationSeconds } : {}),
          processingProgress: 100,
          updatedAt: sql`now()`,
        })
        .where(
          and(
            eq(mediaMetadata.id, id),
            isNull(mediaMetadata.deletedAt),
            inArray(mediaMetadata.status, [MediaStatus.PENDING, MediaStatus.UPLOADED, MediaStatus.PROCESSING]),
          ),
        )
        .returning({ id: mediaMetadata.id });
      if (updated.length === 0) {
        return null;
      }
      await this.logEvent(id, MediaStatus.READY, 'asset ready', 100, t);
      return this.findById(id, t);
    });
  }

  /**
   * → FAILED. Never overwrites a READY/ARCHIVED row or touches a deleted one (a slow
   * reconcile tick racing a Lambda that just finished must not fail a good asset).
   * Returns whether the transition happened.
   */
  async markFailed(id: string, error: string, tx?: DBExecutor): Promise<boolean> {
    return this.inTx(tx, async (t) => {
      const updated = await t
        .update(mediaMetadata)
        .set({ status: MediaStatus.FAILED, processingError: error.slice(0, 2000), updatedAt: sql`now()` })
        .where(
          and(
            eq(mediaMetadata.id, id),
            isNull(mediaMetadata.deletedAt),
            notInArray(mediaMetadata.status, [MediaStatus.READY, MediaStatus.ARCHIVED, MediaStatus.FAILED]),
          ),
        )
        .returning({ id: mediaMetadata.id });
      if (updated.length === 0) {
        return false;
      }
      await this.logEvent(id, MediaStatus.FAILED, error.slice(0, 500), undefined, t);
      return true;
    });
  }

  async setDeliveryPrefix(id: string, deliveryPrefix: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .update(mediaMetadata)
      .set({ deliveryPrefix, updatedAt: sql`now()` })
      .where(eq(mediaMetadata.id, id));
  }

  async setPoster(videoId: string, posterMediaId: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .update(mediaMetadata)
      .set({ posterMediaId, updatedAt: sql`now()` })
      .where(eq(mediaMetadata.id, videoId));
  }

  /** Soft-delete + return the storage coordinates so the caller can enqueue cleanup. */
  async softDelete(id: string, tx?: DBExecutor): Promise<MediaRecord | null> {
    const existing = await this.findById(id, tx);
    if (!existing) {
      return null;
    }
    await this.inTx(tx, async (t) => {
      await t
        .update(mediaMetadata)
        .set({ status: MediaStatus.ARCHIVED, deletedAt: sql`now()`, updatedAt: sql`now()` })
        .where(and(eq(mediaMetadata.id, id), isNull(mediaMetadata.deletedAt)));
      await this.logEvent(id, MediaStatus.ARCHIVED, 'soft-deleted; storage purged', undefined, t);
    });
    return existing;
  }

  /** `processing` rows with no update for `stuckSeconds` (transcoder died mid-job). */
  async findStuckProcessing(stuckSeconds: number, limit: number): Promise<MediaRecord[]> {
    const rows = await this.dbService.db
      .select()
      .from(mediaMetadata)
      .where(
        and(
          eq(mediaMetadata.status, MediaStatus.PROCESSING),
          isNull(mediaMetadata.deletedAt),
          lt(mediaMetadata.updatedAt, sql`now() - (${stuckSeconds} || ' seconds')::interval`),
        ),
      )
      .limit(limit);
    return rows.map((r) => this.map(r)!).filter(Boolean);
  }

  /** Stale `pending` rows whose upload never completed (orphan-sweep cron). */
  async findStalePending(olderThanSeconds: number, limit: number): Promise<MediaRecord[]> {
    const rows = await this.dbService.db
      .select()
      .from(mediaMetadata)
      .where(
        and(
          eq(mediaMetadata.status, MediaStatus.PENDING),
          isNull(mediaMetadata.deletedAt),
          lt(mediaMetadata.createdAt, sql`now() - (${olderThanSeconds} || ' seconds')::interval`),
        ),
      )
      .limit(limit);
    return rows.map((r) => this.map(r)!).filter(Boolean);
  }

  private map(row: typeof mediaMetadata.$inferSelect | undefined): MediaRecord | null {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      mediaType: row.mediaType as MediaType,
      usageType: row.usageType as UsageType,
      accessLevel: row.accessLevel as AccessLevel,
      status: row.status as MediaStatus,
      storageProvider: row.storageProvider,
      storageBucket: row.storageBucket,
      storageKey: row.storageKey,
      storageRegion: row.storageRegion,
      cdnProvider: row.cdnProvider,
      deliveryPrefix: row.deliveryPrefix,
      originalFilename: row.originalFilename,
      mimeType: row.mimeType,
      fileSizeBytes: row.fileSizeBytes,
      checksum: row.checksum,
      width: row.width,
      height: row.height,
      durationSeconds: row.durationSeconds,
      isHls: row.isHls,
      hlsMasterKey: row.hlsMasterKey,
      posterMediaId: row.posterMediaId,
      processingProvider: row.processingProvider,
      processingJobId: row.processingJobId,
      processingProgress: row.processingProgress,
      processingError: row.processingError,
      uploadedBy: row.uploadedBy,
      altText: row.altText,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
