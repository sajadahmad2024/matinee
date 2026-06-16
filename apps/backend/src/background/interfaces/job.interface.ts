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
