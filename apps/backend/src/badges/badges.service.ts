import { Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { BadgeRecord, BadgeRepository, EarnedBadge, TriggerRecord } from '@db/repositories/badges/badge.repository';
import { CreateBadgeDto, UpdateBadgeDto } from './dto/badge.dto';

export interface CustomerBadge extends BadgeRecord {
  earned: boolean;
}

/** The active badge catalog is global + slow-changing; the per-user `earned` flag stays fresh. */
const BADGES_TAG = 'badges';
const BADGES_TTL = 600;

@Injectable()
export class BadgesService {
  constructor(
    private readonly badges: BadgeRepository,
    private readonly cache: CacheService,
  ) {}

  private bust(): Promise<void> {
    return this.cache.invalidateTag(BADGES_TAG);
  }

  private slugify(name: string): string {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 120) || 'badge'
    );
  }

  /** Active badge catalog with an `earned` flag for the caller (catalog cached; earned fresh). */
  async catalog(userId: string): Promise<CustomerBadge[]> {
    const all = await this.cache.getOrSetTagged('badges:active', [BADGES_TAG], BADGES_TTL, () => this.badges.list(true));
    const earned = await this.badges.earnedIds(userId, all.map((b) => b.id));
    return all.map((b) => ({ ...b, earned: earned.has(b.id) }));
  }

  myBadges(userId: string): Promise<EarnedBadge[]> {
    return this.badges.listEarned(userId);
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────
  adminList(): Promise<BadgeRecord[]> {
    return this.badges.list(false);
  }

  triggers(): Promise<TriggerRecord[]> {
    return this.badges.listTriggers();
  }

  async create(dto: CreateBadgeDto, adminId: string): Promise<BadgeRecord> {
    const created = await this.badges.create({ ...dto, slug: this.slugify(dto.name) }, adminId);
    await this.bust();
    return created;
  }

  async update(id: string, dto: UpdateBadgeDto): Promise<BadgeRecord> {
    const patch = { ...dto, ...(dto.name ? { slug: this.slugify(dto.name) } : {}) };
    const updated = await this.badges.update(id, patch);
    if (!updated) {
      throw new NotFoundException('Badge not found');
    }
    await this.bust();
    return updated;
  }

  async remove(id: string): Promise<{ deleted: true }> {
    const ok = await this.badges.softDelete(id);
    if (!ok) {
      throw new NotFoundException('Badge not found');
    }
    await this.bust();
    return { deleted: true };
  }
}
