/** Intrinsic kind of an asset. */
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other',
}

/** What the asset is used for (drives default access tier + admin library filters). */
export enum UsageType {
  CONTENT_VIDEO = 'content_video',
  CONTENT_TRAILER = 'content_trailer',
  CONTENT_THUMBNAIL = 'content_thumbnail',
  AVATAR = 'avatar',
  STUDIO_LOGO = 'studio_logo',
  BANNER = 'banner',
  DOCUMENT = 'document',
  GENERIC = 'generic',
}

/** Delivery security tier — decides how a URL is minted at serve time. */
export enum AccessLevel {
  /** Unsigned CDN URL (avatars, thumbnails, public images). */
  PUBLIC = 'public',
  /** Short-lived signed CDN cookie/URL, app-only (streaming content). */
  PROTECTED = 'protected',
  /** Never client-served (originals/mezzanine; admin-only via signed URL). */
  PRIVATE = 'private',
}

/** Asset lifecycle. */
export enum MediaStatus {
  PENDING = 'pending',       // row created; awaiting the client's upload
  UPLOADING = 'uploading',   // (reserved) multipart in progress
  UPLOADED = 'uploaded',     // bytes are in storage; pre-processing
  PROCESSING = 'processing', // transcode job submitted
  READY = 'ready',           // playable / servable
  FAILED = 'failed',         // upload/transcode failed
  ARCHIVED = 'archived',     // retired
}

/** Provider DI tokens (env-selected concrete impls bound in MediaModule). */
export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
export const MEDIA_DELIVERY_PROVIDER = Symbol('MEDIA_DELIVERY_PROVIDER');
export const TRANSCODER_PROVIDER = Symbol('TRANSCODER_PROVIDER');

/** Cache tag for media reads (invalidate on status change / delete). */
export const MEDIA_CACHE_TAG = 'media';
