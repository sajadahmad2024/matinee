import { IOtpEmailJob } from '@bg/interfaces/job.interface';
import { EmailService } from '@email/email.service';
import { EMAIL_TEMPLATES } from '@email/constants/email-templates.constants';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '@config/env.config';

/**
 * Email job handler (worker-side).
 *
 * Called by QueueConsumerService when an OTP-email job arrives on QueueName.EMAIL.
 * Producer side lives in the API (e.g. ProfileService.requestEmailVerification enqueues
 * via QueueService.send(QueueName.EMAIL, JobName.OTP_EMAIL, { email, otp })).
 *
 * Provider strategy:
 *   - EMAIL_PROVIDER=sendgrid → sends via SendGrid HTTP API with a dynamic template
 *     managed in the SendGrid Console (template IDs live in EMAIL_TEMPLATES).
 *   - EMAIL_PROVIDER=smtp/ses/log → sends via nodemailer using the local Handlebars
 *     template `mfa-code.hbs` (rendered → html). `log` prints to console + stashes the
 *     code in Redis for /dev-tools/otp?dest=<email>&channel=email.
 */
@Injectable()
export class EmailJobService {
  private readonly logger = new Logger(EmailJobService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly config: ConfigService<EnvConfig>,
  ) {}

  async sendOtpEmail(data: IOtpEmailJob): Promise<void> {
    this.logger.debug(`Sending OTP email to ${data.email}`);

    // Use the SendGrid dynamic template when we're on the SendGrid provider (branded email
    // managed in the SendGrid Console). Any other provider falls back to the local
    // Handlebars template (mfa-code.hbs) so log / smtp / ses paths keep working.
    const useSendGridTemplate = this.config.get<string>('EMAIL_PROVIDER') === 'sendgrid';
    if (useSendGridTemplate) {
      await this.emailService.sendEmail({
        to: data.email,
        subject: `Your verification code: ${data.otp}`,
        templateId: EMAIL_TEMPLATES.SIGNUP_OTP,
        templateData: {
          name: data.customerName ?? 'User',
          otp: String(data.otp),
          code: String(data.otp),
          expiresIn: '10 minutes',
          appName: 'Maintinee',
          year: new Date().getFullYear(),
        },
      });
    } else {
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
    }
    this.logger.debug(`OTP email sent to ${data.email}`);
  }
}
