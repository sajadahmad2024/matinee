import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import { NotificationRecord, NotificationRepository } from '@db/repositories/notifications/notification.repository';
import { NotificationsQueryDto } from '../dto/profile-query.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly notifications: NotificationRepository) {}

  private paginate(total: number, page: number, limit: number): PaginationDetailsDto {
    return { pageNo: page, pageSize: limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  /** Paginated inbox for a user — fresh (read state changes on every open). */
  async list(
    userId: string,
    query: NotificationsQueryDto,
  ): Promise<{ items: NotificationRecord[]; pagination: PaginationDetailsDto }> {
    const { items, total } = await this.notifications.listByUser(userId, {
      page: query.page,
      limit: query.limit,
      ...(query.category ? { category: query.category } : {}),
      ...(query.unread ? { unreadOnly: true } : {}),
    });
    return { items, pagination: this.paginate(total, query.page, query.limit) };
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    return { count: await this.notifications.unreadCount(userId) };
  }

  async markRead(userId: string, id: string): Promise<{ id: string; isRead: true }> {
    const owned = await this.notifications.markRead(userId, id);
    if (!owned) {
      throw new NotFoundException('Notification not found');
    }
    return { id, isRead: true };
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    return { updated: await this.notifications.markAllRead(userId) };
  }
}
