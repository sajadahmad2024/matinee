import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOrGuest } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ProfileService } from './profile.service';
import { AppBootstrapDto } from '../dto/profile-response.dto';

/**
 * Common app-open endpoint — one call on launch returns everything the client needs:
 * profile, wallet + level, streak, current subscription, unread count, and the
 * subscription-based access summary (free/premium) used to gate the app.
 */
@ApiTags('Me')
@ApiBearerAuth()
@CustomerOrGuest()
@Controller({ path: RouteNames.ME, version: '1' })
export class MeController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'App-open bootstrap — profile + wallet + subscription + access in one call' })
  @ApiEnvelope(AppBootstrapDto)
  me(@CurrentUser('id') userId: string) {
    return this.profile.getBootstrap(userId);
  }
}
