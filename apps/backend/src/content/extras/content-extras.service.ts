import { AdSalesRepository } from '@db/repositories/ads/ad-sales.repository';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { ContentExtrasRepository } from '@db/repositories/content/content-extras.repository';
import { ContentRepository, PublishRegion } from '@db/repositories/content/content.repository';
import { MediaRepository } from '@db/repositories/media/media.repository';
import { MediaType } from '@media/constants/media.constant';
import { LicenseDto, SponsorshipDto, SetRegionsDto } from './dto/content-extras.dto';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Licensing, sponsorship, publish-regions and workflow history for a content item (admin). */
@Injectable()
export class ContentExtrasService {
  constructor(
    private readonly extras: ContentExtrasRepository,
    private readonly content: ContentRepository,
    private readonly cache: CacheService,
    private readonly media?: MediaRepository,
    private readonly adSales?: AdSalesRepository,
  ) {}

  /** Link the deal to an Ad Sales advertiser (+ optional sponsorship campaign). */
  private async resolveAdvertiser(adminId: string, dto: SponsorshipDto): Promise<{ advertiserId?: string; campaignId?: string }> {
    if (!this.adSales) return {};
    const advertiser = dto.advertiserId
      ? await this.adSales.getAdvertiser(dto.advertiserId)
      : await this.adSales.findOrCreateAdvertiser(dto.sponsorName, adminId);
    if (!advertiser) throw new BadRequestException('advertiserId not found');
    if (!dto.campaignId) return { advertiserId: advertiser.id };
    const campaign = await this.adSales.getCampaign(dto.campaignId);
    if (!campaign) throw new BadRequestException('campaignId not found');
    if (campaign.type !== 'sponsorship') throw new BadRequestException('campaignId must be a sponsorship campaign');
    if (campaign.advertiserId !== advertiser.id) throw new BadRequestException('Campaign belongs to another advertiser');
    if (campaign.status === 'ended') throw new BadRequestException('Campaign has ended');
    return { advertiserId: advertiser.id, campaignId: campaign.id };
  }

  /** Ad-config consistency + referenced media kinds (banner = image, creative = video). */
  private async assertAdConfig(dto: SponsorshipDto): Promise<void> {
    if (
      dto.skippableAfterSeconds !== undefined &&
      dto.adDurationSeconds !== undefined &&
      dto.skippableAfterSeconds > dto.adDurationSeconds
    ) {
      throw new BadRequestException('skippableAfterSeconds must be ≤ adDurationSeconds');
    }
    if (dto.placement === 'mid-roll' && dto.midRollAtSeconds === undefined) {
      throw new BadRequestException('midRollAtSeconds is required for a mid-roll placement');
    }
    const checks: Array<[string | undefined, MediaType, string]> = [
      [dto.bannerMediaId, MediaType.IMAGE, 'bannerMediaId must be an image'],
      [dto.creativeMediaId, MediaType.VIDEO, 'creativeMediaId must be a video'],
    ];
    for (const [id, type, message] of checks) {
      if (!id || !this.media) continue;
      const record = await this.media.findById(id);
      if (!record) throw new BadRequestException(`${message} (media not found)`);
      if (record.mediaType !== type) throw new BadRequestException(message);
    }
  }

  private async assertExists(contentId: string): Promise<void> {
    const c = await this.content.findById(contentId);
    if (!c) throw new NotFoundException('Content not found');
  }

  private regionsView(items: PublishRegion[]) {
    return { regions: items.map((r) => r.region), liveRegions: items.filter((r) => r.live).map((r) => r.region), items };
  }

  // Licensing
  async getLicense(contentId: string) {
    await this.assertExists(contentId);
    return this.extras.getLicense(contentId);
  }
  async setLicense(adminId: string, contentId: string, dto: LicenseDto) {
    await this.assertExists(contentId);
    if (dto.startsAt && dto.expiresAt && new Date(dto.expiresAt) <= new Date(dto.startsAt)) {
      throw new BadRequestException('expiresAt must be after startsAt');
    }
    const license = await this.extras.upsertLicense(contentId, dto, adminId);
    await this.extras.recordChange(contentId, 'updated', adminId, `License: ${dto.licensorName}`);
    await this.cache.invalidateTag('content');
    return license;
  }
  /** Mark content `original` again (deactivate the licence). */
  async removeLicense(adminId: string, contentId: string) {
    await this.assertExists(contentId);
    const had = await this.extras.removeLicense(contentId);
    await this.extras.recordChange(contentId, 'updated', adminId, had ? 'License removed — marked original' : 'Marked original');
    await this.cache.invalidateTag('content');
    return { message: 'License removed' };
  }

  // Sponsorship
  async getSponsorship(contentId: string) {
    await this.assertExists(contentId);
    return this.extras.getSponsorship(contentId);
  }
  async setSponsorship(adminId: string, contentId: string, dto: SponsorshipDto) {
    await this.assertExists(contentId);
    if (dto.adFormat === 'commercial') {
      throw new BadRequestException('Feed commercials are Ad Sales campaigns — create one with POST /v1/admin/ads/campaigns');
    }
    await this.assertAdConfig(dto);
    const links = await this.resolveAdvertiser(adminId, dto);
    const { overlayDays, advertiserId: _a, campaignId: _c, ...input } = dto;
    let { startsAt, endsAt } = input;
    if (!endsAt && overlayDays) {
      const start = startsAt ? new Date(startsAt) : new Date();
      startsAt = start.toISOString();
      endsAt = new Date(start.getTime() + overlayDays * DAY_MS).toISOString();
    }
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
      throw new BadRequestException('endsAt must be after startsAt');
    }
    const sponsorship = await this.extras.upsertSponsorship(contentId, { ...input, ...links, startsAt, endsAt }, adminId);
    await this.extras.recordChange(contentId, 'updated', adminId, `Sponsor: ${dto.sponsorName} (${dto.adFormat ?? 'sponsored'})`);
    await this.cache.invalidateTag('content');
    return sponsorship;
  }
  /** Back to organic. */
  async removeSponsorship(adminId: string, contentId: string) {
    await this.assertExists(contentId);
    const had = await this.extras.removeSponsorship(contentId);
    await this.extras.recordChange(contentId, 'updated', adminId, had ? 'Sponsorship removed — organic' : 'Marked organic');
    await this.cache.invalidateTag('content');
    return { message: 'Sponsorship removed' };
  }

  // Publish regions
  async getRegions(contentId: string) {
    await this.assertExists(contentId);
    return this.regionsView(await this.extras.getRegions(contentId));
  }
  async setRegions(adminId: string, contentId: string, dto: SetRegionsDto) {
    await this.assertExists(contentId);
    const off = dto.offRegions ?? [];
    const stray = off.filter((r) => !dto.regions.includes(r));
    if (stray.length > 0) {
      throw new BadRequestException(`offRegions must be a subset of regions (not selected: ${stray.join(', ')})`);
    }
    const items = await this.extras.setRegions(contentId, dto.regions, off);
    const view = this.regionsView(items);
    await this.extras.recordChange(
      contentId,
      'updated',
      adminId,
      `Publish regions: ${view.regions.join(', ') || 'none'}${off.length ? ` (off: ${off.join(', ')})` : ''}`,
    );
    await this.cache.invalidateTag('content'); // availability changed → refresh feed
    return view;
  }

  // Workflow history
  async getHistory(contentId: string) {
    await this.assertExists(contentId);
    return this.extras.listHistory(contentId);
  }
}
