import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ACCOUNT_TYPES_KEY } from '../decorators/account-type.decorator';
import { AuthContext } from '../interfaces/auth-context.interface';
import { AccountType } from '../interfaces/jwt-payload.interface';

/** Enforces `@AccountTypes(...)` (e.g. @AdminOnly). No metadata ⇒ any authenticated user. */
@Injectable()
export class AccountTypeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowed = this.reflector.getAllAndOverride<AccountType[]>(ACCOUNT_TYPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!allowed || allowed.length === 0) {
      return true;
    }
    const user = context.switchToHttp().getRequest<Request & { user?: AuthContext }>().user;
    if (!user || !allowed.includes(user.accountType)) {
      throw new ForbiddenException('This endpoint is not available for your account type');
    }
    return true;
  }
}
