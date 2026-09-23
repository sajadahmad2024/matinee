import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';
import { createTransport, Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EmailProvider } from '@email/providers/email.provider';
import { EmailSendResult, SendEmailOptions } from '@email/interfaces/email.interface';

/**
 * SendGrid email provider — dual-mode:
 *   - `options.templateId` set → **@sendgrid/mail SDK** with a dynamic template (`d-...`) and
 *     `dynamicTemplateData`. Same approach as the Trovey project.
 *   - otherwise → falls back to SendGrid's SMTP relay (nodemailer) for raw `html`/`text`
 *     built from local Handlebars templates.
 *
 * Env: `EMAIL_PROVIDER=sendgrid`, `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` (or `EMAIL_FROM`),
 *      optional `SENDGRID_FROM_NAME`.
 */
@Injectable()
export class SendGridEmailProvider extends EmailProvider {
  private readonly logger = new Logger(SendGridEmailProvider.name);
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>;
  private readonly defaultFrom: string;
  private readonly defaultFromName: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.apiKey = this.configService.get<string>('SENDGRID_API_KEY') ?? '';
    // Prefer SENDGRID_FROM_EMAIL (a verified SendGrid sender), else EMAIL_FROM.
    this.defaultFrom =
      this.configService.get<string>('SENDGRID_FROM_EMAIL') ||
      this.configService.get<string>('EMAIL_FROM') ||
      'noreply@example.com';
    this.defaultFromName = this.configService.get<string>('SENDGRID_FROM_NAME') || 'Maintinee';

    if (this.apiKey) {
      sgMail.setApiKey(this.apiKey);
    } else {
      this.logger.warn('SENDGRID_API_KEY is not set — SendGrid emails will fail until configured.');
    }

    const transportOptions: SMTPTransport.Options = {
      host: this.configService.get<string>('SENDGRID_SMTP_HOST') ?? 'smtp.sendgrid.net',
      port: this.configService.get<number>('SENDGRID_SMTP_PORT') ?? 587,
      secure: false,
    };
    if (this.apiKey) {
      transportOptions.auth = { user: 'apikey', pass: this.apiKey };
    }
    this.transporter = createTransport(transportOptions);
  }

  async send(options: SendEmailOptions): Promise<EmailSendResult> {
    return options.templateId ? this.sendViaSdk(options) : this.sendViaSmtp(options);
  }

  /** Dynamic-template path via `@sendgrid/mail` SDK (mirrors the Trovey pattern). */
  private async sendViaSdk(options: SendEmailOptions): Promise<EmailSendResult> {
    if (!this.apiKey) {
      throw new Error('SENDGRID_API_KEY is not set — cannot send templated emails');
    }
    const to = Array.isArray(options.to) ? options.to.join(', ') : options.to;
    const msg = {
      to,
      from: { email: options.from ?? this.defaultFrom, name: this.defaultFromName },
      templateId: options.templateId!,
      ...(options.templateData ? { dynamicTemplateData: options.templateData } : {}),
      ...(options.subject ? { subject: options.subject } : {}),
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
    };
    try {
      const [res] = await sgMail.send(msg);
      const messageId = (res.headers as Record<string, string>)?.['x-message-id'] ?? `sendgrid-${Date.now()}`;
      this.logger.debug(`Templated email sent via SendGrid SDK (template=${options.templateId}, status=${res.statusCode}, id=${messageId})`);
      return { messageId };
    } catch (err: unknown) {
      // The SDK stashes the SendGrid error payload at err.response.body — surface it verbatim.
      const e = err as { response?: { statusCode?: number; body?: unknown }; message?: string };
      const status = e?.response?.statusCode ?? '?';
      const body = e?.response?.body ? JSON.stringify(e.response.body) : (e?.message ?? String(err));
      throw new Error(`SendGrid rejected send (${status}): ${body}`);
    }
  }

  /** SMTP relay path — for html/text sends built from local Handlebars templates. */
  private async sendViaSmtp(options: SendEmailOptions): Promise<EmailSendResult> {
    const { to, subject, html, text, from, replyTo, attachments } = options;
    const mailOptions: SMTPTransport.Options = {
      from: from ?? this.defaultFrom,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
    };
    if (html !== undefined) mailOptions.html = html;
    if (text !== undefined) mailOptions.text = text;
    if (replyTo !== undefined) mailOptions.replyTo = replyTo;
    if (attachments !== undefined) {
      mailOptions.attachments = attachments.map((a) => {
        const attachment: { filename: string; content: Buffer | string; contentType?: string } = {
          filename: a.filename,
          content: a.content,
        };
        if (a.contentType !== undefined) attachment.contentType = a.contentType;
        return attachment;
      });
    }
    const result = await this.transporter.sendMail(mailOptions);
    this.logger.debug(`Email sent via SendGrid SMTP: messageId=${result.messageId}`);
    return { messageId: result.messageId };
  }

  async verify(): Promise<boolean> {
    await this.transporter.verify();
    return true;
  }
}
