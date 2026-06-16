import { SignedCookies } from '../interfaces/media.types';

/**
 * CDN delivery abstraction. Public assets get an unsigned URL; protected assets get
 * a short-lived signed URL (single file) or signed cookies (HLS — one grant covers
 * the master + variant playlists + segments under a prefix). Env-selected
 * (`MEDIA_DELIVERY_DRIVER`): CloudFront in cloud, a local stub for dev.
 */
export abstract class MediaDeliveryProvider {
  /** Provider id stored on the row (`media_metadata.cdn_provider`). */
  abstract readonly name: string;

  /** Unsigned, cacheable URL for a public asset. */
  abstract publicUrl(key: string): string;

  /** Short-lived signed URL for a single protected object (images/files). */
  abstract signedUrl(key: string, ttlSeconds: number): Promise<string>;

  /** Signed cookies scoped to a path prefix (protected HLS). Returns the master URL too. */
  abstract signedCookies(pathPrefix: string, ttlSeconds: number): Promise<SignedCookies>;
}
