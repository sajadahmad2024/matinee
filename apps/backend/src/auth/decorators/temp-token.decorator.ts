import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Request } from 'express';
import { OtpChallenge } from '../services/token.service';

export const TEMP_TOKEN_PURPOSE_KEY = 'tempTokenPurpose';

/**
 * Declares the purpose a temp-auth token must carry. Enforced by `TempTokenGuard`.
 *
 * A "temp token" is a short-lived, single-purpose JWT the server mints as proof that the
 * holder completed a specific step (e.g. requested an OTP for their email). The confirm-side
 * endpoint uses it *in place of* a Bearer token — the token itself carries the identity
 * (`sub`) and the pre-authorised scope (`purpose`).
 *
 * Purposes are open-ended: `email_verification`, `phone_verification`, `password_reset`,
 * `magic_link_login`, `sensitive_action`, etc. Add new ones freely without touching the guard.
 */
export const RequirePurpose = (purpose: string) => SetMetadata(TEMP_TOKEN_PURPOSE_KEY, purpose);

/** Injects the temp-token payload attached by `TempTokenGuard`.
 *  `@TempToken()` → full payload; `@TempToken('sub')` → a single field. */
export const TempToken = createParamDecorator(
  (field: keyof OtpChallenge | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request & { tempToken: OtpChallenge }>();
    return field ? req.tempToken[field] : req.tempToken;
  },
);
