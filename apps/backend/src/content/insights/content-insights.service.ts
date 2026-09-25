import { Injectable } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { ContentInsightsRepository, ContentStats, LicenseSummary } from '@db/repositories/content/content-insights.repository';
import { MediaService } from '../../media/media.service';
import { LicenseListQueryDto } from './dto/content-insights.dto';

const STATS_TTL = 30; // seconds — tab badges refresh often; content writes bust the tag anyway

/** Aggregates behind the admin content list page (tabs, cards, inventory, licensing workspace). */
@Injectable()
export class ContentInsightsService {
  constructor(
    private readonly insights: ContentInsightsRepository,
    private readonly media: MediaService,
    private readonly cache: CacheService,
  ) {}

  stats(region: string | undefined): Promise<ContentStats> {
    return this.cache.getOrSetTagged(`content:stats:${region ?? 'all'}`, ['content'], STATS_TTL, () => this.insights.stats(region));
  }

  async licenses(q: LicenseListQueryDto) {
    const { items, total } = await this.insights.listLicenses({
      q: q.q,
      expiresWithinDays: q.expiresWithinDays,
      renewalStatus: q.renewalStatus,
      licenseType: q.licenseType,
      sort: q.sort,
      page: q.page,
      limit: q.limit,
    });
    const urls = await this.media.publicUrls(items.map((i) => i.thumbnailMediaId).filter((v): v is string => v !== null));
    return {
      items: items.map(({ thumbnailMediaId, ...row }) => ({
        ...row,
        thumbnailUrl: thumbnailMediaId ? (urls.get(thumbnailMediaId) ?? null) : null,
      })),
      pagination: { pageNo: q.page, pageSize: q.limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / q.limit)) },
    };
  }

  licenseSummary(): Promise<LicenseSummary> {
    return this.cache.getOrSetTagged('content:licenses:summary', ['content'], STATS_TTL, () => this.insights.licenseSummary());
  }
}
