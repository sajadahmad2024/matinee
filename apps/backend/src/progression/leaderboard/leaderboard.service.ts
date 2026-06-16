import { Injectable } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import { LeaderboardRepository, LeaderboardRow, MyRank } from '@db/repositories/progression/leaderboard.repository';
import { LeaderboardQueryDto } from './dto/leaderboard.dto';

// Ranked pages are expensive (ORDER BY over the month) and XP changes constantly, so we use a
// short TTL rather than precise invalidation — small, bounded staleness is acceptable here.
const RANKED_TTL = 60;

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly leaderboard: LeaderboardRepository,
    private readonly cache: CacheService,
  ) {}

  /** Cached ranked page (short TTL). The viewer's own rank is fetched fresh by the callers. */
  private getRankedCached(periodMonth: string, page: number, limit: number): Promise<{ items: LeaderboardRow[]; total: number }> {
    return this.cache.getOrSet(`leaderboard:${periodMonth}:${page}:${limit}`, RANKED_TTL, () =>
      this.leaderboard.getRanked(periodMonth, page, limit),
    );
  }

  /** First-of-month date string for a 'YYYY-MM' input, or the current month. */
  private resolvePeriod(month?: string): string {
    if (month) {
      return `${month}-01`;
    }
    return `${new Date().toISOString().slice(0, 7)}-01`;
  }

  private paginate(total: number, page: number, limit: number): PaginationDetailsDto {
    return { pageNo: page, pageSize: limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  /** Customer leaderboard: ranked page + the viewer's own rank. */
  async getForViewer(
    viewerId: string,
    query: LeaderboardQueryDto,
  ): Promise<{ periodMonth: string; items: LeaderboardRow[]; pagination: PaginationDetailsDto; myRank: MyRank | null }> {
    const periodMonth = this.resolvePeriod(query.month);
    const [{ items, total }, myRank] = await Promise.all([
      this.getRankedCached(periodMonth, query.page, query.limit),
      this.leaderboard.getMyRank(periodMonth, viewerId),
    ]);
    return { periodMonth, items, pagination: this.paginate(total, query.page, query.limit), myRank };
  }

  /** Admin view: ranked page for any month (no caller rank). */
  async getForAdmin(
    query: LeaderboardQueryDto,
  ): Promise<{ periodMonth: string; items: LeaderboardRow[]; pagination: PaginationDetailsDto; myRank: null }> {
    const periodMonth = this.resolvePeriod(query.month);
    const { items, total } = await this.getRankedCached(periodMonth, query.page, query.limit);
    return { periodMonth, items, pagination: this.paginate(total, query.page, query.limit), myRank: null };
  }
}
