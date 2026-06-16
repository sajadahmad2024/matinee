import { Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { ContentExtrasRepository } from '@db/repositories/content/content-extras.repository';
import { ContentRepository } from '@db/repositories/content/content.repository';
import { LicenseDto, SponsorshipDto, SetRegionsDto } from './dto/content-extras.dto';

/** Licensing, sponsorship, publish-regions and workflow history for a content item (admin). */
@Injectable()
export class ContentExtrasService {
  constructor(
    private readonly extras: ContentExtrasRepository,
    private readonly content: ContentRepository,
    private readonly cache: CacheService,
  ) {}

  private async assertExists(contentId: string): Promise<void> {
    const c = await this.content.findById(contentId);
    if (!c) throw new NotFoundException('Content not found');
  }

  // Licensing
  async getLicense(contentId: string) {
    await this.assertExists(contentId);
    return this.extras.getLicense(contentId);
  }
  async setLicense(adminId: string, contentId: string, dto: LicenseDto) {
    await this.assertExists(contentId);
    const license = await this.extras.upsertLicense(contentId, dto, adminId);
    await this.extras.recordChange(contentId, 'updated', adminId, `License: ${dto.licensorName}`);
    await this.cache.invalidateTag('content');
    return license;
  }

  // Sponsorship
  async getSponsorship(contentId: string) {
    await this.assertExists(contentId);
    return this.extras.getSponsorship(contentId);
  }
  async setSponsorship(adminId: string, contentId: string, dto: SponsorshipDto) {
    await this.assertExists(contentId);
    const sponsorship = await this.extras.upsertSponsorship(contentId, dto, adminId);
    await this.extras.recordChange(contentId, 'updated', adminId, `Sponsor: ${dto.sponsorName} (${dto.adFormat ?? 'sponsored'})`);
    await this.cache.invalidateTag('content');
    return sponsorship;
  }

  // Publish regions
  async getRegions(contentId: string) {
    await this.assertExists(contentId);
    return { regions: await this.extras.getRegions(contentId) };
  }
  async setRegions(adminId: string, contentId: string, dto: SetRegionsDto) {
    await this.assertExists(contentId);
    const regions = await this.extras.setRegions(contentId, dto.regions);
    await this.extras.recordChange(contentId, 'updated', adminId, `Publish regions: ${regions.join(', ') || 'none'}`);
    await this.cache.invalidateTag('content'); // availability changed → refresh feed
    return { regions };
  }

  // Workflow history
  async getHistory(contentId: string) {
    await this.assertExists(contentId);
    return this.extras.listHistory(contentId);
  }
}
