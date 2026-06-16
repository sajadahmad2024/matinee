import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DBService } from '@db/db.service';
import { CatalogItem, RewardCatalogRepository } from '@db/repositories/redemption/reward-catalog.repository';
import { RedemptionRecord, RewardRedemptionRepository } from '@db/repositories/redemption/reward-redemption.repository';
import { LedgerRepository } from '@db/repositories/tokenomics/ledger.repository';
import { SubscriptionRepository } from '@db/repositories/subscriptions/subscription.repository';
import { ProfileRepository } from '@db/repositories/users/profile.repository';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';

export interface RedeemResult {
  redemptionId: string;
  itemId: string;
  costPoints: number;
  status: string;
  pointsBalance: number;
}

export interface Paged {
  items: RedemptionRecord[];
  pagination: PaginationDetailsDto;
}

@Injectable()
export class RedemptionService {
  constructor(
    private readonly db: DBService,
    private readonly catalog: RewardCatalogRepository,
    private readonly redemptions: RewardRedemptionRepository,
    private readonly ledger: LedgerRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly profiles: ProfileRepository,
  ) {}

  private page(total: number, page: number, limit: number): PaginationDetailsDto {
    return { pageNo: page, pageSize: limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  /** Enforce every storefront eligibility rule before taking points. */
  private async assertEligible(userId: string, item: CatalogItem): Promise<void> {
    if (!item.isActive) {
      throw new BadRequestException('This reward is not available');
    }
    const now = Date.now();
    if (item.startsAt && new Date(item.startsAt).getTime() > now) {
      throw new BadRequestException('This reward is not yet available');
    }
    if (item.endsAt && new Date(item.endsAt).getTime() <= now) {
      throw new BadRequestException('This reward offer has ended');
    }
    if (item.requiresSubscription) {
      const sub = await this.subscriptions.getActiveForUser(userId);
      if (!sub) {
        throw new ForbiddenException('This reward requires an active subscription');
      }
    }
    if (item.region) {
      const profile = await this.profiles.getProfile(userId);
      if ((profile?.region ?? null) !== item.region) {
        throw new ForbiddenException('This reward is not available in your region');
      }
    }
  }

  /** Redeem an item: claim stock + spend points + record redemption — all atomic. */
  async redeem(userId: string, itemId: string): Promise<RedeemResult> {
    const item = await this.catalog.getById(itemId);
    if (!item) {
      throw new NotFoundException('Catalog item not found');
    }
    await this.assertEligible(userId, item);
    const tracked = item.stockTotal !== null;
    try {
      return await this.db.transaction(async (tx) => {
        if (tracked) {
          const claimed = await this.catalog.claimStock(itemId, tx);
          if (!claimed) {
            throw new ConflictException('This reward is out of stock');
          }
        }
        const redemptionId = await this.redemptions.create(itemId, userId, item.costPoints, tx);
        const res = await this.ledger.append(
          {
            userId,
            currency: 'points',
            amount: -item.costPoints,
            direction: 'spend',
            sourceKind: 'earned',
            sourceType: 'reward_redemption',
            sourceId: itemId,
            idempotencyKey: `redeem:${redemptionId}`,
            note: `Redeemed: ${item.name}`,
          },
          tx,
        );
        return { redemptionId, itemId, costPoints: item.costPoints, status: 'pending', pointsBalance: res.balanceAfter };
      });
    } catch (e) {
      const code = (e as { code?: string })?.code ?? (e as { cause?: { code?: string } })?.cause?.code;
      if (code === '23514') {
        throw new BadRequestException('Insufficient points to redeem this reward');
      }
      throw e;
    }
  }

  async myRedemptions(userId: string, page: number, limit: number): Promise<Paged> {
    const { items, total } = await this.redemptions.listByUser(userId, page, limit);
    return { items, pagination: this.page(total, page, limit) };
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────
  async adminList(page: number, limit: number, status?: string): Promise<Paged> {
    const { items, total } = await this.redemptions.listAll({ page, limit, ...(status ? { status } : {}) });
    return { items, pagination: this.page(total, page, limit) };
  }

  async fulfill(redemptionId: string, note?: string): Promise<{ id: string; status: string }> {
    const r = await this.redemptions.getById(redemptionId);
    if (!r) {
      throw new NotFoundException('Redemption not found');
    }
    if (!['pending', 'confirmed'].includes(r.status)) {
      throw new BadRequestException(`Cannot fulfill a ${r.status} redemption`);
    }
    await this.redemptions.setStatus(redemptionId, 'fulfilled', note);
    return { id: redemptionId, status: 'fulfilled' };
  }

  /** Cancel + refund: return points and restock, atomically. Only for not-yet-fulfilled redemptions. */
  async cancel(redemptionId: string, note?: string): Promise<{ id: string; status: string; refundedPoints: number }> {
    const r = await this.redemptions.getById(redemptionId);
    if (!r) {
      throw new NotFoundException('Redemption not found');
    }
    if (!['pending', 'confirmed'].includes(r.status)) {
      throw new BadRequestException(`Cannot cancel a ${r.status} redemption`);
    }
    await this.db.transaction(async (tx) => {
      await this.redemptions.setStatus(redemptionId, 'refunded', note, tx);
      await this.ledger.append(
        {
          userId: r.userId,
          currency: 'points',
          amount: r.costPoints,
          direction: 'refund',
          sourceKind: 'earned',
          sourceType: 'reward_redemption',
          sourceId: r.itemId,
          idempotencyKey: `refund:${redemptionId}`,
          note: `Refund: ${r.itemName ?? 'reward'}`,
        },
        tx,
      );
      await this.catalog.releaseStock(r.itemId, tx);
    });
    return { id: redemptionId, status: 'refunded', refundedPoints: r.costPoints };
  }
}
