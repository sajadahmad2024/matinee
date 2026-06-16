import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ActivateInput, ActivationResult, PaymentProvider, PaymentProviderName } from './payment.provider';

/**
 * In-app-purchase provider (Apple App Store / Google Play) — structure ready; receipt verification
 * is the integration TODO. The client completes the purchase in-app and posts the receipt as
 * `input.proof`; activate() verifies it with Apple/Google and maps the result. Products map via
 * subscription_plans.provider_product_id. Cancel is user-driven in the store (we reconcile via
 * server notifications); refund is store-side.
 */
@Injectable()
export class IapPaymentProvider extends PaymentProvider {
  readonly name: PaymentProviderName = 'iap';

  constructor(_config: ConfigService) {
    super();
  }

  private notConfigured(): never {
    throw new ServiceUnavailableException(
      'In-app purchases are not yet wired. Set PAYMENT_PROVIDER=manual, or complete the App Store / Play receipt verification.',
    );
  }

  async activate(_input: ActivateInput): Promise<ActivationResult> {
    // TODO: verify input.proof (Apple/Google receipt) and map the validated purchase.
    this.notConfigured();
  }

  async cancel(_providerSubscriptionId: string): Promise<void> {
    // IAP cancellations are store-driven; reconciled via App Store / Play server notifications.
    this.notConfigured();
  }

  async refund(_providerInvoiceId: string): Promise<void> {
    // Refunds are store-side for IAP.
    this.notConfigured();
  }
}
