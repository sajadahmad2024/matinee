import { EnvConfig } from '@config/env.config';
import { getAwsEndpointOverride, getFlociCredentials } from '@common/helpers/aws-endpoint.util';
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

    // Endpoint resolution: Floci (DEPLOYMENT_TARGET=aws + FLOCI_ENDPOINT) wins;
    // otherwise fall back to the per-service MEDIA_S3_ENDPOINT (MinIO/other local S3);
    // otherwise let the SDK resolve real AWS.
    const flociEndpoint = getAwsEndpointOverride(config);
    const legacyEndpoint = config.get<string>('MEDIA_S3_ENDPOINT') ?? '';
    const endpoint = flociEndpoint ?? (legacyEndpoint || undefined);

    // Credentials: Floci accepts anything (dummy pair); real AWS uses the default chain
    // when no explicit creds are set; explicit legacy creds win over both.
    const legacyAccessKeyId = config.get<string>('MEDIA_S3_ACCESS_KEY_ID') ?? '';
    const legacySecretKey = config.get<string>('MEDIA_S3_SECRET_ACCESS_KEY') ?? '';
    const credentials =
      legacyAccessKeyId && legacySecretKey
        ? { accessKeyId: legacyAccessKeyId, secretAccessKey: legacySecretKey }
        : (getFlociCredentials(config) ?? undefined);

    this.client = new S3Client({
      region,
      ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
      ...(credentials ? { credentials } : {}),
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
    } catch (err) {
      // 404 / 403 (object not there / no perms) → treat as "does not exist" — the caller uses
      // this as a boolean pre-check. Any OTHER failure (transport, auth, region mismatch) should
      // NOT be silently squashed — throw so the operation surfaces the real problem.
      const errName = (err as { name?: string; $metadata?: { httpStatusCode?: number } }).name;
      const status = (err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
      if (errName === 'NotFound' || errName === 'NoSuchKey' || status === 404 || status === 403) {
        return { exists: false };
      }
      throw err;
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
