import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ActivateInput, ActivationResult, PaymentProvider, PaymentProviderName } from './payment.provider';

/**
 * Manual / no-gateway provider (default). Activates immediately — used for local dev, admin-granted
 * comps, and any non-gateway billing. Real money flows when PAYMENT_PROVIDER is switched to
 * stripe or iap; the subscription service is unchanged.
 */
@Injectable()
export class ManualPaymentProvider extends PaymentProvider {
  readonly name: PaymentProviderName = 'manual';

  async activate(input: ActivateInput): Promise<ActivationResult> {
    const now = new Date().toISOString();
    const trialing = input.trialDays > 0;
    const trialEnd = trialing
      ? new Date(Date.now() + input.trialDays * 86_400_000).toISOString()
      : null;
    // Paid period starts now; trial (if any) is reflected by status + trialEndAt.
    const currentPeriodEnd = this.addInterval(now, input.interval);
    return {
      providerSubscriptionId: `manual_sub_${randomUUID()}`,
      providerInvoiceId: `manual_inv_${randomUUID()}`,
      status: trialing ? 'trialing' : 'active',
      currentPeriodStart: now,
      currentPeriodEnd,
      trialEndAt: trialEnd,
      paymentMethod: 'manual',
      platform: 'web',
    };
  }

  async cancel(): Promise<void> {
    // Nothing to do at a gateway.
  }

  async refund(): Promise<void> {
    // Nothing to do at a gateway.
  }
}
