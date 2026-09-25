import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CacheService } from '@cache/cache.service';
import { ContentExtrasRepository } from '@db/repositories/content/content-extras.repository';
import { ContentRecord, ContentRepository } from '@db/repositories/content/content.repository';
import { MediaService } from '../../media/media.service';
import { ContentService } from './content.service';
import { ContentListQueryDto } from './dto/content-query.dto';
import { CreateContentDto } from './dto/content-write.dto';
import { isBoostActive, toEnrichedAdminContent, viewsTrend } from './mappers/content.mapper';

const G1 = '0190a000-0000-7000-8000-000000000001';
const G2 = '0190a000-0000-7000-8000-000000000002';

function record(over: Partial<ContentRecord> = {}): ContentRecord {
  return {
    id: 'c1', title: 'Neon Nights', slug: 'neon-nights-x', description: null, contentType: 'trailer', accessTier: 'free',
    unlockPoints: null, studioId: null, videoMediaId: null, thumbnailMediaId: null, durationSeconds: 120, language: 'en',
    status: 'draft', scheduledAt: null, publishedAt: null, isBoosted: false, boostPriority: 0, boostStartsAt: null,
    boostedUntil: null, boostChannels: [], recommendation: 'normal', isSponsored: false, isAdCommercial: false,
    rightsRegion: 'global', parentContentId: null, licenseStatus: 'original', licenseExpiresAt: null, licensorName: null,
    licenseTerms: null, availableUntil: null, watchLinks: [], createdBy: 'a1', updatedBy: 'a1', viewCount: 2000,
    likeCount: 0, dislikeCount: 0, commentCount: 0, shareCount: 0, rejectionReason: null,
    createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z', ...over,
  };
}

function build(current: ContentRecord | null = record()) {
  const repo = {
    findById: jest.fn().mockResolvedValue(current),
    existingIds: jest.fn((_k: string, ids: string[]) => Promise.resolve(new Set(ids))),
    createWithRelations: jest.fn().mockResolvedValue(record()),
    updateWithRelations: jest.fn().mockResolvedValue(record()),
    unschedule: jest.fn().mockResolvedValue(record({ status: 'pending_approval' })),
    setBoost: jest.fn().mockResolvedValue(record({ isBoosted: true, boostPriority: 100 })),
    setStatus: jest.fn().mockResolvedValue(record({ status: 'scheduled' })),
    list: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    getCast: jest.fn().mockResolvedValue([]),
    adminSignals: jest.fn().mockResolvedValue(new Map()),
    getGenresFor: jest.fn().mockResolvedValue(new Map()),
    getTagsFor: jest.fn().mockResolvedValue(new Map()),
    getRegionsFor: jest.fn().mockResolvedValue(new Map()),
  };
  const history = { recordChange: jest.fn().mockResolvedValue(undefined) };
  const media = { publicUrls: jest.fn().mockResolvedValue(new Map()) };
  const cache = { invalidateTag: jest.fn().mockResolvedValue(undefined) };
  const svc = new ContentService(
    repo as unknown as ContentRepository,
    history as unknown as ContentExtrasRepository,
    media as unknown as MediaService,
    cache as unknown as CacheService,
  );
  return { svc, repo, history, cache };
}

describe('content mapper', () => {
  it('viewsTrend: ±10% is flat, no baseline with views is up', () => {
    expect(viewsTrend(0, 0)).toBe('flat');
    expect(viewsTrend(5, 0)).toBe('up');
    expect(viewsTrend(105, 100)).toBe('flat');
    expect(viewsTrend(120, 100)).toBe('up');
    expect(viewsTrend(80, 100)).toBe('down');
  });

  it('isBoostActive respects the window', () => {
    const now = new Date('2026-09-25T00:00:00Z');
    expect(isBoostActive(record({ isBoosted: false }), now)).toBe(false);
    expect(isBoostActive(record({ isBoosted: true }), now)).toBe(true);
    expect(isBoostActive(record({ isBoosted: true, boostStartsAt: '2026-09-26T00:00:00Z' }), now)).toBe(false);
    expect(isBoostActive(record({ isBoosted: true, boostedUntil: '2026-09-24T00:00:00Z' }), now)).toBe(false);
  });

  it('enrichment computes revenue per 1k views and actor refs', () => {
    const dto = toEnrichedAdminContent(record(), {
      signals: {
        studioName: 'Seoul', linkedGamesCount: 2, sponsorName: null, adPlacement: null, completionRate: 50,
        views7d: 10, viewsPrev7d: 5, revenueCents: 1000, unresolvedFlags: 1, createdByName: 'Sarah K.', updatedByName: null,
      },
      genres: [], tags: [], regions: [{ region: 'NA', live: true }], thumbnailUrl: null,
    });
    expect(dto.revenuePer1kCents).toBe(500);
    expect(dto.viewsTrend).toBe('up');
    expect(dto.createdBy).toEqual({ id: 'a1', name: 'Sarah K.' });
    expect(dto.publishRegions).toEqual([{ region: 'NA', live: true }]);
  });
});

describe('ContentListQueryDto', () => {
  it('parses CSV statuses and boolean strings', async () => {
    const dto = plainToInstance(ContentListQueryDto, { status: 'published,scheduled', isBoosted: 'true', hasParent: 'false' });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.status).toEqual(['published', 'scheduled']);
    expect(dto.isBoosted).toBe(true);
    expect(dto.hasParent).toBe(false);
  });

  it('rejects unknown statuses and sorts', async () => {
    const dto = plainToInstance(ContentListQueryDto, { status: 'published,live', sort: 'random' });
    const props = (await validate(dto)).map((e) => e.property);
    expect(props).toEqual(expect.arrayContaining(['status', 'sort']));
  });
});

describe('CreateContentDto watch links', () => {
  it('requires label for Other and https urls', async () => {
    const bad = plainToInstance(CreateContentDto, {
      title: 'X title',
      watchLinks: [{ platform: 'Other' }, { platform: 'Netflix', url: 'http://netflix.com' }],
    });
    expect((await validate(bad)).map((e) => e.property)).toContain('watchLinks');
    const ok = plainToInstance(CreateContentDto, { title: 'X title', watchLinks: [{ platform: 'Other', label: 'Mubi' }] });
    expect(await validate(ok)).toHaveLength(0);
  });
});

describe('ContentService', () => {
  it('rejects primaryGenreId outside genreIds', async () => {
    const { svc } = build();
    await expect(svc.create('a1', { title: 'X', genreIds: [G1], primaryGenreId: G2 })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects unknown genre ids', async () => {
    const { svc, repo } = build();
    repo.existingIds.mockResolvedValueOnce(new Set([G1]));
    await expect(svc.create('a1', { title: 'X', genreIds: [G1, G2] })).rejects.toThrow(/Unknown genre/);
  });

  it('creates with relations and records history', async () => {
    const { svc, repo, history, cache } = build();
    await svc.create('a1', { title: 'X', genreIds: [G1], primaryGenreId: G1, tagIds: [] });
    expect(repo.createWithRelations).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'X', createdBy: 'a1' }),
      { genreIds: [G1], primaryGenreId: G1, tagIds: [], cast: undefined },
    );
    expect(history.recordChange).toHaveBeenCalledWith('c1', 'created', 'a1', expect.any(String));
    expect(cache.invalidateTag).toHaveBeenCalledWith('content');
  });

  it('rejects a past availableUntil and a past schedule', async () => {
    const { svc } = build();
    await expect(svc.create('a1', { title: 'X', availableUntil: '2000-01-01T00:00:00Z' })).rejects.toThrow(/future/);
    await expect(svc.publish('a1', 'c1', '2000-01-01T00:00:00Z')).rejects.toThrow(/future/);
  });

  it('unschedule only from scheduled', async () => {
    const { svc } = build(record({ status: 'published' }));
    await expect(svc.unschedule('a1', 'c1')).rejects.toBeInstanceOf(ConflictException);
    const ok = build(record({ status: 'scheduled', scheduledAt: '2030-01-01T00:00:00Z' }));
    await expect(ok.svc.unschedule('a1', 'c1')).resolves.toMatchObject({ status: 'pending_approval' });
    expect(ok.history.recordChange).toHaveBeenCalledWith('c1', 'unscheduled', 'a1', expect.any(String));
  });

  it('boost validates the window and passes channels', async () => {
    const { svc, repo } = build();
    await expect(
      svc.boost('a1', 'c1', { startsAt: '2030-01-02T00:00:00Z', until: '2030-01-01T00:00:00Z' }),
    ).rejects.toThrow(/after startsAt/);
    await svc.boost('a1', 'c1', { until: '2030-01-01T00:00:00Z', channels: ['homepage'] });
    expect(repo.setBoost).toHaveBeenCalledWith('c1', expect.objectContaining({ boosted: true, priority: 100, channels: ['homepage'] }));
  });

  it('a content cannot parent itself or nest under a child', async () => {
    const { svc, repo } = build();
    await expect(svc.update('a1', 'c1', { parentContentId: 'c1' })).rejects.toThrow(/own parent/);
    repo.findById.mockResolvedValueOnce(record()).mockResolvedValueOnce(record({ id: 'p1', parentContentId: 'x' }));
    await expect(svc.update('a1', 'c1', { parentContentId: 'p1' })).rejects.toThrow(/primary title/);
  });

  it('getAdmin 404s', async () => {
    const { svc } = build(null);
    await expect(svc.getAdmin('nope')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('adminList maps query to filters', async () => {
    const { svc, repo } = build();
    const q = plainToInstance(ContentListQueryDto, { status: 'published,scheduled', region: 'EU', sort: 'most_viewed' });
    await svc.adminList(q);
    expect(repo.list).toHaveBeenCalledWith(
      expect.objectContaining({ statuses: ['published', 'scheduled'], region: 'EU', sort: 'most_viewed', page: 1, limit: 20 }),
    );
  });
});
