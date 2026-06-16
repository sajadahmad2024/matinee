import { Module } from '@nestjs/common';
import { AdminNotificationController } from './admin-notification.controller';
import { NotificationAdminService } from './notification-admin.service';

/**
 * Notifications authoring module (admin) — compose/broadcast + campaigns. Resolves an audience
 * (all customers / segment / selected) and fans out into user_notifications inboxes (the customer
 * inbox in the profile module consumes them). Fan-out is synchronous for now → moves to a worker
 * job + device push when those land.
 */
@Module({
  controllers: [AdminNotificationController],
  providers: [NotificationAdminService],
})
export class NotificationsModule {}
