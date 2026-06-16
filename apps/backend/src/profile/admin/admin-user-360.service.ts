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
