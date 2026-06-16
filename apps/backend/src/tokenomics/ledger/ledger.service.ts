import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  AppendResult,
  LedgerCurrency,
  LedgerRepository,
} from '@db/repositories/tokenomics/ledger.repository';

interface AwardOptions {
  sourceId?: string;
  note?: string;
}

/**
 * The single write path for the points/xp ledger. The DB `ledger_apply` trigger maintains
 * the wallet + balance_after and rejects over-spends; this service gives award/spend/adjust
 * semantics with idempotency. Injected by earning flows, games, and admin tooling.
 */
@Injectable()
export class LedgerService {
  constructor(private readonly ledger: LedgerRepository) {}

  /** Credit (earn). amount must be > 0. Idempotent on idempotencyKey. */
  award(
    userId: string,
    currency: LedgerCurrency,
    amount: number,
    sourceType: string,
    idempotencyKey: string,
    opts: AwardOptions = {},
  ): Promise<AppendResult> {
    if (amount <= 0) {
      throw new BadRequestException('Award amount must be positive');
    }
    return this.ledger.append({
      userId,
      currency,
      amount,
      direction: 'earn',
      sourceKind: 'earned',
      sourceType,
      idempotencyKey,
      ...(opts.sourceId ? { sourceId: opts.sourceId } : {}),
      ...(opts.note ? { note: opts.note } : {}),
    });
  }

  /** Debit (spend). amount must be > 0; throws 400 on insufficient balance. */
  async spend(
    userId: string,
    currency: LedgerCurrency,
    amount: number,
    sourceType: string,
    idempotencyKey: string,
    opts: AwardOptions = {},
  ): Promise<AppendResult> {
    if (amount <= 0) {
      throw new BadRequestException('Spend amount must be positive');
    }
    try {
      return await this.ledger.append({
        userId,
        currency,
        amount: -amount,
        direction: 'spend',
        sourceKind: 'earned',
        sourceType,
        idempotencyKey,
        ...(opts.sourceId ? { sourceId: opts.sourceId } : {}),
        ...(opts.note ? { note: opts.note } : {}),
      });
    } catch (e) {
      if (this.isInsufficient(e)) {
        throw new BadRequestException('Insufficient balance');
      }
      throw e;
    }
  }

  /** Admin manual adjustment (signed). Each call is a distinct, non-deduped entry. */
  async adjust(
    userId: string,
    currency: LedgerCurrency,
    delta: number,
    adminId: string,
    reason: string,
  ): Promise<AppendResult> {
    if (delta === 0) {
      throw new BadRequestException('Adjustment cannot be zero');
    }
    try {
      return await this.ledger.append({
        userId,
        currency,
        amount: delta,
        direction: 'adjust',
        sourceKind: 'earned',
        sourceType: 'admin',
        idempotencyKey: `admin:${adminId}:${randomUUID()}`,
        sourceId: adminId,
        note: reason,
      });
    } catch (e) {
      if (this.isInsufficient(e)) {
        throw new BadRequestException('Adjustment would make the balance negative');
      }
      throw e;
    }
  }

  /** The ledger trigger raises check_violation (SQLSTATE 23514) when a balance would go negative. */
  private isInsufficient(e: unknown): boolean {
    const code = (e as { code?: string })?.code ?? (e as { cause?: { code?: string } })?.cause?.code;
    return code === '23514';
  }
}
