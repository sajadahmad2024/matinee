import { Module } from '@nestjs/common';
import { AuthModule } from '@auth/auth.module';
import { AdminNotificationController } from './admin-notification.controller';
import { NotificationAdminService } from './notification-admin.service';
import { FcmProvider } from './providers/fcm.provider';
import { NotificationSendService } from './notification-send.service';

/**
 * Notifications module. Three responsibilities:
 * 1. Admin authoring — compose/broadcast + campaigns (user_notifications inbox fan-out).
 * 2. Push transport — FcmProvider wraps Firebase Cloud Messaging.
 * 3. Business-facing send facade — NotificationSendService enqueues push jobs; workers under
 *    `src/background/notifications/` consume them.
 *
 * FcmProvider + NotificationSendService are exported: feature modules inject the send service,
 * the background module injects FcmProvider directly. AuthModule import brings in
 * FirebaseAdminService (owner of the Firebase app singleton).
 */
@Module({
  imports: [AuthModule],
  controllers: [AdminNotificationController],
  providers: [NotificationAdminService, FcmProvider, NotificationSendService],
  exports: [FcmProvider, NotificationSendService],
})
export class NotificationsModule {}
