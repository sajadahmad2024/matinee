import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import { ModerationRepository, Resolution, TicketStatus } from '@db/repositories/moderation/moderation.repository';
import { UsersRepository } from '@db/repositories/users/users.repository';
import { EnforcementRepository } from '@db/repositories/auth/enforcement.repository';
import { CommentRepository } from '@db/repositories/engagement/comment.repository';
import { ContentRepository } from '@db/repositories/content/content.repository';
import { ResolveTicketDto } from './dto/moderation.dto';

const SUSPEND_DAYS = 7;

@Injectable()
export class ModerationService {
  constructor(
    private readonly tickets: ModerationRepository,
    private readonly usersRepo: UsersRepository,
    private readonly enforcement: EnforcementRepository,
    private readonly comments: CommentRepository,
    private readonly content: ContentRepository,
  ) {}

  private page(total: number, page: number, limit: number): PaginationDetailsDto {
    return { pageNo: page, pageSize: limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async list(query: { page: number; limit: number; status?: string; severity?: string; category?: string }) {
    const { items, total } = await this.tickets.list(query);
    return { items, pagination: this.page(total, query.page, query.limit) };
  }

  async detail(ticketId: string) {
    const ticket = await this.tickets.getById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return { ...ticket, reports: await this.tickets.getReports(ticketId) };
  }

  async assign(ticketId: string, adminId: string) {
    if (!(await this.tickets.assign(ticketId, adminId))) {
      throw new NotFoundException('Ticket not found');
    }
    return { id: ticketId, status: 'in_review', assignedTo: adminId };
  }

  async setStatus(ticketId: string, status: TicketStatus) {
    if (!(await this.tickets.setStatus(ticketId, status))) {
      throw new NotFoundException('Ticket not found');
    }
    return { id: ticketId, status };
  }

  stats() {
    return this.tickets.stats();
  }

  /** Resolve a ticket and apply the chosen enforcement (remove content / warn / suspend / ban). */
  async resolve(ticketId: string, dto: ResolveTicketDto, adminId: string) {
    const ticket = await this.tickets.getById(ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    if (['resolved', 'dismissed'].includes(ticket.status)) {
      throw new BadRequestException(`Ticket already ${ticket.status}`);
    }
    const resolution = dto.resolution as Resolution;
    await this.applyAction(ticket.subjectType, ticket.subjectId, ticket.offenderUserId, resolution, dto.note, adminId);
    await this.tickets.resolve(ticketId, resolution, dto.note, adminId, resolution === 'no_action');
    return { id: ticketId, resolution, status: resolution === 'no_action' ? 'dismissed' : 'resolved' };
  }

  private async applyAction(subjectType: string, subjectId: string | null, offenderUserId: string | null, resolution: Resolution, note: string | undefined, adminId: string): Promise<void> {
    switch (resolution) {
      case 'content_removed':
        if (subjectType === 'comment' && subjectId) {
          await this.comments.setStatus(subjectId, 'hidden');
        } else if (subjectType === 'content' && subjectId) {
          await this.content.softDelete(subjectId);
        }
        break;
      case 'user_suspended':
        if (offenderUserId) {
          const until = new Date(Date.now() + SUSPEND_DAYS * 86_400_000).toISOString();
          await this.usersRepo.setStatus(offenderUserId, { status: 'suspended', suspendedUntil: until, reason: note ?? null, changedBy: adminId });
          await this.enforcement.create({ userId: offenderUserId, action: 'suspend', performedBy: adminId, ...(note ? { reason: note } : {}), expiresAt: until });
        }
        break;
      case 'user_banned':
        if (offenderUserId) {
          await this.usersRepo.setStatus(offenderUserId, { status: 'banned', reason: note ?? null, changedBy: adminId });
          await this.enforcement.create({ userId: offenderUserId, action: 'ban', performedBy: adminId, ...(note ? { reason: note } : {}) });
        }
        break;
      case 'user_warned':
      case 'no_action':
      default:
        break;
    }
  }
}
