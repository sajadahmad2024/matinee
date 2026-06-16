import { Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import {
  CastInput,
  ContentListFilters,
  ContentRepository,
  FeedFilters,
} from '@db/repositories/content/content.repository';
import { ContentResponseDto } from './dto/content-response.dto';
import { CreateContentDto, UpdateContentDto } from './dto/content-write.dto';
import { toAdminContent, toPublicContent } from './mappers/content.mapper';

export interface PaginatedContent {
  items: ContentResponseDto[];
  pagination: PaginationDetailsDto;
}

/** One cache tag for all content reads — bumped on any mutation → invalidates feed + detail. */
const CONTENT_TAG = 'content';
const FEED_TTL = 30; // seconds — hot path, tolerates slight staleness
const DETAIL_TTL = 120;

@Injectable()
export class ContentService {
  constructor(
    private readonly repo: ContentRepository,
    private readonly cache: CacheService,
  ) {}

  private slugify(title: string): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 300);
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${base || 'content'}-${suffix}`;
  }

  private paginate(total: number, filters: { page: number; limit: number }): PaginationDetailsDto {
    return {
      pageNo: filters.page,
      pageSize: filters.limit,
      totalCount: total,
      totalPages: Math.max(1, Math.ceil(total / filters.limit)),
    };
  }

  /** Invalidate every content read (feed + detail) after a write. */
  private bust(): Promise<void> {
    return this.cache.invalidateTag(CONTENT_TAG);
  }

  // ─── Customer (cached) ───────────────────────────────────────────────────────
  feed(filters: FeedFilters): Promise<PaginatedContent> {
    const key = `content:feed:${filters.region ?? 'all'}:${filters.page}:${filters.limit}`;
    return this.cache.getOrSetTagged(key, [CONTENT_TAG], FEED_TTL, async () => {
      const { items, total } = await this.repo.feed(filters);
      return { items: items.map(toPublicContent), pagination: this.paginate(total, filters) };
    });
  }

  getPublic(id: string): Promise<ContentResponseDto> {
    return this.cache.getOrSetTagged(`content:detail:${id}`, [CONTENT_TAG], DETAIL_TTL, async () => {
      const c = await this.repo.findById(id);
      if (!c || c.status !== 'published') throw new NotFoundException('Content not found');
      const cast = await this.repo.getCast(id);
      return { ...toPublicContent(c), cast };
    });
  }

  // ─── Admin (fresh; mutations bust the cache) ──────────────────────────────────
  async adminList(filters: ContentListFilters): Promise<PaginatedContent> {
    const { items, total } = await this.repo.list(filters);
    return { items: items.map(toAdminContent), pagination: this.paginate(total, filters) };
  }

  async getAdmin(id: string): Promise<ContentResponseDto> {
    const c = await this.repo.findById(id);
    if (!c) throw new NotFoundException('Content not found');
    const cast = await this.repo.getCast(id);
    return { ...toAdminContent(c), cast };
  }

  /** Replace the cast list on a content (admin editor). Busts the detail cache. */
  async setCast(id: string, members: CastInput[]): Promise<ContentResponseDto> {
    const c = await this.repo.findById(id);
    if (!c) throw new NotFoundException('Content not found');
    const cast = await this.repo.setCast(id, members);
    await this.bust();
    return { ...toAdminContent(c), cast };
  }

  async create(adminId: string, dto: CreateContentDto): Promise<ContentResponseDto> {
    const c = await this.repo.create({ ...dto, slug: this.slugify(dto.title), createdBy: adminId });
    await this.bust();
    return toAdminContent(c);
  }

  async update(adminId: string, id: string, dto: UpdateContentDto): Promise<ContentResponseDto> {
    const c = await this.repo.update(id, { ...dto, updatedBy: adminId });
    if (!c) throw new NotFoundException('Content not found');
    await this.bust();
    return toAdminContent(c);
  }

  /** Approve & publish (now) or schedule for a future go-live. */
  async publish(adminId: string, id: string, scheduledAt?: string): Promise<ContentResponseDto> {
    const c = scheduledAt
      ? await this.repo.setStatus(id, 'scheduled', { scheduledAt, approvedBy: adminId })
      : await this.repo.setStatus(id, 'published', { publishedAt: true, approvedBy: adminId });
    if (!c) throw new NotFoundException('Content not found');
    await this.bust();
    return toAdminContent(c);
  }

  async reject(adminId: string, id: string, reason: string): Promise<ContentResponseDto> {
    const c = await this.repo.setStatus(id, 'rejected', { approvedBy: adminId, rejectionReason: reason });
    if (!c) throw new NotFoundException('Content not found');
    await this.bust();
    return toAdminContent(c);
  }

  async archive(id: string): Promise<ContentResponseDto> {
    const c = await this.repo.setStatus(id, 'archived', {});
    if (!c) throw new NotFoundException('Content not found');
    await this.bust();
    return toAdminContent(c);
  }

  /** Submit a draft for review (draft → pending_approval). */
  async submit(id: string): Promise<ContentResponseDto> {
    const c = await this.repo.setStatus(id, 'pending_approval', {});
    if (!c) throw new NotFoundException('Content not found');
    await this.bust();
    return toAdminContent(c);
  }

  /** Boost / un-boost content in the feed. */
  async boost(id: string, boosted: boolean, priority: number, until?: string): Promise<ContentResponseDto> {
    const c = await this.repo.setBoost(id, boosted, priority, until);
    if (!c) throw new NotFoundException('Content not found');
    await this.bust();
    return toAdminContent(c);
  }

  async remove(id: string): Promise<{ message: string }> {
    const c = await this.repo.findById(id);
    if (!c) throw new NotFoundException('Content not found');
    await this.repo.softDelete(id);
    await this.bust();
    return { message: 'Content deleted' };
  }
}
