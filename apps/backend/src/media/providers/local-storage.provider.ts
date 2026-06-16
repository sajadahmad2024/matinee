import { EnvConfig } from '@config/env.config';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider } from './storage.provider';
import { ObjectHead, UploadTarget } from '../interfaces/media.types';

/**
 * Dev stub — no real bytes move (the app body limit is 1 MB and there's no local S3).
 * It returns a placeholder upload URL and "confirms" objects so the full lifecycle
 * (request → complete → transcode → ready → playback) runs locally without AWS.
 * In cloud, swap `MEDIA_STORAGE_DRIVER=s3` and nothing else changes.
 */
@Injectable()
export class LocalStorageProvider extends StorageProvider {
  readonly name = 'local';
  readonly bucket = 'local';
  private readonly logger = new Logger(LocalStorageProvider.name);

  constructor(private readonly config: ConfigService<EnvConfig>) {
    super();
  }

  private baseUrl(): string {
    return this.config.get<string>('MEDIA_PUBLIC_BASE_URL') ?? 'http://localhost:3000';
  }

  async createUploadUrl(input: { key: string; contentType: string; maxBytes: number }): Promise<UploadTarget> {
    const ttl = this.config.get<number>('MEDIA_UPLOAD_URL_TTL') ?? 900;
    // A placeholder target; the dev client need not actually PUT here.
    const url = `${this.baseUrl()}/__local-upload/${encodeURIComponent(input.key)}`;
    return { url, method: 'PUT', headers: { 'Content-Type': input.contentType }, expiresInSeconds: ttl };
  }

  async headObject(_key: string): Promise<ObjectHead> {
    // Simulate a present object so `complete` proceeds in dev.
    return { exists: true, size: 0 };
  }

  async deleteObject(key: string): Promise<void> {
    this.logger.debug(`[local] delete object ${key}`);
  }

  async deletePrefix(prefix: string): Promise<void> {
    this.logger.debug(`[local] delete prefix ${prefix}`);
  }
}
