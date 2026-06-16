import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import { CommentRecord, CommentRepository } from '@db/repositories/engagement/comment.repository';
import { CommentReactionKind, CommentReactionRepository } from '@db/repositories/engagement/comment-reaction.repository';
import { CommentReportRepository, ReportRecord, ReportReason } from '@db/repositories/engagement/comment-report.repository';
import { ModerationRepository } from '@db/repositories/moderation/moderation.repository';
import { ContentAccessService } from '../services/content-access.service';

export interface Paged<T> {
  items: T[];
  pagination: PaginationDetailsDto;
}

/** Maps a comment-report reason to a moderation category + severity. */
const REPORT_TO_MODERATION: Record<string, { category: string; severity: 'high' | 'medium' | 'low' }> = {
  nudity_sexual: { category: 'nudity', severity: 'high' },
  violence_gore: { category: 'violence', severity: 'high' },
  hate_speech: { category: 'hate_speech', severity: 'high' },
  harassment_bullying: { category: 'harassment', severity: 'medium' },
  other: { category: 'other', severity: 'low' },
};

@Injectable()
export class CommentService {
  constructor(
    private readonly comments: CommentRepository,
    private readonly reactions: CommentReactionRepository,
    private readonly reports: CommentReportRepository,
    private readonly moderation: ModerationRepository,
    private readonly access: ContentAccessService,
  ) {}

  private page(total: number, page: number, limit: number): PaginationDetailsDto {
    return { pageNo: page, pageSize: limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  private async load(id: string, viewerId: string): Promise<CommentRecord> {
    const c = await this.comments.getById(id, viewerId);
    if (!c || c.status === 'deleted') {
      throw new NotFoundException('Comment not found');
    }
    return c;
  }

  // ─── Customer ────────────────────────────────────────────────────────────────
  async list(contentId: string, viewerId: string, p: number, limit: number): Promise<Paged<CommentRecord>> {
    await this.access.assertPublished(contentId);
    const { items, total } = await this.comments.listTopLevel(contentId, viewerId, p, limit);
    return { items, pagination: this.page(total, p, limit) };
  }

  async create(userId: string, contentId: string, body: string): Promise<CommentRecord> {
    await this.access.assertPublished(contentId);
    const id = await this.comments.create({ contentId, userId, body });
    return this.load(id, userId);
  }

  async listReplies(commentId: string, viewerId: string, p: number, limit: number): Promise<Paged<CommentRecord>> {
    await this.load(commentId, viewerId);
    const { items, total } = await this.comments.listReplies(commentId, viewerId, p, limit);
    return { items, pagination: this.page(total, p, limit) };
  }

  async reply(userId: string, parentId: string, body: string): Promise<CommentRecord> {
    const parent = await this.load(parentId, userId);
    const id = await this.comments.create({ contentId: parent.contentId, userId, body, parentCommentId: parentId });
    return this.load(id, userId);
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

  async report(userId: string, commentId: string, reason: ReportReason, description?: string): Promise<{ reportId: string; ticketId: string }> {
    const comment = await this.comments.getById(commentId, userId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    const reportId = await this.reports.create({ commentId, reportedBy: userId, reason, ...(description ? { description } : {}) });
    // Roll the report up into the moderation queue (dedups onto one open ticket per comment).
    const map = REPORT_TO_MODERATION[reason] ?? REPORT_TO_MODERATION['other']!;
    const ticketId = await this.moderation.createOrBumpTicket({
      subjectType: 'comment',
      subjectId: commentId,
      offenderUserId: comment.author.id,
      category: map.category,
      severity: map.severity,
      contentSnapshot: comment.body,
      reporterUserId: userId,
      reason,
      ...(description ? { note: description } : {}),
    });
    return { reportId, ticketId };
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────
  async adminSetStatus(commentId: string, status: 'visible' | 'hidden' | 'deleted'): Promise<{ id: string; status: string }> {
    const ok = await this.comments.setStatus(commentId, status);
    if (!ok) {
      throw new NotFoundException('Comment not found');
    }
    return { id: commentId, status };
  }

  async adminListReports(p: number, limit: number, status?: string): Promise<Paged<ReportRecord>> {
    const { items, total } = await this.reports.list({ page: p, limit, ...(status ? { status } : {}) });
    return { items, pagination: this.page(total, p, limit) };
  }

  async adminResolveReport(reportId: string, status: 'actioned' | 'dismissed', adminId: string): Promise<{ id: string; status: string }> {
    const ok = await this.reports.resolve(reportId, status, adminId);
    if (!ok) {
      throw new NotFoundException('Report not found');
    }
    return { id: reportId, status };
  }
}
