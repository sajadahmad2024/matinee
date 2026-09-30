import { DBService } from '@db/db.service';
import { ContentRepository } from '@db/repositories/content/content.repository';
import { NotificationCampaignRepository } from '@db/repositories/notifications/notification-campaign.repository';
import { QueueService } from '@queue/queue.service';
import { JobName, QueueName } from '@queue/queue.constant';
import { boostCampaignFor, BoostNotifierService } from './boost-notifier.service';

function build(claims: Array<{ id: string; title: string; description: string | null; boostChannels: string[] }>) {
  const db = { transaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) => fn('tx')) };
  const content = {
    claimBoostNotifications: jest.fn().mockResolvedValue(claims),
    setBoostCampaign: jest.fn().mockResolvedValue(undefined),
  };
  let n = 0;
  const campaigns = {
    create: jest.fn(() => Promise.resolve(`camp${++n}`)),
    setStatus: jest.fn().mockResolvedValue(undefined),
  };
  const queue = { send: jest.fn().mockResolvedValue(undefined) };
  const svc = new BoostNotifierService(
    db as unknown as DBService,
    content as unknown as ContentRepository,
    campaigns as unknown as NotificationCampaignRepository,
    queue as unknown as QueueService,
  );
  return { svc, content, campaigns, queue };
}

describe('boostCampaignFor', () => {
  it('notifications → all; subscribers only → subscriber segment', () => {
    expect(boostCampaignFor({ id: 'c1', title: 'Neon', description: null, boostChannels: ['notifications', 'subscribers'] })).toMatchObject({
      targetType: 'all',
      deepLink: 'matinee://content/c1',
      targetFilter: { category: 'new_content', contentId: 'c1' },
    });
    const subs = boostCampaignFor({ id: 'c1', title: 'Neon', description: 'x'.repeat(400), boostChannels: ['subscribers'] });
    expect(subs.targetType).toBe('segment');
    expect(subs.targetFilter).toMatchObject({ subscribers: true });
    expect(subs.message).toHaveLength(200);
  });
});

describe('BoostNotifierService', () => {
  it('creates one campaign per claimed boost inside the claim tx, then enqueues fan-out', async () => {
    const { svc, content, campaigns, queue } = build([
      { id: 'c1', title: 'A', description: null, boostChannels: ['notifications'] },
      { id: 'c2', title: 'B', description: null, boostChannels: ['subscribers'] },
    ]);
    await expect(svc.notifyDue(10)).resolves.toBe(2);
    expect(content.claimBoostNotifications).toHaveBeenCalledWith(10, undefined, 'tx');
    expect(campaigns.create).toHaveBeenCalledWith(expect.objectContaining({ targetType: 'all' }), 'draft', null, 'tx');
    expect(content.setBoostCampaign).toHaveBeenCalledWith('c2', 'camp2', 'tx');
    expect(queue.send).toHaveBeenCalledWith(QueueName.NOTIFICATIONS, JobName.NOTIFY_CAMPAIGN_FANOUT, { campaignId: 'camp1' });
    expect(campaigns.setStatus).toHaveBeenCalledWith('camp1', 'sending');
  });

  it('nothing claimed → nothing sent; enqueue failure leaves a draft', async () => {
    const empty = build([]);
    await expect(empty.svc.notifyDue()).resolves.toBe(0);
    expect(empty.queue.send).not.toHaveBeenCalled();
    const failing = build([{ id: 'c1', title: 'A', description: null, boostChannels: ['notifications'] }]);
    failing.queue.send.mockRejectedValueOnce(new Error('sqs down'));
    await expect(failing.svc.notifyDue()).resolves.toBe(0);
    expect(failing.campaigns.setStatus).toHaveBeenLastCalledWith('camp1', 'draft');
  });
});
