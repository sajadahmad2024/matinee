import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import { DBService } from '@db/db.service';
import { PredictionRecord, PredictionRepository } from '@db/repositories/games/prediction.repository';
import { LedgerRepository } from '@db/repositories/tokenomics/ledger.repository';
import { RewardRuleRepository } from '@db/repositories/tokenomics/reward-rule.repository';
import { SubscriptionRepository } from '@db/repositories/subscriptions/subscription.repository';
import { CreatePredictionDto } from './dto/prediction.dto';

/** Default monthly free-entry allowance for non-subscribers (overridable via the 'prediction' reward rule). */
const DEFAULT_FREE_ENTRIES_PER_MONTH = 3;

export interface PredictionEntitlement {
  isSubscriber: boolean;
  /** null = unlimited (subscribers). */
  viewsAllowed: number | null;
  viewsUsed: number;
  /** null = unlimited. */
  viewsRemaining: number | null;
  canEnter: boolean;
}

@Injectable()
export class PredictionService {
  constructor(
    private readonly predictions: PredictionRepository,
    private readonly ledger: LedgerRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly rules: RewardRuleRepository,
    private readonly db: DBService,
  ) {}

  /** First day of the current month (UTC) — the free-allowance reset boundary. */
  private monthStart(): string {
    return `${new Date().toISOString().slice(0, 7)}-01T00:00:00.000Z`;
  }

  /**
   * The caller's prediction allowance for this month. Subscribers are unlimited; free users get
   * a configured monthly cap (powers the "X of Y free predictions" entitlement on the screen).
   */
  async getEntitlement(userId: string): Promise<PredictionEntitlement> {
    const [sub, rule, viewsUsed] = await Promise.all([
      this.subscriptions.getActiveForUser(userId),
      this.rules.getByKey('prediction'),
      this.predictions.countEntriesByUserSince(userId, this.monthStart()),
    ]);
    const isSubscriber = sub != null;
    if (isSubscriber) {
      return { isSubscriber, viewsAllowed: null, viewsUsed, viewsRemaining: null, canEnter: true };
    }
    const cfg = (rule?.config ?? {}) as { free_entries_per_month?: number };
    const viewsAllowed = cfg.free_entries_per_month ?? DEFAULT_FREE_ENTRIES_PER_MONTH;
    const viewsRemaining = Math.max(0, viewsAllowed - viewsUsed);
    return { isSubscriber, viewsAllowed, viewsUsed, viewsRemaining, canEnter: viewsRemaining > 0 };
  }

  private liveOrThrow(p: PredictionRecord): void {
    const now = Date.now();
    if (p.status !== 'open' || new Date(p.startAt).getTime() > now || new Date(p.endAt).getTime() <= now) {
      throw new BadRequestException('Prediction is not open');
    }
  }

  // ─── Customer ────────────────────────────────────────────────────────────────
  async listOpen(userId: string) {
    const [open, entitlement] = await Promise.all([this.predictions.listOpen(), this.getEntitlement(userId)]);
    const items = await Promise.all(
      open.map(async (p) => ({
        id: p.id, question: p.question, description: p.description, endAt: p.endAt,
        entryCostPoints: p.entryCostPoints, payoutMultiplier: p.payoutMultiplier, rewardXp: p.rewardXp,
        options: (await this.predictions.getOptions(p.id)).map((o) => ({ id: o.id, label: o.label, optionMediaId: o.optionMediaId })),
        myEntry: await this.myEntry(p.id, userId),
      })),
    );
    return { entitlement, items };
  }

  private async myEntry(predictionId: string, userId: string) {
    const e = await this.predictions.getEntry(predictionId, userId);
    return e ? { optionId: e.optionId, pointsStaked: e.pointsStaked, isCorrect: e.isCorrect, pointsAwarded: e.pointsAwarded } : null;
  }

  async detail(userId: string, predictionId: string) {
    const p = await this.predictions.getById(predictionId);
    if (!p) {
      throw new NotFoundException('Prediction not found');
    }
    const options = await this.predictions.getOptions(predictionId);
    return {
      id: p.id, question: p.question, description: p.description, status: p.status, endAt: p.endAt,
      entryCostPoints: p.entryCostPoints, payoutMultiplier: p.payoutMultiplier, rewardXp: p.rewardXp, correctOptionId: p.correctOptionId,
      options: options.map((o) => ({ id: o.id, label: o.label, optionMediaId: o.optionMediaId, isCorrect: p.status === 'resolved' ? o.isCorrect : undefined })),
      myEntry: await this.myEntry(predictionId, userId),
    };
  }

  /** Enter a prediction — stake entry cost and lock in an option (one entry per user). */
  async enter(userId: string, predictionId: string, optionId: string) {
    const p = await this.predictions.getById(predictionId);
    if (!p) {
      throw new NotFoundException('Prediction not found');
    }
    this.liveOrThrow(p);
    const options = await this.predictions.getOptions(predictionId);
    if (!options.some((o) => o.id === optionId)) {
      throw new BadRequestException('Invalid option');
    }
    if (await this.predictions.getEntry(predictionId, userId)) {
      throw new ConflictException('You have already entered this prediction');
    }
    // Enforce the non-subscriber monthly free-entry allowance.
    const entitlement = await this.getEntitlement(userId);
    if (!entitlement.canEnter) {
      throw new ForbiddenException('Free prediction limit reached for this month — subscribe for unlimited predictions');
    }
    try {
      const entryId = await this.db.transaction(async (tx) => {
        const id = await this.predictions.createEntry(predictionId, userId, optionId, p.entryCostPoints, tx);
        if (p.entryCostPoints > 0) {
          await this.ledger.append({ userId, currency: 'points', amount: -p.entryCostPoints, direction: 'spend', sourceKind: 'earned', sourceType: 'prediction', sourceId: predictionId, idempotencyKey: `predict-enter:${id}`, note: `Prediction: ${p.question.slice(0, 60)}` }, tx);
        }
        return id;
      });
      return { entryId, optionId, pointsStaked: p.entryCostPoints };
    } catch (e) {
      const code = (e as { code?: string })?.code ?? (e as { cause?: { code?: string } })?.cause?.code;
      if (code === '23514') {
        throw new BadRequestException('Insufficient points to enter');
      }
      throw e;
    }
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────
  private page(total: number, page: number, limit: number): PaginationDetailsDto {
    return { pageNo: page, pageSize: limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async adminList(page: number, limit: number, status?: string) {
    const { items, total } = await this.predictions.list({ page, limit, ...(status ? { status } : {}) });
    return { items, pagination: this.page(total, page, limit) };
  }

  async adminGet(predictionId: string) {
    const p = await this.predictions.getById(predictionId);
    if (!p) {
      throw new NotFoundException('Prediction not found');
    }
    return { ...p, options: await this.predictions.getOptions(predictionId) };
  }

  async create(dto: CreatePredictionDto, adminId: string) {
    if (dto.options.length < 2) {
      throw new BadRequestException('A prediction needs at least 2 options');
    }
    const id = await this.predictions.create(dto, dto.options, adminId);
    return this.adminGet(id);
  }

  async update(predictionId: string, dto: Partial<CreatePredictionDto>) {
    const p = await this.predictions.getById(predictionId);
    if (!p) {
      throw new NotFoundException('Prediction not found');
    }
    if (['resolved', 'cancelled'].includes(p.status)) {
      throw new BadRequestException(`Cannot edit a ${p.status} prediction`);
    }
    await this.predictions.update(predictionId, dto);
    return this.adminGet(predictionId);
  }

  async remove(predictionId: string) {
    const p = await this.predictions.getById(predictionId);
    if (!p) {
      throw new NotFoundException('Prediction not found');
    }
    if (p.status === 'resolved') {
      throw new BadRequestException('Cannot delete a resolved prediction');
    }
    if ((await this.predictions.countEntries(predictionId)) > 0) {
      throw new BadRequestException('Cannot delete a prediction with entries — cancel it instead');
    }
    await this.predictions.delete(predictionId);
    return { deleted: true };
  }

  async lock(predictionId: string) {
    const ok = await this.predictions.setStatus(predictionId, 'locked');
    if (!ok) {
      throw new NotFoundException('Prediction not found');
    }
    return { id: predictionId, status: 'locked' };
  }

  /** Resolve — set the correct option and pay out correct entries (stake × multiplier + xp). */
  async resolve(predictionId: string, correctOptionId: string, adminId: string) {
    const p = await this.predictions.getById(predictionId);
    if (!p) {
      throw new NotFoundException('Prediction not found');
    }
    if (!['open', 'locked'].includes(p.status)) {
      throw new BadRequestException(`Cannot resolve a ${p.status} prediction`);
    }
    const options = await this.predictions.getOptions(predictionId);
    if (!options.some((o) => o.id === correctOptionId)) {
      throw new BadRequestException('correctOptionId is not an option of this prediction');
    }
    const entries = await this.predictions.listEntries(predictionId);
    await this.predictions.resolve(predictionId, correctOptionId, adminId);
    let correctCount = 0;
    for (const e of entries) {
      const correct = e.optionId === correctOptionId;
      const payout = correct ? (e.pointsStaked > 0 ? e.pointsStaked * p.payoutMultiplier : p.rewardPoints) : 0;
      await this.predictions.setEntryResult(e.id, correct, payout);
      if (correct) {
        correctCount++;
        if (payout > 0) {
          await this.ledger.append({ userId: e.userId, currency: 'points', amount: payout, direction: 'earn', sourceKind: 'earned', sourceType: 'prediction', sourceId: predictionId, idempotencyKey: `predict-payout:${e.id}:points`, note: `Prediction win: ${p.question.slice(0, 50)}` });
        }
        if (p.rewardXp > 0) {
          await this.ledger.append({ userId: e.userId, currency: 'xp', amount: p.rewardXp, direction: 'earn', sourceKind: 'earned', sourceType: 'prediction', sourceId: predictionId, idempotencyKey: `predict-payout:${e.id}:xp`, note: `Prediction win` });
        }
      }
    }
    return { id: predictionId, status: 'resolved', correctOptionId, totalEntries: entries.length, correctCount };
  }

  /** Cancel — refund every staker, set cancelled. */
  async cancel(predictionId: string) {
    const p = await this.predictions.getById(predictionId);
    if (!p) {
      throw new NotFoundException('Prediction not found');
    }
    if (['resolved', 'cancelled'].includes(p.status)) {
      throw new BadRequestException(`Cannot cancel a ${p.status} prediction`);
    }
    const entries = await this.predictions.listEntries(predictionId);
    for (const e of entries) {
      if (e.pointsStaked > 0) {
        await this.ledger.append({ userId: e.userId, currency: 'points', amount: e.pointsStaked, direction: 'refund', sourceKind: 'earned', sourceType: 'prediction', sourceId: predictionId, idempotencyKey: `predict-refund:${e.id}`, note: 'Prediction cancelled — stake refunded' });
      }
    }
    await this.predictions.setStatus(predictionId, 'cancelled');
    return { id: predictionId, status: 'cancelled', refunded: entries.length };
  }
}
