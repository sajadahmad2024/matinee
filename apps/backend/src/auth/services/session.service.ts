import { UsersRepository, UserRecord } from '@db/repositories/users/users.repository';
import { RbacRepository } from '@db/repositories/auth/rbac.repository';
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthContext, AccountStatus } from '../interfaces/auth-context.interface';
import { Platform } from '../interfaces/jwt-payload.interface';
import { AccessClaims, TokenService } from './token.service';

/**
 * The ONLY auth component that reads the DB — used at login and refresh to mint
 * access tokens with fresh authorization claims, and to enforce token_version.
 * The guard never calls this on the hot (valid-access) path.
 */
@Injectable()
export class SessionService {
  constructor(
    private readonly users: UsersRepository,
    private readonly rbac: RbacRepository,
    private readonly tokens: TokenService,
  ) {}

  /** Effective status — a lapsed suspension is treated as active. */
  private effectiveStatus(user: UserRecord): AccountStatus {
    if (user.status === 'suspended' && user.suspendedUntil && new Date(user.suspendedUntil) <= new Date()) {
      return 'active';
    }
    return user.status;
  }

  /** Read the user + (admin) RBAC and assemble the claims for an access token. */
  async resolveClaims(userId: string, platform: Platform): Promise<AccessClaims | null> {
    const user = await this.users.findById(userId);
    if (!user) {
      return null;
    }
    let roles: string[] = [];
    let permissions: string[] = [];
    if (user.accountType === 'admin') {
      const resolved = await this.rbac.resolveForUser(userId);
      roles = resolved.roles;
      permissions = resolved.permissions;
    }
    return {
      sub: user.id,
      act: user.accountType,
      plt: platform,
      tv: user.tokenVersion,
      status: this.effectiveStatus(user),
      roles,
      permissions,
    };
  }

  private toContext(claims: AccessClaims): AuthContext {
    return {
      id: claims.sub,
      accountType: claims.act,
      status: claims.status,
      tokenVersion: claims.tv,
      roles: claims.roles,
      permissions: claims.permissions,
      platform: claims.plt,
    };
  }

  /**
   * Validate a refresh token against the DB (token_version + status), then mint a
   * fresh access token with up-to-date claims. Powers /auth/refresh and the
   * guard's transparent web refresh.
   */
  async refresh(refreshToken: string, platform: Platform): Promise<{ accessToken: string; context: AuthContext }> {
    let payload;
    try {
      payload = this.tokens.verifyRefresh(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const claims = await this.resolveClaims(payload.sub, platform);
    if (!claims || claims.tv !== payload.tv) {
      throw new UnauthorizedException('Session has been invalidated');
    }
    if (claims.status !== 'active') {
      throw new ForbiddenException({ code: 'ACCOUNT_' + claims.status.toUpperCase(), message: `Account ${claims.status}` });
    }
    return { accessToken: this.tokens.signAccess(claims), context: this.toContext(claims) };
  }
}
