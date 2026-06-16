import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ActivateInput, ActivationResult, PaymentProvider, PaymentProviderName } from './payment.provider';

/**
 * Stripe provider (structure ready; gateway calls are the integration TODO). Activation runs after
 * a Stripe Checkout/PaymentIntent is confirmed — `input.proof` carries the session/intent id to
 * verify before persisting. Plans/prices map via subscription_plans.provider_product_id and
 * plan_region_prices.provider_price_id. Cancel/refund call the Stripe API by provider id.
 */
@Injectable()
export class StripePaymentProvider extends PaymentProvider {
  readonly name: PaymentProviderName = 'stripe';

  constructor(_config: ConfigService) {
    super();
  }

  private notConfigured(): never {
    throw new ServiceUnavailableException(
      'Stripe payments are not yet wired. Set PAYMENT_PROVIDER=manual, or complete the Stripe integration.',
    );
  }

  async activate(_input: ActivateInput): Promise<ActivationResult> {
    // TODO: verify proof (checkout session / payment intent) via the Stripe SDK, read the
    // subscription + invoice, and map to ActivationResult.
    this.notConfigured();
  }

  async cancel(_providerSubscriptionId: string): Promise<void> {
    // TODO: stripe.subscriptions.cancel(providerSubscriptionId)
    this.notConfigured();
  }

  async refund(_providerInvoiceId: string): Promise<void> {
    // TODO: stripe.refunds.create({ payment_intent | charge from the invoice })
    this.notConfigured();
  }
}
