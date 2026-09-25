import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ViewRepository } from '@db/repositories/engagement/view.repository';
import { EngagementEvent } from '../events/engagement.events';
import { ContentAccessService } from '../services/content-access.service';
import { VIEW_COUNT_MIN_SECONDS, VIEW_RECOUNT_MINUTES, VIEW_REUSE_MINUTES, ViewService } from './view.service';

function build() {
  const views = {
    startView: jest.fn().mockResolvedValue({ viewId: 'v1', resumed: true }),
    recordHeartbeat: jest.fn().mockResolvedValue({ sessionWatchedSeconds: 20, credited: 10, dayWatchSeconds: 1900 }),
    getProgress: jest.fn().mockResolvedValue({ lastPositionSeconds: 20, isCompleted: false, updatedAt: 'x' }),
  };
  const access = { assertPublished: jest.fn().mockResolvedValue(undefined) };
  const today = { date: '2026-09-25', watchSeconds: 1900, requiredSeconds: 1800, remainingSeconds: 0, qualified: true };
  const events = { emitAsync: jest.fn().mockResolvedValue([today]) };
  const svc = new ViewService(
    views as unknown as ViewRepository,
    access as unknown as ContentAccessService,
    events as unknown as EventEmitter2,
  );
  return { svc, views, events, today };
}

describe('ViewService', () => {
  it('start passes the reuse window', async () => {
    const { svc, views } = build();
    await expect(svc.start('u1', 'c1', { sessionId: 's1' })).resolves.toEqual({ viewId: 'v1', resumed: true });
    expect(views.startView).toHaveBeenCalledWith('u1', 'c1', { sessionId: 's1', reuseMinutes: VIEW_REUSE_MINUTES });
  });

  it('heartbeat records with counting rules, emits WatchProgress and echoes today', async () => {
    const { svc, views, events, today } = build();
    const r = await svc.heartbeat('u1', 'c1', 'v1', { watchedSeconds: 20, positionSeconds: 20 });
    expect(views.recordHeartbeat).toHaveBeenCalledWith(expect.objectContaining({
      countMinSeconds: VIEW_COUNT_MIN_SECONDS, recountMinutes: VIEW_RECOUNT_MINUTES, completed: false, completionPercent: 0,
    }));
    expect(events.emitAsync).toHaveBeenCalledWith(EngagementEvent.WatchProgress, { userId: 'u1', contentId: 'c1', dayWatchSeconds: 1900 });
    expect(r).toEqual({ lastPositionSeconds: 20, isCompleted: false, updatedAt: 'x', today });
  });

  it('heartbeat for an unknown / foreign session → 404', async () => {
    const { svc, views } = build();
    views.recordHeartbeat.mockResolvedValueOnce(null);
    await expect(svc.heartbeat('u1', 'c1', 'nope', { watchedSeconds: 1, positionSeconds: 1 })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('no streak listener → response without today', async () => {
    const { svc, events } = build();
    events.emitAsync.mockResolvedValueOnce([]);
    const r = await svc.heartbeat('u1', 'c1', 'v1', { watchedSeconds: 5, positionSeconds: 5 });
    expect(r).not.toHaveProperty('today');
  });
});
