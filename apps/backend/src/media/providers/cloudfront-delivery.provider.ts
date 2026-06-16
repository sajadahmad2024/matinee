import { EnvConfig } from '@config/env.config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createSign } from 'crypto';
import { MediaDeliveryProvider } from './delivery.provider';
import { SignedCookies } from '../interfaces/media.types';

/**
 * CloudFront delivery with RSA-signed URLs (single objects) and signed cookies
 * (HLS — one grant covers master + variants + segments under a path prefix).
 * Signing uses Node crypto (no extra SDK). Bucket stays private behind OAC.
 */
@Injectable()
export class CloudFrontDeliveryProvider extends MediaDeliveryProvider {
  readonly name = 'cloudfront';
  private readonly cdnUrl: string;
  private readonly keyPairId: string;
  private readonly privateKey: string;

  constructor(config: ConfigService<EnvConfig>) {
    super();
    this.cdnUrl = (config.get<string>('MEDIA_CDN_URL') ?? '').replace(/\/$/, '');
    this.keyPairId = config.get<string>('MEDIA_CDN_KEY_PAIR_ID') ?? '';
    this.privateKey = (config.get<string>('MEDIA_CDN_PRIVATE_KEY') ?? '').replace(/\\n/g, '\n');
  }

  publicUrl(key: string): string {
    return `${this.cdnUrl}/${this.normalize(key)}`;
  }

  async signedUrl(key: string, ttlSeconds: number): Promise<string> {
    const url = this.publicUrl(key);
    const expires = this.expiry(ttlSeconds);
    const policy = JSON.stringify({
      Statement: [{ Resource: url, Condition: { DateLessThan: { 'AWS:EpochTime': expires } } }],
    });
    const signature = this.sign(policy);
    const params = new URLSearchParams({
      Expires: String(expires),
      'Key-Pair-Id': this.keyPairId,
      Signature: signature,
    });
    return `${url}?${params.toString()}`;
  }

  async signedCookies(pathPrefix: string, ttlSeconds: number): Promise<SignedCookies> {
    const resource = `${this.cdnUrl}/${this.normalize(pathPrefix)}*`;
    const expires = this.expiry(ttlSeconds);
    const policy = JSON.stringify({
      Statement: [{ Resource: resource, Condition: { DateLessThan: { 'AWS:EpochTime': expires } } }],
    });
    return {
      'CloudFront-Policy': this.cfBase64(Buffer.from(policy)),
      'CloudFront-Signature': this.sign(policy),
      'CloudFront-Key-Pair-Id': this.keyPairId,
    };
  }

  private sign(policy: string): string {
    const signer = createSign('RSA-SHA1');
    signer.update(policy);
    return this.cfBase64(signer.sign(this.privateKey));
  }

  /** CloudFront's URL-safe base64 variant. */
  private cfBase64(buf: Buffer): string {
    return buf.toString('base64').replace(/\+/g, '-').replace(/=/g, '_').replace(/\//g, '~');
  }

  private expiry(ttlSeconds: number): number {
    return Math.floor(Date.now() / 1000) + ttlSeconds;
  }

  private normalize(key: string): string {
    return key.replace(/^\//, '');
  }
}
