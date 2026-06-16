import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthContext } from '../interfaces/auth-context.interface';
import { SessionService } from '../services/session.service';
import { TokenService } from '../services/token.service';

type AuthRequest = Request & { user?: AuthContext; newAccessToken?: string };

/**
 * Global guard. Hot path is pure crypto — verify the access-token signature and
 * read its embedded authorization claims (`st`/`rl`/`pm`). **No DB, no cache.**
 *
 * The ONLY DB touch is transparent refresh: when a web request's access token is
 * expired but a valid refresh cookie is present, it mints a fresh access token
 * (re-checking token_version + status) so the session continues seamlessly.
 * Mobile clients refresh explicitly via /auth/refresh.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly session: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) {
      return true;
    }

    const req = context.switchToHttp().getRequest<AuthRequest>();
    const platform = this.tokenService.detectPlatform(req);
    const accessToken = this.tokenService.extractAccessToken(req);

    // ── Hot path: validate the access token with crypto only (no DB) ──────────
    if (accessToken) {
      try {
        const payload = this.tokenService.verifyAccess(accessToken);
        const user = this.tokenService.contextFromPayload(payload, platform);
        this.enforceStatus(user.status);
        req.user = user;
        if (this.tokenService.isWithinRenewWindow(payload)) {
          req.newAccessToken = this.tokenService.signAccessFromContext(user); // sliding renewal — no DB
        }
        return true;
      } catch (error) {
        if ((error as Error).name !== 'TokenExpiredError') {
          throw new UnauthorizedException('Invalid access token');
        }
        // expired → fall through to transparent refresh
      }
    }

    // ── Transparent refresh (web only) — the single DB read, on expiry ────────
    const refreshToken = this.tokenService.extractRefreshToken(req);
    if (refreshToken && platform === 'web') {
      const { accessToken: fresh, context } = await this.session.refresh(refreshToken, platform);
      req.user = context;
      req.newAccessToken = fresh;
      return true;
    }

    throw new UnauthorizedException('Missing or expired access token');
  }

  private enforceStatus(status: AuthContext['status']): void {
    if (status !== 'active') {
      throw new ForbiddenException({ code: 'ACCOUNT_' + status.toUpperCase(), message: `Account ${status}` });
    }
  }
}
