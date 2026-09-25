import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { contentReactions } from '@db/drizzle/schema';
import { and, eq, inArray } from 'drizzle-orm';

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

  /** The user's reactions on many contents at once (feed cards) — only rows that exist. */
  async getUserReactions(userId: string, contentIds: readonly string[], tx?: DBExecutor): Promise<Map<string, ReactionKind>> {
    const out = new Map<string, ReactionKind>();
    if (contentIds.length === 0) {
      return out;
    }
    const rows = await this.exec(tx)
      .select({ contentId: contentReactions.contentId, reaction: contentReactions.reaction })
      .from(contentReactions)
      .where(and(eq(contentReactions.userId, userId), inArray(contentReactions.contentId, [...contentIds])));
    for (const r of rows) {
      out.set(r.contentId, r.reaction as ReactionKind);
    }
    return out;
  }
}
