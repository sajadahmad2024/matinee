import { EnvConfig } from '@config/env.config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaDeliveryProvider } from './delivery.provider';
import { SignedCookies } from '../interfaces/media.types';

/**
 * Dev stub — returns deterministic local URLs and a fake token for "signed" access.
 * No real protection (dev only). In cloud, swap `MEDIA_DELIVERY_DRIVER=cloudfront`.
 */
@Injectable()
export class LocalDeliveryProvider extends MediaDeliveryProvider {
  readonly name = 'local';
  private readonly base: string;

  constructor(config: ConfigService<EnvConfig>) {
    super();
    this.base = (config.get<string>('MEDIA_PUBLIC_BASE_URL') ?? 'http://localhost:3000').replace(/\/$/, '');
  }

  publicUrl(key: string): string {
    return `${this.base}/__local-cdn/${key.replace(/^\//, '')}`;
  }

  async signedUrl(key: string, ttlSeconds: number): Promise<string> {
    const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
    return `${this.publicUrl(key)}?token=local-dev&expires=${expires}`;
  }

  async signedCookies(_pathPrefix: string, ttlSeconds: number): Promise<SignedCookies> {
    const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
    return { 'X-Local-Media-Token': `local-dev:${expires}` };
  }
}
