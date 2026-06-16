import { Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { PlanRecord, RegionPrice, SubscriptionPlanRepository } from '@db/repositories/subscriptions/subscription-plan.repository';
import { ProfileRepository } from '@db/repositories/users/profile.repository';
import { CreatePlanDto, SetRegionPriceDto, UpdatePlanDto } from './dto/plan.dto';

export interface PlanWithPrice extends PlanRecord {
  price: { priceCents: number; currency: string; region: string | null };
}
export interface AdminPlan extends PlanRecord {
  regionPrices: RegionPrice[];
}

/** Plans + region pricing change rarely; one tag busts every cached customer view. */
const PLANS_TAG = 'plans';
const PLANS_TTL = 600;

@Injectable()
export class PlanService {
  constructor(
    private readonly plans: SubscriptionPlanRepository,
    private readonly profiles: ProfileRepository,
    private readonly cache: CacheService,
  ) {}

  /** Active plans with the price resolved for the caller's region (falls back to base price). */
  async listForCustomer(userId: string): Promise<PlanWithPrice[]> {
    const profile = await this.profiles.getProfile(userId);
    const region = profile?.region ?? null;
    // Cacheable per-region (the only per-user variance); slow-changing catalog + pricing.
    return this.cache.getOrSetTagged(`plans:customer:${region ?? 'base'}`, [PLANS_TAG], PLANS_TTL, async () => {
      const plans = await this.plans.list(true);
      return Promise.all(
        plans.map(async (p) => {
          const rp = region ? await this.plans.priceForRegion(p.id, region) : null;
          const price = rp
            ? { priceCents: rp.priceCents, currency: rp.currency, region }
            : { priceCents: p.basePriceCents, currency: p.baseCurrency, region: null };
          return { ...p, price };
        }),
      );
    });
  }

  /** Bust every cached customer plan view after a catalog/pricing change. */
  private bust(): Promise<void> {
    return this.cache.invalidateTag(PLANS_TAG);
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────
  async adminList(): Promise<AdminPlan[]> {
    const plans = await this.plans.list(false);
    return Promise.all(plans.map(async (p) => ({ ...p, regionPrices: await this.plans.getRegionPrices(p.id) })));
  }

  async create(dto: CreatePlanDto, adminId: string): Promise<PlanRecord> {
    const created = await this.plans.create(dto, adminId);
    await this.bust();
    return created;
  }

  async update(id: string, dto: UpdatePlanDto): Promise<PlanRecord> {
    const updated = await this.plans.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Plan not found');
    }
    await this.bust();
    return updated;
  }

  async remove(id: string): Promise<{ deleted: true }> {
    const ok = await this.plans.softDelete(id);
    if (!ok) {
      throw new NotFoundException('Plan not found');
    }
    await this.bust();
    return { deleted: true };
  }

  async setRegionPrice(planId: string, dto: SetRegionPriceDto): Promise<{ region: string; priceCents: number; currency: string }> {
    const plan = await this.plans.getById(planId);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    await this.plans.setRegionPrice(planId, dto.region, dto.priceCents, dto.currency ?? plan.baseCurrency);
    await this.bust();
    return { region: dto.region, priceCents: dto.priceCents, currency: dto.currency ?? plan.baseCurrency };
  }
}
