import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthContext } from '../interfaces/auth-context.interface';

/**
 * Injects the authenticated user (AuthContext) attached by the AuthGuard.
 * `@CurrentUser()` → full context; `@CurrentUser('id')` → a single field.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthContext | undefined, ctx: ExecutionContext): AuthContext | AuthContext[keyof AuthContext] => {
    const request = ctx.switchToHttp().getRequest<Request & { user: AuthContext }>();
    const user = request.user;
    return data ? user[data] : user;
  },
);
