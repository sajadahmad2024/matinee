import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { commentReactions } from '@db/drizzle/schema';
import { and, eq } from 'drizzle-orm';

export type CommentReactionKind = 'like' | 'dislike';

/**
 * Like/dislike on a comment. PK (comment, user) — switching upserts. The
 * `comment_reaction_counts` trigger maintains comments.like_count/dislike_count.
 */
@Injectable()
export class CommentReactionRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  async set(userId: string, commentId: string, reaction: CommentReactionKind, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .insert(commentReactions)
      .values({ commentId, userId, reaction })
      .onConflictDoUpdate({ target: [commentReactions.commentId, commentReactions.userId], set: { reaction } });
  }

  async remove(userId: string, commentId: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .delete(commentReactions)
      .where(and(eq(commentReactions.commentId, commentId), eq(commentReactions.userId, userId)));
  }
}
