import { EnvConfig } from '@config/env.config';
import { getAwsEndpointOverride, getFlociCredentials } from '@common/helpers/aws-endpoint.util';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { ObjectStream, StorageLocation, StorageProvider } from './storage.provider';
import { ObjectHead, UploadTarget } from '../interfaces/media.types';

/**
 * S3-backed storage (private buckets). Works against real AWS S3 in cloud and any
 * S3-compatible endpoint (Floci/MinIO) locally — only env differs.
 *
 * Two buckets: `MEDIA_S3_BUCKET` (source — client uploads) and `MEDIA_OUTPUT_BUCKET`
 * (transcoder HLS output; defaults to the source bucket). Asset roots are UUID-scoped, so
 * prefix operations are applied to both.
 */
@Injectable()
export class S3StorageProvider extends StorageProvider {
  readonly name = 's3';
  readonly bucket: string;
  private readonly outputBucket: string;
  private readonly logger = new Logger(S3StorageProvider.name);
  private readonly client: S3Client;

  constructor(private readonly config: ConfigService<EnvConfig>) {
    super();
    this.bucket = config.get<string>('MEDIA_S3_BUCKET') ?? '';
    this.outputBucket = config.get<string>('MEDIA_OUTPUT_BUCKET') || this.bucket;
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
    // A presigned PUT pins Content-Type but can't cap Content-Length. Size is enforced after
    // the fact: `POST /:id/complete` and the transcoder Lambda both compare the landed
    // object's size to the size declared at request time and reject + delete oversize objects.
    return { url, method: 'PUT', headers: { 'Content-Type': input.contentType }, expiresInSeconds: ttl };
  }

  async headObject(key: string): Promise<ObjectHead> {
    try {
      const out = await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return { exists: true, size: out.ContentLength, contentType: out.ContentType, etag: out.ETag };
    } catch (err) {
      const errName = (err as { name?: string }).name;
      const status = (err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
      if (errName === 'NotFound' || errName === 'NoSuchKey' || status === 404) {
        return { exists: false };
      }
      if (status === 403) {
        // S3 answers 403 (not 404) for a missing key when the caller lacks s3:ListBucket, so
        // this is treated as "missing" — but it can also be a real IAM misconfiguration.
        this.logger.warn(
          `HEAD ${this.bucket}/${key} returned 403 — treating as missing. If the object exists, ` +
            'the app role likely lacks s3:GetObject / s3:ListBucket on this bucket.',
        );
        return { exists: false };
      }
      // Transport / auth / region errors must surface, not masquerade as "not uploaded".
      throw err;
    }
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  /** Purge a prefix in BOTH buckets — an asset's originals live in source, its HLS in output. */
  async deletePrefix(prefix: string): Promise<void> {
    const buckets = this.outputBucket === this.bucket ? [this.bucket] : [this.bucket, this.outputBucket];
    for (const bucket of buckets) {
      await this.deletePrefixIn(bucket, prefix);
    }
    this.logger.debug(`Deleted storage prefix ${prefix} (${buckets.join(', ')})`);
  }

  async openRead(key: string, location: StorageLocation): Promise<ObjectStream | null> {
    const bucket = location === 'output' ? this.outputBucket : this.bucket;
    try {
      const out = await this.client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      if (!out.Body) {
        return null;
      }
      return { body: out.Body as Readable, contentType: out.ContentType, contentLength: out.ContentLength };
    } catch (err) {
      const status = (err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
      if ((err as { name?: string }).name === 'NoSuchKey' || status === 404 || status === 403) {
        return null;
      }
      throw err;
    }
  }

  private async deletePrefixIn(bucket: string, prefix: string): Promise<void> {
    let token: string | undefined;
    do {
      const list = await this.client.send(
        new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token }),
      );
      const objects = (list.Contents ?? []).flatMap((o) => (o.Key ? [{ Key: o.Key }] : []));
      if (objects.length > 0) {
        await this.client.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: objects } }));
      }
      token = list.IsTruncated ? list.NextContinuationToken : undefined;
    } while (token);
  }
}
