import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import { DBService } from '@db/db.service';
import { AuctionRecord, AuctionRepository } from '@db/repositories/games/auction.repository';
import { LedgerRepository } from '@db/repositories/tokenomics/ledger.repository';
import { CreateAuctionDto } from './dto/auction.dto';

@Injectable()
export class AuctionService {
  constructor(
    private readonly auctions: AuctionRepository,
    private readonly ledger: LedgerRepository,
    private readonly db: DBService,
  ) {}

  private liveOrThrow(a: AuctionRecord): void {
    const now = Date.now();
    if (a.status !== 'open' || new Date(a.startAt).getTime() > now || new Date(a.endAt).getTime() <= now) {
      throw new BadRequestException('Auction is not open');
    }
  }

  // ─── Customer ────────────────────────────────────────────────────────────────
  async listOpen(userId: string) {
    const open = await this.auctions.listOpen();
    return Promise.all(
      open.map(async (a) => {
        const highest = await this.auctions.getHighestActive(a.id);
        const mine = await this.auctions.getUserActiveBid(a.id, userId);
        return {
          id: a.id, title: a.title, prize: a.prize, endAt: a.endAt, minBidPoints: a.minBidPoints,
          highestBid: highest?.amountPoints ?? null,
          myBid: mine?.amountPoints ?? null,
        };
      }),
    );
  }

  async detail(userId: string, auctionId: string) {
    const a = await this.auctions.getById(auctionId);
    if (!a) {
      throw new NotFoundException('Auction not found');
    }
    const [highest, mine] = await Promise.all([this.auctions.getHighestActive(auctionId), this.auctions.getUserActiveBid(auctionId, userId)]);
    return {
      id: a.id, title: a.title, description: a.description, prize: a.prize, status: a.status, endAt: a.endAt,
      minBidPoints: a.minBidPoints, winnerUserId: a.winnerUserId, winningAmount: a.winningAmount,
      highestBid: highest?.amountPoints ?? null, myBid: mine?.amountPoints ?? null,
    };
  }

  /** Place / raise a bid. Holds the points (debit); raising refunds your prior hold. */
  async placeBid(userId: string, auctionId: string, amount: number) {
    const a = await this.auctions.getById(auctionId);
    if (!a) {
      throw new NotFoundException('Auction not found');
    }
    this.liveOrThrow(a);
    if (amount < a.minBidPoints) {
      throw new BadRequestException(`Bid must be at least ${a.minBidPoints} points`);
    }
    const highest = await this.auctions.getHighestActive(auctionId);
    if (highest && amount <= highest.amountPoints) {
      throw new BadRequestException(`Bid must exceed the current highest (${highest.amountPoints})`);
    }
    try {
      const bidId = await this.db.transaction(async (tx) => {
        const prev = await this.auctions.getUserActiveBid(auctionId, userId, tx);
        if (prev) {
          await this.auctions.setBidStatus(prev.id, 'refunded', tx);
          await this.ledger.append({ userId, currency: 'points', amount: prev.amountPoints, direction: 'refund', sourceKind: 'earned', sourceType: 'bid_refund', sourceId: auctionId, idempotencyKey: `bid-raise-refund:${prev.id}`, note: 'Bid raised — prior hold released' }, tx);
        }
        const id = await this.auctions.placeBid(auctionId, userId, amount, tx);
        await this.ledger.append({ userId, currency: 'points', amount: -amount, direction: 'spend', sourceKind: 'earned', sourceType: 'bid', sourceId: auctionId, idempotencyKey: `bid-hold:${id}`, note: `Bid: ${a.title.slice(0, 60)}` }, tx);
        return id;
      });
      return { bidId, amount };
    } catch (e) {
      const code = (e as { code?: string })?.code ?? (e as { cause?: { code?: string } })?.cause?.code;
      if (code === '23514') {
        throw new BadRequestException('Insufficient points to place this bid');
      }
      throw e;
    }
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────
  private page(total: number, page: number, limit: number): PaginationDetailsDto {
    return { pageNo: page, pageSize: limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async adminList(page: number, limit: number, status?: string) {
    const { items, total } = await this.auctions.list({ page, limit, ...(status ? { status } : {}) });
    return { items, pagination: this.page(total, page, limit) };
  }

  async adminGet(auctionId: string) {
    const a = await this.auctions.getById(auctionId);
    if (!a) {
      throw new NotFoundException('Auction not found');
    }
    return { ...a, activeBids: await this.auctions.listActiveBids(auctionId) };
  }

  async create(dto: CreateAuctionDto, adminId: string) {
    if (new Date(dto.endAt).getTime() <= new Date(dto.startAt).getTime()) {
      throw new BadRequestException('endAt must be after startAt');
    }
    const id = await this.auctions.create(dto, adminId);
    return this.adminGet(id);
  }

  async update(auctionId: string, dto: Partial<CreateAuctionDto>) {
    const a = await this.auctions.getById(auctionId);
    if (!a) {
      throw new NotFoundException('Auction not found');
    }
    if (['settled', 'cancelled'].includes(a.status)) {
      throw new BadRequestException(`Cannot edit a ${a.status} auction`);
    }
    await this.auctions.update(auctionId, dto);
    return this.adminGet(auctionId);
  }

  async remove(auctionId: string) {
    const a = await this.auctions.getById(auctionId);
    if (!a) {
      throw new NotFoundException('Auction not found');
    }
    if ((await this.auctions.countBids(auctionId)) > 0) {
      throw new BadRequestException('Cannot delete an auction with bids — cancel it instead');
    }
    await this.auctions.delete(auctionId);
    return { deleted: true };
  }

  async open(auctionId: string) {
    const ok = await this.auctions.setStatus(auctionId, 'open');
    if (!ok) {
      throw new NotFoundException('Auction not found');
    }
    return { id: auctionId, status: 'open' };
  }

  /** Settle — highest active bid wins (points spent), all other holds refunded. */
  async settle(auctionId: string) {
    const a = await this.auctions.getById(auctionId);
    if (!a) {
      throw new NotFoundException('Auction not found');
    }
    if (['settled', 'cancelled'].includes(a.status)) {
      throw new BadRequestException(`Auction already ${a.status}`);
    }
    const active = await this.auctions.listActiveBids(auctionId);
    if (active.length === 0) {
      await this.auctions.settle(auctionId, null, null);
      return { id: auctionId, status: 'settled', winnerUserId: null, winningAmount: null, refundedCount: 0 };
    }
    const winner = active.reduce((max, b) => (b.amountPoints > max.amountPoints ? b : max), active[0]!);
    let refundedCount = 0;
    await this.db.transaction(async (tx) => {
      await this.auctions.setBidStatus(winner.id, 'won', tx);
      for (const b of active) {
        if (b.id === winner.id) {
          continue;
        }
        await this.auctions.setBidStatus(b.id, 'refunded', tx);
        await this.ledger.append({ userId: b.userId, currency: 'points', amount: b.amountPoints, direction: 'refund', sourceKind: 'earned', sourceType: 'bid_refund', sourceId: auctionId, idempotencyKey: `bid-settle-refund:${b.id}`, note: 'Auction lost — bid refunded' }, tx);
        refundedCount++;
      }
      await this.auctions.settle(auctionId, winner.userId, winner.amountPoints, tx);
    });
    return { id: auctionId, status: 'settled', winnerUserId: winner.userId, winningAmount: winner.amountPoints, refundedCount };
  }

  /** Cancel — refund every active hold. */
  async cancel(auctionId: string) {
    const a = await this.auctions.getById(auctionId);
    if (!a) {
      throw new NotFoundException('Auction not found');
    }
    if (['settled', 'cancelled'].includes(a.status)) {
      throw new BadRequestException(`Auction already ${a.status}`);
    }
    const active = await this.auctions.listActiveBids(auctionId);
    await this.db.transaction(async (tx) => {
      for (const b of active) {
        await this.auctions.setBidStatus(b.id, 'refunded', tx);
        await this.ledger.append({ userId: b.userId, currency: 'points', amount: b.amountPoints, direction: 'refund', sourceKind: 'earned', sourceType: 'bid_refund', sourceId: auctionId, idempotencyKey: `bid-cancel-refund:${b.id}`, note: 'Auction cancelled — bid refunded' }, tx);
      }
      await this.auctions.setStatus(auctionId, 'cancelled', tx);
    });
    return { id: auctionId, status: 'cancelled', refunded: active.length };
  }
}
