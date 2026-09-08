export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  /** SendGrid dynamic template id (e.g. `d-abc123`). When set, `html`/`text` are ignored and the
   *  SendGrid HTTP API is used with `dynamic_template_data` = `templateData`. Other providers
   *  ignore this and fall back to `html`/`text`. */
  templateId?: string;
  templateData?: Record<string, unknown>;
}

export type EmailProviderType = 'smtp' | 'ses' | 'sendgrid' | 'log';

export interface EmailSendResult {
  messageId: string;
}
