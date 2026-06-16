import { HashingService } from '@common/hashing/hashing.service';
import { IdentityRepository } from '@db/repositories/auth/identity.repository';
import { QueueService } from '@queue/queue.service';
import { JobName, QueueName } from '@queue/queue.constant';
import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { randomInt } from 'crypto';
import { PhoneVerificationProvider, PhoneVerifyInput } from './phone-verification.provider';

const OTP_TTL_SECONDS = 5 * 60;

/** Backend-managed OTP over SMS, persisted (hashed) in otp_codes. */
@Injectable()
export class TwilioOtpProvider extends PhoneVerificationProvider {
  private readonly logger = new Logger(TwilioOtpProvider.name);

  constructor(
    private readonly identity: IdentityRepository,
    private readonly queue: QueueService,
    private readonly hashing: HashingService,
  ) {
    super();
  }

  async requestOtp(phone: string): Promise<{ delivery: 'sent' }> {
    // 6-digit, zero-padded (randomInt upper bound is exclusive).
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const codeHash = await this.hashing.hash(code);
    await this.identity.createOtp({
      destination: phone,
      channel: 'sms',
      purpose: 'login',
      codeHash,
      expiresInSeconds: OTP_TTL_SECONDS,
    });
    // Enqueue the SMS so provider latency/failures never block the auth request; the worker
    // calls the real (Twilio) SmsService and SQS gives us retries + DLQ.
    await this.queue.send(QueueName.SMS, JobName.SEND_SMS, {
      to: phone,
      body: `Your verification code is ${code}. It expires in 5 minutes.`,
    });
    this.logger.debug(`OTP issued for ${phone} (SMS enqueued)`);
    return { delivery: 'sent' };
  }

  async verify(input: PhoneVerifyInput): Promise<{ phone: string; verified: boolean }> {
    if (!input.code) {
      throw new BadRequestException('OTP code is required');
    }
    const otp = await this.identity.findActiveOtp(input.phone, 'login');
    if (!otp) {
      throw new UnauthorizedException('OTP expired or not requested');
    }
    if (otp.attempts >= otp.maxAttempts) {
      throw new UnauthorizedException('Too many attempts; request a new code');
    }
    const ok = await this.hashing.compare(input.code, otp.codeHash);
    if (!ok) {
      await this.identity.incrementOtpAttempts(otp.id);
      throw new UnauthorizedException('Invalid code');
    }
    await this.identity.consumeOtp(otp.id);
    return { phone: input.phone, verified: true };
  }
}
