/** SQS payload: submit the HLS transcode job for a media asset. */
export interface TranscodeVideoJob {
  mediaId: string;
}

/** SQS payload: delayed self-poll of an in-flight transcode job. */
export interface TranscodePollJob {
  mediaId: string;
  jobId: string;
  masterKey: string;
  outputPrefix: string;
  attempt: number;
}

/** SQS payload: delete storage objects for a soft-deleted asset. */
export interface MediaCleanupJob {
  mediaId: string;
  storageKey: string | null;
  deliveryPrefix: string;
}
