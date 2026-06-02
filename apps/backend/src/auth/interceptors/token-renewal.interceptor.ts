import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthContext } from '../interfaces/auth-context.interface';
import { TokenService } from '../services/token.service';

/**
 * Emits a fresh access token the guard minted (sliding renewal OR transparent
 * refresh): Set-Cookie for web, `X-Renewed-Access-Token` header for mobile.
 */
@Injectable()
export class TokenRenewalInterceptor implements NestInterceptor {
  constructor(private readonly tokenService: TokenService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }
    const req = context.switchToHttp().getRequest<Request & { user?: AuthContext; newAccessToken?: string }>();
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        const token = req.newAccessToken;
        const user = req.user;
        if (!token || !user) {
          return;
        }
        if (user.platform === 'web') {
          this.tokenService.setAccessCookie(res, token);
        } else {
          res.setHeader('X-Renewed-Access-Token', token);
        }
      }),
    );
  }
}
