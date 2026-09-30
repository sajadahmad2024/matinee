import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CacheService } from '@cache/cache.service';
import { ContentExtrasRepository } from '@db/repositories/content/content-extras.repository';
import { ContentRepository } from '@db/repositories/content/content.repository';
import { ContentExtrasService } from './content-extras.service';
import { SponsorshipDto } from './dto/content-extras.dto';

function build() {
  const extras = {
    setRegions: jest.fn((_id: string, regions: string[], off: string[]) =>
      Promise.resolve(regions.map((region) => ({ region, live: !off.includes(region) }))),
    ),
    upsertSponsorship: jest.fn().mockResolvedValue({ id: 's1' }),
    removeLicense: jest.fn().mockResolvedValue(true),
    removeSponsorship: jest.fn().mockResolvedValue(false),
    recordChange: jest.fn().mockResolvedValue(undefined),
  };
  const content = { findById: jest.fn().mockResolvedValue({ id: 'c1' }) };
  const cache = { invalidateTag: jest.fn().mockResolvedValue(undefined) };
  const svc = new ContentExtrasService(
    extras as unknown as ContentExtrasRepository,
    content as unknown as ContentRepository,
    cache as unknown as CacheService,
  );
  return { svc, extras };
}

describe('ContentExtrasService', () => {
  it('regions: offRegions must be a subset; response splits live', async () => {
    const { svc } = build();
    await expect(svc.setRegions('a1', 'c1', { regions: ['NA'], offRegions: ['EU'] })).rejects.toBeInstanceOf(BadRequestException);
    await expect(svc.setRegions('a1', 'c1', { regions: ['NA', 'EU'], offRegions: ['EU'] })).resolves.toEqual({
      regions: ['NA', 'EU'],
      liveRegions: ['NA'],
      items: [{ region: 'NA', live: true }, { region: 'EU', live: false }],
    });
  });

  it('sponsorship: overlayDays derives endsAt; icon-overlay alias maps to overlay', async () => {
    const { svc, extras } = build();
    const dto = plainToInstance(SponsorshipDto, {
      sponsorName: 'Nike', placement: 'icon-overlay', startsAt: '2030-01-01T00:00:00.000Z', overlayDays: 30,
    });
    expect(dto.placement).toBe('overlay');
    await svc.setSponsorship('a1', 'c1', dto);
    expect(extras.upsertSponsorship).toHaveBeenCalledWith(
      'c1',
      expect.objectContaining({ placement: 'overlay', endsAt: '2030-01-31T00:00:00.000Z' }),
      'a1',
    );
    expect(extras.upsertSponsorship.mock.calls[0]?.[1]).not.toHaveProperty('overlayDays');
  });

  it('sponsorship: overlayDays without startsAt starts now', async () => {
    const { svc, extras } = build();
    await svc.setSponsorship('a1', 'c1', { sponsorName: 'Nike', overlayDays: 1 });
    const input = extras.upsertSponsorship.mock.calls[0]?.[1] as { startsAt: string; endsAt: string };
    expect(new Date(input.endsAt).getTime() - new Date(input.startsAt).getTime()).toBe(24 * 60 * 60 * 1000);
  });

  it('sponsorship: endsAt before startsAt is rejected', async () => {
    const { svc } = build();
    await expect(
      svc.setSponsorship('a1', 'c1', { sponsorName: 'Nike', startsAt: '2030-01-02T00:00:00Z', endsAt: '2030-01-01T00:00:00Z' }),
    ).rejects.toThrow(/after startsAt/);
  });

  it('remove license / sponsorship record history', async () => {
    const { svc, extras } = build();
    await expect(svc.removeLicense('a1', 'c1')).resolves.toEqual({ message: 'License removed' });
    await expect(svc.removeSponsorship('a1', 'c1')).resolves.toEqual({ message: 'Sponsorship removed' });
    expect(extras.recordChange).toHaveBeenCalledTimes(2);
  });
});
