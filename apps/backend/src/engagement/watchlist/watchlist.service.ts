import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import { ContentRepository } from '@db/repositories/content/content.repository';
import { WatchlistRepository } from '@db/repositories/engagement/watchlist.repository';
import { ContentAccessService } from '../services/content-access.service';
import { EngagementEvent } from '../events/engagement.events';
import { toPublicContent } from '../../content/catalog/mappers/content.mapper';
import { ContentResponseDto } from '../../content/catalog/dto/content-response.dto';

@Injectable()
export class WatchlistService {
  constructor(
    private readonly watchlist: WatchlistRepository,
    private readonly content: ContentRepository,
    private readonly access: ContentAccessService,
    private readonly events: EventEmitter2,
  ) {}

  async add(userId: string, contentId: string): Promise<{ saved: true }> {
    await this.access.assertPublished(contentId);
    await this.watchlist.add(userId, contentId);
    this.events.emit(EngagementEvent.ContentSaved, { userId, contentId });
    return { saved: true };
  }

  async remove(userId: string, contentId: string): Promise<{ saved: false }> {
    await this.watchlist.remove(userId, contentId);
    this.events.emit(EngagementEvent.ContentUnsaved, { userId, contentId });
    return { saved: false };
  }

  /**
   * My saved content, newest-saved first, hydrated to public cards.
   * Unpublished/deleted saves are dropped from the page (kept in the table for when they return).
   */
  async list(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: ContentResponseDto[]; pagination: PaginationDetailsDto }> {
    const { items, total } = await this.watchlist.listSaved(userId, page, limit);
    const records = await this.content.findPublishedByIds(items.map((i) => i.contentId));
    const byId = new Map(records.map((r) => [r.id, r]));
    const cards = items
      .map((i) => byId.get(i.contentId))
      .filter((r): r is NonNullable<typeof r> => r != null)
      .map(toPublicContent);
    return {
      items: cards,
      pagination: { pageNo: page, pageSize: limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }
}
