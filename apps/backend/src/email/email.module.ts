import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@email/email.service';
import { EmailProvider } from '@email/providers/email.provider';
import { SmtpEmailProvider } from '@email/providers/smtp.provider';
import { SesEmailProvider } from '@email/providers/ses.provider';
import { SendGridEmailProvider } from '@email/providers/sendgrid.provider';
import { LogEmailProvider } from '@email/providers/log.provider';
import { CacheService } from '@cache/cache.service';
import { EmailProviderType } from '@email/interfaces/email.interface';

const logger = new Logger('EmailModule');

const emailProviderFactory = {
  provide: EmailProvider,
  useFactory: (configService: ConfigService, cache: CacheService): EmailProvider => {
    const providerType =
      (configService.get<string>('EMAIL_PROVIDER') as EmailProviderType | undefined) ?? 'smtp';

    logger.log(`Initializing email provider: ${providerType}`);

    switch (providerType) {
      case 'log':
        return new LogEmailProvider(cache);
      case 'ses':
        return new SesEmailProvider(configService);
      case 'sendgrid':
        return new SendGridEmailProvider(configService);
      case 'smtp':
      default:
        return new SmtpEmailProvider(configService);
    }
  },
  inject: [ConfigService, CacheService],
};

@Global()
@Module({
  providers: [emailProviderFactory, EmailService],
  exports: [EmailService, EmailProvider],
})
export class EmailModule {}
