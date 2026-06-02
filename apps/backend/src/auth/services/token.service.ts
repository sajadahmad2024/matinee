import { EnvConfig } from '@config/env.config';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { AccountStatus, AccountType, JwtPayload, Platform } from '../interfaces/jwt-payload.interface';
import { AuthContext } from '../interfaces/auth-context.interface';
import { TokenPair } from '../interfaces/token.interface';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';
const DEFAULT_ACCESS_SECRET = 'dev-access-secret-change-me';
const OTP_CHALLENGE_TTL = 600; // 10 minutes

/** Short-lived token issued when an OTP is requested; required to verify it. */
export interface OtpChallenge {
  destination: string;
  purpose: string;
}

/** Everything embedded in an access token (authorization travels in the token). */
export interface AccessClaims {
  sub: string;
  act: AccountType;
  plt: Platform;
  tv: number;
  status: AccountStatus;
  roles: string[];
  permissions: string[];
}

type RefreshClaims = Pick<AccessClaims, 'sub' | 'act' | 'plt' | 'tv'>;

@Injectable()
export class TokenService implements OnModuleInit {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService<EnvConfig>,
  ) {}

  /** Fail fast in production rather than ever signing tokens with a weak/default secret. */
  onModuleInit(): void {
    if (this.config.get<string>('NODE_ENV') !== 'production') {
      return;
    }
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret || secret === DEFAULT_ACCESS_SECRET) {
      throw new Error('JWT_SECRET must be set to a strong value in production');
    }
    if (!this.config.get<string>('JWT_REFRESH_SECRET')) {
      throw new Error('JWT_REFRESH_SECRET must be set (distinct from JWT_SECRET) in production');
    }
  }

  private get accessSecret(): string {
    return this.config.get<string>('JWT_SECRET') ?? DEFAULT_ACCESS_SECRET;
  }
  private get refreshSecret(): string {
    return this.config.get<string>('JWT_REFRESH_SECRET') || this.accessSecret;
  }
  get accessTtl(): number {
    return this.config.get<number>('JWT_ACCESS_TTL') ?? 900;
  }
  get renewWindow(): number {
    return this.config.get<number>('JWT_RENEW_WINDOW') ?? 300;
  }

  signAccess(claims: AccessClaims): string {
    return this.jwt.sign(
      { typ: 'access', act: claims.act, plt: claims.plt, tv: claims.tv, st: claims.status, rl: claims.roles, pm: claims.permissions },
      { subject: claims.sub, secret: this.accessSecret, expiresIn: this.accessTtl, jwtid: randomUUID() },
    );
  }

  signRefresh(claims: RefreshClaims, ttlSeconds: number): string {
    return this.jwt.sign(
      { typ: 'refresh', act: claims.act, plt: claims.plt, tv: claims.tv },
      { subject: claims.sub, secret: this.refreshSecret, expiresIn: ttlSeconds, jwtid: randomUUID() },
    );
  }

  buildPair(claims: AccessClaims, refreshTtlSeconds: number): TokenPair {
    return { accessToken: this.signAccess(claims), refreshToken: this.signRefresh(claims, refreshTtlSeconds) };
  }

  /** Re-sign an access token from an already-authenticated context (sliding renewal — no DB). */
  signAccessFromContext(user: AuthContext): string {
    return this.signAccess({
      sub: user.id,
      act: user.accountType,
      plt: user.platform,
      tv: user.tokenVersion,
      status: user.status,
      roles: user.roles,
      permissions: user.permissions,
    });
  }

  /** Build the request principal from verified access-token claims (no DB). */
  contextFromPayload(payload: JwtPayload, platform: Platform): AuthContext {
    return {
      id: payload.sub,
      accountType: payload.act,
      status: payload.st ?? 'active',
      tokenVersion: payload.tv,
      roles: payload.rl ?? [],
      permissions: payload.pm ?? [],
      platform,
    };
  }

  // ─── OTP challenge token (issued on request; required to verify) ─────────────

  signOtpChallenge(destination: string, purpose: string): string {
    return this.jwt.sign(
      { typ: 'otp', dest: destination, purp: purpose },
      { secret: this.accessSecret, expiresIn: OTP_CHALLENGE_TTL, jwtid: randomUUID() },
    );
  }

  /** Sign the OAuth `state` so it can't be tampered with (guest-token injection / redirect tampering). */
  signOAuthState(payload: { guestToken?: string | undefined; redirect?: string | undefined }): string {
    return this.jwt.sign(
      { typ: 'oauth_state', gt: payload.guestToken, rd: payload.redirect },
      { secret: this.accessSecret, expiresIn: OTP_CHALLENGE_TTL, jwtid: randomUUID() },
    );
  }

  verifyOAuthState(token: string): { guestToken?: string | undefined; redirect?: string | undefined } {
    const p = this.jwt.verify<{ typ: string; gt?: string; rd?: string }>(token, {
      secret: this.accessSecret,
      algorithms: ['HS256'],
    });
    if (p.typ !== 'oauth_state') {
      throw new Error('Not an OAuth state token');
    }
    return { guestToken: p.gt, redirect: p.rd };
  }

  verifyOtpChallenge(token: string): OtpChallenge {
    const payload = this.jwt.verify<{ typ: string; dest: string; purp: string }>(token, {
      secret: this.accessSecret,
      algorithms: ['HS256'],
    });
    if (payload.typ !== 'otp') {
      throw new Error('Not an OTP challenge token');
    }
    return { destination: payload.dest, purpose: payload.purp };
  }

  verifyAccess(token: string): JwtPayload {
    const payload = this.jwt.verify<JwtPayload>(token, { secret: this.accessSecret, algorithms: ['HS256'] });
    if (payload.typ !== 'access') {
      throw new Error('Not an access token');
    }
    return payload;
  }

  verifyRefresh(token: string): JwtPayload {
    const payload = this.jwt.verify<JwtPayload>(token, { secret: this.refreshSecret, algorithms: ['HS256'] });
    if (payload.typ !== 'refresh') {
      throw new Error('Not a refresh token');
    }
    return payload;
  }

  /** True when the access token is inside its sliding-renewal window. */
  isWithinRenewWindow(payload: JwtPayload): boolean {
    if (!payload.exp) {
      return false;
    }
    const now = Math.floor(Date.now() / 1000);
    return payload.exp - now <= this.renewWindow;
  }

  // ─── Extraction (web cookie OR mobile bearer) ───────────────────────────────

  detectPlatform(req: Request): Platform {
    const header = (req.headers['x-client-platform'] as string | undefined)?.toLowerCase();
    if (header === 'web' || header === 'mobile') {
      return header;
    }
    return this.readCookie(req, ACCESS_COOKIE) ? 'web' : 'mobile';
  }

  extractAccessToken(req: Request): string | null {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      return auth.slice(7);
    }
    return this.readCookie(req, ACCESS_COOKIE);
  }

  extractRefreshToken(req: Request, bodyToken?: string): string | null {
    return bodyToken ?? this.readCookie(req, REFRESH_COOKIE);
  }

  // ─── Cookie writers (web only) ──────────────────────────────────────────────

  setAuthCookies(res: Response, pair: TokenPair, refreshTtlSeconds: number): void {
    const secure = this.config.get<boolean>('COOKIE_SECURE') ?? false;
    const domain = this.config.get<string>('COOKIE_DOMAIN') ?? 'localhost';
    res.cookie(ACCESS_COOKIE, pair.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      domain,
      path: '/',
      maxAge: this.accessTtl * 1000,
    });
    res.cookie(REFRESH_COOKIE, pair.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      domain,
      path: '/',
      maxAge: refreshTtlSeconds * 1000,
    });
  }

  setAccessCookie(res: Response, accessToken: string): void {
    const secure = this.config.get<boolean>('COOKIE_SECURE') ?? false;
    const domain = this.config.get<string>('COOKIE_DOMAIN') ?? 'localhost';
    res.cookie(ACCESS_COOKIE, accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      domain,
      path: '/',
      maxAge: this.accessTtl * 1000,
    });
  }

  clearAuthCookies(res: Response): void {
    const domain = this.config.get<string>('COOKIE_DOMAIN') ?? 'localhost';
    res.clearCookie(ACCESS_COOKIE, { domain, path: '/' });
    res.clearCookie(REFRESH_COOKIE, { domain, path: '/' });
  }

  private readCookie(req: Request, name: string): string | null {
    const fromParser = (req as Request & { cookies?: Record<string, string> }).cookies?.[name];
    if (fromParser) {
      return fromParser;
    }
    const header = req.headers.cookie;
    if (!header) {
      return null;
    }
    for (const part of header.split(';')) {
      const [k, ...v] = part.trim().split('=');
      if (k === name) {
        return decodeURIComponent(v.join('='));
      }
    }
    return null;
  }
}
