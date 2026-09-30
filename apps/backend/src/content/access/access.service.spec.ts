import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthContext } from '@auth/interfaces/auth-context.interface';
import { AccountType } from '@auth/interfaces/jwt-payload.interface';
import { DBService } from '@db/db.service';
import { ContentRepository } from '@db/repositories/content/content.repository';
import { ContentUnlockRepository } from '@db/repositories/content/unlock.repository';
import { LedgerRepository } from '@db/repositories/tokenomics/ledger.repository';
import { MediaService } from '@media/media.service';
import { AccessService } from './access.service';

const customer = { id: 'u1', accountType: AccountType.CUSTOMER } as AuthContext;
const admin = { id: 'a1', accountType: AccountType.ADMIN } as AuthContext;

function build(content: Record<string, unknown> | null) {
  const repo = {
    findById: jest.fn().mockResolvedValue(content),
    viewerRegion: jest.fn().mockResolvedValue(null),
    isAvailableIn: jest.fn().mockResolvedValue(true),
  };
  const unlocks = { isUnlocked: jest.fn().mockResolvedValue(false) };
  const media = {
    findRecords: jest.fn().mockResolvedValue(new Map([['m1', { id: 'm1', status: 'ready', width: 1080, height: 1920 }]])),
    getPlayback: jest.fn().mockResolvedValue({ kind: 'hls', url: 'u', cookies: {}, expiresInSeconds: 900 }),
  };
  const svc = new AccessService(
    {} as DBService,
    repo as unknown as ContentRepository,
    unlocks as unknown as ContentUnlockRepository,
    {} as LedgerRepository,
    media as unknown as MediaService,
  );
  return { svc, repo, unlocks, media };
}

const published = { id: 'c1', status: 'published', accessTier: 'free', videoMediaId: 'm1', availableUntil: null, licenseStatus: 'original', durationSeconds: 90 };

describe('AccessService.playback', () => {
  it('free published content plays', async () => {
    const { svc } = build(published);
    await expect(svc.playback(customer, 'c1')).resolves.toMatchObject({ mediaId: 'm1', width: 1080, durationSeconds: 90, playback: { kind: 'hls' } });
  });

  it('unpublished / expired window / expired licence → 404 for customers, admins preview', async () => {
    for (const over of [{ status: 'draft' }, { availableUntil: '2000-01-01T00:00:00Z' }, { licenseStatus: 'expired' }]) {
      const { svc } = build({ ...published, ...over });
      await expect(svc.playback(customer, 'c1')).rejects.toBeInstanceOf(NotFoundException);
      await expect(svc.playback(admin, 'c1')).resolves.toMatchObject({ mediaId: 'm1' });
    }
  });

  it('exclusive requires an unlock', async () => {
    const { svc, unlocks } = build({ ...published, accessTier: 'exclusive' });
    await expect(svc.playback(customer, 'c1')).rejects.toBeInstanceOf(ForbiddenException);
    unlocks.isUnlocked.mockResolvedValue(true);
    await expect(svc.playback(customer, 'c1')).resolves.toMatchObject({ accessTier: 'exclusive' });
  });

  it('region: only enforced for macro-region viewers', async () => {
    const { svc, repo } = build(published);
    repo.viewerRegion.mockResolvedValue('Mumbai');
    await expect(svc.playback(customer, 'c1')).resolves.toBeDefined();
    repo.viewerRegion.mockResolvedValue('eu');
    repo.isAvailableIn.mockResolvedValue(false);
    await expect(svc.playback(customer, 'c1')).rejects.toThrow(/region/);
    expect(repo.isAvailableIn).toHaveBeenCalledWith('c1', 'EU');
  });

  it('no / not-ready video → 409', async () => {
    const { svc, media } = build({ ...published, videoMediaId: null });
    await expect(svc.playback(customer, 'c1')).rejects.toBeInstanceOf(ConflictException);
    const b = build(published);
    b.media.findRecords.mockResolvedValue(new Map([['m1', { id: 'm1', status: 'processing' }]]));
    await expect(b.svc.playback(customer, 'c1')).rejects.toBeInstanceOf(ConflictException);
    expect(media.getPlayback).not.toHaveBeenCalled();
  });
});
