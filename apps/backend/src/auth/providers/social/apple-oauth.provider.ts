import { EnvConfig } from '@config/env.config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { decodeJwtPayload, SocialAuthProvider, SocialProfile } from './social-auth.types';

const AUTH_ENDPOINT = 'https://appleid.apple.com/auth/authorize';
const TOKEN_ENDPOINT = 'https://appleid.apple.com/auth/token';
const AUDIENCE = 'https://appleid.apple.com';

@Injectable()
export class AppleOAuthProvider extends SocialAuthProvider {
  readonly provider = 'apple' as const;

  constructor(
    private readonly config: ConfigService<EnvConfig>,
    private readonly jwt: JwtService,
  ) {
    super();
  }

  private get clientId(): string {
    return this.config.get<string>('APPLE_CLIENT_ID') ?? '';
  }
  private get callbackUrl(): string {
    return this.config.get<string>('APPLE_CALLBACK_URL') ?? '';
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      scope: 'name email',
      state,
      response_mode: 'form_post', // Apple POSTs the callback
    });
    return `${AUTH_ENDPOINT}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<SocialProfile> {
    const res = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.buildClientSecret(),
        redirect_uri: this.callbackUrl,
        grant_type: 'authorization_code',
      }).toString(),
    });
    if (!res.ok) {
      throw new UnauthorizedException('Apple token exchange failed');
    }
    const data = (await res.json()) as { id_token?: string };
    if (!data.id_token) {
      throw new UnauthorizedException('Apple did not return an id_token');
    }
    const claims = decodeJwtPayload(data.id_token);
    const ev = claims['email_verified'];
    return {
      providerUserId: String(claims['sub'] ?? ''),
      email: (claims['email'] as string | undefined) ?? null,
      emailVerified: ev === true || ev === 'true',
      name: null, // Apple only returns the name on first authorize (form_post body)
      picture: null,
    };
  }

  /** Apple's client_secret is an ES256-signed JWT built from the .p8 key. */
  private buildClientSecret(): string {
    const teamId = this.config.get<string>('APPLE_TEAM_ID') ?? '';
    const keyId = this.config.get<string>('APPLE_KEY_ID') ?? '';
    const privateKey = (this.config.get<string>('APPLE_PRIVATE_KEY') ?? '').replace(/\\n/g, '\n');
    return this.jwt.sign(
      {},
      {
        algorithm: 'ES256',
        secret: privateKey,
        keyid: keyId,
        issuer: teamId,
        audience: AUDIENCE,
        subject: this.clientId,
        expiresIn: 300,
      },
    );
  }
}
