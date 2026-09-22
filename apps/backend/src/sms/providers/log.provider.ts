import { Logger } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { SmsProvider } from './sms.provider';
import { SendSmsOptions, SmsResult } from '../interfaces/sms.interface';

/** Last code captured per destination is kept this long (seconds) for the dev-tools endpoint. */
const DEV_CODE_TTL = 600;

/**
 * DEV-ONLY SMS provider (`SMS_PROVIDER=log`). Does NOT send anything — it prints the message to
 * the console AND stashes any detected verification code in Redis under `dev:otp:sms:<to>` so the
 * dev-tools endpoint can return it (the real provider hashes the code, so it's otherwise
 * unrecoverable locally). Lets you run the full OTP flow with no Twilio account.
 */
export class LogSmsProvider extends SmsProvider {
  private readonly logger = new Logger('LogSmsProvider');

  constructor(private readonly cache: CacheService) {
    super();
  }

  async send(options: SendSmsOptions): Promise<SmsResult> {
    const code = options.body.match(/\b(\d{4,8})\b/)?.[1];
    this.logger.log(`📱 [DEV-SMS] to=${options.to} | ${options.body}${code ? `  (code=${code})` : ''}`);
    if (code) {
      await this.cache.set(`dev:otp:sms:${options.to}`, code, DEV_CODE_TTL);
    }
    return { messageId: `dev-${Date.now()}`, status: 'sent' };
  }

  async checkDeliveryStatus(_messageId: string): Promise<string> {
    return 'delivered';
  }
}
