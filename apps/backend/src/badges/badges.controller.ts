import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOnly } from '../auth/decorators/account-type.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BadgesService } from './badges.service';
import { CustomerBadgeDto, EarnedBadgeDto } from './dto/badge.dto';

/** Customer achievements — the badge catalog and what I've earned. */
@ApiTags('Badges')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: RouteNames.BADGES, version: '1' })
export class BadgesController {
  constructor(private readonly badges: BadgesService) {}

  @Get()
  @ApiOperation({ summary: 'Badge catalog with my earned flag' })
  @ApiEnvelope(CustomerBadgeDto, { isArray: true })
  catalog(@CurrentUser('id') userId: string) {
    return this.badges.catalog(userId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Badges I have earned' })
  @ApiEnvelope(EarnedBadgeDto, { isArray: true })
  mine(@CurrentUser('id') userId: string) {
    return this.badges.myBadges(userId);
  }
}
