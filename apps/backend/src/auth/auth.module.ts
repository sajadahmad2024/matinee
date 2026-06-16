import { EnvConfig } from '@config/env.config';
import { HashingService } from '@common/hashing/hashing.service';
import { BcryptService } from '@common/hashing/bcrypt.service';
import { SmsModule } from '@sms/sms.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

// Core services
import { TokenService } from './services/token.service';
import { SessionService } from './services/session.service';
import { FirebaseAdminService } from './services/firebase-admin.service';

// Providers (phone verification — env-selected)
import { PhoneVerificationProvider } from './providers/phone-verification.provider';
import { TwilioOtpProvider } from './providers/twilio-otp.provider';
import { FirebasePhoneProvider } from './providers/firebase-phone.provider';

// Providers (social OAuth — redirect flow)
import { GoogleOAuthProvider } from './providers/social/google-oauth.provider';
import { AppleOAuthProvider } from './providers/social/apple-oauth.provider';

// Customer auth
import { CustomerAuthController } from './customer/customer-auth.controller';
import { CustomerAuthService } from './customer/customer-auth.service';

// Devices
import { DeviceController } from './devices/device.controller';
import { DeviceService } from './devices/device.service';

// Admin auth
import { AdminAuthController } from './admin/admin-auth.controller';
import { AdminAuthService } from './admin/admin-auth.service';

// Admin management
import { AdminManagementService } from './admin/admin-management.service';
import { AdminAdminsController } from './admin/admin-admins.controller';
import { AdminRolesController } from './admin/admin-roles.controller';
import { AdminPermissionsController } from './admin/admin-permissions.controller';
import { AdminUsersController } from './admin/admin-users.controller';

const phoneVerificationProvider = {
  provide: PhoneVerificationProvider,
  useFactory: (config: ConfigService<EnvConfig>, twilio: TwilioOtpProvider, firebase: FirebasePhoneProvider) =>
    config.get<string>('PHONE_VERIFICATION_PROVIDER') === 'firebase' ? firebase : twilio,
  inject: [ConfigService, TwilioOtpProvider, FirebasePhoneProvider],
};

@Module({
  imports: [ConfigModule, JwtModule.register({}), SmsModule],
  controllers: [
    CustomerAuthController,
    DeviceController,
    AdminAuthController,
    AdminAdminsController,
    AdminRolesController,
    AdminPermissionsController,
    AdminUsersController,
  ],
  providers: [
    // Core
    TokenService,
    SessionService,
    FirebaseAdminService,
    { provide: HashingService, useClass: BcryptService },

    // Phone verification providers + env-selected facade
    TwilioOtpProvider,
    FirebasePhoneProvider,
    phoneVerificationProvider,

    // Social OAuth providers (redirect flow)
    GoogleOAuthProvider,
    AppleOAuthProvider,

    // Domain services
    CustomerAuthService,
    DeviceService,
    AdminAuthService,
    AdminManagementService,
  ],
  // Exported so the global guards/interceptor (registered in AppModule) can resolve them.
  exports: [TokenService, SessionService],
})
export class AuthModule {}
