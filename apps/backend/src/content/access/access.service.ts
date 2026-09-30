import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthContext } from '@auth/interfaces/auth-context.interface';
import { AccountType } from '@auth/interfaces/jwt-payload.interface';
import { DBService } from '@db/db.service';
import { ContentRecord, ContentRepository } from '@db/repositories/content/content.repository';
import { MediaStatus } from '@media/constants/media.constant';
import { MediaService } from '@media/media.service';
import { PlaybackDto } from '@media/dto/media-response.dto';
import { ContentUnlockRepository } from '@db/repositories/content/unlock.repository';
import { LedgerRepository } from '@db/repositories/tokenomics/ledger.repository';

export interface Entitlement {
  contentId: string;
  accessTier: string;
  unlockPoints: number;
  isLocked: boolean;
  isUnlocked: boolean;
}

export interface ContentPlayback {
  contentId: string;
  mediaId: string;
  accessTier: string;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  playback: PlaybackDto;
}

const MACRO_REGIONS = ['NA', 'EU', 'APAC', 'LATAM', 'MEA'];

/** Published, not deleted, inside its live window and licence not expired. */
export function isPlayableNow(c: ContentRecord, now: Date = new Date()): boolean {
  if (c.status !== 'published') return false;
  if (c.availableUntil && new Date(c.availableUntil) <= now) return false;
  if (c.licenseStatus === 'expired') return false;
  return true;
}

export interface UnlockResult {
  isUnlocked: true;
  alreadyUnlocked: boolean;
  pointsSpent: number;
  pointsBalance: number | null;
}

/**
 * Content access / unlocking. Exclusive content is gated behind `unlock_points`; unlocking
 * spends points and records a `content_unlocks` entitlement — atomically, so a user can never
 * be debited without the unlock (or vice-versa). Spends via the shared LedgerRepository (the
 * DB ledger_apply trigger maintains the wallet and rejects an over-spend).
 */
@Injectable()
export class AccessService {
  constructor(
    private readonly db: DBService,
    private readonly content: ContentRepository,
    private readonly unlocks: ContentUnlockRepository,
    private readonly ledger: LedgerRepository,
    private readonly media: MediaService,
  ) {}

  /**
   * Entitlement-checked playback for a content's video. Non-admins: published + live window +
   * licence not expired (404), region availability when the viewer has a macro-region (403),
   * exclusive requires an unlock (403). Admins skip those checks (preview). 409 when the video
   * isn't ready.
   */
  async playback(actor: AuthContext, contentId: string): Promise<ContentPlayback> {
    const c = await this.content.findById(contentId);
    if (!c) throw new NotFoundException('Content not found');
    if (actor.accountType !== AccountType.ADMIN) {
      if (!isPlayableNow(c)) throw new NotFoundException('Content not found');
      const region = (await this.content.viewerRegion(actor.id))?.toUpperCase();
      if (region && MACRO_REGIONS.includes(region) && !(await this.content.isAvailableIn(contentId, region))) {
        throw new ForbiddenException('Content is not available in your region');
      }
      if (c.accessTier === 'exclusive' && !(await this.unlocks.isUnlocked(actor.id, contentId))) {
        throw new ForbiddenException('Content is locked — unlock it first');
      }
    }
    if (!c.videoMediaId) throw new ConflictException('Content has no video yet');
    const video = (await this.media.findRecords([c.videoMediaId])).get(c.videoMediaId);
    if (!video || video.status !== MediaStatus.READY) throw new ConflictException('Video is not ready yet');
    return {
      contentId,
      mediaId: video.id,
      accessTier: c.accessTier,
      durationSeconds: c.durationSeconds,
      width: video.width,
      height: video.height,
      playback: await this.media.getPlayback(video.id),
    };
  }

  private async loadPublished(contentId: string) {
    const c = await this.content.findById(contentId);
    if (!c || c.status !== 'published') {
      throw new NotFoundException('Content not found');
    }
    return c;
  }

  /** Lock/unlock state for a content + the caller. Free content is always unlocked. */
  async getEntitlement(userId: string, contentId: string): Promise<Entitlement> {
    const c = await this.loadPublished(contentId);
    if (c.accessTier !== 'exclusive') {
      return { contentId, accessTier: c.accessTier, unlockPoints: 0, isLocked: false, isUnlocked: true };
    }
    const isUnlocked = await this.unlocks.isUnlocked(userId, contentId);
    return {
      contentId,
      accessTier: 'exclusive',
      unlockPoints: c.unlockPoints ?? 0,
      isLocked: !isUnlocked,
      isUnlocked,
    };
  }

  /** Unlock exclusive content by spending its points. Idempotent; 400 on insufficient balance. */
  async unlock(userId: string, contentId: string): Promise<UnlockResult> {
    const c = await this.loadPublished(contentId);
    if (c.accessTier !== 'exclusive') {
      throw new BadRequestException('This content is free — no unlock required');
    }
    const points = c.unlockPoints ?? 0;
    try {
      return await this.db.transaction(async (tx) => {
        const fresh = await this.unlocks.insertIfAbsent(userId, contentId, points, tx);
        if (!fresh) {
          return { isUnlocked: true, alreadyUnlocked: true, pointsSpent: 0, pointsBalance: null };
        }
        let pointsBalance: number | null = null;
        if (points > 0) {
          // Throws SQLSTATE 23514 (rolls back the whole tx, incl. the unlock) if balance < points.
          const res = await this.ledger.append(
            {
              userId,
              currency: 'points',
              amount: -points,
              direction: 'spend',
              sourceKind: 'earned',
              sourceType: 'content_unlock',
              sourceId: contentId,
              idempotencyKey: `unlock:${userId}:${contentId}`,
              note: `Unlock: ${c.title}`,
            },
            tx,
          );
          pointsBalance = res.balanceAfter;
        }
        return { isUnlocked: true, alreadyUnlocked: false, pointsSpent: points, pointsBalance };
      });
    } catch (e) {
      const code = (e as { code?: string })?.code ?? (e as { cause?: { code?: string } })?.cause?.code;
      if (code === '23514') {
        throw new BadRequestException('Insufficient points to unlock this content');
      }
      throw e;
    }
  }
}
