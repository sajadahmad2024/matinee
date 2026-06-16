import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthContext } from '../interfaces/auth-context.interface';

/** Enforces `@Permissions(...)` with AND logic over the user's resolved permissions. */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) {
      return true;
    }
    const user = context.switchToHttp().getRequest<Request & { user?: AuthContext }>().user;
    if (!user || !required.every((perm) => user.permissions.includes(perm))) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
