import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShareRepository } from '@db/repositories/engagement/share.repository';
import { ContentAccessService } from '../services/content-access.service';
import { EngagementEvent } from '../events/engagement.events';
import { ShareService } from './share.service';

function build(created: boolean) {
  const shares = { record: jest.fn().mockResolvedValue({ id: 'sh1', created }) };
  const access = { assertPublished: jest.fn().mockResolvedValue(undefined), getCounts: jest.fn().mockResolvedValue({ shareCount: 3 }) };
  const events = { emit: jest.fn() };
  const svc = new ShareService(shares as unknown as ShareRepository, access as unknown as ContentAccessService, events as unknown as EventEmitter2);
  return { svc, events };
}

describe('ShareService dedupe', () => {
  it('a new share emits ContentShared (points seam) and is not deduped', async () => {
    const { svc, events } = build(true);
    await expect(svc.share('u1', 'c1', 'x')).resolves.toEqual({ shareId: 'sh1', shareCount: 3, deduped: false });
    expect(events.emit).toHaveBeenCalledWith(EngagementEvent.ContentShared, { userId: 'u1', contentId: 'c1', shareId: 'sh1', channel: 'x' });
  });

  it('a repeat share the same day returns the existing share and emits nothing', async () => {
    const { svc, events } = build(false);
    await expect(svc.share('u1', 'c1', 'x')).resolves.toEqual({ shareId: 'sh1', shareCount: 3, deduped: true });
    expect(events.emit).not.toHaveBeenCalled();
  });
});
