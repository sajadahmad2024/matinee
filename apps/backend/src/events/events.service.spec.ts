import { EventRepository } from '@db/repositories/events/event.repository';
import { SessionRepository } from '@db/repositories/analytics/session.repository';
import { IngestEventsDto } from './dto/event.dto';
import { AppEventName } from './event-catalog';
import { EventsService } from './events.service';

function build() {
  const events = { ingest: jest.fn().mockResolvedValue(2) };
  const sessions = { userCountry: jest.fn().mockResolvedValue('IN'), upsertFromEvents: jest.fn().mockResolvedValue(1) };
  const svc = new EventsService(events as unknown as EventRepository, sessions as unknown as SessionRepository);
  return { svc, events, sessions };
}

const dto = (withSession: boolean): IngestEventsDto => ({
  platform: 'android',
  events: [
    { eventName: AppEventName.AppOpen, occurredAt: '2026-09-25T10:00:00Z', ...(withSession ? { sessionId: 's1' } : {}) },
    { eventName: AppEventName.VideoPlay, occurredAt: '2026-09-25T10:01:00Z', ...(withSession ? { sessionId: 's1' } : {}) },
  ],
});

describe('EventsService.ingest session tracking', () => {
  it('upserts a derived session stamped with the user country + macro-region', async () => {
    const { svc, sessions } = build();
    await expect(svc.ingest('u1', dto(true))).resolves.toEqual({ accepted: 2 });
    expect(sessions.upsertFromEvents).toHaveBeenCalledWith(
      'u1',
      { platform: 'android', countryCode: 'IN', region: 'APAC' },
      [expect.objectContaining({ clientSessionId: 's1', videos: 1, foregrounds: 0 })],
    );
  });

  it('skips session work for anonymous batches and batches without session ids', async () => {
    const { svc, sessions } = build();
    await svc.ingest(null, dto(true));
    await svc.ingest('u1', dto(false));
    expect(sessions.upsertFromEvents).not.toHaveBeenCalled();
  });

  it('never fails ingestion when session accounting throws', async () => {
    const { svc, sessions } = build();
    sessions.upsertFromEvents.mockRejectedValueOnce(new Error('db down'));
    await expect(svc.ingest('u1', dto(true))).resolves.toEqual({ accepted: 2 });
  });
});
