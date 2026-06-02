import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { Public } from '../decorators/public.decorator';
import { AdminOnly } from '../decorators/account-type.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Platform } from '../interfaces/jwt-payload.interface';
import { TokenService } from '../services/token.service';
import { AdminAuthService, AdminLoginResult } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AdminSessionResponseDto } from './dto/admin-session-response.dto';
import { MessageResponseDto, RefreshResponseDto, UserResponseDto } from '../dto/auth-responses.dto';
import { RefreshDto } from '../customer/dto/refresh.dto';

@ApiTags('Admin Auth')
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.AUTH}`, version: '1' })
export class AdminAuthController {
  constructor(
    private readonly adminAuth: AdminAuthService,
    private readonly tokens: TokenService,
  ) {}

  @Post('login')
  @Public()
  @Throttle({ short: { limit: 5, ttl: 60_000 }, medium: { limit: 15, ttl: 5 * 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login (sets cookies for web, returns tokens for mobile)' })
  @ApiEnvelope(AdminSessionResponseDto)
  async login(@Body() dto: AdminLoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const platform = this.adminPlatform(req);
    const result = await this.adminAuth.login(dto.email, dto.password, dto.rememberMe ?? false, platform);
    return this.deliverSession(res, platform, result);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh the admin access token' })
  @ApiEnvelope(RefreshResponseDto)
  async refresh(@Body() dto: RefreshDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const platform = this.adminPlatform(req);
    const token = this.tokens.extractRefreshToken(req, dto.refreshToken);
    if (!token) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const { accessToken } = await this.adminAuth.refresh(token, platform);
    if (platform === 'web') {
      this.tokens.setAccessCookie(res, accessToken);
      return { accessToken: '' };
    }
    return { accessToken };
  }

  @Post('logout')
  @AdminOnly()
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin logout (clears cookies)' })
  @ApiEnvelope(MessageResponseDto)
  logout(@Res({ passthrough: true }) res: Response) {
    this.tokens.clearAuthCookies(res);
    res.clearCookie('csrf', { path: '/' });
    return { message: 'Logged out' };
  }

  @Post('forgot-password')
  @Public()
  @Throttle({ short: { limit: 3, ttl: 60_000 }, long: { limit: 10, ttl: 30 * 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a 6-digit password-reset code by email' })
  @ApiEnvelope(MessageResponseDto)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.adminAuth.forgotPassword(dto.email);
    return { message: 'If the email exists, a reset code has been sent' };
  }

  @Post('reset-password')
  @Public()
  @Throttle({ short: { limit: 5, ttl: 60_000 }, long: { limit: 20, ttl: 30 * 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with the email code (invalidates old sessions)' })
  @ApiEnvelope(AdminSessionResponseDto)
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const platform = this.adminPlatform(req);
    const result = await this.adminAuth.resetPassword(dto.email, dto.code, dto.newPassword, platform);
    return this.deliverSession(res, platform, result);
  }

  @Get('me')
  @AdminOnly()
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current admin (with roles & permissions)' })
  @ApiEnvelope(UserResponseDto)
  me(@CurrentUser('id') adminId: string) {
    return this.adminAuth.getProfile(adminId);
  }

  /** Admin defaults to the web (cookie) channel; only an explicit header opts into mobile/bearer. */
  private adminPlatform(req: Request): Platform {
    return (req.headers['x-client-platform'] as string | undefined)?.toLowerCase() === 'mobile' ? 'mobile' : 'web';
  }

  private deliverSession(res: Response, platform: Platform, result: AdminLoginResult): AdminSessionResponseDto {
    if (platform === 'web') {
      this.tokens.setAuthCookies(res, result.tokens, result.refreshTtl);
      res.cookie('csrf', randomUUID(), { httpOnly: false, sameSite: 'lax', path: '/' });
      return { user: result.user };
    }
    return { user: result.user, accessToken: result.tokens.accessToken, refreshToken: result.tokens.refreshToken };
  }
}
