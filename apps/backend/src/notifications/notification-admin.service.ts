import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import { CampaignRecord, NotificationCampaignRepository } from '@db/repositories/notifications/notification-campaign.repository';
import { QueueService } from '@queue/queue.service';
import { JobName, QueueName } from '@queue/queue.constant';
import { CreateCampaignDto } from './dto/campaign.dto';

@Injectable()
export class NotificationAdminService {
  constructor(
    private readonly campaigns: NotificationCampaignRepository,
    private readonly queue: QueueService,
  ) {}

  private page(total: number, page: number, limit: number): PaginationDetailsDto {
    return { pageNo: page, pageSize: limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async createCampaign(dto: CreateCampaignDto, adminId: string): Promise<CampaignRecord> {
    const status = dto.scheduledAt ? 'scheduled' : 'draft';
    const filter = { ...(dto.targetFilter ?? {}), ...(dto.category ? { category: dto.category } : {}) };
    const id = await this.campaigns.create({ ...dto, targetFilter: filter }, status, adminId);
    return (await this.campaigns.getById(id))!;
  }

  async list(page: number, limit: number, status?: string) {
    const { items, total } = await this.campaigns.list({ page, limit, ...(status ? { status } : {}) });
    return { items, pagination: this.page(total, page, limit) };
  }

  async get(id: string): Promise<CampaignRecord> {
    const c = await this.campaigns.getById(id);
    if (!c) {
      throw new NotFoundException('Campaign not found');
    }
    return c;
  }

  /**
   * Enqueue the campaign fan-out. We flip the campaign to `sending` and hand off to the worker
   * (NotificationFanoutHandler), which resolves the audience and writes inboxes in one atomic,
   * retry-safe transaction. The admin UI polls campaign status for completion.
   */
  async send(campaignId: string): Promise<{ id: string; status: string }> {
    const c = await this.get(campaignId);
    if (!['draft', 'scheduled'].includes(c.status)) {
      throw new BadRequestException(`Cannot send a ${c.status} campaign`);
    }
    await this.campaigns.setStatus(campaignId, 'sending');
    await this.queue.send(QueueName.NOTIFICATIONS, JobName.NOTIFY_CAMPAIGN_FANOUT, { campaignId });
    return { id: campaignId, status: 'sending' };
  }

  async cancel(campaignId: string): Promise<{ id: string; status: string }> {
    const c = await this.get(campaignId);
    if (!['draft', 'scheduled'].includes(c.status)) {
      throw new BadRequestException(`Cannot cancel a ${c.status} campaign`);
    }
    await this.campaigns.setStatus(campaignId, 'canceled');
    return { id: campaignId, status: 'canceled' };
  }

  /** Compose + send immediately. */
  async broadcast(dto: CreateCampaignDto, adminId: string) {
    const filter = { ...(dto.targetFilter ?? {}), ...(dto.category ? { category: dto.category } : {}) };
    const id = await this.campaigns.create({ ...dto, targetFilter: filter }, 'draft', adminId);
    return this.send(id);
  }
}
