import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { contentReactions } from '@db/drizzle/schema';
import { and, eq } from 'drizzle-orm';

export type ReactionKind = 'like' | 'dislike';

/**
 * Content like/dislike. One reaction per (content, user) — enforced by a unique constraint;
 * switching like↔dislike upserts. Denormalized counts on `contents` are maintained by the
 * `content_reaction_counts` trigger, so this repo only writes the row.
 */
@Injectable()
export class ReactionRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Set (or switch) the user's reaction on a content. Idempotent for the same reaction. */
  async set(userId: string, contentId: string, reaction: ReactionKind, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .insert(contentReactions)
      .values({ contentId, userId, reaction })
      .onConflictDoUpdate({
        target: [contentReactions.contentId, contentReactions.userId],
        set: { reaction },
      });
  }

  /** Remove the user's reaction (no-op if none). */
  async remove(userId: string, contentId: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .delete(contentReactions)
      .where(and(eq(contentReactions.contentId, contentId), eq(contentReactions.userId, userId)));
  }

  /** The user's current reaction on a content, or null. */
  async getUserReaction(userId: string, contentId: string, tx?: DBExecutor): Promise<ReactionKind | null> {
    const rows = await this.exec(tx)
      .select({ reaction: contentReactions.reaction })
      .from(contentReactions)
      .where(and(eq(contentReactions.contentId, contentId), eq(contentReactions.userId, userId)))
      .limit(1);
    return (rows[0]?.reaction as ReactionKind | undefined) ?? null;
  }
}
