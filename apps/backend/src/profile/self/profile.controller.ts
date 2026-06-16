import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { EarnsQueryDto } from '../dto/profile-query.dto';
import {
  LedgerEntryDto,
  ProfileDto,
  ProfileScreenDto,
  ReferralDto,
  WalletDto,
} from '../dto/profile-response.dto';

/** Customer self-service: the Profile screen, edit-profile, my-earns and referral. */
@ApiTags('Profile')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: RouteNames.PROFILE, version: '1' })
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Profile screen — identity + wallet + streak + subscription + unread count' })
  @ApiEnvelope(ProfileScreenDto)
  screen(@CurrentUser('id') userId: string) {
    return this.profile.getProfileScreen(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Edit profile (name / about-you / avatar / locale)' })
  @ApiEnvelope(ProfileDto)
  update(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.profile.updateProfile(userId, dto);
  }

  @Get('wallet')
  @ApiOperation({ summary: 'Wallet balances + level (always fresh)' })
  @ApiEnvelope(WalletDto)
  wallet(@CurrentUser('id') userId: string) {
    return this.profile.getWallet(userId);
  }

  @Get('earns')
  @ApiOperation({ summary: 'My Earns — paginated points/xp transaction history' })
  @ApiPaginatedEnvelope(LedgerEntryDto)
  earns(@CurrentUser('id') userId: string, @Query() query: EarnsQueryDto) {
    return this.profile.getEarns(userId, query);
  }

  @Get('referral')
  @ApiOperation({ summary: 'My referral code + completed-referral count' })
  @ApiEnvelope(ReferralDto)
  referral(@CurrentUser('id') userId: string) {
    return this.profile.getReferral(userId);
  }
}
