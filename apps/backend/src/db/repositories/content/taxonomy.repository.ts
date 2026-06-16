import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { studios, genres, tags, people } from '@db/drizzle/schema';
import { and, asc, eq, isNull, sql } from 'drizzle-orm';

export interface StudioRecord {
  id: string;
  name: string;
  slug: string;
  logoMediaId: string | null;
  description: string | null;
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
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 100);
  return `${base || 'item'}-${Math.random().toString(36).slice(2, 7)}`;
}

@Injectable()
export class TaxonomyRepository {
  constructor(private readonly dbService: DBService) {}
  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  // ─── Studios (soft-deletable, logo) ─────────────────────────────────────────
  async listStudios(tx?: DBExecutor): Promise<StudioRecord[]> {
    return this.exec(tx)
      .select({ id: studios.id, name: studios.name, slug: studios.slug, logoMediaId: studios.logoMediaId, description: studios.description })
      .from(studios)
      .where(isNull(studios.deletedAt))
      .orderBy(asc(studios.name));
  }
  async createStudio(input: { name: string; description?: string; logoMediaId?: string }, tx?: DBExecutor): Promise<StudioRecord> {
    const rows = await this.exec(tx)
      .insert(studios)
      .values({ name: input.name, slug: slugify(input.name), ...(input.description ? { description: input.description } : {}), ...(input.logoMediaId ? { logoMediaId: input.logoMediaId } : {}) })
      .returning({ id: studios.id, name: studios.name, slug: studios.slug, logoMediaId: studios.logoMediaId, description: studios.description });
    return rows[0]!;
  }
  async updateStudio(id: string, patch: { name?: string; description?: string; logoMediaId?: string | null }, tx?: DBExecutor): Promise<StudioRecord | null> {
    const rows = await this.exec(tx)
      .update(studios)
      .set({ ...patch, updatedAt: sql`now()` })
      .where(and(eq(studios.id, id), isNull(studios.deletedAt)))
      .returning({ id: studios.id, name: studios.name, slug: studios.slug, logoMediaId: studios.logoMediaId, description: studios.description });
    return rows[0] ?? null;
  }
  async deleteStudio(id: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).update(studios).set({ deletedAt: sql`now()` }).where(and(eq(studios.id, id), isNull(studios.deletedAt)));
  }

  // ─── Genres (active flag + sort) ────────────────────────────────────────────
  async listGenres(onlyActive = false, tx?: DBExecutor): Promise<GenreRecord[]> {
    return this.exec(tx)
      .select({ id: genres.id, name: genres.name, slug: genres.slug, isActive: genres.isActive, sortOrder: genres.sortOrder })
      .from(genres)
      .where(onlyActive ? eq(genres.isActive, true) : undefined)
      .orderBy(asc(genres.sortOrder), asc(genres.name));
  }
  async createGenre(input: { name: string; sortOrder?: number }, tx?: DBExecutor): Promise<GenreRecord> {
    const rows = await this.exec(tx)
      .insert(genres)
      .values({ name: input.name, slug: slugify(input.name), ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}) })
      .returning({ id: genres.id, name: genres.name, slug: genres.slug, isActive: genres.isActive, sortOrder: genres.sortOrder });
    return rows[0]!;
  }
  async updateGenre(id: string, patch: { name?: string; isActive?: boolean; sortOrder?: number }, tx?: DBExecutor): Promise<GenreRecord | null> {
    const rows = await this.exec(tx)
      .update(genres)
      .set(patch)
      .where(eq(genres.id, id))
      .returning({ id: genres.id, name: genres.name, slug: genres.slug, isActive: genres.isActive, sortOrder: genres.sortOrder });
    return rows[0] ?? null;
  }
  async deleteGenre(id: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).delete(genres).where(eq(genres.id, id));
  }

  // ─── Tags (minimal) ─────────────────────────────────────────────────────────
  async listTags(tx?: DBExecutor): Promise<TagRecord[]> {
    return this.exec(tx).select({ id: tags.id, name: tags.name, slug: tags.slug }).from(tags).orderBy(asc(tags.name));
  }
  async createTag(name: string, tx?: DBExecutor): Promise<TagRecord> {
    const rows = await this.exec(tx).insert(tags).values({ name, slug: slugify(name) }).returning({ id: tags.id, name: tags.name, slug: tags.slug });
    return rows[0]!;
  }
  async updateTag(id: string, name: string, tx?: DBExecutor): Promise<TagRecord | null> {
    const rows = await this.exec(tx).update(tags).set({ name, slug: slugify(name) }).where(eq(tags.id, id)).returning({ id: tags.id, name: tags.name, slug: tags.slug });
    return rows[0] ?? null;
  }
  async deleteTag(id: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).delete(tags).where(eq(tags.id, id));
  }

  // ─── People / cast (photo, bio) ─────────────────────────────────────────────
  async listPeople(tx?: DBExecutor): Promise<PersonRecord[]> {
    return this.exec(tx)
      .select({ id: people.id, name: people.name, slug: people.slug, photoMediaId: people.photoMediaId, bio: people.bio })
      .from(people)
      .orderBy(asc(people.name));
  }
  async createPerson(input: { name: string; bio?: string; photoMediaId?: string }, tx?: DBExecutor): Promise<PersonRecord> {
    const rows = await this.exec(tx)
      .insert(people)
      .values({ name: input.name, slug: slugify(input.name), ...(input.bio ? { bio: input.bio } : {}), ...(input.photoMediaId ? { photoMediaId: input.photoMediaId } : {}) })
      .returning({ id: people.id, name: people.name, slug: people.slug, photoMediaId: people.photoMediaId, bio: people.bio });
    return rows[0]!;
  }
  async updatePerson(id: string, patch: { name?: string; bio?: string; photoMediaId?: string | null }, tx?: DBExecutor): Promise<PersonRecord | null> {
    const rows = await this.exec(tx)
      .update(people)
      .set({ ...patch, updatedAt: sql`now()` })
      .where(eq(people.id, id))
      .returning({ id: people.id, name: people.name, slug: people.slug, photoMediaId: people.photoMediaId, bio: people.bio });
    return rows[0] ?? null;
  }
  async deletePerson(id: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).delete(people).where(eq(people.id, id));
  }
}
