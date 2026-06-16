import { Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { TaxonomyRepository } from '@db/repositories/content/taxonomy.repository';
import {
  CreateGenreDto,
  CreatePersonDto,
  CreateStudioDto,
  UpdateGenreDto,
  UpdatePersonDto,
  UpdateStudioDto,
} from './dto/taxonomy.dto';

/** Reference master-data (studios/genres/tags/cast). Read-heavy + rarely written → cached. */
const TAG = 'taxonomy';
const TTL = 300; // 5 min

@Injectable()
export class TaxonomyService {
  constructor(
    private readonly repo: TaxonomyRepository,
    private readonly cache: CacheService,
  ) {}
  private bust() {
    return this.cache.invalidateTag(TAG);
  }

  // Studios
  listStudios() {
    return this.cache.getOrSetTagged('tax:studios', [TAG], TTL, () => this.repo.listStudios());
  }
  async createStudio(dto: CreateStudioDto) {
    const r = await this.repo.createStudio(dto);
    await this.bust();
    return r;
  }
  async updateStudio(id: string, dto: UpdateStudioDto) {
    const r = await this.repo.updateStudio(id, dto);
    if (!r) throw new NotFoundException('Studio not found');
    await this.bust();
    return r;
  }
  async deleteStudio(id: string) {
    await this.repo.deleteStudio(id);
    await this.bust();
    return { message: 'Studio deleted' };
  }

  // Genres
  listGenres(onlyActive = false) {
    return this.cache.getOrSetTagged(`tax:genres:${onlyActive ? 'active' : 'all'}`, [TAG], TTL, () =>
      this.repo.listGenres(onlyActive),
    );
  }
  async createGenre(dto: CreateGenreDto) {
    const r = await this.repo.createGenre(dto);
    await this.bust();
    return r;
  }
  async updateGenre(id: string, dto: UpdateGenreDto) {
    const r = await this.repo.updateGenre(id, dto);
    if (!r) throw new NotFoundException('Genre not found');
    await this.bust();
    return r;
  }
  async deleteGenre(id: string) {
    await this.repo.deleteGenre(id);
    await this.bust();
    return { message: 'Genre deleted' };
  }

  // Tags
  listTags() {
    return this.cache.getOrSetTagged('tax:tags', [TAG], TTL, () => this.repo.listTags());
  }
  async createTag(name: string) {
    const r = await this.repo.createTag(name);
    await this.bust();
    return r;
  }
  async updateTag(id: string, name: string) {
    const r = await this.repo.updateTag(id, name);
    if (!r) {
      throw new NotFoundException('Tag not found');
    }
    await this.bust();
    return r;
  }
  async deleteTag(id: string) {
    await this.repo.deleteTag(id);
    await this.bust();
    return { message: 'Tag deleted' };
  }

  // People / cast
  listPeople() {
    return this.cache.getOrSetTagged('tax:people', [TAG], TTL, () => this.repo.listPeople());
  }
  async createPerson(dto: CreatePersonDto) {
    const r = await this.repo.createPerson(dto);
    await this.bust();
    return r;
  }
  async updatePerson(id: string, dto: UpdatePersonDto) {
    const r = await this.repo.updatePerson(id, dto);
    if (!r) throw new NotFoundException('Person not found');
    await this.bust();
    return r;
  }
  async deletePerson(id: string) {
    await this.repo.deletePerson(id);
    await this.bust();
    return { message: 'Person deleted' };
  }
}
