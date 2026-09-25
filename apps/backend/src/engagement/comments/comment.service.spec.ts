import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DBService } from '@db/db.service';
import { EnforcementRepository } from '@db/repositories/auth/enforcement.repository';
import { CommentRepository } from '@db/repositories/engagement/comment.repository';
import { CommentReactionRepository } from '@db/repositories/engagement/comment-reaction.repository';
import { CommentReportRepository } from '@db/repositories/engagement/comment-report.repository';
import { ModerationRepository } from '@db/repositories/moderation/moderation.repository';
import { NotificationRepository } from '@db/repositories/notifications/notification.repository';
import { UsersRepository } from '@db/repositories/users/users.repository';
import { ContentAccessService } from '../services/content-access.service';
import { CommentService, REPORT_TO_MODERATION } from './comment.service';
import { AdminCommentsQueryDto, CreateCommentDto, ReportCommentDto } from './dto/comment.dto';

const comment = (over: Record<string, unknown> = {}) => ({
  id: 'c1', contentId: 'k1', parentCommentId: null, body: 'Nice', status: 'visible', likeCount: 0, dislikeCount: 0,
  replyCount: 0, createdAt: 'x', author: { id: 'author', username: 'a', firstName: null, avatarUrl: null }, myReaction: null, ...over,
});

function build() {
  const comments = {
    getById: jest.fn().mockResolvedValue(comment()),
    create: jest.fn().mockResolvedValue('new'),
    adminGet: jest.fn().mockResolvedValue({ ...comment(), author: { id: 'author', name: 'A', username: 'a', avatarUrl: null }, flagReasons: [], pendingReports: 1 }),
    hideIfVisible: jest.fn().mockResolvedValue(true),
    adminReplies: jest.fn().mockResolvedValue([]),
    listTopLevel: jest.fn().mockResolvedValue({ items: [], total: 0 }),
  };
  const reports = {
    create: jest.fn().mockResolvedValue('r1'),
    getById: jest.fn().mockResolvedValue({ id: 'r1', commentId: 'c1', status: 'pending' }),
    resolve: jest.fn().mockResolvedValue(true),
    summaryForComment: jest.fn().mockResolvedValue({ pending: 0, actioned: 1 }),
    resolvePendingForComment: jest.fn().mockResolvedValue(2),
    listForComment: jest.fn().mockResolvedValue([]),
  };
  const moderation = {
    createOrBumpTicket: jest.fn().mockResolvedValue('t1'),
    findOpenTicket: jest.fn().mockResolvedValue({ id: 't1', status: 'open' }),
    resolve: jest.fn().mockResolvedValue(undefined),
  };
  const users = { findById: jest.fn().mockResolvedValue({ id: 'author', accountType: 'customer' }), setStatus: jest.fn() };
  const enforcement = { create: jest.fn() };
  const notifications = { create: jest.fn() };
  const access = { assertPublished: jest.fn() };
  const db = { transaction: jest.fn((fn: (tx: unknown) => unknown) => fn('tx')) };
  const svc = new CommentService(
    comments as unknown as CommentRepository,
    {} as CommentReactionRepository,
    reports as unknown as CommentReportRepository,
    moderation as unknown as ModerationRepository,
    users as unknown as UsersRepository,
    enforcement as unknown as EnforcementRepository,
    notifications as unknown as NotificationRepository,
    access as unknown as ContentAccessService,
    db as unknown as DBService,
    { emit: jest.fn() } as never,
    { record: jest.fn() } as never,
  );
  return { svc, comments, reports, moderation, users, enforcement, notifications };
}

describe('CommentService report', () => {
  it.each(Object.entries(REPORT_TO_MODERATION))('maps %s to a valid moderation reason', async (reason, map) => {
    const { svc, moderation, reports } = build();
    await svc.report('u1', 'c1', reason as never);
    expect(reports.create).toHaveBeenCalledWith(expect.objectContaining({ reason }), 'tx');
    expect(moderation.createOrBumpTicket).toHaveBeenCalledWith(expect.objectContaining({ reason: map.reason, category: map.category }), 'tx');
    expect(['hate_speech', 'spam', 'nudity', 'violence', 'harassment', 'other']).toContain(map.reason);
  });
  it('duplicate report → 409', async () => {
    const { svc, reports } = build();
    reports.create.mockRejectedValueOnce(Object.assign(new Error('dup'), { code: '23505' }));
    await expect(svc.report('u1', 'c1', 'spam')).rejects.toBeInstanceOf(ConflictException);
  });
  it('own comment → 400; hidden → 404', async () => {
    const { svc, comments } = build();
    await expect(svc.report('author', 'c1', 'spam')).rejects.toBeInstanceOf(BadRequestException);
    comments.getById.mockResolvedValueOnce(comment({ status: 'hidden' }));
    await expect(svc.report('u1', 'c1', 'spam')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('CommentService replies', () => {
  it('reply to a reply attaches to the top-level comment', async () => {
    const { svc, comments } = build();
    comments.getById
      .mockResolvedValueOnce(comment({ id: 'r1', parentCommentId: 'c1' }))
      .mockResolvedValueOnce(comment({ id: 'c1' }))
      .mockResolvedValueOnce(comment({ id: 'new', parentCommentId: 'c1' }));
    await svc.reply('u1', 'r1', 'hi');
    expect(comments.create).toHaveBeenCalledWith({ contentId: 'k1', userId: 'u1', body: 'hi', parentCommentId: 'c1' });
  });
  it('cannot reply to a hidden comment', async () => {
    const { svc, comments } = build();
    comments.getById.mockResolvedValueOnce(comment({ status: 'hidden' }));
    await expect(svc.reply('u1', 'c1', 'hi')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('CommentService admin', () => {
  it('enforce ban: hides comment, bans author, closes reports + ticket in one tx', async () => {
    const { svc, comments, reports, moderation, users, enforcement } = build();
    const r = await svc.adminEnforce('c1', 'admin', { action: 'ban', reason: 'Hate speech' });
    expect(enforcement.create).toHaveBeenCalledWith(expect.objectContaining({ action: 'ban', userId: 'author' }), 'tx');
    expect(users.setStatus).toHaveBeenCalledWith('author', expect.objectContaining({ status: 'banned' }), 'tx');
    expect(comments.hideIfVisible).toHaveBeenCalledWith('c1', 'tx');
    expect(reports.resolvePendingForComment).toHaveBeenCalledWith('c1', 'actioned', 'admin', 'tx');
    expect(moderation.resolve).toHaveBeenCalledWith('t1', 'user_banned', 'Hate speech', 'admin', false, 'tx');
    expect(r).toMatchObject({ action: 'ban', commentStatus: 'hidden', reportsActioned: 2, ticketId: 't1' });
  });
  it('enforce warn: notification, no hide by default', async () => {
    const { svc, comments, notifications, enforcement, users } = build();
    await svc.adminEnforce('c1', 'admin', { action: 'warn', reason: 'Be nice' });
    expect(notifications.create).toHaveBeenCalledWith('author', expect.objectContaining({ body: 'Be nice' }), 'tx');
    expect(enforcement.create).toHaveBeenCalledWith(expect.objectContaining({ action: 'warn' }), 'tx');
    expect(users.setStatus).not.toHaveBeenCalled();
    expect(comments.hideIfVisible).not.toHaveBeenCalled();
  });
  it('enforce rejects non-customer authors and past suspendUntil', async () => {
    const { svc, users } = build();
    await expect(svc.adminEnforce('c1', 'a', { action: 'suspend', reason: 'x x', suspendUntil: '2000-01-01T00:00:00Z' })).rejects.toThrow(/future/);
    users.findById.mockResolvedValueOnce({ id: 'author', accountType: 'admin' });
    await expect(svc.adminEnforce('c1', 'a', { action: 'ban', reason: 'x x' })).rejects.toBeInstanceOf(BadRequestException);
  });
  it('resolving the last pending report closes the ticket', async () => {
    const { svc, moderation, comments } = build();
    const r = await svc.adminResolveReport('r1', 'actioned', 'admin');
    expect(comments.hideIfVisible).toHaveBeenCalledWith('c1', 'tx');
    expect(moderation.resolve).toHaveBeenCalledWith('t1', 'content_removed', undefined, 'admin', false, 'tx');
    expect(r).toMatchObject({ ticketClosed: 't1', pendingReports: 0 });
  });
  it('all dismissed → ticket dismissed; pending left → ticket untouched', async () => {
    const a = build();
    a.reports.summaryForComment.mockResolvedValueOnce({ pending: 0, actioned: 0 });
    await a.svc.adminResolveReport('r1', 'dismissed', 'admin');
    expect(a.moderation.resolve).toHaveBeenCalledWith('t1', 'no_action', undefined, 'admin', true, 'tx');
    const b = build();
    b.reports.summaryForComment.mockResolvedValueOnce({ pending: 2, actioned: 0 });
    await b.svc.adminResolveReport('r1', 'dismissed', 'admin');
    expect(b.moderation.resolve).not.toHaveBeenCalled();
  });
});

describe('comment DTOs', () => {
  it('trims body and rejects whitespace-only', async () => {
    const ok = plainToInstance(CreateCommentDto, { body: '  hi  ' });
    expect(await validate(ok)).toHaveLength(0);
    expect(ok.body).toBe('hi');
    expect(await validate(plainToInstance(CreateCommentDto, { body: '   ' }))).not.toHaveLength(0);
  });
  it('spam is a valid report reason', async () => {
    expect(await validate(plainToInstance(ReportCommentDto, { reason: 'spam' }))).toHaveLength(0);
  });
  it('admin parentId accepts top or uuid; flagged parses boolean', async () => {
    const q = plainToInstance(AdminCommentsQueryDto, { parentId: 'top', flagged: 'true', sort: 'most_flagged' });
    expect(await validate(q)).toHaveLength(0);
    expect(q.flagged).toBe(true);
    expect(await validate(plainToInstance(AdminCommentsQueryDto, { parentId: 'abc' }))).not.toHaveLength(0);
  });
});
