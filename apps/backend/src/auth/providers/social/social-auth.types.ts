export type SocialProviderName = 'google' | 'apple';

export interface SocialProfile {
  providerUserId: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  picture: string | null;
}

/** Decode a JWT payload WITHOUT verification — safe only for tokens received
 *  directly from the provider's token endpoint over a trusted TLS channel. */
export function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const part = jwt.split('.')[1];
  if (!part) {
    return {};
  }
  const json = Buffer.from(part, 'base64url').toString('utf8');
  return JSON.parse(json) as Record<string, unknown>;
}

/** Contract every social provider implements (redirect → callback code exchange). */
export abstract class SocialAuthProvider {
  abstract readonly provider: SocialProviderName;
  abstract getAuthorizationUrl(state: string): string;
  abstract exchangeCode(code: string): Promise<SocialProfile>;
}
