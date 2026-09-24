import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { CustomerOnly } from '../decorators/account-type.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CustomerAuthService } from './customer-auth.service';
import { RequestPhoneOtpDto } from './dto/request-phone-otp.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { CheckUsernameDto } from './dto/check-username.dto';
import { RefreshDto } from './dto/refresh.dto';
import {
  AuthResponseDto,
  MessageResponseDto,
  OtpDeliveryResponseDto,
  RefreshResponseDto,
  UserResponseDto,
  UsernameAvailableResponseDto,
} from '../dto/auth-responses.dto';

@ApiTags('Customer Auth')
@Controller({ path: RouteNames.AUTH, version: '1' })
export class CustomerAuthController {
  constructor(private readonly auth: CustomerAuthService) {}

  @Post('phone/otp')
  @Public()
  @Throttle({ short: { limit: 5, ttl: 60_000 }, long: { limit: 20, ttl: 30 * 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a phone OTP (Twilio sends; Firebase is client-managed)' })
  @ApiEnvelope(OtpDeliveryResponseDto)
  requestPhoneOtp(@Body() dto: RequestPhoneOtpDto) {
    return this.auth.requestPhoneOtp(dto.phone);
  }

  @Post('phone/verify')
  @Public()
  @Throttle({ short: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify phone OTP / Firebase token; sign in or sign up' })
  @ApiEnvelope(AuthResponseDto)
  verifyPhone(@Body() dto: VerifyPhoneDto) {
    return this.auth.verifyPhone({
      otpToken: dto.otpToken,
      code: dto.code,
      firebaseToken: dto.firebaseToken,
    });
  }

  @Get('social/google')
  @Public()
  @ApiOperation({ summary: 'Start Google sign-in — 302 redirect to the Google consent screen' })
  @ApiResponse({ status: 302, description: 'Redirect to the Google OAuth consent screen' })
  googleStart(@Query('redirect') redirect: string | undefined, @Res() res: Response) {
    const state = this.auth.encodeOAuthState({ redirect });
    res.redirect(this.auth.getSocialAuthUrl('google', state));
  }

  @Get('social/google/callback')
  @Public()
  @ApiOperation({ summary: 'Google OAuth callback — 302 back to the app with tokens in the URL fragment' })
  @ApiResponse({ status: 302, description: 'Redirect back to the app with access/refresh tokens in the URL fragment' })
  async googleCallback(@Query('code') code: string, @Query('state') state: string | undefined, @Res() res: Response) {
    const { redirect } = this.auth.decodeOAuthState(state);
    const result = await this.auth.completeSocialLogin('google', code);
    res.redirect(this.auth.buildSuccessRedirect(result, redirect));
  }

  @Get('social/apple')
  @Public()
  @ApiOperation({ summary: 'Start Apple sign-in — 302 redirect to the Apple consent screen' })
  @ApiResponse({ status: 302, description: 'Redirect to the Apple OAuth consent screen' })
  appleStart(@Query('redirect') redirect: string | undefined, @Res() res: Response) {
    const state = this.auth.encodeOAuthState({ redirect });
    res.redirect(this.auth.getSocialAuthUrl('apple', state));
  }

  @Post('social/apple/callback')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apple OAuth callback (form_post) — 302 back to the app with tokens' })
  @ApiResponse({ status: 302, description: 'Redirect back to the app with access/refresh tokens in the URL fragment' })
  async appleCallback(@Body('code') code: string, @Body('state') state: string | undefined, @Res() res: Response) {
    const { redirect } = this.auth.decodeOAuthState(state);
    const result = await this.auth.completeSocialLogin('apple', code);
    res.redirect(this.auth.buildSuccessRedirect(result, redirect));
  }

  @Get('username/available')
  @Public()
  @Throttle({ short: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'Pre-check username availability (for the Create Account screen)' })
  @ApiEnvelope(UsernameAvailableResponseDto)
  async checkUsername(@Query() dto: CheckUsernameDto) {
    return { available: await this.auth.isUsernameAvailable(dto.username) };
  }

  @Post('profile')
  @CustomerOnly()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete/update profile (username + referral)' })
  @ApiEnvelope(UserResponseDto)
  completeProfile(@CurrentUser('id') userId: string, @Body() dto: CompleteProfileDto) {
    return this.auth.completeProfile(userId, {
      username: dto.username,
      referralCode: dto.referralCode,
      gender: dto.gender,
      fullName: dto.fullName,
    });
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange a refresh token for a new access token' })
  @ApiEnvelope(RefreshResponseDto)
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken ?? '');
  }

  @Get('me')
  @CustomerOnly()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current authenticated user' })
  @ApiEnvelope(UserResponseDto)
  me(@CurrentUser('id') userId: string) {
    return this.auth.getProfile(userId);
  }

  @Post('logout')
  @CustomerOnly()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (client discards tokens)' })
  @ApiEnvelope(MessageResponseDto)
  logout() {
    return { message: 'Logged out' };
  }

  @Post('logout-all')
  @CustomerOnly()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all sessions (bumps token_version)' })
  @ApiEnvelope(MessageResponseDto)
  async logoutAll(@CurrentUser('id') userId: string) {
    await this.auth.logoutAll(userId);
    return { message: 'All sessions revoked' };
  }
}
