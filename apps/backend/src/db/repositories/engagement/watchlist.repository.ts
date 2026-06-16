import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { contentWatchlist } from '@db/drizzle/schema';
import { and, desc, eq, sql } from 'drizzle-orm';

export interface SavedItem {
  contentId: string;
  savedAt: string;
}

/** "Save for later" watchlist. PK (user, content) makes add idempotent. */
@Injectable()
export class WatchlistRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  async add(userId: string, contentId: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).insert(contentWatchlist).values({ userId, contentId }).onConflictDoNothing();
  }

  async remove(userId: string, contentId: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .delete(contentWatchlist)
      .where(and(eq(contentWatchlist.userId, userId), eq(contentWatchlist.contentId, contentId)));
  }

  async isSaved(userId: string, contentId: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .select({ contentId: contentWatchlist.contentId })
      .from(contentWatchlist)
      .where(and(eq(contentWatchlist.userId, userId), eq(contentWatchlist.contentId, contentId)))
      .limit(1);
    return rows.length > 0;
  }

  /** Saved content ids (newest-saved first), paginated — hydrated to cards by the service. */
  async listSaved(
    userId: string,
    page: number,
    limit: number,
    tx?: DBExecutor,
  ): Promise<{ items: SavedItem[]; total: number }> {
    const db = this.exec(tx);
    const where = eq(contentWatchlist.userId, userId);
    const [items, totalRes] = await Promise.all([
      db
        .select({ contentId: contentWatchlist.contentId, savedAt: contentWatchlist.createdAt })
        .from(contentWatchlist)
        .where(where)
        .orderBy(desc(contentWatchlist.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ n: sql<number>`count(*)::int` }).from(contentWatchlist).where(where),
    ]);
    return { items, total: totalRes[0]?.n ?? 0 };
  }
}
