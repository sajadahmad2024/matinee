import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { contents, contentRegions, contentCast, people } from '@db/drizzle/schema';
import { and, asc, desc, eq, exists, ilike, inArray, isNull, or, sql } from 'drizzle-orm';

export type ContentStatus =
  | 'draft'
  | 'pending_approval'
  | 'scheduled'
  | 'published'
  | 'rejected'
  | 'archived';

/** A row of `contents` (camel-cased to the Drizzle schema). */
export interface ContentRecord {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  contentType: string;
  accessTier: string;
  unlockPoints: number | null;
  studioId: string | null;
  videoMediaId: string | null;
  thumbnailMediaId: string | null;
  durationSeconds: number | null;
  language: string | null;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  isBoosted: boolean;
  boostPriority: number;
  recommendation: string;
  isSponsored: boolean;
  isAdCommercial: boolean;
  rightsRegion: string;
  parentContentId: string | null;
  licenseStatus: string;
  licenseExpiresAt: string | null;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  shareCount: number;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentInput {
  title: string;
  slug: string;
  description?: string | undefined;
  contentType?: string | undefined;
  accessTier?: string | undefined;
  unlockPoints?: number | undefined;
  studioId?: string | undefined;
  videoMediaId?: string | undefined;
  thumbnailMediaId?: string | undefined;
  language?: string | undefined;
  rightsRegion?: string | undefined;
  parentContentId?: string | undefined;
  createdBy?: string | undefined;
}

export type UpdateContentInput = Partial<
  Pick<
    CreateContentInput,
    | 'title'
    | 'description'
    | 'contentType'
    | 'accessTier'
    | 'unlockPoints'
    | 'studioId'
    | 'videoMediaId'
    | 'thumbnailMediaId'
    | 'language'
    | 'rightsRegion'
    | 'parentContentId'
  >
> & { recommendation?: string | undefined; updatedBy?: string | undefined };

/** One cast/crew credit on a content (joined to the person record). */
export interface CastMember {
  personId: string;
  name: string;
  slug: string;
  photoMediaId: string | null;
  role: string;
  characterName: string | null;
  billingOrder: number;
}

export interface CastInput {
  personId: string;
  role?: string | undefined;
  characterName?: string | undefined;
  billingOrder?: number | undefined;
}

export interface ContentListFilters {
  status?: string | undefined;
  contentType?: string | undefined;
  studioId?: string | undefined;
  q?: string | undefined;
  page: number;
  limit: number;
}

export interface FeedFilters {
  region?: string | undefined; // macro-region code; undefined = all
  page: number;
  limit: number;
}

@Injectable()
export class ContentRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  private map(row: typeof contents.$inferSelect): ContentRecord {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      contentType: row.contentType,
      accessTier: row.accessTier,
      unlockPoints: row.unlockPoints,
      studioId: row.studioId,
      videoMediaId: row.videoMediaId,
      thumbnailMediaId: row.thumbnailMediaId,
      durationSeconds: row.durationSeconds,
      language: row.language,
      status: row.status,
      scheduledAt: row.scheduledAt,
      publishedAt: row.publishedAt,
      isBoosted: row.isBoosted,
      boostPriority: row.boostPriority,
      recommendation: row.recommendation,
      isSponsored: row.isSponsored,
      isAdCommercial: row.isAdCommercial,
      rightsRegion: row.rightsRegion,
      parentContentId: row.parentContentId,
      licenseStatus: row.licenseStatus,
      licenseExpiresAt: row.licenseExpiresAt,
      viewCount: row.viewCount,
      likeCount: row.likeCount,
      dislikeCount: row.dislikeCount,
      commentCount: row.commentCount,
      shareCount: row.shareCount,
      rejectionReason: row.rejectionReason,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async create(input: CreateContentInput, tx?: DBExecutor): Promise<ContentRecord> {
    const rows = await this.exec(tx)
      .insert(contents)
      .values({
        title: input.title,
        slug: input.slug,
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.contentType ? { contentType: input.contentType } : {}),
        ...(input.accessTier ? { accessTier: input.accessTier } : {}),
        ...(input.unlockPoints !== undefined ? { unlockPoints: input.unlockPoints } : {}),
        ...(input.studioId ? { studioId: input.studioId } : {}),
        ...(input.videoMediaId ? { videoMediaId: input.videoMediaId } : {}),
        ...(input.thumbnailMediaId ? { thumbnailMediaId: input.thumbnailMediaId } : {}),
        ...(input.language ? { language: input.language } : {}),
        ...(input.rightsRegion ? { rightsRegion: input.rightsRegion } : {}),
        ...(input.parentContentId ? { parentContentId: input.parentContentId } : {}),
        ...(input.createdBy ? { createdBy: input.createdBy } : {}),
      })
      .returning();
    return this.map(rows[0]!);
  }

  async findById(id: string, tx?: DBExecutor): Promise<ContentRecord | null> {
    const rows = await this.exec(tx)
      .select()
      .from(contents)
      .where(and(eq(contents.id, id), isNull(contents.deletedAt)))
      .limit(1);
    return rows[0] ? this.map(rows[0]) : null;
  }

  /**
   * Batch-fetch published, non-deleted content by id (e.g. hydrating a watchlist).
   * Unpublished / deleted ids are silently dropped. Caller decides ordering.
   */
  async findPublishedByIds(ids: string[], tx?: DBExecutor): Promise<ContentRecord[]> {
    if (ids.length === 0) {
      return [];
    }
    const rows = await this.exec(tx)
      .select()
      .from(contents)
      .where(and(inArray(contents.id, ids), eq(contents.status, 'published'), isNull(contents.deletedAt)));
    return rows.map((r) => this.map(r));
  }

  /** Admin directory — filterable, paginated, newest first. */
  async list(filters: ContentListFilters, tx?: DBExecutor): Promise<{ items: ContentRecord[]; total: number }> {
    const where = and(
      isNull(contents.deletedAt),
      filters.status ? eq(contents.status, filters.status) : undefined,
      filters.contentType ? eq(contents.contentType, filters.contentType) : undefined,
      filters.studioId ? eq(contents.studioId, filters.studioId) : undefined,
      filters.q ? ilike(contents.title, `%${filters.q}%`) : undefined,
    );
    const db = this.exec(tx);
    const [items, totalRow] = await Promise.all([
      db
        .select()
        .from(contents)
        .where(where)
        .orderBy(desc(contents.createdAt))
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit),
      db.select({ n: sql<number>`count(*)::int` }).from(contents).where(where),
    ]);
    return { items: items.map((r) => this.map(r)), total: totalRow[0]?.n ?? 0 };
  }

  /** Customer feed — published, region-available, boosted first then newest. */
  async feed(filters: FeedFilters, tx?: DBExecutor): Promise<{ items: ContentRecord[]; total: number }> {
    const regionAvailable = filters.region
      ? or(
          eq(contents.rightsRegion, 'global'),
          exists(
            this.dbService.db
              .select({ one: sql`1` })
              .from(contentRegions)
              .where(and(eq(contentRegions.contentId, contents.id), eq(contentRegions.region, filters.region))),
          ),
        )
      : undefined;
    const where = and(isNull(contents.deletedAt), eq(contents.status, 'published'), regionAvailable);
    const db = this.exec(tx);
    const [items, totalRow] = await Promise.all([
      db
        .select()
        .from(contents)
        .where(where)
        .orderBy(desc(contents.boostPriority), desc(contents.publishedAt))
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit),
      db.select({ n: sql<number>`count(*)::int` }).from(contents).where(where),
    ]);
    return { items: items.map((r) => this.map(r)), total: totalRow[0]?.n ?? 0 };
  }

  async update(id: string, patch: UpdateContentInput, tx?: DBExecutor): Promise<ContentRecord | null> {
    const rows = await this.exec(tx)
      .update(contents)
      .set({ ...patch, updatedAt: sql`now()` })
      .where(and(eq(contents.id, id), isNull(contents.deletedAt)))
      .returning();
    return rows[0] ? this.map(rows[0]) : null;
  }

  /** Status transition (publish / reject / archive / schedule) with the relevant audit fields. */
  async setStatus(
    id: string,
    status: ContentStatus,
    extra: {
      publishedAt?: boolean;
      scheduledAt?: string;
      approvedBy?: string;
      rejectionReason?: string;
    } = {},
    tx?: DBExecutor,
  ): Promise<ContentRecord | null> {
    const rows = await this.exec(tx)
      .update(contents)
      .set({
        status,
        updatedAt: sql`now()`,
        ...(extra.publishedAt ? { publishedAt: sql`now()` } : {}),
        ...(extra.scheduledAt ? { scheduledAt: extra.scheduledAt } : {}),
        ...(extra.approvedBy ? { approvedBy: extra.approvedBy, approvedAt: sql`now()` } : {}),
        ...(extra.rejectionReason ? { rejectionReason: extra.rejectionReason } : {}),
      })
      .where(and(eq(contents.id, id), isNull(contents.deletedAt)))
      .returning();
    return rows[0] ? this.map(rows[0]) : null;
  }

  /** Boost (or un-boost) content in the feed. priority orders boosted items; until = auto-expire. */
  async setBoost(id: string, boosted: boolean, priority: number, until: string | undefined, tx?: DBExecutor): Promise<ContentRecord | null> {
    const rows = await this.exec(tx)
      .update(contents)
      .set({ isBoosted: boosted, boostPriority: priority, boostedUntil: until ?? null, updatedAt: sql`now()` })
      .where(and(eq(contents.id, id), isNull(contents.deletedAt)))
      .returning();
    return rows[0] ? this.map(rows[0]) : null;
  }

  async softDelete(id: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .update(contents)
      .set({ deletedAt: sql`now()` })
      .where(and(eq(contents.id, id), isNull(contents.deletedAt)));
  }

  // ─── Cast & crew (content_cast ⋈ people) ───────────────────────────────────

  /** Ordered cast/crew for a content (billing order, then name). */
  async getCast(contentId: string, tx?: DBExecutor): Promise<CastMember[]> {
    return this.exec(tx)
      .select({
        personId: people.id,
        name: people.name,
        slug: people.slug,
        photoMediaId: people.photoMediaId,
        role: contentCast.role,
        characterName: contentCast.characterName,
        billingOrder: contentCast.billingOrder,
      })
      .from(contentCast)
      .innerJoin(people, eq(contentCast.personId, people.id))
      .where(eq(contentCast.contentId, contentId))
      .orderBy(asc(contentCast.billingOrder), asc(people.name));
  }

  /** Hydrate cast for many contents at once → map keyed by contentId (feed/detail cards). */
  async getCastForContents(contentIds: string[], tx?: DBExecutor): Promise<Map<string, CastMember[]>> {
    const out = new Map<string, CastMember[]>();
    if (contentIds.length === 0) {
      return out;
    }
    const rows = await this.exec(tx)
      .select({
        contentId: contentCast.contentId,
        personId: people.id,
        name: people.name,
        slug: people.slug,
        photoMediaId: people.photoMediaId,
        role: contentCast.role,
        characterName: contentCast.characterName,
        billingOrder: contentCast.billingOrder,
      })
      .from(contentCast)
      .innerJoin(people, eq(contentCast.personId, people.id))
      .where(inArray(contentCast.contentId, contentIds))
      .orderBy(asc(contentCast.billingOrder), asc(people.name));
    for (const r of rows) {
      const { contentId, ...member } = r;
      const list = out.get(contentId) ?? [];
      list.push(member);
      out.set(contentId, list);
    }
    return out;
  }

  /** Replace the full cast list for a content (admin editor: delete-all then insert). */
  async setCast(contentId: string, members: CastInput[], tx?: DBExecutor): Promise<CastMember[]> {
    const run = async (db: DBExecutor) => {
      await db.delete(contentCast).where(eq(contentCast.contentId, contentId));
      if (members.length > 0) {
        await db.insert(contentCast).values(
          members.map((m, i) => ({
            contentId,
            personId: m.personId,
            role: m.role ?? 'actor',
            characterName: m.characterName ?? null,
            billingOrder: m.billingOrder ?? i,
          })),
        );
      }
      return this.getCast(contentId, db);
    };
    return tx ? run(tx) : this.dbService.db.transaction(run);
  }

  // ─── Worker / cron support ─────────────────────────────────────────────────

  /** Flip due `scheduled` content to `published` (cron go-live). Returns the count published. */
  async publishDueScheduled(tx?: DBExecutor): Promise<number> {
    const rows = await this.exec(tx)
      .update(contents)
      .set({ status: 'published', publishedAt: sql`now()`, updatedAt: sql`now()` })
      .where(
        and(
          eq(contents.status, 'scheduled'),
          isNull(contents.deletedAt),
          sql`${contents.scheduledAt} is not null and ${contents.scheduledAt} <= now()`,
        ),
      )
      .returning({ id: contents.id });
    return rows.length;
  }

  /** Licensed content whose license expires within `days` (cron reminder). */
  async findExpiringLicenses(
    days: number,
    tx?: DBExecutor,
  ): Promise<Array<{ id: string; title: string; licenseExpiresAt: string | null; licensorName: string | null }>> {
    return this.exec(tx)
      .select({
        id: contents.id,
        title: contents.title,
        licenseExpiresAt: contents.licenseExpiresAt,
        licensorName: contents.licensorName,
      })
      .from(contents)
      .where(
        and(
          isNull(contents.deletedAt),
          eq(contents.licenseStatus, 'licensed'),
          sql`${contents.licenseExpiresAt} is not null`,
          sql`${contents.licenseExpiresAt} <= now() + (${days} || ' days')::interval`,
        ),
      );
  }
}
