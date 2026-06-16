import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { contentUnlocks } from '@db/drizzle/schema';
import { and, eq, inArray } from 'drizzle-orm';

/** Entitlement records for exclusive content unlocked with points (UNIQUE per user+content). */
@Injectable()
export class ContentUnlockRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  async isUnlocked(userId: string, contentId: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .select({ id: contentUnlocks.id })
      .from(contentUnlocks)
      .where(and(eq(contentUnlocks.userId, userId), eq(contentUnlocks.contentId, contentId)))
      .limit(1);
    return rows.length > 0;
  }

  /** Which of these contentIds the user has unlocked (for feed/list badging). */
  async unlockedAmong(userId: string, contentIds: string[], tx?: DBExecutor): Promise<Set<string>> {
    if (contentIds.length === 0) {
      return new Set();
    }
    const rows = await this.exec(tx)
      .select({ contentId: contentUnlocks.contentId })
      .from(contentUnlocks)
      .where(and(eq(contentUnlocks.userId, userId), inArray(contentUnlocks.contentId, contentIds)));
    return new Set(rows.map((r) => r.contentId));
  }

  /**
   * Insert the entitlement if absent (idempotent). Returns true only when a new row was created —
   * the caller spends points only in that case. Run inside the unlock transaction.
   */
  async insertIfAbsent(userId: string, contentId: string, pointsSpent: number, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .insert(contentUnlocks)
      .values({ userId, contentId, pointsSpent })
      .onConflictDoNothing({ target: [contentUnlocks.contentId, contentUnlocks.userId] })
      .returning({ id: contentUnlocks.id });
    return rows.length > 0;
  }
}
