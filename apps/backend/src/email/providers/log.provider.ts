import { Logger } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { EmailProvider } from '@email/providers/email.provider';
import { EmailSendResult, SendEmailOptions } from '@email/interfaces/email.interface';

const DEV_CODE_TTL = 600;

/**
 * DEV-ONLY email provider (`EMAIL_PROVIDER=log`). Does NOT send — prints the email to the console
 * AND stashes any detected code (e.g. admin password-reset / OTP) in Redis under
 * `dev:otp:email:<to>` for the dev-tools endpoint. Lets you run admin reset / email flows with no
 * SendGrid/SMTP account.
 */
export class LogEmailProvider extends EmailProvider {
  private readonly logger = new Logger('LogEmailProvider');

  constructor(private readonly cache: CacheService) {
    super();
  }

  async send(options: SendEmailOptions): Promise<EmailSendResult> {
    const to = Array.isArray(options.to) ? options.to.join(', ') : options.to;
    const hay = `${options.subject} ${options.text ?? ''} ${options.html ?? ''}`;
    const code = hay.match(/\b(\d{4,8})\b/)?.[1];
    this.logger.log(`✉️  [DEV-EMAIL] to=${to} | subject="${options.subject}"${code ? `  (code=${code})` : ''}`);
    if (code) {
      await this.cache.set(`dev:otp:email:${to}`, code, DEV_CODE_TTL);
    }
    return { messageId: `dev-${Date.now()}` };
  }

  async verify(): Promise<boolean> {
    return true;
  }
}
