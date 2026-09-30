import { Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import {
  GenreRecord,
  PersonRecord,
  StudioRecord,
  TagRecord,
  TaxonomyKind,
  TaxonomyRepository,
  WithContentCount,
} from '@db/repositories/content/taxonomy.repository';
import {
  CreateGenreDto,
  CreatePersonDto,
  CreateStudioDto,
  UpdateGenreDto,
  UpdatePersonDto,
  UpdateStudioDto,
} from './dto/taxonomy.dto';

/**
 * Reference master-data (studios/genres/tags/cast).
 *
 * - Public (customer) reads are cached and never expose usage counts.
 * - Admin reads include `contentCount` and are **not** cached: counts change whenever content
 *   is assigned/unassigned (a content write, not a taxonomy write), so a cache would go stale.
 */
const TAG = 'taxonomy';
const TTL = 300; // 5 min

/** Drop the admin-only usage count from a row. */
function withoutCount<T extends { contentCount?: number }>(row: T): Omit<T, 'contentCount'> {
  const { contentCount: _contentCount, ...rest } = row;
  return rest;
}

@Injectable()
export class TaxonomyService {
  constructor(
    private readonly repo: TaxonomyRepository,
    private readonly cache: CacheService,
  ) {}
  private bust() {
    return this.cache.invalidateTag(TAG);
  }
  /** Attach the current usage count to a freshly updated row (one grouped query). */
  private async withCount<T extends { id: string }>(kind: TaxonomyKind, row: T): Promise<WithContentCount<T>> {
    const counts = await this.repo.countContentUsage(kind, [row.id]);
    return { ...row, contentCount: counts.get(row.id) ?? 0 };
  }

  // Studios (admin-only)
  listStudios(): Promise<WithContentCount<StudioRecord>[]> {
    return this.repo.listStudios();
  }
  async createStudio(dto: CreateStudioDto): Promise<WithContentCount<StudioRecord>> {
    const r = await this.repo.createStudio(dto);
    await this.bust();
    return { ...r, contentCount: 0 };
  }
  async updateStudio(id: string, dto: UpdateStudioDto): Promise<WithContentCount<StudioRecord>> {
    const r = await this.repo.updateStudio(id, dto);
    if (!r) throw new NotFoundException('Studio not found');
    await this.bust();
    return this.withCount('studio', r);
  }
  async deleteStudio(id: string) {
    await this.repo.deleteStudio(id);
    await this.bust();
    return { message: 'Studio deleted' };
  }

  // Genres
  /** Admin manager: every genre (active or not) with usage counts. */
  listGenres(): Promise<WithContentCount<GenreRecord>[]> {
    return this.repo.listGenres(false);
  }
  /** Customer filters: active genres only, cached, no counts. */
  listPublicGenres(): Promise<GenreRecord[]> {
    return this.cache.getOrSetTagged('tax:genres:active', [TAG], TTL, async () =>
      (await this.repo.listGenres(true)).map((g) => withoutCount(g)),
    );
  }
  async createGenre(dto: CreateGenreDto): Promise<WithContentCount<GenreRecord>> {
    const r = await this.repo.createGenre(dto);
    await this.bust();
    return { ...r, contentCount: 0 };
  }
  async updateGenre(id: string, dto: UpdateGenreDto): Promise<WithContentCount<GenreRecord>> {
    const r = await this.repo.updateGenre(id, dto);
    if (!r) throw new NotFoundException('Genre not found');
    await this.bust();
    return this.withCount('genre', r);
  }
  async deleteGenre(id: string) {
    await this.repo.deleteGenre(id);
    await this.bust();
    return { message: 'Genre deleted' };
  }

  // Tags
  /** Admin manager: tags with usage counts. */
  listTags(): Promise<WithContentCount<TagRecord>[]> {
    return this.repo.listTags();
  }
  /** Customer discovery: cached, no counts. */
  listPublicTags(): Promise<TagRecord[]> {
    return this.cache.getOrSetTagged('tax:tags', [TAG], TTL, async () =>
      (await this.repo.listTags()).map((t) => withoutCount(t)),
    );
  }
  async createTag(name: string): Promise<WithContentCount<TagRecord>> {
    const r = await this.repo.createTag(name);
    await this.bust();
    return { ...r, contentCount: 0 };
  }
  async updateTag(id: string, name: string): Promise<WithContentCount<TagRecord>> {
    const r = await this.repo.updateTag(id, name);
    if (!r) {
      throw new NotFoundException('Tag not found');
    }
    await this.bust();
    return this.withCount('tag', r);
  }
  async deleteTag(id: string) {
    await this.repo.deleteTag(id);
    await this.bust();
    return { message: 'Tag deleted' };
  }

  // People / cast (admin-only)
  listPeople(): Promise<WithContentCount<PersonRecord>[]> {
    return this.repo.listPeople();
  }
  async createPerson(dto: CreatePersonDto): Promise<WithContentCount<PersonRecord>> {
    const r = await this.repo.createPerson(dto);
    await this.bust();
    return { ...r, contentCount: 0 };
  }
  async updatePerson(id: string, dto: UpdatePersonDto): Promise<WithContentCount<PersonRecord>> {
    const r = await this.repo.updatePerson(id, dto);
    if (!r) throw new NotFoundException('Person not found');
    await this.bust();
    return this.withCount('person', r);
  }
  async deletePerson(id: string) {
    await this.repo.deletePerson(id);
    await this.bust();
    return { message: 'Person deleted' };
  }
}
