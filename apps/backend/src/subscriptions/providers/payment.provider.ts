import { Injectable } from '@nestjs/common';

/** DI token for the configured payment provider (manual / stripe / iap). */
export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

export type PaymentProviderName = 'manual' | 'stripe' | 'iap';
export type BillingInterval = 'monthly' | 'yearly';

export interface ActivateInput {
  userId: string;
  planId: string;
  priceCents: number;
  currency: string;
  region: string;
  interval: BillingInterval;
  trialDays: number;
  /** Provider-specific proof: Stripe checkout/session id, or an IAP receipt token. Ignored by manual. */
  proof?: string;
}

export interface ActivationResult {
  providerSubscriptionId: string;
  providerInvoiceId: string;
  status: 'active' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndAt: string | null;
  paymentMethod: string;
  platform: string;
}

/**
 * Payment provider strategy. The subscription service depends ONLY on this abstraction, so
 * in-app-purchase (Apple/Google) and Stripe can be added by config with no business-logic change
 * (the schema already carries provider / provider_*_id columns everywhere). Selected via the
 * PAYMENT_PROVIDER env in the module factory — same pattern as the SMS/Email providers.
 */
@Injectable()
export abstract class PaymentProvider {
  abstract readonly name: PaymentProviderName;

  /** Confirm payment and return the activation details to persist (subscription + first invoice). */
  abstract activate(input: ActivateInput): Promise<ActivationResult>;

  /** Cancel at the provider (no-op for manual). */
  abstract cancel(providerSubscriptionId: string): Promise<void>;

  /** Refund an invoice at the provider (no-op for manual). */
  abstract refund(providerInvoiceId: string): Promise<void>;

  /** Add `intervalMonths` to an ISO timestamp — shared period math for all providers. */
  protected addInterval(fromIso: string, interval: BillingInterval): string {
    const d = new Date(fromIso);
    if (interval === 'yearly') {
      d.setUTCFullYear(d.getUTCFullYear() + 1);
    } else {
      d.setUTCMonth(d.getUTCMonth() + 1);
    }
    return d.toISOString();
  }
}
