import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { TEMP_TOKEN_PURPOSE_KEY } from '../decorators/temp-token.decorator';
import { OtpChallenge, TokenService } from '../services/token.service';

/**
 * Verifies a short-lived, purpose-scoped auth JWT ("temp token") for routes decorated with
 * `@RequirePurpose(...)`. Auth *replaces* the Bearer for those routes — the token itself
 * carries the identity (`sub`) and the pre-authorised scope (`purpose`).
 *
 * Not OTP-specific despite the underlying JWT type (`typ: 'otp'`): this same token is used
 * for any two-step flow where step 1 (authenticated) mints proof and step 2 (public) redeems
 * it — email verification, phone verification, password reset, magic link, sensitive-action
 * re-auth, etc. Add new flows by declaring a new purpose string; no guard change needed.
 *
 * Token location: `body.otpToken` (matches the request DTOs). On success, decoded payload is
 * attached at `request.tempToken` and pulled via `@TempToken()` / `@TempToken('sub')`.
 *
 * Opt-in via `@UseGuards(TempTokenGuard)` on the specific route (not global) so it only runs
 * where it's actually needed.
 */
@Injectable()
export class TempTokenGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly tokens: TokenService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string | undefined>(TEMP_TOKEN_PURPOSE_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required) {
      return true;
    }

    const req = ctx.switchToHttp().getRequest<Request & { tempToken?: OtpChallenge }>();
    const token = (req.body as { otpToken?: string } | undefined)?.otpToken;
    if (!token) {
      throw new UnauthorizedException('Missing verification session');
    }

    let payload: OtpChallenge;
    try {
      payload = this.tokens.verifyOtpChallenge(token);
    } catch {
      throw new UnauthorizedException('Verification session is invalid or expired — request a new code');
    }
    if (payload.purpose !== required || !payload.sub) {
      throw new UnauthorizedException('Invalid verification session');
    }
    req.tempToken = payload;
    return true;
  }
}
