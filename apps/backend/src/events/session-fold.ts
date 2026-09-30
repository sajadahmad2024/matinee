import { AppEventName, AppEventType, eventTypeOf } from './event-catalog';

/** Per-session delta folded from one ingest batch (see SessionRepository.upsertFromEvents). */
export interface SessionDelta {
  clientSessionId: string;
  startedAt: string;
  lastEventAt: string;
  /** Batch contained app_background / logout → the session is (for now) closed at lastEventAt. */
  ended: boolean;
  /** Re-entries in this batch (app_foreground count; the opening app_open is implicit). */
  foregrounds: number;
  backgrounds: number;
  videos: number;
  actions: number;
  gamified: boolean;
}

/** Events that count as an engagement action inside a session. */
export const SESSION_ENGAGEMENT_EVENTS: ReadonlySet<AppEventName> = new Set([
  AppEventName.ContentLiked,
  AppEventName.ContentDisliked,
  AppEventName.ContentCommented,
  AppEventName.ContentShared,
  AppEventName.WatchlistAdded,
]);

const SESSION_END_EVENTS: ReadonlySet<AppEventName> = new Set([AppEventName.AppBackground, AppEventName.Logout]);

interface FoldableEvent {
  eventName: AppEventName;
  sessionId?: string | undefined;
  occurredAt: string;
}

/**
 * Fold a batch of client events into one delta per client session id. Events without a
 * session id (or with an unparseable timestamp) are ignored. Pure — unit tested.
 */
export function foldSessions(events: readonly FoldableEvent[]): SessionDelta[] {
  const byId = new Map<string, SessionDelta & { startMs: number; lastMs: number }>();
  for (const e of events) {
    const sid = e.sessionId?.trim();
    const ms = Date.parse(e.occurredAt);
    if (!sid || Number.isNaN(ms)) {
      continue;
    }
    let d = byId.get(sid);
    if (!d) {
      d = {
        clientSessionId: sid, startedAt: e.occurredAt, lastEventAt: e.occurredAt, startMs: ms, lastMs: ms,
        ended: false, foregrounds: 0, backgrounds: 0, videos: 0, actions: 0, gamified: false,
      };
      byId.set(sid, d);
    }
    if (ms < d.startMs) {
      d.startMs = ms;
      d.startedAt = e.occurredAt;
    }
    if (ms > d.lastMs) {
      d.lastMs = ms;
      d.lastEventAt = e.occurredAt;
    }
    if (e.eventName === AppEventName.AppForeground) {
      d.foregrounds += 1;
    }
    if (e.eventName === AppEventName.AppBackground) {
      d.backgrounds += 1;
    }
    if (SESSION_END_EVENTS.has(e.eventName)) {
      d.ended = true;
    }
    if (e.eventName === AppEventName.VideoPlay) {
      d.videos += 1;
    }
    if (SESSION_ENGAGEMENT_EVENTS.has(e.eventName)) {
      d.actions += 1;
    }
    if (eventTypeOf(e.eventName) === AppEventType.Game) {
      d.gamified = true;
    }
  }
  return [...byId.values()].map(({ startMs, lastMs, ...rest }) => ({
    ...rest,
    startedAt: new Date(startMs).toISOString(),
    lastEventAt: new Date(lastMs).toISOString(),
  }));
}
