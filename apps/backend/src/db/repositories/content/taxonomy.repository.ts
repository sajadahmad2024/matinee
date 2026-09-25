import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { contentCast, contentGenres, contentTags, contents, genres, people, studios, tags } from '@db/drizzle/schema';
import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';

export interface StudioRecord {
  id: string;
  name: string;
  slug: string;
  logoMediaId: string | null;
  description: string | null;
  countryCode: string | null;
}
export interface GenreRecord {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}
export interface TagRecord {
  id: string;
  name: string;
  slug: string;
}
export interface PersonRecord {
  id: string;
  name: string;
  slug: string;
  photoMediaId: string | null;
  bio: string | null;
  knownFor: PersonKnownFor | null;
}

export const PERSON_KNOWN_FOR = ['actor', 'director', 'writer', 'producer', 'other'] as const;
export type PersonKnownFor = (typeof PERSON_KNOWN_FOR)[number];

/** A taxonomy row plus how many non-deleted contents use it ("used by" / "unused"). */
export type WithContentCount<T> = T & { contentCount: number };
export type TaxonomyKind = 'studio' | 'genre' | 'tag' | 'person';

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 100);
  return `${base || 'item'}-${Math.random().toString(36).slice(2, 7)}`;
}

const studioCols = {
  id: studios.id,
  name: studios.name,
  slug: studios.slug,
  logoMediaId: studios.logoMediaId,
  description: studios.description,
  countryCode: studios.countryCode,
};
const genreCols = { id: genres.id, name: genres.name, slug: genres.slug, isActive: genres.isActive, sortOrder: genres.sortOrder };
const tagCols = { id: tags.id, name: tags.name, slug: tags.slug };
const personCols = {
  id: people.id,
  name: people.name,
  slug: people.slug,
  photoMediaId: people.photoMediaId,
  bio: people.bio,
  knownFor: sql<PersonKnownFor | null>`${people.knownFor}`,
};

@Injectable()
export class TaxonomyRepository {
  constructor(private readonly dbService: DBService) {}
  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  // ─── Usage counts (grouped subqueries — one per list, never N+1) ────────────
  // Every count only considers non-deleted contents.

  private studioCounts(tx?: DBExecutor) {
    return this.exec(tx)
      .select({ refId: sql<string>`${contents.studioId}`.as('ref_id'), n: sql<number>`count(*)::int`.as('n') })
      .from(contents)
      .where(and(isNull(contents.deletedAt), sql`${contents.studioId} IS NOT NULL`))
      .groupBy(contents.studioId)
      .as('studio_counts');
  }
  private genreCounts(tx?: DBExecutor) {
    return this.exec(tx)
      .select({ refId: sql<string>`${contentGenres.genreId}`.as('ref_id'), n: sql<number>`count(*)::int`.as('n') })
      .from(contentGenres)
      .innerJoin(contents, and(eq(contents.id, contentGenres.contentId), isNull(contents.deletedAt)))
      .groupBy(contentGenres.genreId)
      .as('genre_counts');
  }
  private tagCounts(tx?: DBExecutor) {
    return this.exec(tx)
      .select({ refId: sql<string>`${contentTags.tagId}`.as('ref_id'), n: sql<number>`count(*)::int`.as('n') })
      .from(contentTags)
      .innerJoin(contents, and(eq(contents.id, contentTags.contentId), isNull(contents.deletedAt)))
      .groupBy(contentTags.tagId)
      .as('tag_counts');
  }
  /** A person can hold several credits (roles) on one title → count distinct contents. */
  private personCounts(tx?: DBExecutor) {
    return this.exec(tx)
      .select({
        refId: sql<string>`${contentCast.personId}`.as('ref_id'),
        n: sql<number>`count(DISTINCT ${contentCast.contentId})::int`.as('n'),
      })
      .from(contentCast)
      .innerJoin(contents, and(eq(contents.id, contentCast.contentId), isNull(contents.deletedAt)))
      .groupBy(contentCast.personId)
      .as('person_counts');
  }

  /** Usage counts for specific ids (e.g. after an update). Missing ids → 0. */
  async countContentUsage(kind: TaxonomyKind, ids: string[], tx?: DBExecutor): Promise<Map<string, number>> {
    const out = new Map<string, number>(ids.map((id) => [id, 0]));
    if (ids.length === 0) {
      return out;
    }
    const counts =
      kind === 'studio'
        ? this.studioCounts(tx)
        : kind === 'genre'
          ? this.genreCounts(tx)
          : kind === 'tag'
            ? this.tagCounts(tx)
            : this.personCounts(tx);
    const rows = await this.exec(tx).select({ refId: counts.refId, n: counts.n }).from(counts).where(inArray(counts.refId, ids));
    for (const r of rows) {
      out.set(r.refId, Number(r.n));
    }
    return out;
  }

  // ─── Studios (soft-deletable, logo, country) ────────────────────────────────
  async listStudios(tx?: DBExecutor): Promise<WithContentCount<StudioRecord>[]> {
    const counts = this.studioCounts(tx);
    return this.exec(tx)
      .select({ ...studioCols, contentCount: sql<number>`coalesce(${counts.n}, 0)`.mapWith(Number) })
      .from(studios)
      .leftJoin(counts, eq(counts.refId, studios.id))
      .where(isNull(studios.deletedAt))
      .orderBy(asc(studios.name));
  }
  async createStudio(
    input: { name: string; description?: string; logoMediaId?: string; countryCode?: string },
    tx?: DBExecutor,
  ): Promise<StudioRecord> {
    const rows = await this.exec(tx)
      .insert(studios)
      .values({
        name: input.name,
        slug: slugify(input.name),
        ...(input.description ? { description: input.description } : {}),
        ...(input.logoMediaId ? { logoMediaId: input.logoMediaId } : {}),
        ...(input.countryCode ? { countryCode: input.countryCode } : {}),
      })
      .returning(studioCols);
    return rows[0]!;
  }
  async updateStudio(
    id: string,
    patch: { name?: string; description?: string; logoMediaId?: string | null; countryCode?: string | null },
    tx?: DBExecutor,
  ): Promise<StudioRecord | null> {
    const rows = await this.exec(tx)
      .update(studios)
      .set({ ...patch, updatedAt: sql`now()` })
      .where(and(eq(studios.id, id), isNull(studios.deletedAt)))
      .returning(studioCols);
    return rows[0] ?? null;
  }
  async deleteStudio(id: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).update(studios).set({ deletedAt: sql`now()` }).where(and(eq(studios.id, id), isNull(studios.deletedAt)));
  }

  // ─── Genres (active flag + sort) ────────────────────────────────────────────
  async listGenres(onlyActive = false, tx?: DBExecutor): Promise<WithContentCount<GenreRecord>[]> {
    const counts = this.genreCounts(tx);
    return this.exec(tx)
      .select({ ...genreCols, contentCount: sql<number>`coalesce(${counts.n}, 0)`.mapWith(Number) })
      .from(genres)
      .leftJoin(counts, eq(counts.refId, genres.id))
      .where(onlyActive ? eq(genres.isActive, true) : undefined)
      .orderBy(asc(genres.sortOrder), asc(genres.name));
  }
  async createGenre(input: { name: string; sortOrder?: number }, tx?: DBExecutor): Promise<GenreRecord> {
    const rows = await this.exec(tx)
      .insert(genres)
      .values({ name: input.name, slug: slugify(input.name), ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}) })
      .returning(genreCols);
    return rows[0]!;
  }
  async updateGenre(id: string, patch: { name?: string; isActive?: boolean; sortOrder?: number }, tx?: DBExecutor): Promise<GenreRecord | null> {
    const rows = await this.exec(tx).update(genres).set(patch).where(eq(genres.id, id)).returning(genreCols);
    return rows[0] ?? null;
  }
  async deleteGenre(id: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).delete(genres).where(eq(genres.id, id));
  }

  // ─── Tags (minimal) ─────────────────────────────────────────────────────────
  async listTags(tx?: DBExecutor): Promise<WithContentCount<TagRecord>[]> {
    const counts = this.tagCounts(tx);
    return this.exec(tx)
      .select({ ...tagCols, contentCount: sql<number>`coalesce(${counts.n}, 0)`.mapWith(Number) })
      .from(tags)
      .leftJoin(counts, eq(counts.refId, tags.id))
      .orderBy(asc(tags.name));
  }
  async createTag(name: string, tx?: DBExecutor): Promise<TagRecord> {
    const rows = await this.exec(tx).insert(tags).values({ name, slug: slugify(name) }).returning(tagCols);
    return rows[0]!;
  }
  async updateTag(id: string, name: string, tx?: DBExecutor): Promise<TagRecord | null> {
    const rows = await this.exec(tx).update(tags).set({ name, slug: slugify(name) }).where(eq(tags.id, id)).returning(tagCols);
    return rows[0] ?? null;
  }
  async deleteTag(id: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).delete(tags).where(eq(tags.id, id));
  }

  // ─── People / cast (photo, bio, known-for) ──────────────────────────────────
  async listPeople(tx?: DBExecutor): Promise<WithContentCount<PersonRecord>[]> {
    const counts = this.personCounts(tx);
    return this.exec(tx)
      .select({ ...personCols, contentCount: sql<number>`coalesce(${counts.n}, 0)`.mapWith(Number) })
      .from(people)
      .leftJoin(counts, eq(counts.refId, people.id))
      .orderBy(asc(people.name));
  }
  async createPerson(
    input: { name: string; bio?: string; photoMediaId?: string; knownFor?: PersonKnownFor },
    tx?: DBExecutor,
  ): Promise<PersonRecord> {
    const rows = await this.exec(tx)
      .insert(people)
      .values({
        name: input.name,
        slug: slugify(input.name),
        ...(input.bio ? { bio: input.bio } : {}),
        ...(input.photoMediaId ? { photoMediaId: input.photoMediaId } : {}),
        ...(input.knownFor ? { knownFor: input.knownFor } : {}),
      })
      .returning(personCols);
    return rows[0]!;
  }
  async updatePerson(
    id: string,
    patch: { name?: string; bio?: string; photoMediaId?: string | null; knownFor?: PersonKnownFor | null },
    tx?: DBExecutor,
  ): Promise<PersonRecord | null> {
    const rows = await this.exec(tx)
      .update(people)
      .set({ ...patch, updatedAt: sql`now()` })
      .where(eq(people.id, id))
      .returning(personCols);
    return rows[0] ?? null;
  }
  async deletePerson(id: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).delete(people).where(eq(people.id, id));
  }
}
