import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DBService } from '@db/db.service';

// Repositories — centralized data access layer
import { UsersRepository } from './repositories/users/users.repository';
import { RbacRepository } from './repositories/auth/rbac.repository';
import { IdentityRepository } from './repositories/auth/identity.repository';
import { ReferralRepository } from './repositories/auth/referral.repository';
import { EnforcementRepository } from './repositories/auth/enforcement.repository';
import { DeviceRepository } from './repositories/auth/device.repository';
import { MediaRepository } from './repositories/media/media.repository';

const repositories = [
  UsersRepository,
  RbacRepository,
  IdentityRepository,
  ReferralRepository,
  EnforcementRepository,
  DeviceRepository,
  MediaRepository,
];

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DBService, ...repositories],
  exports: [DBService, ...repositories],
})
export class DBModule {}
