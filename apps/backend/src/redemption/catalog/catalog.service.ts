import { Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import { CatalogItem, RewardCatalogRepository } from '@db/repositories/redemption/reward-catalog.repository';
import { ProfileRepository } from '@db/repositories/users/profile.repository';
import { CatalogQueryDto, CreateCatalogItemDto, UpdateCatalogItemDto } from './dto/catalog.dto';

export interface Paged {
  items: CatalogItem[];
  pagination: PaginationDetailsDto;
}

/** Storefront catalog is slow-changing; one tag busts every cached region/category page. */
const CATALOG_TAG = 'rewards-catalog';
const CATALOG_TTL = 300;

@Injectable()
export class CatalogService {
  constructor(
    private readonly catalog: RewardCatalogRepository,
    private readonly profiles: ProfileRepository,
    private readonly cache: CacheService,
  ) {}

  private page(total: number, page: number, limit: number): PaginationDetailsDto {
    return { pageNo: page, pageSize: limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  private bust(): Promise<void> {
    return this.cache.invalidateTag(CATALOG_TAG);
  }

  /** Customer storefront — active, in-window, in-stock, region-available for this user. */
  async browse(userId: string, query: CatalogQueryDto): Promise<Paged> {
    const profile = await this.profiles.getProfile(userId);
    const region = profile?.region ?? null;
    const key = `rewards:store:${region ?? 'all'}:${query.category ?? 'all'}:${query.page}:${query.limit}`;
    return this.cache.getOrSetTagged(key, [CATALOG_TAG], CATALOG_TTL, async () => {
      const { items, total } = await this.catalog.list({
        page: query.page,
        limit: query.limit,
        storefront: true,
        region,
        ...(query.category ? { category: query.category } : {}),
      });
      return { items, pagination: this.page(total, query.page, query.limit) };
    });
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────
  async adminList(query: CatalogQueryDto): Promise<Paged> {
    const { items, total } = await this.catalog.list({
      page: query.page,
      limit: query.limit,
      ...(query.category ? { category: query.category } : {}),
    });
    return { items, pagination: this.page(total, query.page, query.limit) };
  }

  async create(dto: CreateCatalogItemDto, adminId: string): Promise<CatalogItem> {
    const created = await this.catalog.create(dto, adminId);
    await this.bust();
    return created;
  }

  async update(id: string, dto: UpdateCatalogItemDto): Promise<CatalogItem> {
    const updated = await this.catalog.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Catalog item not found');
    }
    await this.bust();
    return updated;
  }
}
