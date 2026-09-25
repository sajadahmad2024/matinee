import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { comments, commentReactions, commentReports, contents, users } from '@db/drizzle/schema';
import { and, asc, desc, eq, isNull, sql, type SQL } from 'drizzle-orm';

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

/** Admin moderation row: any status, with the author's display name and the content title. */
export interface AdminCommentRecord {
  id: string;
  contentId: string;
  contentTitle: string | null;
  parentCommentId: string | null;
  body: string;
  status: string;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  flagCount: number;
  isFlagged: boolean;
  /** Distinct reasons of this comment's pending reports. */
  flagReasons: string[];
  pendingReports: number;
  createdAt: string;
  author: { id: string; name: string; username: string | null; avatarUrl: string | null };
}

export type CommentSort = 'newest' | 'oldest' | 'alphabetical';
export type AdminCommentSort = 'newest' | 'oldest' | 'most_flagged';

export interface AdminCommentFilter {
  contentId?: string | undefined;
  status?: CommentStatus | undefined;
  /** A comment id (its replies) or 'top' (top-level comments only). */
  parentId?: string | undefined;
  flagged?: boolean | undefined;
  sort?: AdminCommentSort | undefined;
  page: number;
  limit: number;
}

export type CommentStatus = 'visible' | 'hidden' | 'deleted';

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

  private order(sort: CommentSort): SQL[] {
    switch (sort) {
      case 'oldest':
        return [asc(comments.createdAt), asc(comments.id)];
      case 'alphabetical':
        return [sql`lower(${comments.body}) asc`, asc(comments.createdAt)];
      case 'newest':
      default:
        return [desc(comments.createdAt), desc(comments.id)];
    }
  }

  /** Visible top-level comments for a content (newest first by default). */
  async listTopLevel(contentId: string, viewerId: string, page: number, limit: number, sort: CommentSort = 'newest', tx?: DBExecutor): Promise<{ items: CommentRecord[]; total: number }> {
    const db = this.exec(tx);
    const where = and(eq(comments.contentId, contentId), isNull(comments.parentCommentId), eq(comments.status, 'visible'));
    const [rows, totalRes] = await Promise.all([
      this.baseSelect(viewerId, db).where(where).orderBy(...this.order(sort)).limit(limit).offset((page - 1) * limit),
      db.select({ n: sql<number>`count(*)::int` }).from(comments).where(where),
    ]);
    return { items: rows.map((r) => this.map(r)), total: totalRes[0]?.n ?? 0 };
  }

  /** Visible replies under a parent comment (oldest first by default — thread reading order). */
  async listReplies(parentId: string, viewerId: string, page: number, limit: number, sort: CommentSort = 'oldest', tx?: DBExecutor): Promise<{ items: CommentRecord[]; total: number }> {
    const db = this.exec(tx);
    const where = and(eq(comments.parentCommentId, parentId), eq(comments.status, 'visible'));
    const [rows, totalRes] = await Promise.all([
      this.baseSelect(viewerId, db).where(where).orderBy(...this.order(sort)).limit(limit).offset((page - 1) * limit),
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

  /** Hide a comment only if it's currently visible (never resurrects a deleted one). */
  async hideIfVisible(id: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .update(comments)
      .set({ status: 'hidden', updatedAt: sql`now()` })
      .where(and(eq(comments.id, id), eq(comments.status, 'visible')))
      .returning({ id: comments.id });
    return rows.length > 0;
  }

  /** Does the comment exist and belong to this content (guard for reply/report targets)? */
  async exists(id: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx).select({ id: comments.id }).from(comments).where(eq(comments.id, id)).limit(1);
    return rows.length > 0;
  }

  /** Admin row select (any status) with author display name, content title and pending-report info. */
  private adminSelect(db: DBExecutor) {
    // "First Last" → username → "Unknown user" (display name for the moderation table).
    const authorName = sql<string>`coalesce(
      nullif(trim(concat_ws(' ', ${users.firstName}, ${users.lastName})), ''),
      ${users.username},
      'Unknown user'
    )`;
    const pending = sql`(select array_agg(distinct cr.reason order by cr.reason) from ${commentReports} cr
                          where cr.comment_id = ${comments.id} and cr.status = 'pending')`;
    return db
      .select({
        id: comments.id,
        contentId: comments.contentId,
        contentTitle: contents.title,
        parentCommentId: comments.parentCommentId,
        body: comments.body,
        status: comments.status,
        likeCount: comments.likeCount,
        dislikeCount: comments.dislikeCount,
        replyCount: comments.replyCount,
        flagCount: comments.flagCount,
        isFlagged: comments.isFlagged,
        flagReasons: sql<string[] | null>`${pending}`,
        pendingReports: sql<number>`(select count(*)::int from ${commentReports} cr where cr.comment_id = ${comments.id} and cr.status = 'pending')`,
        createdAt: comments.createdAt,
        authorId: comments.userId,
        authorName,
        authorUsername: users.username,
        authorAvatarUrl: users.avatarUrl,
      })
      .from(comments)
      .leftJoin(users, eq(users.id, comments.userId))
      .leftJoin(contents, eq(contents.id, comments.contentId));
  }

  private mapAdmin(r: Awaited<ReturnType<CommentRepository['adminSelect']>>[number]): AdminCommentRecord {
    return {
      id: r.id,
      contentId: r.contentId,
      contentTitle: r.contentTitle,
      parentCommentId: r.parentCommentId,
      body: r.body,
      status: r.status,
      likeCount: r.likeCount,
      dislikeCount: r.dislikeCount,
      replyCount: r.replyCount,
      flagCount: r.flagCount,
      isFlagged: r.isFlagged,
      flagReasons: r.flagReasons ?? [],
      pendingReports: Number(r.pendingReports ?? 0),
      createdAt: r.createdAt,
      author: { id: r.authorId, name: r.authorName, username: r.authorUsername, avatarUrl: r.authorAvatarUrl },
    };
  }

  /** Admin list: any status; filter by content / status / parent / flagged; sortable. */
  async adminList(filter: AdminCommentFilter, tx?: DBExecutor): Promise<{ items: AdminCommentRecord[]; total: number }> {
    const db = this.exec(tx);
    const hasPending = sql`exists (select 1 from ${commentReports} cr where cr.comment_id = ${comments.id} and cr.status = 'pending')`;
    const where = and(
      filter.contentId ? eq(comments.contentId, filter.contentId) : undefined,
      filter.status ? eq(comments.status, filter.status) : undefined,
      filter.parentId === 'top' ? isNull(comments.parentCommentId) : filter.parentId ? eq(comments.parentCommentId, filter.parentId) : undefined,
      filter.flagged === true ? hasPending : filter.flagged === false ? sql`not ${hasPending}` : undefined,
    );
    const order: SQL[] =
      filter.sort === 'oldest'
        ? [asc(comments.createdAt), asc(comments.id)]
        : filter.sort === 'most_flagged'
          ? [desc(comments.flagCount), desc(comments.createdAt)]
          : [desc(comments.createdAt), desc(comments.id)];
    const [rows, totalRes] = await Promise.all([
      this.adminSelect(db)
        .where(where)
        .orderBy(...order)
        .limit(filter.limit)
        .offset((filter.page - 1) * filter.limit),
      db.select({ n: sql<number>`count(*)::int` }).from(comments).where(where),
    ]);
    return { items: rows.map((r) => this.mapAdmin(r)), total: totalRes[0]?.n ?? 0 };
  }

  /** One comment (any status) for admin views. */
  async adminGet(id: string, tx?: DBExecutor): Promise<AdminCommentRecord | null> {
    const rows = await this.adminSelect(this.exec(tx)).where(eq(comments.id, id)).limit(1);
    return rows[0] ? this.mapAdmin(rows[0]) : null;
  }

  /** All replies (any status) under a comment, oldest first — admin thread view. */
  async adminReplies(parentId: string, limit = 200, tx?: DBExecutor): Promise<AdminCommentRecord[]> {
    const rows = await this.adminSelect(this.exec(tx))
      .where(eq(comments.parentCommentId, parentId))
      .orderBy(asc(comments.createdAt), asc(comments.id))
      .limit(limit);
    return rows.map((r) => this.mapAdmin(r));
  }
}
