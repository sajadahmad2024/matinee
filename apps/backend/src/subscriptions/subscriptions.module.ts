import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PlanController } from './plans/plan.controller';
import { AdminPlanController } from './plans/admin-plan.controller';
import { PlanService } from './plans/plan.service';
import { SubscriptionController } from './subscription/subscription.controller';
import { AdminSubscriptionController } from './subscription/admin-subscription.controller';
import { SubscriptionService } from './subscription/subscription.service';
import { PaymentProvider, PaymentProviderName } from './providers/payment.provider';
import { ManualPaymentProvider } from './providers/manual-payment.provider';
import { StripePaymentProvider } from './providers/stripe-payment.provider';
import { IapPaymentProvider } from './providers/iap-payment.provider';

const logger = new Logger('SubscriptionsModule');

/**
 * Subscriptions module — plans + per-region pricing + the subscription lifecycle (subscribe /
 * cancel / invoices / refund). Payment runs through the PaymentProvider strategy, selected by the
 * PAYMENT_PROVIDER env (manual | stripe | iap) — same factory pattern as SMS/Email — so swapping
 * gateways is config-only; the business logic never changes.
 */
@Module({
  imports: [ConfigModule],
  controllers: [PlanController, AdminPlanController, SubscriptionController, AdminSubscriptionController],
  providers: [
    {
      provide: PaymentProvider,
      useFactory: (config: ConfigService): PaymentProvider => {
        const name = (config.get<string>('PAYMENT_PROVIDER') ?? 'manual') as PaymentProviderName;
        logger.log(`Initializing payment provider: ${name}`);
        switch (name) {
          case 'stripe':
            return new StripePaymentProvider(config);
          case 'iap':
            return new IapPaymentProvider(config);
          case 'manual':
          default:
            return new ManualPaymentProvider();
        }
      },
      inject: [ConfigService],
    },
    PlanService,
    SubscriptionService,
  ],
  exports: [SubscriptionService],
})
export class SubscriptionsModule {}
