/** A direct-to-storage upload target handed to the client (presigned PUT). */
export interface UploadTarget {
  url: string;
  method: 'PUT';
  headers: Record<string, string>;
  expiresInSeconds: number;
}

/** Result of probing an object in storage. */
export interface ObjectHead {
  exists: boolean;
  size?: number | undefined;
  contentType?: string | undefined;
  etag?: string | undefined;
}

/** CloudFront-style signed cookies (cookie name → value). Empty for unsigned/local. */
export type SignedCookies = Record<string, string>;

/** What the worker hands back after kicking off a transcode. */
export interface TranscodeSubmission {
  jobId: string;
  /** True when the transcode is simulated (local driver) → finalize immediately. */
  simulated: boolean;
  /** Object key of the HLS master playlist that will exist when done. */
  masterKey: string;
  /** Prefix the HLS outputs live under (what a signed cookie scopes to). */
  outputPrefix: string;
}

/** Normalized transcode job state (polled from the provider). */
export interface TranscodeStatus {
  state: 'submitted' | 'progressing' | 'complete' | 'error';
  progress: number | null;
  error?: string | undefined;
  durationSeconds?: string | undefined;
  width?: number | undefined;
  height?: number | undefined;
}

/** A ready-to-play descriptor returned to the client. */
export interface PlaybackTicket {
  /** 'hls' for adaptive video; 'file' for a single image/object. */
  kind: 'hls' | 'file';
  /** Master playlist URL (hls) or object URL (file). */
  url: string;
  /** Signed cookies to send with subsequent CDN requests (hls/protected); empty otherwise. */
  cookies: SignedCookies;
  /** Seconds the URL/cookies remain valid. */
  expiresInSeconds: number;
}
