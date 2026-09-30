import { Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { DashboardAnalyticsRepository } from '@db/repositories/analytics/dashboard-analytics.repository';
import {
  MarketingRepository,
  MarketingSpendRow,
  SocialMentionPatch,
  SocialMentionRow,
} from '@db/repositories/analytics/marketing.repository';
import { AnalyticsService } from '../analytics.service';
import { shapeExternal, weeksIn } from '../dashboard/dashboard-shapes';
import { resolveRegionScope } from '../dashboard/regions';
import {
  IngestSocialMentionsDto,
  MarketingSpendQueryDto,
  SocialMentionsQueryDto,
  SocialSummaryDto,
  SocialSummaryQueryDto,
  UpdateSocialMentionDto,
  UpsertMarketingSpendDto,
} from '../dto/marketing.dto';

/** `YYYY-MM` / `YYYY-MM-01` → `YYYY-MM-01`. */
export const monthStart = (m: string): string => `${m.slice(0, 7)}-01`;

/**
 * Admin inputs for the marketing blocks of the dashboard: channel spend (CAC / LTV:CAC) and
 * external social mentions (Community — External). Writes bump nothing cached explicitly —
 * dashboard caches are 60 s.
 */
@Injectable()
export class MarketingService {
  constructor(
    private readonly marketing: MarketingRepository,
    private readonly dashboard: DashboardAnalyticsRepository,
    private readonly analytics: AnalyticsService,
    private readonly cache: CacheService,
  ) {}

  listSpend(q: MarketingSpendQueryDto): Promise<MarketingSpendRow[]> {
    return this.marketing.listSpend(q.fromMonth ? monthStart(q.fromMonth) : null, q.toMonth ? monthStart(q.toMonth) : null);
  }

  upsertSpend(dto: UpsertMarketingSpendDto): Promise<MarketingSpendRow> {
    return this.marketing.upsertSpend({
      channel: dto.channel,
      periodMonth: monthStart(dto.periodMonth),
      spendCents: dto.spendCents,
      currency: dto.currency ?? 'USD',
      newUsers: dto.newUsers ?? 0,
    });
  }

  async deleteSpend(id: string): Promise<{ deleted: boolean }> {
    if (!(await this.marketing.deleteSpend(id))) {
      throw new NotFoundException('Marketing spend row not found');
    }
    return { deleted: true };
  }

  async listMentions(q: SocialMentionsQueryDto): Promise<{ items: SocialMentionRow[]; total: number; page: number; limit: number }> {
    const res = await this.marketing.listMentions({
      page: q.page,
      limit: q.limit,
      ...(q.platform ? { platform: q.platform } : {}),
      ...(q.sentiment ? { sentiment: q.sentiment } : {}),
      ...(q.from ? { from: q.from } : {}),
      ...(q.to ? { to: q.to } : {}),
    });
    return { ...res, page: q.page, limit: q.limit };
  }

  async ingestMentions(dto: IngestSocialMentionsDto): Promise<{ ingested: number }> {
    // De-duplicate within the batch on (platform, externalId) — Postgres rejects a single
    // INSERT … ON CONFLICT that touches the same key twice.
    const seen = new Set<string>();
    const items = [...dto.mentions].reverse().filter((m) => {
      if (!m.externalId) {
        return true;
      }
      const k = `${m.platform}:${m.externalId}`;
      if (seen.has(k)) {
        return false;
      }
      seen.add(k);
      return true;
    }).reverse();
    const ingested = await this.marketing.ingestMentions(
      items.map((m) => ({
        platform: m.platform,
        externalId: m.externalId ?? null,
        authorHandle: m.authorHandle ?? null,
        url: m.url ?? null,
        content: m.content ?? null,
        sentiment: m.sentiment ?? null,
        impressions: m.impressions ?? 0,
        engagement: m.engagement ?? 0,
        emvCents: m.emvCents ?? 0,
        isViralMoment: m.isViralMoment ?? false,
        countryCode: m.countryCode ?? null,
        mentionedAt: m.mentionedAt ?? null,
      })),
    );
    return { ingested };
  }

  async updateMention(id: string, dto: UpdateSocialMentionDto): Promise<SocialMentionRow> {
    const patch: SocialMentionPatch = {};
    if (dto.authorHandle !== undefined) patch.authorHandle = dto.authorHandle;
    if (dto.url !== undefined) patch.url = dto.url;
    if (dto.content !== undefined) patch.content = dto.content;
    if (dto.sentiment !== undefined) patch.sentiment = dto.sentiment;
    if (dto.impressions !== undefined) patch.impressions = dto.impressions;
    if (dto.engagement !== undefined) patch.engagement = dto.engagement;
    if (dto.emvCents !== undefined) patch.emvCents = dto.emvCents;
    if (dto.isViralMoment !== undefined) patch.isViralMoment = dto.isViralMoment;
    if (dto.countryCode !== undefined) patch.countryCode = dto.countryCode;
    if (dto.mentionedAt !== undefined) patch.mentionedAt = dto.mentionedAt;
    const row = await this.marketing.updateMention(id, patch);
    if (!row) {
      throw new NotFoundException('Social mention not found');
    }
    return row;
  }

  async deleteMention(id: string): Promise<{ deleted: boolean }> {
    if (!(await this.marketing.deleteMention(id))) {
      throw new NotFoundException('Social mention not found');
    }
    return { deleted: true };
  }

  /** Community — External block + per-platform split (cached 60 s). */
  socialSummary(q: SocialSummaryQueryDto): Promise<SocialSummaryDto> {
    const { from, to } = this.analytics.resolveWindow(q);
    const scope = resolveRegionScope(q.region);
    return this.cache.getOrSet(`analytics:social:${scope.code}:${from}:${to}`, 60, async () => {
      const { totals, byPlatform } = await this.dashboard.socialSummary({ from, to, countries: scope.countries });
      return {
        from,
        to,
        region: scope.code,
        ...shapeExternal(totals, weeksIn(from, to)),
        byPlatform: byPlatform.map((r) => ({
          platform: String(r['platform']),
          mentions: Number(r['mentions'] ?? 0),
          impressions: Number(r['impressions'] ?? 0),
          positive: Number(r['positive'] ?? 0),
          negative: Number(r['negative'] ?? 0),
        })),
      };
    });
  }
}
