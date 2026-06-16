import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import { Participation, QuestRecord, QuestRepository } from '@db/repositories/games/quest.repository';
import { LedgerRepository } from '@db/repositories/tokenomics/ledger.repository';
import { CreateQuestDto, UpdateQuestDto } from './dto/quest.dto';

@Injectable()
export class QuestService {
  constructor(
    private readonly quests: QuestRepository,
    private readonly ledger: LedgerRepository,
  ) {}

  private required(q: QuestRecord): number {
    return q.requireAll ? q.contentCount : 1;
  }

  private liveOrThrow(q: QuestRecord): void {
    const now = Date.now();
    if (q.status !== 'active' || new Date(q.startAt).getTime() > now || new Date(q.endAt).getTime() <= now) {
      throw new BadRequestException('Quest is not active');
    }
  }

  // ─── Customer ────────────────────────────────────────────────────────────────
  async listActive(userId: string) {
    const rows = await this.quests.listActiveForUser(userId);
    return rows.map((q) => ({
      id: q.id, name: q.name, description: q.description, rewardPoints: q.rewardPoints, rewardXp: q.rewardXp,
      endAt: q.endAt, contentCount: q.contentCount, required: this.required(q),
      completedCount: q.participation?.completedCount ?? 0,
      isCompleted: q.participation?.isCompleted ?? false,
      claimed: q.participation?.rewardedAt != null,
    }));
  }

  async detail(userId: string, questId: string) {
    const q = await this.quests.getById(questId);
    if (!q) {
      throw new NotFoundException('Quest not found');
    }
    const [contentIds, completed, participation] = await Promise.all([
      this.quests.getContentIds(questId),
      this.quests.getCompletedContentIds(questId, userId),
      this.quests.getParticipation(questId, userId),
    ]);
    const done = new Set(completed);
    return {
      id: q.id, name: q.name, description: q.description, rewardPoints: q.rewardPoints, rewardXp: q.rewardXp,
      startAt: q.startAt, endAt: q.endAt, status: q.status, required: this.required(q),
      contents: contentIds.map((contentId) => ({ contentId, completed: done.has(contentId) })),
      completedCount: participation?.completedCount ?? 0,
      isCompleted: participation?.isCompleted ?? false,
      claimed: participation?.rewardedAt != null,
    };
  }

  async completeContent(userId: string, questId: string, contentId: string): Promise<Participation> {
    const q = await this.quests.getById(questId);
    if (!q) {
      throw new NotFoundException('Quest not found');
    }
    this.liveOrThrow(q);
    const contentIds = await this.quests.getContentIds(questId);
    if (!contentIds.includes(contentId)) {
      throw new BadRequestException('Content is not part of this quest');
    }
    return this.quests.recordContentComplete(q, userId, contentId);
  }

  /** Claim the quest reward once completed (idempotent). */
  async claim(userId: string, questId: string): Promise<{ rewardedPoints: number; rewardedXp: number; alreadyClaimed: boolean }> {
    const q = await this.quests.getById(questId);
    if (!q) {
      throw new NotFoundException('Quest not found');
    }
    const participation = await this.quests.getParticipation(questId, userId);
    if (!participation || !participation.isCompleted) {
      throw new BadRequestException('Quest is not completed yet');
    }
    if (participation.rewardedAt) {
      return { rewardedPoints: 0, rewardedXp: 0, alreadyClaimed: true };
    }
    const base = `quest:${questId}:${userId}`;
    if (q.rewardPoints > 0) {
      await this.ledger.append({ userId, currency: 'points', amount: q.rewardPoints, direction: 'earn', sourceKind: 'earned', sourceType: 'quest', sourceId: questId, idempotencyKey: `${base}:points`, note: `Quest: ${q.name}` });
    }
    if (q.rewardXp > 0) {
      await this.ledger.append({ userId, currency: 'xp', amount: q.rewardXp, direction: 'earn', sourceKind: 'earned', sourceType: 'quest', sourceId: questId, idempotencyKey: `${base}:xp`, note: `Quest: ${q.name}` });
    }
    await this.quests.markRewarded(questId, userId);
    return { rewardedPoints: q.rewardPoints, rewardedXp: q.rewardXp, alreadyClaimed: false };
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────
  private page(total: number, page: number, limit: number): PaginationDetailsDto {
    return { pageNo: page, pageSize: limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async adminList(page: number, limit: number, status?: string) {
    const { items, total } = await this.quests.list({ page, limit, ...(status ? { status } : {}) });
    return { items, pagination: this.page(total, page, limit) };
  }

  async adminGet(questId: string) {
    const q = await this.quests.getById(questId);
    if (!q) {
      throw new NotFoundException('Quest not found');
    }
    return { ...q, contentIds: await this.quests.getContentIds(questId) };
  }

  async create(dto: CreateQuestDto, adminId: string) {
    if (new Date(dto.endAt).getTime() <= new Date(dto.startAt).getTime()) {
      throw new BadRequestException('endAt must be after startAt');
    }
    const id = await this.quests.create(dto, dto.contentIds ?? [], adminId);
    return this.adminGet(id);
  }

  async update(questId: string, dto: UpdateQuestDto) {
    const ok = await this.quests.update(questId, dto);
    if (!ok) {
      throw new NotFoundException('Quest not found');
    }
    return this.adminGet(questId);
  }

  async setStatus(questId: string, status: 'active' | 'ended' | 'cancelled') {
    const ok = await this.quests.setStatus(questId, status);
    if (!ok) {
      throw new NotFoundException('Quest not found');
    }
    return { id: questId, status };
  }

  async remove(questId: string) {
    const q = await this.quests.getById(questId);
    if (!q) {
      throw new NotFoundException('Quest not found');
    }
    if (!(await this.quests.delete(questId))) {
      throw new BadRequestException('Cannot delete an active quest — end or cancel it first');
    }
    return { deleted: true };
  }
}
