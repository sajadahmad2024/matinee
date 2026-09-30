import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DBService } from '@db/db.service';
import { EnforcementRepository } from '@db/repositories/auth/enforcement.repository';
import { CommentRepository } from '@db/repositories/engagement/comment.repository';
import { CommentReportRepository } from '@db/repositories/engagement/comment-report.repository';
import { ContentRepository } from '@db/repositories/content/content.repository';
import { ModerationRepository } from '@db/repositories/moderation/moderation.repository';
import { NotificationRepository } from '@db/repositories/notifications/notification.repository';
import { AdminAuditRepository } from '@db/repositories/platform/admin-audit.repository';
import { UsersRepository } from '@db/repositories/users/users.repository';
import { BulkTicketsDto, TicketsQueryDto } from './dto/moderation.dto';
import { ModerationService, SUSPEND_DURATION_MS } from './moderation.service';

const ticket = (over: Record<string, unknown> = {}) => ({
  id: 't1', subjectType: 'comment', subjectId: 'c1', offenderUserId: 'u1', offenderUsername: 'bad', severity: 'high', category: 'hate_speech',
  contentSnapshot: 'x', reportCount: 2, isRepeatOffender: false, status: 'open', assignedTo: null, resolution: null, resolutionNote: null,
  resolvedAt: null, createdAt: 'now', ...over,
});
const actor = { adminId: 'admin', ip: '1.2.3.4', userAgent: 'jest' };

function build(t: Record<string, unknown> | null = ticket(), offender: Record<string, unknown> | null = { id: 'u1', accountType: 'customer', status: 'active' }) {
  const tickets = {
    getById: jest.fn().mockResolvedValue(t),
    resolve: jest.fn().mockResolvedValue(true),
    assign: jest.fn().mockResolvedValue(true),
    setStatus: jest.fn().mockResolvedValue(true),
    addNote: jest.fn().mockResolvedValue({ id: 'n1' }),
    markRepeatOffender: jest.fn().mockResolvedValue(1),
    list: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    countsByStatus: jest.fn().mockResolvedValue({ open: 3, in_review: 1, resolved: 10 }),
    pendingBreakdown: jest.fn().mockResolvedValue({ bySeverity: { high: 2, low: 2 }, byType: { comment: 4 } }),
    avgResolutionMinutes: jest.fn().mockResolvedValue({ current: 4.24, previous: 4.8 }),
    closedCounts: jest.fn().mockResolvedValue({ today: 5, yesterday: 2 }),
    reportVolume24h: jest.fn().mockResolvedValue({ buckets: [{ hour: 'h1', reports: 2 }, { hour: 'h2', reports: 3 }], previous24h: 1 }),
    categoryCounts: jest.fn().mockResolvedValue({ spam: 1, hate_speech: 3 }),
    safetyInputs: jest.fn().mockResolvedValue({ totalItems: 200, flaggedItems: 3 }),
  };
  const users = { findById: jest.fn().mockResolvedValue(offender), setStatus: jest.fn() };
  const enforcement = { create: jest.fn(), listForUser: jest.fn().mockResolvedValue([]) };
  const comments = { hideIfVisible: jest.fn().mockResolvedValue(true) };
  const content = { softDelete: jest.fn() };
  const commentReports = { resolvePendingForComment: jest.fn().mockResolvedValue(2) };
  const notifications = { create: jest.fn() };
  const audit = { record: jest.fn(), listForTarget: jest.fn().mockResolvedValue([]), list: jest.fn() };
  const db = { transaction: jest.fn((fn: (tx: unknown) => unknown) => fn('tx')) };
  const svc = new ModerationService(
    tickets as unknown as ModerationRepository,
    users as unknown as UsersRepository,
    enforcement as unknown as EnforcementRepository,
    comments as unknown as CommentRepository,
    content as unknown as ContentRepository,
    commentReports as unknown as CommentReportRepository,
    notifications as unknown as NotificationRepository,
    audit as unknown as AdminAuditRepository,
    db as unknown as DBService,
  );
  return { svc, tickets, users, enforcement, comments, content, commentReports, notifications, audit };
}

describe('ModerationService.planResolution', () => {
  const { svc } = build();
  const now = Date.parse('2026-01-01T00:00:00Z');
  const t = ticket();

  it.each(Object.entries(SUSPEND_DURATION_MS))('suspendDuration %s', (d, ms) => {
    expect(svc.planResolution(t, { resolution: 'user_suspended', suspendDuration: d as never }, now)).toEqual({ suspendUntil: new Date(now + ms).toISOString() });
  });
  it('defaults to 7 days', () => {
    expect(svc.planResolution(t, { resolution: 'user_suspended' }, now).suspendUntil).toBe(new Date(now + 7 * 86_400_000).toISOString());
  });
  it('accepts an explicit future suspendUntil', () => {
    expect(svc.planResolution(t, { resolution: 'user_suspended', suspendUntil: '2026-02-01T00:00:00Z' }, now).suspendUntil).toBe('2026-02-01T00:00:00.000Z');
  });
  it.each([
    ['past until', { resolution: 'user_suspended', suspendUntil: '2025-01-01T00:00:00Z' }],
    ['> 1 year', { resolution: 'user_suspended', suspendUntil: '2027-06-01T00:00:00Z' }],
    ['both', { resolution: 'user_suspended', suspendDuration: '24h', suspendUntil: '2026-02-01T00:00:00Z' }],
    ['duration on ban', { resolution: 'user_banned', suspendDuration: '24h' }],
  ])('rejects %s', (_n, dto) => {
    expect(() => svc.planResolution(t, dto as never, now)).toThrow(BadRequestException);
  });
  it('rejects content_removed on a user ticket and user actions without an offender', () => {
    expect(() => svc.planResolution(ticket({ subjectType: 'user' }), { resolution: 'content_removed' })).toThrow(BadRequestException);
    expect(() => svc.planResolution(ticket({ offenderUserId: null }), { resolution: 'user_warned' })).toThrow(BadRequestException);
  });
});

describe('ModerationService.resolve', () => {
  it('suspends for the chosen duration, closes reports, flags repeat offender and audits', async () => {
    const m = build();
    const r = await m.svc.resolve('t1', { resolution: 'user_suspended', suspendDuration: '24h', note: 'n' }, actor);
    expect(r.status).toBe('resolved');
    expect(r.reportsClosed).toBe(2);
    expect(r.enforcement?.action).toBe('suspend');
    const until = Date.parse(r.enforcement!.expiresAt!);
    expect(Math.abs(until - (Date.now() + 86_400_000))).toBeLessThan(5_000);
    expect(m.users.setStatus).toHaveBeenCalledWith('u1', expect.objectContaining({ status: 'suspended' }), 'tx');
    expect(m.tickets.markRepeatOffender).toHaveBeenCalledWith('u1', 'tx');
    expect(m.audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'moderation.ticket.resolved', targetType: 'moderation_ticket', targetId: 't1', actorId: 'admin', ipAddress: '1.2.3.4' }), 'tx');
  });

  it('dismisses (no_action) without enforcement or repeat-offender propagation', async () => {
    const m = build();
    const r = await m.svc.resolve('t1', { resolution: 'no_action' }, actor);
    expect(r).toMatchObject({ status: 'dismissed', enforcement: null });
    expect(m.commentReports.resolvePendingForComment).toHaveBeenCalledWith('c1', 'dismissed', 'admin', 'tx');
    expect(m.tickets.markRepeatOffender).not.toHaveBeenCalled();
    expect(m.audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'moderation.ticket.dismissed' }), 'tx');
  });

  it('content_removed soft-deletes content', async () => {
    const m = build(ticket({ subjectType: 'content', subjectId: 'k1', offenderUserId: null }));
    await m.svc.resolve('t1', { resolution: 'content_removed' }, actor);
    expect(m.content.softDelete).toHaveBeenCalledWith('k1', 'tx');
    expect(m.commentReports.resolvePendingForComment).not.toHaveBeenCalled();
  });

  it('warn notifies and records a warn enforcement', async () => {
    const m = build();
    await m.svc.resolve('t1', { resolution: 'user_warned', note: 'be nice' }, actor);
    expect(m.notifications.create).toHaveBeenCalled();
    expect(m.enforcement.create).toHaveBeenCalledWith(expect.objectContaining({ action: 'warn' }), 'tx');
  });

  it('does not re-ban an already banned offender', async () => {
    const m = build(ticket(), { id: 'u1', accountType: 'customer', status: 'banned' });
    const r = await m.svc.resolve('t1', { resolution: 'user_banned' }, actor);
    expect(r.enforcement).toBeNull();
    expect(m.enforcement.create).not.toHaveBeenCalled();
  });

  it('404 / 409 / race', async () => {
    await expect(build(null).svc.resolve('t1', { resolution: 'no_action' }, actor)).rejects.toBeInstanceOf(NotFoundException);
    await expect(build(ticket({ status: 'resolved' })).svc.resolve('t1', { resolution: 'no_action' }, actor)).rejects.toBeInstanceOf(ConflictException);
    const m = build();
    m.tickets.resolve.mockResolvedValue(false);
    await expect(m.svc.resolve('t1', { resolution: 'user_banned' }, actor)).rejects.toBeInstanceOf(ConflictException);
    expect(m.enforcement.create).not.toHaveBeenCalled();
  });

  it('refuses to enforce against an admin', async () => {
    await expect(build(ticket(), { id: 'u1', accountType: 'admin', status: 'active' }).svc.resolve('t1', { resolution: 'user_banned' }, actor)).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('ModerationService workflow', () => {
  it('assign rejects a non-admin assignee and closed tickets', async () => {
    const m = build(ticket(), { id: 'x', accountType: 'customer', status: 'active' });
    await expect(m.svc.assign('t1', actor, 'x')).rejects.toBeInstanceOf(BadRequestException);
    await expect(build(ticket({ status: 'dismissed' })).svc.assign('t1', actor)).rejects.toBeInstanceOf(ConflictException);
  });

  it('escalate with a note stores a note and audits the transition', async () => {
    const m = build();
    await m.svc.setStatus('t1', 'escalated', actor, 'needs legal');
    expect(m.tickets.addNote).toHaveBeenCalledWith('t1', 'admin', 'needs legal', 'tx');
    expect(m.audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'moderation.ticket.status_changed', metadata: expect.objectContaining({ from: 'open', to: 'escalated' }) }), 'tx');
  });

  it('list maps assignee=me to the caller', async () => {
    const m = build();
    await m.svc.list(plainToInstance(TicketsQueryDto, { assignee: 'me', type: 'video' }), 'admin');
    expect(m.tickets.list).toHaveBeenCalledWith(expect.objectContaining({ assignee: 'admin', subjectType: 'content' }));
  });
});

describe('ModerationService.bulk', () => {
  it('reports per-item results and writes a summary audit row', async () => {
    const m = build();
    m.tickets.getById.mockImplementation(async (id: string) => (id === 'gone' ? null : id === 'closed' ? ticket({ id, status: 'resolved' }) : ticket({ id })));
    const r = await m.svc.bulk({ ticketIds: ['a', 'gone', 'closed'], action: 'dismiss' } as BulkTicketsDto, actor);
    expect(r).toMatchObject({ processed: 3, succeeded: 1, failed: 2 });
    expect(r.results[1]).toMatchObject({ id: 'gone', ok: false, error: 'Ticket not found' });
    expect(r.results[2]).toMatchObject({ id: 'closed', ok: false });
    expect(m.audit.record).toHaveBeenLastCalledWith(expect.objectContaining({ action: 'moderation.bulk', metadata: expect.objectContaining({ succeeded: 1, failed: 2 }) }));
  });

  it('resolve requires a resolution', async () => {
    await expect(build().svc.bulk({ ticketIds: ['a'], action: 'resolve' } as BulkTicketsDto, actor)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('validates the DTO (uuid ids, max 100)', async () => {
    const errs = await validate(plainToInstance(BulkTicketsDto, { ticketIds: ['nope'], action: 'dismiss' }));
    expect(errs.length).toBeGreaterThan(0);
    const many = Array.from({ length: 101 }, (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`);
    expect((await validate(plainToInstance(BulkTicketsDto, { ticketIds: many, action: 'dismiss' }))).length).toBeGreaterThan(0);
  });
});

describe('ModerationService.stats', () => {
  it('assembles the dashboard payload', async () => {
    const s = await build().svc.stats();
    expect(s.backlog).toMatchObject({ total: 4, health: 'healthy', byStatus: { open: 3, in_review: 1, escalated: 0 }, bySeverity: { high: 2, medium: 0, low: 2 } });
    expect(s.avgResolutionMinutes).toEqual({ current: 4.2, previous: 4.8, changePct: -11.7 });
    expect(s.resolvedToday).toEqual({ today: 5, yesterday: 2, delta: 3 });
    expect(s.safetyScore.score).toBe(98.5);
    expect(s.reportVolume24h.total).toBe(5);
    expect(s.violationBreakdown).toHaveLength(6);
    expect(s.violationBreakdown.find((v) => v.category === 'hate_speech')).toEqual({ category: 'hate_speech', count: 3, percentage: 75 });
  });
});
