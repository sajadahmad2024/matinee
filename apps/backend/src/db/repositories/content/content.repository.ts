import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import {
  contents,
  contentRegions,
  contentCast,
  people,
  studios,
  genres,
  tags,
  contentGenres,
  contentTags,
} from '@db/drizzle/schema';
import { and, asc, desc, eq, exists, gte, ilike, inArray, isNotNull, isNull, lte, not, or, sql, SQL } from 'drizzle-orm';

export type ContentStatus =
  | 'draft'
  | 'pending_approval'
  | 'scheduled'
  | 'published'
  | 'rejected'
  | 'archived';

/** "Where to watch" CTA stored on `contents.watch_links`. */
export interface WatchLink {
  platform: string;
  label?: string;
  url?: string;
}

export type BoostChannel = 'homepage' | 'notifications' | 'regional' | 'subscribers';

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
  boostStartsAt: string | null;
  boostedUntil: string | null;
  boostChannels: string[];
  recommendation: string;
  isSponsored: boolean;
  isAdCommercial: boolean;
  rightsRegion: string;
  parentContentId: string | null;
  licenseStatus: string;
  licenseExpiresAt: string | null;
  licensorName: string | null;
  licenseTerms: string | null;
  availableUntil: string | null;
  watchLinks: WatchLink[];
  createdBy: string | null;
  updatedBy: string | null;
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
  recommendation?: string | undefined;
  watchLinks?: WatchLink[] | undefined;
  availableUntil?: string | null | undefined;
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
    | 'recommendation'
    | 'watchLinks'
    | 'availableUntil'
  >
> & { updatedBy?: string | undefined };

/** Optional M2M replacements saved alongside a create/update. `undefined` = leave untouched. */
export interface ContentRelationsInput {
  genreIds?: string[] | undefined;
  primaryGenreId?: string | undefined;
  tagIds?: string[] | undefined;
  cast?: CastInput[] | undefined;
}

export interface BoostInput {
  boosted: boolean;
  priority: number;
  startsAt?: string | undefined;
  until?: string | undefined;
  channels?: string[] | undefined;
}

export interface ContentGenreRef {
  id: string;
  name: string;
  slug: string;
  isPrimary: boolean;
}

export interface ContentTagRef {
  id: string;
  name: string;
  slug: string;
}

export interface PublishRegion {
  region: string;
  live: boolean;
}

/** Per-row admin signals computed across related tables (one batched query). */
export interface AdminContentSignals {
  studioName: string | null;
  linkedGamesCount: number;
  sponsorName: string | null;
  adPlacement: string | null;
  completionRate: number;
  views7d: number;
  viewsPrev7d: number;
  revenueCents: number;
  unresolvedFlags: number;
  createdByName: string | null;
  updatedByName: string | null;
}

export type ContentSort =
  | 'newest'
  | 'oldest'
  | 'most_viewed'
  | 'least_viewed'
  | 'recently_updated'
  | 'scheduled_asc'
  | 'license_expiry_asc'
  | 'title_asc';

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
  statuses?: string[] | undefined;
  contentType?: string | undefined;
  studioId?: string | undefined;
  parentContentId?: string | undefined;
  hasParent?: boolean | undefined;
  q?: string | undefined;
  region?: string | undefined;
  isBoosted?: boolean | undefined;
  isSponsored?: boolean | undefined;
  licenseStatuses?: string[] | undefined;
  createdFrom?: string | undefined;
  createdTo?: string | undefined;
  scheduledFrom?: string | undefined;
  scheduledTo?: string | undefined;
  licenseExpiresFrom?: string | undefined;
  licenseExpiresTo?: string | undefined;
  sort?: ContentSort | undefined;
  page: number;
  limit: number;
}

/** SQL display name for a user row alias (first + last → username → email). */
export const userDisplayName = (alias: string): SQL =>
  sql.raw(
    `coalesce(nullif(trim(concat_ws(' ', ${alias}.first_name, ${alias}.last_name)), ''), ${alias}.username, ${alias}.email)`,
  );

/** Escape LIKE wildcards in user search input. */
const likeTerm = (q: string): string => `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;

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
      boostStartsAt: row.boostStartsAt,
      boostedUntil: row.boostedUntil,
      boostChannels: row.boostChannels,
      recommendation: row.recommendation,
      isSponsored: row.isSponsored,
      isAdCommercial: row.isAdCommercial,
      rightsRegion: row.rightsRegion,
      parentContentId: row.parentContentId,
      licenseStatus: row.licenseStatus,
      licenseExpiresAt: row.licenseExpiresAt,
      licensorName: row.licensorName,
      licenseTerms: row.licenseTerms,
      availableUntil: row.availableUntil,
      watchLinks: Array.isArray(row.watchLinks) ? (row.watchLinks as WatchLink[]) : [],
      createdBy: row.createdBy,
      updatedBy: row.updatedBy,
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
        ...(input.recommendation ? { recommendation: input.recommendation } : {}),
        ...(input.watchLinks ? { watchLinks: input.watchLinks } : {}),
        ...(input.availableUntil ? { availableUntil: input.availableUntil } : {}),
        ...(input.createdBy ? { createdBy: input.createdBy, updatedBy: input.createdBy } : {}),
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

  /**
   * Content is available in a macro-region when it has a *live* publish-region row for it, or —
   * when no publish regions were chosen at all — when its rights region is `global`.
   */
  private availableIn(region: string): SQL {
    const regionRows = (extra?: SQL) =>
      this.dbService.db
        .select({ one: sql`1` })
        .from(contentRegions)
        .where(and(eq(contentRegions.contentId, contents.id), extra));
    return or(
      exists(regionRows(and(eq(contentRegions.region, region), eq(contentRegions.isLive, true)))),
      and(eq(contents.rightsRegion, 'global'), not(exists(regionRows()))),
    )!;
  }

  private orderFor(sort: ContentSort | undefined): SQL[] {
    switch (sort) {
      case 'oldest':
        return [asc(contents.createdAt)];
      case 'most_viewed':
        return [desc(contents.viewCount), desc(contents.createdAt)];
      case 'least_viewed':
        return [asc(contents.viewCount), desc(contents.createdAt)];
      case 'recently_updated':
        return [desc(contents.updatedAt)];
      case 'scheduled_asc':
        return [sql`${contents.scheduledAt} asc nulls last`, desc(contents.createdAt)];
      case 'license_expiry_asc':
        return [sql`${contents.licenseExpiresAt} asc nulls last`, desc(contents.createdAt)];
      case 'title_asc':
        return [asc(contents.title)];
      case 'newest':
      case undefined:
      default:
        return [desc(contents.createdAt)];
    }
  }

  /** Admin directory — filterable, sortable, paginated (newest first by default). */
  async list(filters: ContentListFilters, tx?: DBExecutor): Promise<{ items: ContentRecord[]; total: number }> {
    const q = filters.q?.trim();
    const where = and(
      isNull(contents.deletedAt),
      filters.statuses?.length ? inArray(contents.status, filters.statuses) : undefined,
      filters.contentType ? eq(contents.contentType, filters.contentType) : undefined,
      filters.studioId ? eq(contents.studioId, filters.studioId) : undefined,
      filters.parentContentId ? eq(contents.parentContentId, filters.parentContentId) : undefined,
      filters.hasParent === true ? isNotNull(contents.parentContentId) : undefined,
      filters.hasParent === false ? isNull(contents.parentContentId) : undefined,
      q
        ? or(
            ilike(contents.title, likeTerm(q)),
            exists(
              this.dbService.db
                .select({ one: sql`1` })
                .from(studios)
                .where(and(eq(studios.id, contents.studioId), ilike(studios.name, likeTerm(q)))),
            ),
          )
        : undefined,
      filters.region ? this.availableIn(filters.region) : undefined,
      filters.isBoosted !== undefined ? eq(contents.isBoosted, filters.isBoosted) : undefined,
      filters.isSponsored !== undefined ? eq(contents.isSponsored, filters.isSponsored) : undefined,
      filters.licenseStatuses?.length ? inArray(contents.licenseStatus, filters.licenseStatuses) : undefined,
      filters.createdFrom ? gte(contents.createdAt, filters.createdFrom) : undefined,
      filters.createdTo ? lte(contents.createdAt, filters.createdTo) : undefined,
      filters.scheduledFrom ? gte(contents.scheduledAt, filters.scheduledFrom) : undefined,
      filters.scheduledTo ? lte(contents.scheduledAt, filters.scheduledTo) : undefined,
      filters.licenseExpiresFrom ? gte(contents.licenseExpiresAt, filters.licenseExpiresFrom) : undefined,
      filters.licenseExpiresTo ? lte(contents.licenseExpiresAt, filters.licenseExpiresTo) : undefined,
    );
    const db = this.exec(tx);
    const [items, totalRow] = await Promise.all([
      db
        .select()
        .from(contents)
        .where(where)
        .orderBy(...this.orderFor(filters.sort))
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit),
      db.select({ n: sql<number>`count(*)::int` }).from(contents).where(where),
    ]);
    return { items: items.map((r) => this.map(r)), total: totalRow[0]?.n ?? 0 };
  }

  /**
   * Feed rank for a boost: only while the boost window is open, and only on the channels that
   * affect the feed (no channels = everywhere; `homepage`; `regional` when the viewer's region
   * is a live publish region).
   */
  private effectiveBoost(region: string | undefined): SQL {
    const regionalHit = region
      ? sql`('regional' = any(${contents.boostChannels}) and exists (
          select 1 from ${contentRegions}
          where ${contentRegions.contentId} = ${contents.id} and ${contentRegions.region} = ${region} and ${contentRegions.isLive}))`
      : sql`false`;
    return sql`case when ${contents.isBoosted}
        and (${contents.boostStartsAt} is null or ${contents.boostStartsAt} <= now())
        and (${contents.boostedUntil} is null or ${contents.boostedUntil} > now())
        and (cardinality(${contents.boostChannels}) = 0 or 'homepage' = any(${contents.boostChannels}) or ${regionalHit})
      then ${contents.boostPriority} else 0 end`;
  }

  /** Customer feed — published, in its live window, region-available; active boosts, then recommendation, then newest. */
  async feed(filters: FeedFilters, tx?: DBExecutor): Promise<{ items: ContentRecord[]; total: number }> {
    const where = and(
      isNull(contents.deletedAt),
      eq(contents.status, 'published'),
      sql`(${contents.availableUntil} is null or ${contents.availableUntil} > now())`,
      filters.region ? this.availableIn(filters.region) : undefined,
    );
    const recommendationRank = sql`case ${contents.recommendation} when 'promoted' then 1 when 'deprioritized' then -1 else 0 end`;
    const db = this.exec(tx);
    const [items, totalRow] = await Promise.all([
      db
        .select()
        .from(contents)
        .where(where)
        .orderBy(desc(this.effectiveBoost(filters.region)), desc(recommendationRank), desc(contents.publishedAt))
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
      updatedBy?: string;
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
        ...(extra.updatedBy ? { updatedBy: extra.updatedBy } : {}),
      })
      .where(and(eq(contents.id, id), isNull(contents.deletedAt)))
      .returning();
    return rows[0] ? this.map(rows[0]) : null;
  }

  /** Boost (or clear the boost). `boosted=false` resets every boost field. */
  async setBoost(id: string, input: BoostInput, tx?: DBExecutor): Promise<ContentRecord | null> {
    const patch = input.boosted
      ? {
          isBoosted: true,
          boostPriority: input.priority,
          boostStartsAt: input.startsAt ?? null,
          boostedUntil: input.until ?? null,
          boostChannels: input.channels ?? [],
        }
      : { isBoosted: false, boostPriority: 0, boostStartsAt: null, boostedUntil: null, boostChannels: [] };
    const rows = await this.exec(tx)
      .update(contents)
      .set({ ...patch, updatedAt: sql`now()` })
      .where(and(eq(contents.id, id), isNull(contents.deletedAt)))
      .returning();
    return rows[0] ? this.map(rows[0]) : null;
  }

  /** scheduled → pending_approval (clears the go-live + approval). Null when not currently scheduled. */
  async unschedule(id: string, updatedBy: string, tx?: DBExecutor): Promise<ContentRecord | null> {
    const rows = await this.exec(tx)
      .update(contents)
      .set({
        status: 'pending_approval',
        scheduledAt: null,
        approvedBy: null,
        approvedAt: null,
        updatedBy,
        updatedAt: sql`now()`,
      })
      .where(and(eq(contents.id, id), isNull(contents.deletedAt), eq(contents.status, 'scheduled')))
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

  // ─── Create / update with relations (one transaction) ────────────────────────

  async createWithRelations(input: CreateContentInput, rel: ContentRelationsInput): Promise<ContentRecord> {
    return this.dbService.transaction(async (tx) => {
      const c = await this.create(input, tx);
      await this.saveRelations(c.id, rel, tx);
      return c;
    });
  }

  async updateWithRelations(id: string, patch: UpdateContentInput, rel: ContentRelationsInput): Promise<ContentRecord | null> {
    return this.dbService.transaction(async (tx) => {
      const c = await this.update(id, patch, tx);
      if (c) {
        await this.saveRelations(id, rel, tx);
      }
      return c;
    });
  }

  private async saveRelations(contentId: string, rel: ContentRelationsInput, tx: DBExecutor): Promise<void> {
    if (rel.genreIds) {
      await this.setGenres(contentId, rel.genreIds, rel.primaryGenreId, tx);
    }
    if (rel.tagIds) {
      await this.setTags(contentId, rel.tagIds, tx);
    }
    if (rel.cast) {
      await this.setCast(contentId, rel.cast, tx);
    }
  }

  // ─── Genres & tags (M2M) ─────────────────────────────────────────────────────

  /** Replace the genre set (primary flag on at most one). */
  async setGenres(contentId: string, genreIds: string[], primaryGenreId: string | undefined, tx?: DBExecutor): Promise<void> {
    const run = async (db: DBExecutor) => {
      await db.delete(contentGenres).where(eq(contentGenres.contentId, contentId));
      if (genreIds.length > 0) {
        await db
          .insert(contentGenres)
          .values(genreIds.map((genreId) => ({ contentId, genreId, isPrimary: genreId === primaryGenreId })));
      }
    };
    await (tx ? run(tx) : this.dbService.db.transaction(run));
  }

  async setTags(contentId: string, tagIds: string[], tx?: DBExecutor): Promise<void> {
    const run = async (db: DBExecutor) => {
      await db.delete(contentTags).where(eq(contentTags.contentId, contentId));
      if (tagIds.length > 0) {
        await db.insert(contentTags).values(tagIds.map((tagId) => ({ contentId, tagId })));
      }
    };
    await (tx ? run(tx) : this.dbService.db.transaction(run));
  }

  /** Which of `ids` exist (validation for genre/tag/studio/person references). */
  async existingIds(kind: 'genre' | 'tag' | 'studio' | 'person', ids: string[], tx?: DBExecutor): Promise<Set<string>> {
    if (ids.length === 0) {
      return new Set();
    }
    const db = this.exec(tx);
    const rows =
      kind === 'genre'
        ? await db.select({ id: genres.id }).from(genres).where(inArray(genres.id, ids))
        : kind === 'tag'
          ? await db.select({ id: tags.id }).from(tags).where(inArray(tags.id, ids))
          : kind === 'studio'
            ? await db.select({ id: studios.id }).from(studios).where(and(inArray(studios.id, ids), isNull(studios.deletedAt)))
            : await db.select({ id: people.id }).from(people).where(inArray(people.id, ids));
    return new Set(rows.map((r) => r.id));
  }

  async getGenresFor(contentIds: string[], tx?: DBExecutor): Promise<Map<string, ContentGenreRef[]>> {
    const out = new Map<string, ContentGenreRef[]>();
    if (contentIds.length === 0) {
      return out;
    }
    const rows = await this.exec(tx)
      .select({ contentId: contentGenres.contentId, id: genres.id, name: genres.name, slug: genres.slug, isPrimary: contentGenres.isPrimary })
      .from(contentGenres)
      .innerJoin(genres, eq(contentGenres.genreId, genres.id))
      .where(inArray(contentGenres.contentId, contentIds))
      .orderBy(desc(contentGenres.isPrimary), asc(genres.sortOrder), asc(genres.name));
    for (const { contentId, ...g } of rows) {
      out.set(contentId, [...(out.get(contentId) ?? []), g]);
    }
    return out;
  }

  async getTagsFor(contentIds: string[], tx?: DBExecutor): Promise<Map<string, ContentTagRef[]>> {
    const out = new Map<string, ContentTagRef[]>();
    if (contentIds.length === 0) {
      return out;
    }
    const rows = await this.exec(tx)
      .select({ contentId: contentTags.contentId, id: tags.id, name: tags.name, slug: tags.slug })
      .from(contentTags)
      .innerJoin(tags, eq(contentTags.tagId, tags.id))
      .where(inArray(contentTags.contentId, contentIds))
      .orderBy(asc(tags.name));
    for (const { contentId, ...t } of rows) {
      out.set(contentId, [...(out.get(contentId) ?? []), t]);
    }
    return out;
  }

  async getRegionsFor(contentIds: string[], tx?: DBExecutor): Promise<Map<string, PublishRegion[]>> {
    const out = new Map<string, PublishRegion[]>();
    if (contentIds.length === 0) {
      return out;
    }
    const rows = await this.exec(tx)
      .select({ contentId: contentRegions.contentId, region: contentRegions.region, live: contentRegions.isLive })
      .from(contentRegions)
      .where(inArray(contentRegions.contentId, contentIds))
      .orderBy(asc(contentRegions.region));
    for (const { contentId, ...r } of rows) {
      out.set(contentId, [...(out.get(contentId) ?? []), r]);
    }
    return out;
  }

  /**
   * Admin list/detail signals for many contents in one round-trip: studio name, linked games,
   * active sponsor, completion, 7-day view trend inputs, attributed revenue, open moderation
   * tickets, and creator/editor display names.
   */
  async adminSignals(contentIds: string[], tx?: DBExecutor): Promise<Map<string, AdminContentSignals>> {
    const out = new Map<string, AdminContentSignals>();
    if (contentIds.length === 0) {
      return out;
    }
    const res = await this.exec(tx).execute(sql`
      select
        c.id,
        s.name as "studioName",
        (select count(*) from predictions p where p.content_id = c.id)
          + (select count(*) from auctions a where a.content_id = c.id)
          + (select count(*) from quest_contents qc where qc.content_id = c.id) as "linkedGamesCount",
        sp.sponsor_name as "sponsorName",
        sp.placement as "adPlacement",
        (select coalesce(avg(v.completion_percent), 0) from content_views v where v.content_id = c.id) as "completionRate",
        (select count(*) from content_views v
          where v.content_id = c.id and v.counted and v.started_at > now() - interval '7 days') as "views7d",
        (select count(*) from content_views v
          where v.content_id = c.id and v.counted and v.started_at <= now() - interval '7 days'
            and v.started_at > now() - interval '14 days') as "viewsPrev7d",
        coalesce((select sum(l.revenue_generated_cents) from content_licenses l where l.content_id = c.id and l.is_active), 0)
          + coalesce(sp.revenue_cents, 0) as "revenueCents",
        (select count(*) from moderation_tickets t
          where t.subject_type = 'content' and t.subject_id = c.id and t.status in ('open', 'in_review', 'escalated')) as "unresolvedFlags",
        ${userDisplayName('cu')} as "createdByName",
        ${userDisplayName('uu')} as "updatedByName"
      from contents c
      left join studios s on s.id = c.studio_id
      left join content_sponsorships sp on sp.content_id = c.id and sp.is_active
      left join users cu on cu.id = c.created_by
      left join users uu on uu.id = c.updated_by
      where ${inArray(sql`c.id`, contentIds)}
    `);
    const rows = (res as unknown as { rows: Record<string, string | number | null>[] }).rows;
    const n = (v: string | number | null | undefined) => Number(v ?? 0);
    const str = (v: string | number | null | undefined) => (v === null || v === undefined ? null : String(v));
    for (const r of rows) {
      out.set(String(r['id']), {
        studioName: str(r['studioName']),
        linkedGamesCount: n(r['linkedGamesCount']),
        sponsorName: str(r['sponsorName']),
        adPlacement: str(r['adPlacement']),
        completionRate: Math.round(n(r['completionRate']) * 100) / 100,
        views7d: n(r['views7d']),
        viewsPrev7d: n(r['viewsPrev7d']),
        revenueCents: n(r['revenueCents']),
        unresolvedFlags: n(r['unresolvedFlags']),
        createdByName: str(r['createdByName']),
        updatedByName: str(r['updatedByName']),
      });
    }
    return out;
  }

  /** Games attached to a content (predictions/auctions by content_id, quests via quest_contents). */
  async linkedGames(contentId: string, tx?: DBExecutor): Promise<{
    predictions: Array<{ id: string; title: string; status: string }>;
    auctions: Array<{ id: string; title: string; status: string }>;
    quests: Array<{ id: string; title: string; status: string }>;
  }> {
    const db = this.exec(tx);
    type Row = { id: string; title: string; status: string };
    const rowsOf = (r: unknown) => (r as { rows: Row[] }).rows;
    const [p, a, q] = await Promise.all([
      db.execute(sql`select id, question as title, status from predictions where content_id = ${contentId} order by start_at desc`),
      db.execute(sql`select id, title, status from auctions where content_id = ${contentId} order by start_at desc`),
      db.execute(sql`select q.id, q.name as title, q.status from quests q
        join quest_contents qc on qc.quest_id = q.id where qc.content_id = ${contentId} order by q.start_at desc`),
    ]);
    return { predictions: rowsOf(p), auctions: rowsOf(a), quests: rowsOf(q) };
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
