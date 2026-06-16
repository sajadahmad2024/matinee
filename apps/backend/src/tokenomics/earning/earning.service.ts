import { Injectable } from '@nestjs/common';
import { LedgerRepository } from '@db/repositories/tokenomics/ledger.repository';
import { RewardRuleRepository } from '@db/repositories/tokenomics/reward-rule.repository';
import { LedgerService } from '../ledger/ledger.service';

interface ShareConfig {
  daily_share_cap?: number;
  behaviors?: Array<{ key: string; points?: number; xp?: number }>;
}
interface DailyLoginConfig {
  points?: number;
  xp?: number;
}

export interface DailyLoginResult {
  points: number;
  xp: number;
  alreadyClaimed: boolean;
}

/**
 * Earning flows — turns engagement/behaviour into ledger awards using the reward-rule config.
 * Every award is idempotent (so retries / duplicate events never double-credit) and respects
 * the rule's daily caps.
 */
@Injectable()
export class EarningService {
  constructor(
    private readonly rules: RewardRuleRepository,
    private readonly ledger: LedgerService,
    private readonly ledgerRepo: LedgerRepository,
  ) {}

  /** Award a share (from the engagement ContentShared event). Capped per day; once per shareId. */
  async awardShare(userId: string, contentId: string, shareId: string): Promise<void> {
    const rule = await this.rules.getByKey('shared_content');
    if (!rule || !rule.isEnabled) {
      return;
    }
    const cfg = (rule.config ?? {}) as ShareConfig;
    const cap = cfg.daily_share_cap ?? Number.POSITIVE_INFINITY;
    const already = await this.ledgerRepo.countTodayBySource(userId, 'content_share');
    if (already >= cap) {
      return; // daily cap reached — silently skip
    }
    const ext = cfg.behaviors?.find((b) => b.key === 'external_share');
    const points = ext?.points ?? 0;
    const xp = ext?.xp ?? 0;
    await this.creditPointsXp(userId, points, xp, 'content_share', `share:${shareId}`, contentId, 'Content share');
  }

  /** Customer daily-login bonus — at most once per UTC day. */
  async claimDailyLogin(userId: string): Promise<DailyLoginResult> {
    const rule = await this.rules.getByKey('daily_login');
    const cfg = (rule?.config ?? {}) as DailyLoginConfig;
    const points = cfg.points ?? 0;
    const xp = cfg.xp ?? 0;
    const day = new Date().toISOString().slice(0, 10);
    const { applied } = await this.creditPointsXp(userId, points, xp, 'daily_streak', `daily_login:${userId}:${day}`, undefined, 'Daily login bonus');
    return { points, xp, alreadyClaimed: !applied };
  }

  /**
   * Credit points and/or xp under one logical event. Distinct idempotency keys per currency so
   * a partial replay still reconciles. Returns whether the POINTS leg applied (claim semantics).
   */
  private async creditPointsXp(
    userId: string,
    points: number,
    xp: number,
    sourceType: string,
    idemBase: string,
    sourceId: string | undefined,
    note: string,
  ): Promise<{ applied: boolean }> {
    const opts = sourceId ? { sourceId, note } : { note };
    let applied = false;
    if (points > 0) {
      const r = await this.ledger.award(userId, 'points', points, sourceType, `${idemBase}:points`, opts);
      applied = r.applied;
    }
    if (xp > 0) {
      const r = await this.ledger.award(userId, 'xp', xp, sourceType, `${idemBase}:xp`, opts);
      if (points <= 0) {
        applied = r.applied;
      }
    }
    return { applied };
  }
}
