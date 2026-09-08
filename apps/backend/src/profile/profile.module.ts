import { Module } from '@nestjs/common';
import { AuthModule } from '@auth/auth.module';
import { ProfileController } from './self/profile.controller';
import { MeController } from './self/me.controller';
import { ProfileService } from './self/profile.service';
import { NotificationController } from './notifications/notification.controller';
import { NotificationService } from './notifications/notification.service';
import { AdminUserProfileController } from './admin/admin-user-profile.controller';
import { AdminUser360Service } from './admin/admin-user-360.service';

/**
 * Profile module — customer self-service (profile screen, edit, wallet, my-earns,
 * referral, notification inbox) + admin read views of a customer's wallet/earns/inbox
 * + the admin user-360 tabs (watch history / referrals / games / reports / roles / warn).
 */
@Module({
  imports: [AuthModule], // TokenService + HashingService for email verification
  controllers: [MeController, ProfileController, NotificationController, AdminUserProfileController],
  providers: [ProfileService, NotificationService, AdminUser360Service],
  exports: [ProfileService, NotificationService],
})
export class ProfileModule {}
