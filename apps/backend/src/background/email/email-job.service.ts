import { IOtpEmailJob } from '@bg/interfaces/job.interface';
import { EmailService } from '@email/email.service';
import { Injectable, Logger } from '@nestjs/common';

/** Business logic executed when an email job is consumed off the queue. */
@Injectable()
export class EmailJobService {
  private readonly logger = new Logger(EmailJobService.name);

  constructor(private readonly emailService: EmailService) {}

  async sendOtpEmail(data: IOtpEmailJob): Promise<void> {
    this.logger.debug(`Sending OTP email to ${data.email}`);
    await this.emailService.sendTemplateEmail(
      data.email,
      'mfa-code',
      {
        name: data.customerName ?? 'User',
        code: String(data.otp),
        expiresIn: '10 minutes',
        appName: 'Maintinee',
        year: new Date().getFullYear(),
      },
      { subject: `Your verification code: ${data.otp}` },
    );
    this.logger.debug(`OTP email sent to ${data.email}`);
  }
}
