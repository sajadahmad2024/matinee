import { BadRequestException, Injectable } from '@nestjs/common';
import { AdminUser360Repository } from '@db/repositories/users/user-360.repository';
import { NotificationRepository } from '@db/repositories/notifications/notification.repository';

@Injectable()
export class AdminUser360Service {
  constructor(
    private readonly user360: AdminUser360Repository,
    private readonly notifications: NotificationRepository,
  ) {}

  watchHistory(userId: string) {
    return this.user360.watchHistory(userId, 50).then((items) => ({ items }));
  }

  /** Watch tab: engagement stats + favourite genres + streak summary. */
  async watchStats(userId: string) {
    const { totals, genres, streak } = await this.user360.watchStats(userId);
    const n = (v: string | number | null | undefined) => Number(v ?? 0);
    const views = n(totals['views']);
    const genreTotal = genres.reduce((acc, g) => acc + n(g['watchSeconds']), 0);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    const last = streak ? (streak['lastQualifiedDate'] as string | null) : null;
    const alive = last === today || last === yesterday;
    return {
      videosWatched: n(totals['videosWatched']),
      sessions: n(totals['sessions']),
      views,
      totalWatchSeconds: n(totals['totalWatchSeconds']),
      avgSessionSeconds: Math.round(n(totals['avgSessionSeconds'])),
      completionRate: views > 0 ? Math.round((n(totals['completed']) / views) * 1000) / 10 : 0,
      lastWatchedAt: (totals['lastWatchedAt'] as string | null) ?? null,
      favoriteGenres: genres.map((g) => ({
        genreId: String(g['genreId']),
        name: String(g['name']),
        watchSeconds: n(g['watchSeconds']),
        percent: genreTotal > 0 ? Math.round((n(g['watchSeconds']) / genreTotal) * 1000) / 10 : 0,
      })),
      streak: {
        currentStreak: alive ? n(streak?.['currentStreak']) : 0,
        longestStreak: n(streak?.['longestStreak']),
        level: streak ? n(streak['level']) : 1,
        activeDays: n(streak?.['activeDays']),
      },
    };
  }

  referrals(userId: string) {
    return this.user360.referrals(userId);
  }

  games(userId: string) {
    return this.user360.gamesActivity(userId);
  }

  reports(userId: string) {
    return this.user360.reportsActivity(userId);
  }

  async setRoles(userId: string, roleNames: string[]): Promise<{ roles: string[] }> {
    const ok = await this.user360.setRoles(userId, roleNames);
    if (!ok) {
      throw new BadRequestException('One or more roles do not exist');
    }
    return { roles: await this.user360.getRoleNames(userId) };
  }

  async warn(userId: string, message: string): Promise<{ warned: true }> {
    await this.notifications.create(userId, { category: 'system', title: 'Warning from moderation', body: message });
    return { warned: true };
  }
}
