import { UserMetricRepository } from '@db/repositories/analytics/user-metric.repository';
import { CommentMetricsListener } from './comment-metrics.listener';

describe('CommentMetricsListener', () => {
  const build = () => {
    const metrics = { increment: jest.fn().mockResolvedValue(1) };
    return { l: new CommentMetricsListener(metrics as unknown as UserMetricRepository), metrics };
  };

  it('bumps comments_posted for a top-level comment', async () => {
    const { l, metrics } = build();
    await l.onCommentCreated({ userId: 'u1', contentId: 'c1', commentId: 'm1', parentCommentId: null });
    expect(metrics.increment.mock.calls).toEqual([['u1', 'comments_posted', 1]]);
  });

  it('bumps comments_posted + replies_posted for a reply', async () => {
    const { l, metrics } = build();
    await l.onCommentCreated({ userId: 'u1', contentId: 'c1', commentId: 'm2', parentCommentId: 'm1' });
    expect(metrics.increment.mock.calls).toEqual([['u1', 'comments_posted', 1], ['u1', 'replies_posted', 1]]);
  });

  it('swallows failures', async () => {
    const { l, metrics } = build();
    metrics.increment.mockRejectedValueOnce(new Error('x'));
    await expect(l.onCommentCreated({ userId: 'u1', contentId: 'c1', commentId: 'm1', parentCommentId: null })).resolves.toBeUndefined();
  });
});
