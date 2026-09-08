import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AccountTypes, CustomerOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { EarnsQueryDto } from '../dto/profile-query.dto';
import { RequestEmailOtpDto, VerifyEmailOtpDto } from '../dto/verify-email.dto';
import {
  LedgerEntryDto,
  ProfileDto,
  ProfileScreenDto,
  ReferralDto,
  WalletDto,
} from '../dto/profile-response.dto';
import { OtpDeliveryResponseDto } from '../../auth/dto/auth-responses.dto';

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

  // ── Email verification (temp-token flow — request needs Bearer, confirm does not) ──

  @Post('email/verify/request')
  @Throttle({ short: { limit: 5, ttl: 60_000 }, long: { limit: 20, ttl: 30 * 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a 6-digit verification code to an email address' })
  @ApiEnvelope(OtpDeliveryResponseDto)
  requestEmailOtp(@CurrentUser('id') userId: string, @Body() dto: RequestEmailOtpDto) {
    return this.profile.requestEmailVerification(userId, dto.email);
  }

  @Post('email/verify/confirm')
  @Public()
  @AccountTypes() // clears class-level @CustomerOnly — otpToken is the auth for this step
  @Throttle({ short: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm the email OTP; auth is the challenge token, no Bearer required' })
  @ApiEnvelope(ProfileDto)
  confirmEmailOtp(@Body() dto: VerifyEmailOtpDto) {
    return this.profile.confirmEmailVerification(dto.otpToken, dto.code);
  }
}
