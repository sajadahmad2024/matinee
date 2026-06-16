import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DBService } from '@db/db.service';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import { PlanRecord, SubscriptionPlanRepository } from '@db/repositories/subscriptions/subscription-plan.repository';
import { SubscriptionRecord, SubscriptionRepository } from '@db/repositories/subscriptions/subscription.repository';
import { InvoiceRecord, SubscriptionInvoiceRepository } from '@db/repositories/subscriptions/subscription-invoice.repository';
import { ProfileRepository } from '@db/repositories/users/profile.repository';
import { PaymentProvider, BillingInterval } from '../providers/payment.provider';
import { SubscribeDto } from './dto/subscription.dto';

const DEFAULT_REGION = 'NA';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly db: DBService,
    private readonly payment: PaymentProvider,
    private readonly subs: SubscriptionRepository,
    private readonly plans: SubscriptionPlanRepository,
    private readonly invoices: SubscriptionInvoiceRepository,
    private readonly profiles: ProfileRepository,
  ) {}

  private page(total: number, page: number, limit: number): PaginationDetailsDto {
    return { pageNo: page, pageSize: limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  private invoiceNumber(): string {
    return `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-${randomUUID().slice(0, 8).toUpperCase()}`;
  }

  /** Subscribe via the configured payment provider (manual/stripe/iap). Persists sub + first invoice atomically. */
  async subscribe(userId: string, dto: SubscribeDto): Promise<SubscriptionRecord> {
    const plan = await this.plans.getById(dto.planId);
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not available');
    }
    if (await this.subs.getActiveForUser(userId)) {
      throw new ConflictException('You already have an active subscription');
    }
    const subId = await this.provision(userId, plan, dto.proof);
    return (await this.subs.getById(subId))!;
  }

  /** Activate (via provider) + persist subscription + first invoice atomically. Shared by subscribe + changePlan. */
  private async provision(userId: string, plan: PlanRecord, proof?: string): Promise<string> {
    const profile = await this.profiles.getProfile(userId);
    const region = profile?.region ?? DEFAULT_REGION;
    const rp = await this.plans.priceForRegion(plan.id, region);
    const priceCents = rp?.priceCents ?? plan.basePriceCents;
    const currency = rp?.currency ?? plan.baseCurrency;

    const activation = await this.payment.activate({
      userId,
      planId: plan.id,
      priceCents,
      currency,
      region,
      interval: plan.interval as BillingInterval,
      trialDays: plan.trialDays,
      ...(proof ? { proof } : {}),
    });

    return this.db.transaction(async (tx) => {
      const id = await this.subs.create(
        {
          userId,
          planId: plan.id,
          status: activation.status,
          region,
          amountCents: priceCents,
          currency,
          currentPeriodStart: activation.currentPeriodStart,
          currentPeriodEnd: activation.currentPeriodEnd,
          trialEndAt: activation.trialEndAt,
          provider: this.payment.name,
          providerSubscriptionId: activation.providerSubscriptionId,
          ...(profile?.countryCode ? { countryCode: profile.countryCode } : {}),
        },
        tx,
      );
      await this.invoices.create(
        {
          subscriptionId: id,
          userId,
          invoiceNumber: this.invoiceNumber(),
          amountCents: priceCents,
          currency,
          region,
          status: 'paid',
          paymentMethod: activation.paymentMethod,
          platform: activation.platform,
          provider: this.payment.name,
          providerInvoiceId: activation.providerInvoiceId,
        },
        tx,
      );
      return id;
    });
  }

  /** Upgrade/downgrade — switch to another plan (cancel current at provider + provision the new one). */
  async changePlan(userId: string, newPlanId: string): Promise<SubscriptionRecord> {
    const plan = await this.plans.getById(newPlanId);
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not available');
    }
    const current = await this.subs.getLatestForUser(userId);
    if (!current || !['active', 'trialing', 'past_due'].includes(current.status)) {
      throw new BadRequestException('No active subscription to change — subscribe instead');
    }
    if (current.planId === newPlanId) {
      throw new BadRequestException('You are already on this plan');
    }
    if (current.providerSubscriptionId) {
      await this.payment.cancel(current.providerSubscriptionId);
    }
    await this.subs.cancel(current.id, 'plan_change');
    const subId = await this.provision(userId, plan);
    return (await this.subs.getById(subId))!;
  }

  /**
   * Single subscription-center payload: the caller's current subscription + every plan annotated
   * with the action available against it (subscribe / current / upgrade / downgrade).
   */
  async overview(userId: string): Promise<{
    current: SubscriptionRecord | null;
    canCancel: boolean;
    plans: Array<PlanRecord & { price: { priceCents: number; currency: string; region: string | null }; isCurrent: boolean; action: string }>;
  }> {
    const latest = await this.subs.getLatestForUser(userId);
    const active = latest && ['active', 'trialing', 'past_due'].includes(latest.status) ? latest : null;
    const profile = await this.profiles.getProfile(userId);
    const region = profile?.region ?? DEFAULT_REGION;
    const currentAmount = active?.amountCents ?? null;
    const plans = await this.plans.list(true);
    const annotated = await Promise.all(
      plans.map(async (p) => {
        const rp = await this.plans.priceForRegion(p.id, region);
        const price = rp
          ? { priceCents: rp.priceCents, currency: rp.currency, region }
          : { priceCents: p.basePriceCents, currency: p.baseCurrency, region: null };
        const isCurrent = !!active && active.planId === p.id;
        let action: string;
        if (!active) {
          action = 'subscribe';
        } else if (isCurrent) {
          action = 'current';
        } else if (currentAmount !== null && price.priceCents > currentAmount) {
          action = 'upgrade';
        } else {
          action = 'downgrade';
        }
        return { ...p, price, isCurrent, action };
      }),
    );
    return { current: active, canCancel: !!active, plans: annotated };
  }

  async mySubscription(userId: string): Promise<SubscriptionRecord | null> {
    return this.subs.getLatestForUser(userId);
  }

  async cancel(userId: string, reason?: string): Promise<{ id: string; status: string }> {
    const sub = await this.subs.getLatestForUser(userId);
    if (!sub || !['active', 'trialing', 'past_due'].includes(sub.status)) {
      throw new BadRequestException('No active subscription to cancel');
    }
    if (sub.providerSubscriptionId) {
      await this.payment.cancel(sub.providerSubscriptionId);
    }
    await this.subs.cancel(sub.id, reason);
    return { id: sub.id, status: 'canceled' };
  }

  async myInvoices(userId: string, page: number, limit: number): Promise<{ items: InvoiceRecord[]; pagination: PaginationDetailsDto }> {
    const { items, total } = await this.invoices.listByUser(userId, page, limit);
    return { items, pagination: this.page(total, page, limit) };
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────
  async adminList(page: number, limit: number, status?: string): Promise<{ items: SubscriptionRecord[]; pagination: PaginationDetailsDto }> {
    const { items, total } = await this.subs.listAll({ page, limit, ...(status ? { status } : {}) });
    return { items, pagination: this.page(total, page, limit) };
  }

  /** Admin transaction ledger — all invoices across users. */
  async adminTransactions(page: number, limit: number, status?: string): Promise<{ items: (InvoiceRecord & { username: string | null })[]; pagination: PaginationDetailsDto }> {
    const { items, total } = await this.invoices.listAll({ page, limit, ...(status ? { status } : {}) });
    return { items, pagination: this.page(total, page, limit) };
  }

  async adminGet(subId: string): Promise<{ subscription: SubscriptionRecord; invoices: InvoiceRecord[] }> {
    const subscription = await this.subs.getById(subId);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    const { items } = await this.invoices.listByUser(subscription.userId, 1, 100);
    return { subscription, invoices: items };
  }

  async adminCancel(subId: string, reason?: string): Promise<{ id: string; status: string }> {
    const sub = await this.subs.getById(subId);
    if (!sub) {
      throw new NotFoundException('Subscription not found');
    }
    if (sub.providerSubscriptionId) {
      await this.payment.cancel(sub.providerSubscriptionId);
    }
    await this.subs.cancel(subId, reason);
    return { id: subId, status: 'canceled' };
  }

  async refundInvoice(invoiceId: string): Promise<{ id: string; status: string }> {
    const inv = await this.invoices.getById(invoiceId);
    if (!inv) {
      throw new NotFoundException('Invoice not found');
    }
    if (inv.status !== 'paid') {
      throw new BadRequestException(`Cannot refund a ${inv.status} invoice`);
    }
    if (inv.providerInvoiceId) {
      await this.payment.refund(inv.providerInvoiceId);
    }
    await this.invoices.markRefunded(invoiceId);
    return { id: invoiceId, status: 'refunded' };
  }
}
