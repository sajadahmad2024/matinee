import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { CustomerOnly, CustomerOrGuest } from '../decorators/account-type.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CustomerAuthService } from './customer-auth.service';
import { RequestPhoneOtpDto } from './dto/request-phone-otp.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { RefreshDto } from './dto/refresh.dto';
import {
  AuthResponseDto,
  MessageResponseDto,
  OtpDeliveryResponseDto,
  RefreshResponseDto,
  UserResponseDto,
} from '../dto/auth-responses.dto';

@ApiTags('Customer Auth')
@Controller({ path: RouteNames.AUTH, version: '1' })
export class CustomerAuthController {
  constructor(private readonly auth: CustomerAuthService) {}

  @Post('guest')
  @Public()
  @ApiOperation({ summary: 'Bootstrap an anonymous guest and issue tokens' })
  @ApiEnvelope(AuthResponseDto, { status: 201 })
  bootstrapGuest() {
    return this.auth.bootstrapGuest();
  }

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
      guestToken: dto.guestToken,
    });
  }

  @Get('social/google')
  @Public()
  @ApiOperation({ summary: 'Start Google sign-in — 302 redirect to the Google consent screen' })
  @ApiResponse({ status: 302, description: 'Redirect to the Google OAuth consent screen' })
  googleStart(
    @Query('guestToken') guestToken: string | undefined,
    @Query('redirect') redirect: string | undefined,
    @Res() res: Response,
  ) {
    const state = this.auth.encodeOAuthState({ guestToken, redirect });
    res.redirect(this.auth.getSocialAuthUrl('google', state));
  }

  @Get('social/google/callback')
  @Public()
  @ApiOperation({ summary: 'Google OAuth callback — 302 back to the app with tokens in the URL fragment' })
  @ApiResponse({ status: 302, description: 'Redirect back to the app with access/refresh tokens in the URL fragment' })
  async googleCallback(@Query('code') code: string, @Query('state') state: string | undefined, @Res() res: Response) {
    const { guestToken, redirect } = this.auth.decodeOAuthState(state);
    const result = await this.auth.completeSocialLogin('google', code, guestToken);
    res.redirect(this.auth.buildSuccessRedirect(result, redirect));
  }

  @Get('social/apple')
  @Public()
  @ApiOperation({ summary: 'Start Apple sign-in — 302 redirect to the Apple consent screen' })
  @ApiResponse({ status: 302, description: 'Redirect to the Apple OAuth consent screen' })
  appleStart(
    @Query('guestToken') guestToken: string | undefined,
    @Query('redirect') redirect: string | undefined,
    @Res() res: Response,
  ) {
    const state = this.auth.encodeOAuthState({ guestToken, redirect });
    res.redirect(this.auth.getSocialAuthUrl('apple', state));
  }

  @Post('social/apple/callback')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apple OAuth callback (form_post) — 302 back to the app with tokens' })
  @ApiResponse({ status: 302, description: 'Redirect back to the app with access/refresh tokens in the URL fragment' })
  async appleCallback(@Body('code') code: string, @Body('state') state: string | undefined, @Res() res: Response) {
    const { guestToken, redirect } = this.auth.decodeOAuthState(state);
    const result = await this.auth.completeSocialLogin('apple', code, guestToken);
    res.redirect(this.auth.buildSuccessRedirect(result, redirect));
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
  @CustomerOrGuest()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current authenticated user' })
  @ApiEnvelope(UserResponseDto)
  me(@CurrentUser('id') userId: string) {
    return this.auth.getProfile(userId);
  }

  @Post('logout')
  @CustomerOrGuest()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (client discards tokens)' })
  @ApiEnvelope(MessageResponseDto)
  logout() {
    return { message: 'Logged out' };
  }

  @Post('logout-all')
  @CustomerOrGuest()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all sessions (bumps token_version)' })
  @ApiEnvelope(MessageResponseDto)
  async logoutAll(@CurrentUser('id') userId: string) {
    await this.auth.logoutAll(userId);
    return { message: 'All sessions revoked' };
  }
}
