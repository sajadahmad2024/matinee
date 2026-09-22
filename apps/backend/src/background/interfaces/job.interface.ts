export interface IEmailJob {
  email: string;
  customerName?: string;
}

export interface IOtpEmailJob extends IEmailJob {
  otp: number;
  passwordResetLink?: string;
  passwordSetLink?: string;
}

export interface ICronJob {
  jobType: string;
  data?: unknown;
}

export interface ISmsJob {
  to: string;
  body: string;
}

export interface INotifyCampaignFanoutJob {
  campaignId: string;
}

// ─── Push notifications (transactional FCM) ────────────────────────────────

/** Serializable payload for a single FCM push, shared by all push jobs. */
export interface IPushJobPayload {
  templateKey: string;
  title: string;
  body: string;
  imageUrl?: string;
  /** Deep-link + custom key/value fields. Coerced to strings by the FCM provider. */
  data?: Record<string, string | number | boolean | null | undefined>;
}

export interface IPushToUserJob {
  userId: string;
  payload: IPushJobPayload;
}

export interface IPushToTopicJob {
  topic: string;
  payload: IPushJobPayload;
}

export interface IPushToDevicesJob {
  deviceTokenIds: string[];
  /** Optional owner attribution — for logging when the push is user-scoped (e.g. multi-device send). */
  userId?: string;
  payload: IPushJobPayload;
}
