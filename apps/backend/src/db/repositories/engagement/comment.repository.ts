import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { comments, commentReactions, users } from '@db/drizzle/schema';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';

export interface CommentRecord {
  id: string;
  contentId: string;
  parentCommentId: string | null;
  body: string;
  status: string;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  createdAt: string;
  author: { id: string; username: string | null; firstName: string | null; avatarUrl: string | null };
  myReaction: 'like' | 'dislike' | null;
}

@Injectable()
export class CommentRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Shared SELECT with author join + the viewer's own reaction (left join). */
  private baseSelect(viewerId: string, db: DBExecutor) {
    return db
      .select({
        id: comments.id,
        contentId: comments.contentId,
        parentCommentId: comments.parentCommentId,
        body: comments.body,
        status: comments.status,
        likeCount: comments.likeCount,
        dislikeCount: comments.dislikeCount,
        replyCount: comments.replyCount,
        createdAt: comments.createdAt,
        authorId: users.id,
        authorUsername: users.username,
        authorFirstName: users.firstName,
        authorAvatarUrl: users.avatarUrl,
        myReaction: commentReactions.reaction,
      })
      .from(comments)
      .innerJoin(users, eq(users.id, comments.userId))
      .leftJoin(
        commentReactions,
        and(eq(commentReactions.commentId, comments.id), eq(commentReactions.userId, viewerId)),
      );
  }

  private map(r: {
    id: string; contentId: string; parentCommentId: string | null; body: string; status: string;
    likeCount: number; dislikeCount: number; replyCount: number; createdAt: string;
    authorId: string; authorUsername: string | null; authorFirstName: string | null; authorAvatarUrl: string | null;
    myReaction: string | null;
  }): CommentRecord {
    return {
      id: r.id,
      contentId: r.contentId,
      parentCommentId: r.parentCommentId,
      body: r.body,
      status: r.status,
      likeCount: r.likeCount,
      dislikeCount: r.dislikeCount,
      replyCount: r.replyCount,
      createdAt: r.createdAt,
      author: { id: r.authorId, username: r.authorUsername, firstName: r.authorFirstName, avatarUrl: r.authorAvatarUrl },
      myReaction: (r.myReaction as 'like' | 'dislike' | null) ?? null,
    };
  }

  async create(input: { contentId: string; userId: string; body: string; parentCommentId?: string }, tx?: DBExecutor): Promise<string> {
    const rows = await this.exec(tx)
      .insert(comments)
      .values({
        contentId: input.contentId,
        userId: input.userId,
        body: input.body,
        ...(input.parentCommentId ? { parentCommentId: input.parentCommentId } : {}),
      })
      .returning({ id: comments.id });
    return rows[0]!.id;
  }

  async getById(id: string, viewerId: string, tx?: DBExecutor): Promise<CommentRecord | null> {
    const rows = await this.baseSelect(viewerId, this.exec(tx)).where(eq(comments.id, id)).limit(1);
    return rows[0] ? this.map(rows[0]) : null;
  }

  /** Visible top-level comments for a content, newest first. */
  async listTopLevel(contentId: string, viewerId: string, page: number, limit: number, tx?: DBExecutor): Promise<{ items: CommentRecord[]; total: number }> {
    const db = this.exec(tx);
    const where = and(eq(comments.contentId, contentId), isNull(comments.parentCommentId), eq(comments.status, 'visible'));
    const [rows, totalRes] = await Promise.all([
      this.baseSelect(viewerId, db).where(where).orderBy(desc(comments.createdAt)).limit(limit).offset((page - 1) * limit),
      db.select({ n: sql<number>`count(*)::int` }).from(comments).where(where),
    ]);
    return { items: rows.map((r) => this.map(r)), total: totalRes[0]?.n ?? 0 };
  }

  /** Visible replies under a parent comment, oldest first (thread reading order). */
  async listReplies(parentId: string, viewerId: string, page: number, limit: number, tx?: DBExecutor): Promise<{ items: CommentRecord[]; total: number }> {
    const db = this.exec(tx);
    const where = and(eq(comments.parentCommentId, parentId), eq(comments.status, 'visible'));
    const [rows, totalRes] = await Promise.all([
      this.baseSelect(viewerId, db).where(where).orderBy(comments.createdAt).limit(limit).offset((page - 1) * limit),
      db.select({ n: sql<number>`count(*)::int` }).from(comments).where(where),
    ]);
    return { items: rows.map((r) => this.map(r)), total: totalRes[0]?.n ?? 0 };
  }

  /** Ownership-scoped soft delete (status→deleted). Returns false if not found/owned. */
  async softDeleteOwn(id: string, userId: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .update(comments)
      .set({ status: 'deleted', deletedAt: sql`now()`, updatedAt: sql`now()` })
      .where(and(eq(comments.id, id), eq(comments.userId, userId), eq(comments.status, 'visible')))
      .returning({ id: comments.id });
    return rows.length > 0;
  }

  /** Admin moderation: set status (visible/hidden/deleted). Returns false if not found. */
  async setStatus(id: string, status: 'visible' | 'hidden' | 'deleted', tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .update(comments)
      .set({ status, updatedAt: sql`now()`, ...(status === 'deleted' ? { deletedAt: sql`now()` } : {}) })
      .where(eq(comments.id, id))
      .returning({ id: comments.id });
    return rows.length > 0;
  }

  /** Does the comment exist and belong to this content (guard for reply/report targets)? */
  async exists(id: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx).select({ id: comments.id }).from(comments).where(eq(comments.id, id)).limit(1);
    return rows.length > 0;
  }
}
