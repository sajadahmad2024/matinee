import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Request } from 'express';
import { OtpChallenge } from '../services/token.service';

export const OTP_PURPOSE_KEY = 'otpPurpose';

/** Declares the OTP challenge purpose a route requires. `OtpChallengeGuard` reads the
 *  `otpToken` field from the request body, verifies the JWT, checks the purpose matches
 *  this value, and attaches the payload as `request.challenge`. No decorator ⇒ guard skips. */
export const RequireOtpPurpose = (purpose: string) => SetMetadata(OTP_PURPOSE_KEY, purpose);

/** Injects the OTP challenge payload attached by `OtpChallengeGuard`.
 *  `@Challenge()` → full payload; `@Challenge('sub')` → single field. */
export const Challenge = createParamDecorator(
  (field: keyof OtpChallenge | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request & { challenge: OtpChallenge }>();
    return field ? req.challenge[field] : req.challenge;
  },
);
