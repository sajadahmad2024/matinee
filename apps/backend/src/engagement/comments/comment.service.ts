import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import { DBService } from '@db/db.service';
import { EnforcementRepository } from '@db/repositories/auth/enforcement.repository';
import {
  AdminCommentFilter,
  AdminCommentRecord,
  CommentRecord,
  CommentRepository,
  CommentSort,
} from '@db/repositories/engagement/comment.repository';
import { CommentReactionKind, CommentReactionRepository } from '@db/repositories/engagement/comment-reaction.repository';
import { CommentReportRepository, ReportRecord, ReportReason } from '@db/repositories/engagement/comment-report.repository';
import { ModerationRepository, Resolution } from '@db/repositories/moderation/moderation.repository';
import { NotificationRepository } from '@db/repositories/notifications/notification.repository';
import { AdminAuditRepository } from '@db/repositories/platform/admin-audit.repository';
import { UsersRepository } from '@db/repositories/users/users.repository';
import { applyUserEnforcement, UserEnforcement } from '../../moderation/user-enforcement';
import { CommentCreatedPayload, EngagementEvent } from '../events/engagement.events';
import { ContentAccessService } from '../services/content-access.service';

export interface Paged<T> {
  items: T[];
  pagination: PaginationDetailsDto;
}

/**
 * Customer report reason → moderation report reason + ticket category + severity.
 * `moderation_reports.reason` only allows the moderation vocabulary, so the raw customer reason
 * must never be written there.
 */
export const REPORT_TO_MODERATION: Record<ReportReason, { reason: string; category: string; severity: 'high' | 'medium' | 'low' }> = {
  nudity_sexual: { reason: 'nudity', category: 'nudity', severity: 'high' },
  violence_gore: { reason: 'violence', category: 'violence', severity: 'high' },
  hate_speech: { reason: 'hate_speech', category: 'hate_speech', severity: 'high' },
  harassment_bullying: { reason: 'harassment', category: 'harassment', severity: 'medium' },
  spam: { reason: 'spam', category: 'spam', severity: 'low' },
  other: { reason: 'other', category: 'other', severity: 'low' },
};

const ENFORCEMENT_RESOLUTION: Record<UserEnforcement, Resolution> = {
  warn: 'user_warned',
  suspend: 'user_suspended',
  ban: 'user_banned',
};

const isUniqueViolation = (err: unknown): boolean => {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === '23505' || e?.cause?.code === '23505';
};

@Injectable()
export class CommentService {
  constructor(
    private readonly comments: CommentRepository,
    private readonly reactions: CommentReactionRepository,
    private readonly reports: CommentReportRepository,
    private readonly moderation: ModerationRepository,
    private readonly users: UsersRepository,
    private readonly enforcement: EnforcementRepository,
    private readonly notifications: NotificationRepository,
    private readonly access: ContentAccessService,
    private readonly db: DBService,
    private readonly events: EventEmitter2,
    private readonly audit: AdminAuditRepository,
  ) {}

  private emitCreated(c: CommentRecord): void {
    const payload: CommentCreatedPayload = { userId: c.author.id, contentId: c.contentId, commentId: c.id, parentCommentId: c.parentCommentId };
    this.events.emit(EngagementEvent.CommentCreated, payload);
  }

  private page(total: number, page: number, limit: number): PaginationDetailsDto {
    return { pageNo: page, pageSize: limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  /** A comment customers can interact with: exists and is visible. */
  private async load(id: string, viewerId: string): Promise<CommentRecord> {
    const c = await this.comments.getById(id, viewerId);
    if (!c || c.status !== 'visible') {
      throw new NotFoundException('Comment not found');
    }
    return c;
  }

  // ─── Customer ────────────────────────────────────────────────────────────────
  async list(contentId: string, viewerId: string, p: number, limit: number, sort: CommentSort = 'newest'): Promise<Paged<CommentRecord>> {
    await this.access.assertPublished(contentId);
    const { items, total } = await this.comments.listTopLevel(contentId, viewerId, p, limit, sort);
    return { items, pagination: this.page(total, p, limit) };
  }

  async create(userId: string, contentId: string, body: string): Promise<CommentRecord> {
    await this.access.assertPublished(contentId);
    const id = await this.comments.create({ contentId, userId, body });
    const created = await this.load(id, userId);
    this.emitCreated(created);
    return created;
  }

  async listReplies(commentId: string, viewerId: string, p: number, limit: number, sort: CommentSort = 'oldest'): Promise<Paged<CommentRecord>> {
    await this.load(commentId, viewerId);
    const { items, total } = await this.comments.listReplies(commentId, viewerId, p, limit, sort);
    return { items, pagination: this.page(total, p, limit) };
  }

  /** One reply level: a reply to a reply attaches to its top-level comment. */
  async reply(userId: string, parentId: string, body: string): Promise<CommentRecord> {
    let parent = await this.load(parentId, userId);
    if (parent.parentCommentId) {
      parent = await this.load(parent.parentCommentId, userId);
    }
    const id = await this.comments.create({ contentId: parent.contentId, userId, body, parentCommentId: parent.id });
    const created = await this.load(id, userId);
    this.emitCreated(created);
    return created;
  }

  async setReaction(userId: string, commentId: string, reaction: CommentReactionKind): Promise<CommentRecord> {
    await this.load(commentId, userId);
    await this.reactions.set(userId, commentId, reaction);
    return this.load(commentId, userId);
  }

  async removeReaction(userId: string, commentId: string): Promise<CommentRecord> {
    await this.load(commentId, userId);
    await this.reactions.remove(userId, commentId);
    return this.load(commentId, userId);
  }

  async remove(userId: string, commentId: string): Promise<{ deleted: true }> {
    const ok = await this.comments.softDeleteOwn(commentId, userId);
    if (!ok) {
      // Distinguish "not mine" from "doesn't exist" for a correct status code.
      const exists = await this.comments.exists(commentId);
      throw exists ? new ForbiddenException('Not your comment') : new NotFoundException('Comment not found');
    }
    return { deleted: true };
  }

  /** Report a comment: comment report + moderation ticket/report in one transaction. */
  async report(userId: string, commentId: string, reason: ReportReason, description?: string): Promise<{ reportId: string; ticketId: string }> {
    const comment = await this.load(commentId, userId);
    if (comment.author.id === userId) {
      throw new BadRequestException('You cannot report your own comment');
    }
    const map = REPORT_TO_MODERATION[reason] ?? REPORT_TO_MODERATION.other;
    try {
      return await this.db.transaction(async (tx) => {
        const reportId = await this.reports.create({ commentId, reportedBy: userId, reason, ...(description ? { description } : {}) }, tx);
        // Roll the report up into the moderation queue (dedups onto one open ticket per comment).
        const ticketId = await this.moderation.createOrBumpTicket(
          {
            subjectType: 'comment',
            subjectId: commentId,
            offenderUserId: comment.author.id,
            category: map.category,
            severity: map.severity,
            contentSnapshot: comment.body,
            reporterUserId: userId,
            reason: map.reason,
            ...(description ? { note: description } : {}),
          },
          tx,
        );
        return { reportId, ticketId };
      });
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('You already reported this comment');
      }
      throw err;
    }
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────
  async adminSetStatus(commentId: string, status: 'visible' | 'hidden' | 'deleted'): Promise<{ id: string; status: string }> {
    const ok = await this.comments.setStatus(commentId, status);
    if (!ok) {
      throw new NotFoundException('Comment not found');
    }
    return { id: commentId, status };
  }

  /** Admin comment list (any status) — filter by content / status / parent / flagged; sortable. */
  async adminListComments(q: AdminCommentFilter): Promise<Paged<AdminCommentRecord>> {
    const { items, total } = await this.comments.adminList(q);
    return { items, pagination: this.page(total, q.page, q.limit) };
  }

  /** "View in context": the comment, its parent, all replies, its reports and open ticket. */
  async adminThread(commentId: string) {
    const comment = await this.comments.adminGet(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    const rootId = comment.parentCommentId ?? comment.id;
    const [parent, replies, reports, openTicket] = await Promise.all([
      comment.parentCommentId ? this.comments.adminGet(comment.parentCommentId) : Promise.resolve(null),
      this.comments.adminReplies(rootId),
      this.reports.listForComment(commentId),
      this.moderation.findOpenTicket('comment', commentId),
    ]);
    return { comment, parent, replies, reports, openTicket };
  }

  /**
   * Warn / suspend / ban the comment's author from the comment itself. Optionally hides the
   * comment, then closes its open ticket and pending reports — all in one transaction.
   */
  async adminEnforce(
    commentId: string,
    adminId: string,
    dto: { action: UserEnforcement; reason: string; suspendUntil?: string | undefined; hideComment?: boolean | undefined },
  ) {
    const comment = await this.comments.adminGet(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (dto.suspendUntil && new Date(dto.suspendUntil).getTime() <= Date.now()) {
      throw new BadRequestException('suspendUntil must be in the future');
    }
    const author = await this.users.findById(comment.author.id);
    if (!author || author.accountType !== 'customer') {
      throw new BadRequestException('Only customer authors can be warned, suspended or banned');
    }
    const hide = dto.hideComment ?? dto.action !== 'warn';
    return this.db.transaction(async (tx) => {
      const applied = await applyUserEnforcement(
        { users: this.users, enforcement: this.enforcement, notifications: this.notifications },
        { userId: author.id, action: dto.action, reason: dto.reason, suspendUntil: dto.suspendUntil, adminId },
        tx,
      );
      const hidden = hide ? await this.comments.hideIfVisible(commentId, tx) : false;
      const reportsActioned = await this.reports.resolvePendingForComment(commentId, 'actioned', adminId, tx);
      const ticket = await this.moderation.findOpenTicket('comment', commentId, tx);
      if (ticket) {
        await this.moderation.resolve(ticket.id, ENFORCEMENT_RESOLUTION[dto.action], dto.reason, adminId, false, tx);
      }
      await this.audit.record(
        {
          actorId: adminId,
          action: `comment.enforce.${dto.action}`,
          targetType: 'comment',
          targetId: commentId,
          metadata: { userId: author.id, reason: dto.reason, expiresAt: applied.expiresAt, hidden, reportsActioned, ticketId: ticket?.id ?? null },
        },
        tx,
      );
      return {
        commentId,
        userId: author.id,
        action: applied.action,
        expiresAt: applied.expiresAt,
        commentStatus: hidden ? 'hidden' : comment.status,
        reportsActioned,
        ticketId: ticket?.id ?? null,
      };
    });
  }

  async adminListReports(p: number, limit: number, status?: string): Promise<Paged<ReportRecord>> {
    const { items, total } = await this.reports.list({ page: p, limit, ...(status ? { status } : {}) });
    return { items, pagination: this.page(total, p, limit) };
  }

  /**
   * Resolve one report and keep the moderation queue in sync: `actioned` hides the comment;
   * once no pending reports remain, the comment's open ticket closes.
   */
  async adminResolveReport(reportId: string, status: 'actioned' | 'dismissed', adminId: string) {
    const report = await this.reports.getById(reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return this.db.transaction(async (tx) => {
      await this.reports.resolve(reportId, status, adminId, tx);
      if (status === 'actioned') {
        await this.comments.hideIfVisible(report.commentId, tx);
      }
      const summary = await this.reports.summaryForComment(report.commentId, tx);
      let ticketClosed: string | null = null;
      if (summary.pending === 0) {
        const ticket = await this.moderation.findOpenTicket('comment', report.commentId, tx);
        if (ticket) {
          const actioned = summary.actioned > 0;
          await this.moderation.resolve(ticket.id, actioned ? 'content_removed' : 'no_action', undefined, adminId, !actioned, tx);
          ticketClosed = ticket.id;
        }
      }
      await this.audit.record(
        {
          actorId: adminId,
          action: `comment.report.${status}`,
          targetType: 'comment',
          targetId: report.commentId,
          metadata: { reportId, pendingReports: summary.pending, ticketClosed },
        },
        tx,
      );
      return { id: reportId, status, commentId: report.commentId, pendingReports: summary.pending, ticketClosed };
    });
  }
}
