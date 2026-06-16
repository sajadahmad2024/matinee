import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EmailProvider } from '@email/providers/email.provider';
import { EmailSendResult, SendEmailOptions } from '@email/interfaces/email.interface';

/**
 * SendGrid email provider (real delivery via SendGrid's SMTP relay using the already-bundled
 * nodemailer — no extra dependency). Env-driven like the other providers: set
 * `EMAIL_PROVIDER=sendgrid` + `SENDGRID_API_KEY` and emails go out through SendGrid with no code
 * change. The worker's email handler calls EmailService → this provider, so flipping config is all
 * that's needed to point at the live endpoint.
 */
@Injectable()
export class SendGridEmailProvider extends EmailProvider {
  private readonly logger = new Logger(SendGridEmailProvider.name);
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>;
  private readonly defaultFrom: string;

  constructor(private readonly configService: ConfigService) {
    super();
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY') ?? '';
    this.defaultFrom = this.configService.get<string>('EMAIL_FROM') ?? 'noreply@example.com';

    // SendGrid SMTP relay: host fixed, username is the literal "apikey", password is the API key.
    const transportOptions: SMTPTransport.Options = {
      host: this.configService.get<string>('SENDGRID_SMTP_HOST') ?? 'smtp.sendgrid.net',
      port: this.configService.get<number>('SENDGRID_SMTP_PORT') ?? 587,
      secure: false,
    };
    if (apiKey) {
      transportOptions.auth = { user: 'apikey', pass: apiKey };
    } else {
      this.logger.warn('SENDGRID_API_KEY is not set — SendGrid emails will fail until configured.');
    }
    this.transporter = createTransport(transportOptions);
  }

  async send(options: SendEmailOptions): Promise<EmailSendResult> {
    const { to, subject, html, text, from, replyTo, attachments } = options;
    const mailOptions: SMTPTransport.Options = {
      from: from ?? this.defaultFrom,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
    };
    if (html !== undefined) {
      mailOptions.html = html;
    }
    if (text !== undefined) {
      mailOptions.text = text;
    }
    if (replyTo !== undefined) {
      mailOptions.replyTo = replyTo;
    }
    if (attachments !== undefined) {
      mailOptions.attachments = attachments.map((a) => {
        const attachment: { filename: string; content: Buffer | string; contentType?: string } = {
          filename: a.filename,
          content: a.content,
        };
        if (a.contentType !== undefined) {
          attachment.contentType = a.contentType;
        }
        return attachment;
      });
    }
    const result = await this.transporter.sendMail(mailOptions);
    this.logger.debug(`Email sent via SendGrid: messageId=${result.messageId}`);
    return { messageId: result.messageId };
  }

  async verify(): Promise<boolean> {
    await this.transporter.verify();
    return true;
  }
}
