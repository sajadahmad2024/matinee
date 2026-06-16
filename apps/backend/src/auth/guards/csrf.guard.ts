import { EnvConfig } from '@config/env.config';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthContext } from '../interfaces/auth-context.interface';

/**
 * Double-submit CSRF protection for cookie-authenticated (web) mutations.
 * Bearer/mobile requests carry no ambient cookie, so they're not CSRF-vulnerable
 * and are skipped. Active only when CSRF_ENABLED=true.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly enabled: boolean;

  constructor(config: ConfigService<EnvConfig>) {
    this.enabled = config.get<boolean>('CSRF_ENABLED') ?? false;
  }

  canActivate(context: ExecutionContext): boolean {
    if (!this.enabled || context.getType() !== 'http') {
      return true;
    }
    const req = context.switchToHttp().getRequest<Request & { user?: AuthContext }>();
    const method = req.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return true;
    }
    const user = req.user;
    // Pre-auth (public) or bearer/mobile sessions are not CSRF-exposed.
    if (!user || user.platform !== 'web') {
      return true;
    }
    const header = req.headers['x-csrf-token'] as string | undefined;
    const cookie = this.readCookie(req, 'csrf');
    if (!header || !cookie || header !== cookie) {
      throw new ForbiddenException('Invalid or missing CSRF token');
    }
    return true;
  }

  private readCookie(req: Request, name: string): string | null {
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
