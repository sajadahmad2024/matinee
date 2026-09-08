import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { OTP_PURPOSE_KEY } from '../decorators/otp-challenge.decorator';
import { OtpChallenge, TokenService } from '../services/token.service';

/**
 * Verifies a short-lived OTP challenge JWT for routes decorated with `@RequireOtpPurpose(...)`.
 *
 * The token lives in `body.otpToken` (matches the request DTOs). On success the decoded
 * `OtpChallenge` is attached at `request.challenge` and can be pulled via `@Challenge()` /
 * `@Challenge('sub')` param decorators. A `sub` claim is required — the challenge must be
 * bound to a specific user for confirm-style endpoints to be authorised without a Bearer.
 *
 * Opt-in via `@UseGuards(OtpChallengeGuard)` on the controller/handler (not global) so it
 * only runs on the tiny set of routes that need it.
 */
@Injectable()
export class OtpChallengeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly tokens: TokenService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string | undefined>(OTP_PURPOSE_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required) {
      return true;
    }

    const req = ctx.switchToHttp().getRequest<Request & { challenge?: OtpChallenge }>();
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
    req.challenge = payload;
    return true;
  }
}
