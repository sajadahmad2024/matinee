import { BadRequestException, ConflictException, HttpException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import { ModerationRepository, OPEN_STATUSES, Resolution, TicketRecord, TicketStatus } from '@db/repositories/moderation/moderation.repository';
import { UsersRepository } from '@db/repositories/users/users.repository';
import { EnforcementRepository } from '@db/repositories/auth/enforcement.repository';
import { CommentRepository } from '@db/repositories/engagement/comment.repository';
import { ContentRepository } from '@db/repositories/content/content.repository';
import { DBExecutor, DBService } from '@db/db.service';
import { CommentReportRepository } from '@db/repositories/engagement/comment-report.repository';
import { NotificationRepository } from '@db/repositories/notifications/notification.repository';
import { AdminAuditRepository, AuditEntry } from '@db/repositories/platform/admin-audit.repository';
import { BulkTicketsDto, CATEGORIES, ResolveTicketDto, SuspendDuration, TicketsQueryDto } from './dto/moderation.dto';
import { applyUserEnforcement, DEFAULT_SUSPEND_DAYS, UserEnforcement } from './user-enforcement';

/** Who performed an admin action (for the audit trail). */
export interface ActorContext {
  adminId: string;
  ip?: string | undefined;
  userAgent?: string | undefined;
}

export const TICKET_TARGET = 'moderation_ticket';
const DAY_MS = 86_400_000;
export const SUSPEND_DURATION_MS: Record<SuspendDuration, number> = { '24h': DAY_MS, '7d': 7 * DAY_MS, '30d': 30 * DAY_MS };
const MAX_SUSPEND_MS = 366 * DAY_MS;
const USER_ACTIONS: Partial<Record<Resolution, UserEnforcement>> = { user_warned: 'warn', user_suspended: 'suspend', user_banned: 'ban' };
const round1 = (n: number) => Math.round(n * 10) / 10;

export interface ResolveResult {
  id: string;
  resolution: Resolution;
  status: 'resolved' | 'dismissed';
  reportsClosed: number;
  enforcement: { action: UserEnforcement; expiresAt: string | null } | null;
}

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(
    private readonly tickets: ModerationRepository,
    private readonly usersRepo: UsersRepository,
    private readonly enforcement: EnforcementRepository,
    private readonly comments: CommentRepository,
    private readonly content: ContentRepository,
    private readonly commentReports: CommentReportRepository,
    private readonly notifications: NotificationRepository,
    private readonly audit: AdminAuditRepository,
    private readonly db: DBService,
  ) {}

  private page(total: number, page: number, limit: number): PaginationDetailsDto {
    return { pageNo: page, pageSize: limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  private auditEntry(actor: ActorContext, action: string, ticket: Pick<TicketRecord, 'id' | 'subjectType' | 'category'>, metadata: Record<string, unknown>): AuditEntry {
    return {
      actorId: actor.adminId,
      action,
      targetType: TICKET_TARGET,
      targetId: ticket.id,
      targetLabel: `${ticket.subjectType} · ${ticket.category}`,
      metadata,
      ipAddress: actor.ip,
      userAgent: actor.userAgent,
    };
  }

  private async requireTicket(ticketId: string): Promise<TicketRecord> {
    const ticket = await this.tickets.getById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  private assertOpen(ticket: TicketRecord): void {
    if (!(OPEN_STATUSES as string[]).includes(ticket.status)) {
      throw new ConflictException(`Ticket already ${ticket.status}`);
    }
  }

  // ─── Queue ─────────────────────────────────────────────────────────────────

  async list(query: TicketsQueryDto, adminId: string) {
    const { items, total } = await this.tickets.list({
      page: query.page,
      limit: query.limit,
      status: query.status,
      severity: query.severity,
      category: query.category,
      subjectType: query.type,
      assignee: query.assignee === 'me' ? adminId : query.assignee,
      offenderId: query.offenderId,
      repeatOffender: query.repeatOffender,
      q: query.q || undefined,
      from: query.from,
      to: query.to,
      sort: query.sort,
    });
    return { items, pagination: this.page(total, query.page, query.limit) };
  }

  async detail(ticketId: string) {
    const ticket = await this.requireTicket(ticketId);
    const offenderId = ticket.offenderUserId;
    const [reports, notes, activity, subject, offender, enforcements, priorTickets, totals] = await Promise.all([
      this.tickets.getReports(ticketId),
      this.tickets.listNotes(ticketId),
      this.audit.listForTarget(TICKET_TARGET, ticketId),
      this.subjectPreview(ticket),
      offenderId ? this.usersRepo.findById(offenderId) : Promise.resolve(null),
      offenderId ? this.enforcement.listForUser(offenderId) : Promise.resolve([]),
      offenderId ? this.tickets.priorTickets(offenderId, ticketId) : Promise.resolve([]),
      offenderId ? this.tickets.offenderTotals(offenderId) : Promise.resolve(null),
    ]);
    return {
      ...ticket,
      reports,
      subject,
      offender: offender
        ? {
            id: offender.id,
            username: offender.username,
            name: [offender.firstName, offender.lastName].filter(Boolean).join(' ') || null,
            avatarUrl: offender.avatarUrl,
            status: offender.status,
            suspendedUntil: offender.suspendedUntil,
            joinedAt: offender.createdAt,
          }
        : null,
      offenderHistory: totals
        ? {
            totals,
            priorTickets,
            enforcements: enforcements.map((e) => ({ id: e.id, action: e.action, reason: e.reason, expiresAt: e.expiresAt, performedBy: e.performedBy, createdAt: e.createdAt })),
          }
        : null,
      notes,
      activity: activity.map((a) => ({ id: a.id, action: a.action, actorId: a.actorId, actorLabel: a.actorLabel, targetType: a.targetType, targetId: a.targetId, metadata: a.metadata, createdAt: a.createdAt })),
    };
  }

  private async subjectPreview(ticket: TicketRecord): Promise<Record<string, unknown> | null> {
    if (!ticket.subjectId) return null;
    if (ticket.subjectType === 'comment') {
      const c = await this.comments.adminGet(ticket.subjectId);
      return c
        ? { type: 'comment', id: c.id, body: c.body, status: c.status, contentId: c.contentId, contentTitle: c.contentTitle, parentCommentId: c.parentCommentId, author: c.author, contextPath: `/v1/admin/comments/${c.id}` }
        : null;
    }
    if (ticket.subjectType === 'content') {
      const k = await this.content.findById(ticket.subjectId);
      return k ? { type: 'content', id: k.id, title: k.title, status: k.status, removed: false } : { type: 'content', id: ticket.subjectId, title: ticket.contentSnapshot, status: null, removed: true };
    }
    return { type: 'user', id: ticket.subjectId };
  }

  // ─── Workflow ──────────────────────────────────────────────────────────────

  private async resolveAssignee(actor: ActorContext, assigneeId?: string): Promise<string> {
    if (!assigneeId || assigneeId === actor.adminId) return actor.adminId;
    const admin = await this.usersRepo.findById(assigneeId);
    if (!admin || admin.accountType !== 'admin' || admin.status !== 'active') {
      throw new BadRequestException('Assignee must be an active admin');
    }
    return assigneeId;
  }

  async assign(ticketId: string, actor: ActorContext, assigneeId?: string, resolvedAssignee?: string) {
    const target = resolvedAssignee ?? (await this.resolveAssignee(actor, assigneeId));
    const ticket = await this.requireTicket(ticketId);
    this.assertOpen(ticket);
    await this.db.transaction(async (tx) => {
      if (!(await this.tickets.assign(ticketId, target, tx))) {
        throw new ConflictException('Ticket is no longer open');
      }
      await this.audit.record(this.auditEntry(actor, 'moderation.ticket.assigned', ticket, { from: ticket.assignedTo, to: target, previousStatus: ticket.status }), tx);
    });
    return { id: ticketId, status: 'in_review', assignedTo: target };
  }

  async setStatus(ticketId: string, status: 'open' | 'in_review' | 'escalated', actor: ActorContext, note?: string) {
    const ticket = await this.requireTicket(ticketId);
    this.assertOpen(ticket);
    await this.db.transaction(async (tx) => {
      if (!(await this.tickets.setStatus(ticketId, status as TicketStatus, tx))) {
        throw new ConflictException('Ticket is no longer open');
      }
      if (note) {
        await this.tickets.addNote(ticketId, actor.adminId, note, tx);
      }
      await this.audit.record(this.auditEntry(actor, 'moderation.ticket.status_changed', ticket, { from: ticket.status, to: status, ...(note ? { note } : {}) }), tx);
    });
    return { id: ticketId, status };
  }

  async addNote(ticketId: string, actor: ActorContext, body: string) {
    const ticket = await this.requireTicket(ticketId);
    return this.db.transaction(async (tx) => {
      const note = await this.tickets.addNote(ticketId, actor.adminId, body, tx);
      await this.audit.record(this.auditEntry(actor, 'moderation.ticket.note_added', ticket, { noteId: note.id }), tx);
      return note;
    });
  }

  async auditLog(query: { page: number; limit: number; ticketId?: string | undefined; actorId?: string | undefined }) {
    const { items, total } = await this.audit.list({
      page: query.page,
      limit: query.limit,
      actionPrefix: 'moderation.',
      actorId: query.actorId,
      ...(query.ticketId ? { targetType: TICKET_TARGET, targetId: query.ticketId } : {}),
    });
    return { items, pagination: this.page(total, query.page, query.limit) };
  }

  // ─── Resolution ────────────────────────────────────────────────────────────

  /** Validate the resolution against the ticket and work out the suspension end (if any). */
  planResolution(ticket: Pick<TicketRecord, 'subjectType' | 'subjectId' | 'offenderUserId'>, dto: Pick<ResolveTicketDto, 'resolution' | 'suspendDuration' | 'suspendUntil'>, now = Date.now()): { suspendUntil?: string } {
    const resolution = dto.resolution as Resolution;
    if ((dto.suspendDuration || dto.suspendUntil) && resolution !== 'user_suspended') {
      throw new BadRequestException('suspendDuration / suspendUntil only apply to user_suspended');
    }
    if (resolution === 'content_removed' && (ticket.subjectType === 'user' || !ticket.subjectId)) {
      throw new BadRequestException('content_removed only applies to comment / content tickets');
    }
    if (USER_ACTIONS[resolution] && !ticket.offenderUserId) {
      throw new BadRequestException('This ticket has no offender to act on');
    }
    if (resolution !== 'user_suspended') return {};
    if (dto.suspendDuration && dto.suspendUntil) {
      throw new BadRequestException('Use either suspendDuration or suspendUntil, not both');
    }
    if (dto.suspendUntil) {
      const until = Date.parse(dto.suspendUntil);
      if (Number.isNaN(until) || until <= now + 60_000) {
        throw new BadRequestException('suspendUntil must be in the future');
      }
      if (until > now + MAX_SUSPEND_MS) {
        throw new BadRequestException('suspendUntil must be within 1 year; use user_banned for a permanent block');
      }
      return { suspendUntil: new Date(until).toISOString() };
    }
    const ms = dto.suspendDuration ? SUSPEND_DURATION_MS[dto.suspendDuration] : DEFAULT_SUSPEND_DAYS * DAY_MS;
    return { suspendUntil: new Date(now + ms).toISOString() };
  }

  /**
   * Resolve a ticket and apply the chosen enforcement (remove content / warn / suspend / ban) in
   * one transaction. The close is conditional on the ticket still being open (409 on a race).
   * For comment tickets, the comment's pending reports are closed too (`dismissed` for
   * no_action, otherwise `actioned`). Actioning an offender flags their other open tickets as
   * repeat-offender. An audit row is written.
   */
  async resolve(ticketId: string, dto: ResolveTicketDto, ctx: ActorContext): Promise<ResolveResult> {
    const ticket = await this.requireTicket(ticketId);
    this.assertOpen(ticket);
    const resolution = dto.resolution as Resolution;
    const plan = this.planResolution(ticket, dto);
    const userAction = USER_ACTIONS[resolution];
    let skipEnforcement = false;
    if (userAction && ticket.offenderUserId) {
      const offender = await this.usersRepo.findById(ticket.offenderUserId);
      if (!offender) {
        throw new BadRequestException('Offender account no longer exists');
      }
      if (offender.accountType === 'admin') {
        throw new BadRequestException('Cannot enforce against an admin account');
      }
      skipEnforcement = offender.status === 'banned' && userAction !== 'warn';
    }
    const dismissed = resolution === 'no_action';
    return this.db.transaction(async (tx) => {
      if (!(await this.tickets.resolve(ticketId, resolution, dto.note, ctx.adminId, dismissed, tx))) {
        throw new ConflictException('Ticket is no longer open');
      }
      const enforcement = await this.applyAction(ticket, resolution, dto.note, plan.suspendUntil, ctx.adminId, skipEnforcement, tx);
      let reportsClosed = 0;
      if (ticket.subjectType === 'comment' && ticket.subjectId) {
        reportsClosed = await this.commentReports.resolvePendingForComment(ticket.subjectId, dismissed ? 'dismissed' : 'actioned', ctx.adminId, tx);
      }
      if (!dismissed && ticket.offenderUserId) {
        await this.tickets.markRepeatOffender(ticket.offenderUserId, tx);
      }
      await this.audit.record(
        this.auditEntry(ctx, dismissed ? 'moderation.ticket.dismissed' : 'moderation.ticket.resolved', ticket, {
          resolution,
          previousStatus: ticket.status,
          subjectId: ticket.subjectId,
          offenderUserId: ticket.offenderUserId,
          reportsClosed,
          enforcement,
          ...(skipEnforcement ? { enforcementSkipped: 'already_banned' } : {}),
          ...(dto.note ? { note: dto.note } : {}),
        }),
        tx,
      );
      return { id: ticketId, resolution, status: dismissed ? 'dismissed' : 'resolved', reportsClosed, enforcement } as ResolveResult;
    });
  }

  private async applyAction(
    ticket: TicketRecord,
    resolution: Resolution,
    note: string | undefined,
    suspendUntil: string | undefined,
    adminId: string,
    skipEnforcement: boolean,
    tx: DBExecutor,
  ): Promise<ResolveResult['enforcement']> {
    if (resolution === 'content_removed') {
      if (ticket.subjectType === 'comment' && ticket.subjectId) {
        await this.comments.hideIfVisible(ticket.subjectId, tx);
      } else if (ticket.subjectType === 'content' && ticket.subjectId) {
        await this.content.softDelete(ticket.subjectId, tx);
      }
      return null;
    }
    const action = USER_ACTIONS[resolution];
    if (!action || !ticket.offenderUserId || skipEnforcement) return null;
    const deps = { users: this.usersRepo, enforcement: this.enforcement, notifications: this.notifications };
    return applyUserEnforcement(deps, { userId: ticket.offenderUserId, action, reason: note, suspendUntil, adminId }, tx);
  }

  // ─── Bulk ──────────────────────────────────────────────────────────────────

  async bulk(dto: BulkTicketsDto, actor: ActorContext) {
    if (dto.action === 'resolve' && !dto.resolution) {
      throw new BadRequestException("resolution is required for action 'resolve'");
    }
    if (dto.action !== 'resolve' && (dto.resolution || dto.suspendDuration || dto.suspendUntil)) {
      throw new BadRequestException("resolution / suspension only apply to action 'resolve'");
    }
    const assignee = dto.action === 'assign' ? await this.resolveAssignee(actor, dto.assigneeId) : undefined;
    const results: { id: string; ok: boolean; status?: string; resolution?: string; error?: string }[] = [];
    for (const id of dto.ticketIds) {
      try {
        switch (dto.action) {
          case 'dismiss': {
            const r = await this.resolve(id, { resolution: 'no_action', ...(dto.note ? { note: dto.note } : {}) }, actor);
            results.push({ id, ok: true, status: r.status, resolution: r.resolution });
            break;
          }
          case 'resolve': {
            const r = await this.resolve(
              id,
              {
                resolution: dto.resolution!,
                ...(dto.note ? { note: dto.note } : {}),
                ...(dto.suspendDuration ? { suspendDuration: dto.suspendDuration } : {}),
                ...(dto.suspendUntil ? { suspendUntil: dto.suspendUntil } : {}),
              },
              actor,
            );
            results.push({ id, ok: true, status: r.status, resolution: r.resolution });
            break;
          }
          case 'assign': {
            const r = await this.assign(id, actor, undefined, assignee);
            results.push({ id, ok: true, status: r.status });
            break;
          }
          case 'escalate': {
            const r = await this.setStatus(id, 'escalated', actor, dto.note);
            results.push({ id, ok: true, status: r.status });
            break;
          }
        }
      } catch (err) {
        if (err instanceof HttpException) {
          results.push({ id, ok: false, error: err.message });
        } else {
          this.logger.error(`Bulk ${dto.action} failed for ticket ${id}`, err instanceof Error ? err.stack : String(err));
          results.push({ id, ok: false, error: 'Internal error' });
        }
      }
    }
    const succeeded = results.filter((r) => r.ok).length;
    await this.audit.record({
      actorId: actor.adminId,
      action: 'moderation.bulk',
      targetType: TICKET_TARGET,
      metadata: {
        action: dto.action,
        ...(dto.resolution ? { resolution: dto.resolution } : {}),
        ticketIds: dto.ticketIds,
        succeeded,
        failed: results.length - succeeded,
      },
      ipAddress: actor.ip,
      userAgent: actor.userAgent,
    });
    return { processed: results.length, succeeded, failed: results.length - succeeded, results };
  }

  // ─── Stats ─────────────────────────────────────────────────────────────────

  async stats() {
    const [byStatus, pending, avg, closed, volume, cats, safety] = await Promise.all([
      this.tickets.countsByStatus(),
      this.tickets.pendingBreakdown(),
      this.tickets.avgResolutionMinutes(),
      this.tickets.closedCounts(),
      this.tickets.reportVolume24h(),
      this.tickets.categoryCounts(30),
      this.tickets.safetyInputs(30),
    ]);
    const backlogByStatus = Object.fromEntries(OPEN_STATUSES.map((s) => [s, byStatus[s] ?? 0]));
    const backlogTotal = Object.values(backlogByStatus).reduce((a, b) => a + b, 0);
    const catTotal = Object.values(cats).reduce((a, b) => a + b, 0);
    const score = safety.totalItems > 0 ? Math.min(100, Math.max(0, round1(100 * (1 - safety.flaggedItems / safety.totalItems)))) : 100;
    return {
      backlog: {
        total: backlogTotal,
        health: backlogTotal < 50 ? 'healthy' : backlogTotal < 100 ? 'elevated' : 'critical',
        byStatus: backlogByStatus,
        bySeverity: { high: pending.bySeverity['high'] ?? 0, medium: pending.bySeverity['medium'] ?? 0, low: pending.bySeverity['low'] ?? 0 },
        byType: { comment: pending.byType['comment'] ?? 0, content: pending.byType['content'] ?? 0, user: pending.byType['user'] ?? 0 },
      },
      byStatus: Object.fromEntries(['open', 'in_review', 'resolved', 'dismissed', 'escalated'].map((s) => [s, byStatus[s] ?? 0])),
      avgResolutionMinutes: {
        current: avg.current === null ? null : round1(avg.current),
        previous: avg.previous === null ? null : round1(avg.previous),
        changePct: avg.current !== null && avg.previous ? round1(((avg.current - avg.previous) / avg.previous) * 100) : null,
      },
      resolvedToday: { today: closed.today, yesterday: closed.yesterday, delta: closed.today - closed.yesterday },
      safetyScore: { score, windowDays: 30, totalItems: safety.totalItems, flaggedItems: safety.flaggedItems },
      reportVolume24h: { total: volume.buckets.reduce((a, b) => a + b.reports, 0), previous24h: volume.previous24h, buckets: volume.buckets },
      violationBreakdown: CATEGORIES.map((category) => {
        const count = cats[category] ?? 0;
        return { category, count, percentage: catTotal ? round1((count / catTotal) * 100) : 0 };
      }),
    };
  }
}
