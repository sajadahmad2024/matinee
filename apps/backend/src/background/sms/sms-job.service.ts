import { ISmsJob } from '@bg/interfaces/job.interface';
import { SmsService } from '@sms/sms.service';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Worker-side SMS delivery. Calls the REAL env-driven SmsService (Twilio in prod) — so when
 * Twilio config lands it sends through Twilio with no code change. Runs off the request path so
 * provider latency/failures never block auth, and SQS gives us retries + DLQ.
 */
@Injectable()
export class SmsJobService {
  private readonly logger = new Logger(SmsJobService.name);

  constructor(private readonly sms: SmsService) {}

  async send(data: ISmsJob): Promise<void> {
    this.logger.debug(`Sending SMS to ${data.to}`);
    await this.sms.sendSms({ to: data.to, body: data.body });
    this.logger.debug(`SMS sent to ${data.to}`);
  }
}
