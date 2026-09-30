import { NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { TaxonomyRepository } from '@db/repositories/content/taxonomy.repository';
import { TaxonomyService } from './taxonomy.service';

const studio = { id: 's1', name: 'Seoul', slug: 'seoul-x', logoMediaId: null, description: null, countryCode: 'KR' };
const genre = { id: 'g1', name: 'Action', slug: 'action-x', isActive: true, sortOrder: 0 };
const tag = { id: 't1', name: 'trending', slug: 'trending-x' };
const person = { id: 'p1', name: 'Min-jun', slug: 'min-jun-x', photoMediaId: null, bio: null, knownFor: 'director' as const };

function build() {
  const repo = {
    listStudios: jest.fn().mockResolvedValue([{ ...studio, contentCount: 3 }]),
    createStudio: jest.fn().mockResolvedValue(studio),
    updateStudio: jest.fn().mockResolvedValue(studio),
    listGenres: jest.fn().mockResolvedValue([{ ...genre, contentCount: 5 }]),
    createGenre: jest.fn().mockResolvedValue(genre),
    updateGenre: jest.fn().mockResolvedValue(null),
    listTags: jest.fn().mockResolvedValue([{ ...tag, contentCount: 2 }]),
    updateTag: jest.fn().mockResolvedValue(tag),
    listPeople: jest.fn().mockResolvedValue([{ ...person, contentCount: 1 }]),
    createPerson: jest.fn().mockResolvedValue(person),
    updatePerson: jest.fn().mockResolvedValue(person),
    countContentUsage: jest.fn().mockImplementation((_kind: string, ids: string[]) =>
      Promise.resolve(new Map(ids.map((id) => [id, 7]))),
    ),
  };
  const cache = {
    invalidateTag: jest.fn().mockResolvedValue(undefined),
    getOrSetTagged: jest.fn((_key: string, _tags: string[], _ttl: number, fn: () => Promise<unknown>) => fn()),
  };
  const svc = new TaxonomyService(repo as unknown as TaxonomyRepository, cache as unknown as CacheService);
  return { svc, repo, cache };
}

describe('TaxonomyService', () => {
  it('admin lists return contentCount and bypass the cache', async () => {
    const { svc, cache } = build();
    await expect(svc.listStudios()).resolves.toEqual([{ ...studio, contentCount: 3 }]);
    await expect(svc.listGenres()).resolves.toEqual([{ ...genre, contentCount: 5 }]);
    await expect(svc.listTags()).resolves.toEqual([{ ...tag, contentCount: 2 }]);
    await expect(svc.listPeople()).resolves.toEqual([{ ...person, contentCount: 1 }]);
    expect(cache.getOrSetTagged).not.toHaveBeenCalled();
  });

  it('admin genre list includes inactive genres', async () => {
    const { svc, repo } = build();
    await svc.listGenres();
    expect(repo.listGenres).toHaveBeenCalledWith(false);
  });

  it('public lists are cached, active-only, and strip contentCount', async () => {
    const { svc, repo, cache } = build();
    await expect(svc.listPublicGenres()).resolves.toEqual([genre]);
    await expect(svc.listPublicTags()).resolves.toEqual([tag]);
    expect(repo.listGenres).toHaveBeenCalledWith(true);
    expect(cache.getOrSetTagged).toHaveBeenCalledTimes(2);
  });

  it('create returns contentCount 0 and busts the cache', async () => {
    const { svc, cache } = build();
    await expect(svc.createStudio({ name: 'Seoul', countryCode: 'KR' })).resolves.toEqual({ ...studio, contentCount: 0 });
    await expect(svc.createPerson({ name: 'Min-jun', knownFor: 'director' })).resolves.toEqual({ ...person, contentCount: 0 });
    expect(cache.invalidateTag).toHaveBeenCalledWith('taxonomy');
  });

  it('update attaches the live usage count', async () => {
    const { svc, repo } = build();
    await expect(svc.updateStudio('s1', { countryCode: null })).resolves.toEqual({ ...studio, contentCount: 7 });
    expect(repo.updateStudio).toHaveBeenCalledWith('s1', { countryCode: null });
    expect(repo.countContentUsage).toHaveBeenCalledWith('studio', ['s1']);
    await expect(svc.updatePerson('p1', { knownFor: 'writer' })).resolves.toMatchObject({ contentCount: 7 });
    expect(repo.countContentUsage).toHaveBeenCalledWith('person', ['p1']);
    await expect(svc.updateTag('t1', 'hot')).resolves.toEqual({ ...tag, contentCount: 7 });
  });

  it('update of a missing row throws NotFound without counting', async () => {
    const { svc, repo } = build();
    await expect(svc.updateGenre('nope', { name: 'x' })).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.countContentUsage).not.toHaveBeenCalled();
  });
});
