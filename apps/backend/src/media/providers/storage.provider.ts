import { ObjectHead, UploadTarget } from '../interfaces/media.types';

/**
 * Object storage abstraction (bucket is PRIVATE — open for upload, closed for read).
 * Concrete impls are env-selected (`MEDIA_STORAGE_DRIVER`): S3 in cloud, a local
 * stub for dev. Swapping S3 → GCS/R2 = a new impl + env, no business-code change.
 */
export abstract class StorageProvider {
  /** Provider id stored on the row (`media_metadata.storage_provider`). */
  abstract readonly name: string;
  /** Bucket the originals live in (informational; '' for local). */
  abstract readonly bucket: string;

  /** Mint a short-lived direct-upload target (presigned PUT) for `key`. */
  abstract createUploadUrl(input: { key: string; contentType: string; maxBytes: number }): Promise<UploadTarget>;

  /** Probe an object — used at `complete` to confirm the client actually uploaded. */
  abstract headObject(key: string): Promise<ObjectHead>;

  /** Delete a single object (best-effort). */
  abstract deleteObject(key: string): Promise<void>;

  /** Delete everything under a prefix (HLS outputs, variants). */
  abstract deletePrefix(prefix: string): Promise<void>;
}
