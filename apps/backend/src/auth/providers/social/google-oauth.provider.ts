import { EnvConfig } from '@config/env.config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { decodeJwtPayload, SocialAuthProvider, SocialProfile } from './social-auth.types';

const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

@Injectable()
export class GoogleOAuthProvider extends SocialAuthProvider {
  readonly provider = 'google' as const;

  constructor(private readonly config: ConfigService<EnvConfig>) {
    super();
  }

  private get clientId(): string {
    return this.config.get<string>('GOOGLE_CLIENT_ID') ?? '';
  }
  private get clientSecret(): string {
    return this.config.get<string>('GOOGLE_CLIENT_SECRET') ?? '';
  }
  private get callbackUrl(): string {
    return this.config.get<string>('GOOGLE_CALLBACK_URL') ?? '';
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'select_account',
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
        client_secret: this.clientSecret,
        redirect_uri: this.callbackUrl,
        grant_type: 'authorization_code',
      }).toString(),
    });
    if (!res.ok) {
      throw new UnauthorizedException('Google token exchange failed');
    }
    const data = (await res.json()) as { id_token?: string };
    if (!data.id_token) {
      throw new UnauthorizedException('Google did not return an id_token');
    }
    const claims = decodeJwtPayload(data.id_token);
    const ev = claims['email_verified'];
    return {
      providerUserId: String(claims['sub'] ?? ''),
      email: (claims['email'] as string | undefined) ?? null,
      emailVerified: ev === true || ev === 'true',
      name: (claims['name'] as string | undefined) ?? null,
      picture: (claims['picture'] as string | undefined) ?? null,
    };
  }
}
