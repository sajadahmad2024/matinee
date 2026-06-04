import { EnvConfig } from '@config/env.config';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageProvider } from './storage.provider';
import { ObjectHead, UploadTarget } from '../interfaces/media.types';

/**
 * S3-backed storage (private bucket). Works against real AWS S3 in cloud and any
 * S3-compatible endpoint (MinIO/LocalStack) locally — only env differs.
 */
@Injectable()
export class S3StorageProvider extends StorageProvider {
  readonly name = 's3';
  readonly bucket: string;
  private readonly logger = new Logger(S3StorageProvider.name);
  private readonly client: S3Client;

  constructor(private readonly config: ConfigService<EnvConfig>) {
    super();
    this.bucket = config.get<string>('MEDIA_S3_BUCKET') ?? '';
    const region = config.get<string>('MEDIA_S3_REGION') ?? 'us-east-1';
    const endpoint = config.get<string>('MEDIA_S3_ENDPOINT') ?? '';
    const accessKeyId = config.get<string>('MEDIA_S3_ACCESS_KEY_ID') ?? '';
    const secretAccessKey = config.get<string>('MEDIA_S3_SECRET_ACCESS_KEY') ?? '';
    this.client = new S3Client({
      region,
      ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
      ...(accessKeyId && secretAccessKey ? { credentials: { accessKeyId, secretAccessKey } } : {}),
    });
  }

  async createUploadUrl(input: { key: string; contentType: string; maxBytes: number }): Promise<UploadTarget> {
    const ttl = this.config.get<number>('MEDIA_UPLOAD_URL_TTL') ?? 900;
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: input.key, ContentType: input.contentType });
    const url = await getSignedUrl(this.client, command, { expiresIn: ttl });
    // Note: a presigned PUT pins Content-Type; absolute size enforcement is done at the
    // bucket/edge (or switch to createPresignedPost) — we still record maxBytes on the row.
    return { url, method: 'PUT', headers: { 'Content-Type': input.contentType }, expiresInSeconds: ttl };
  }

  async headObject(key: string): Promise<ObjectHead> {
    try {
      const out = await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return { exists: true, size: out.ContentLength, contentType: out.ContentType, etag: out.ETag };
    } catch {
      return { exists: false };
    }
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async deletePrefix(prefix: string): Promise<void> {
    let token: string | undefined;
    do {
      const list = await this.client.send(
        new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix, ContinuationToken: token }),
      );
      const objects = (list.Contents ?? []).map((o) => ({ Key: o.Key! })).filter((o) => o.Key);
      if (objects.length > 0) {
        await this.client.send(new DeleteObjectsCommand({ Bucket: this.bucket, Delete: { Objects: objects } }));
      }
      token = list.IsTruncated ? list.NextContinuationToken : undefined;
    } while (token);
    this.logger.debug(`Deleted storage prefix ${prefix}`);
  }
}
