import { AppEventName } from './event-catalog';
import { foldSessions } from './session-fold';

const at = (min: number) => new Date(Date.UTC(2026, 8, 25, 10, min)).toISOString();

describe('foldSessions', () => {
  it('folds one delta per session id with counters, bounds and end flag', () => {
    const [d, ...rest] = foldSessions([
      { eventName: AppEventName.VideoPlay, sessionId: 's1', occurredAt: at(3) },
      { eventName: AppEventName.AppOpen, sessionId: 's1', occurredAt: at(0) },
      { eventName: AppEventName.VideoPlay, sessionId: 's1', occurredAt: at(4) },
      { eventName: AppEventName.ContentLiked, sessionId: 's1', occurredAt: at(5) },
      { eventName: AppEventName.ContentShared, sessionId: 's1', occurredAt: at(6) },
      { eventName: AppEventName.AppBackground, sessionId: 's1', occurredAt: at(7) },
      { eventName: AppEventName.AppForeground, sessionId: 's1', occurredAt: at(9) },
      { eventName: AppEventName.PredictionEntered, sessionId: 's1', occurredAt: at(10) },
    ]);
    expect(rest).toHaveLength(0);
    expect(d).toEqual({
      clientSessionId: 's1', startedAt: at(0), lastEventAt: at(10), ended: true,
      foregrounds: 1, backgrounds: 1, videos: 2, actions: 2, gamified: true,
    });
  });

  it('separates sessions and ignores events without a session id or with a bad timestamp', () => {
    const out = foldSessions([
      { eventName: AppEventName.AppOpen, sessionId: 'a', occurredAt: at(0) },
      { eventName: AppEventName.AppOpen, sessionId: 'b', occurredAt: at(1) },
      { eventName: AppEventName.ScreenView, occurredAt: at(2) },
      { eventName: AppEventName.ScreenView, sessionId: '  ', occurredAt: at(2) },
      { eventName: AppEventName.ScreenView, sessionId: 'a', occurredAt: 'nope' },
    ]);
    expect(out.map((d) => d.clientSessionId).sort()).toEqual(['a', 'b']);
    expect(out.every((d) => !d.ended && !d.gamified && d.videos === 0)).toBe(true);
  });

  it('treats logout as a session end', () => {
    const [d] = foldSessions([{ eventName: AppEventName.Logout, sessionId: 'x', occurredAt: at(1) }]);
    expect(d?.ended).toBe(true);
  });
});
