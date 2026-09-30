import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import { AdEventRepository } from '@db/repositories/ads/ad-event.repository';
import { AdSalesRepository } from '@db/repositories/ads/ad-sales.repository';
import { ContentExtrasRepository, SponsorshipRow } from '@db/repositories/content/content-extras.repository';
import {
  CastInput,
  ContentListFilters,
  ContentRecord,
  ContentRelationsInput,
  ContentRepository,
  FeedFilters,
  UpdateContentInput,
} from '@db/repositories/content/content.repository';
import { TaxonomyRepository } from '@db/repositories/content/taxonomy.repository';
import { AppSettingsRepository } from '@db/repositories/platform/app-settings.repository';
import { MediaService } from '../../media/media.service';
import { AD_COMMERCIALS_FLAG, adMetrics, commercialFrequency, FeedAd, interleaveCommercials, isFlagOn, toFeedAd, toCommercialFeedItem, weightedRotation } from '../../ads/ad.mapper';
import { BoostNotifierService } from './boost-notifier.service';
import { ContentListQueryDto } from './dto/content-query.dto';
import { ContentResponseDto } from './dto/content-response.dto';
import { BoostContentDto, CreateContentDto, UpdateContentDto } from './dto/content-write.dto';
import { toEnrichedAdminContent, toEnrichedPublicContent } from './mappers/content.mapper';

export interface PaginatedContent {
  items: ContentResponseDto[];
  pagination: PaginationDetailsDto;
}

/** One cache tag for all content reads — bumped on any mutation → invalidates feed + detail. */
const CONTENT_TAG = 'content';
const FEED_TTL = 30; // seconds — hot path, tolerates slight staleness
const DETAIL_TTL = 120;

type RelationFields = Pick<
  CreateContentDto,
  'genreIds' | 'primaryGenreId' | 'tagIds' | 'cast' | 'studioName' | 'tagNames' | 'durationSeconds' | 'studioId'
>;
const MAX_TAGS = 30;

/** Trim, drop empties, de-duplicate case-insensitively (first spelling wins). */
export function normalizeNames(names: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of names) {
    const name = raw.trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

@Injectable()
export class ContentService {
  constructor(
    private readonly repo: ContentRepository,
    private readonly history: ContentExtrasRepository,
    private readonly media: MediaService,
    private readonly cache: CacheService,
    private readonly taxonomy: TaxonomyRepository,
    private readonly settings: AppSettingsRepository,
    private readonly boostNotifier: BoostNotifierService,
    private readonly adEvents: AdEventRepository,
    private readonly adSales: AdSalesRepository,
  ) {}

  private slugify(title: string): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 300);
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${base || 'content'}-${suffix}`;
  }

  private paginate(total: number, filters: { page: number; limit: number }): PaginationDetailsDto {
    return {
      pageNo: filters.page,
      pageSize: filters.limit,
      totalCount: total,
      totalPages: Math.max(1, Math.ceil(total / filters.limit)),
    };
  }

  /** Invalidate every content read (feed + detail) after a write. */
  private bust(): Promise<void> {
    return this.cache.invalidateTag(CONTENT_TAG);
  }

  private async requireContent(id: string): Promise<ContentRecord> {
    const c = await this.repo.findById(id);
    if (!c) throw new NotFoundException('Content not found');
    return c;
  }

  // ─── Customer (cached) ───────────────────────────────────────────────────────

  /** `feature.ad_commercials_enabled` (read inside the cached feed computation). */
  private async commercialsEnabled(): Promise<boolean> {
    return isFlagOn(await this.settings.getValue(AD_COMMERCIALS_FLAG));
  }

  /**
   * Organic feed page (commercials excluded from ranking) with commercials inserted every N
   * organic items when the ad-commercials flag is on. Pagination counts organic items only.
   */
  feed(filters: FeedFilters): Promise<PaginatedContent> {
    const key = `content:feed:${filters.region ?? 'all'}:${filters.page}:${filters.limit}`;
    return this.cache.getOrSetTagged(key, [CONTENT_TAG], FEED_TTL, async () => {
      const [{ items, total }, adsOn] = await Promise.all([this.repo.feed(filters), this.commercialsEnabled()]);
      // Commercial slots come from live Ad Sales commercial campaigns (weight-rotated).
      const spots = adsOn ? await this.adSales.liveCommercials(filters.region) : [];
      const [organic, logos] = await Promise.all([
        this.enrichPublic(items),
        this.media.findRecords(spots.map((s) => s.advertiserLogoMediaId).filter((v): v is string => typeof v === 'string')),
      ]);
      const logoUrl = (id: string | null) => {
        const m = id ? logos.get(id) : undefined;
        return m ? this.media.urlOf(m) : null;
      };
      const commercials = weightedRotation(spots).map((s) => toCommercialFeedItem(s, logoUrl(s.advertiserLogoMediaId)));
      const frequency = commercialFrequency(spots.map((s) => s.campaign.feedFrequency));
      return {
        items: interleaveCommercials(organic, commercials, (filters.page - 1) * filters.limit, frequency),
        pagination: this.paginate(total, filters),
      };
    });
  }

  getPublic(id: string): Promise<ContentResponseDto> {
    return this.cache.getOrSetTagged(`content:detail:${id}`, [CONTENT_TAG], DETAIL_TTL, async () => {
      const c = await this.repo.findById(id);
      if (!c || c.status !== 'published') throw new NotFoundException('Content not found');
      const [[enriched], cast] = await Promise.all([this.enrichPublic([c]), this.repo.getCast(id)]);
      return { ...enriched!, cast };
    });
  }

  /**
   * Mobile-card enrichment for many rows with a fixed number of batched queries: studios,
   * genres, tags, live sponsorships, then one media lookup (thumbnails + videos + sponsor banners).
   * `commercials` maps content id → its commercial sponsorship (feed-inserted spots).
   */
  async enrichPublic(records: ContentRecord[], commercials: Map<string, SponsorshipRow> = new Map()): Promise<ContentResponseDto[]> {
    if (records.length === 0) return [];
    const ids = records.map((r) => r.id);
    const [studioNames, genres, tags, sponsorships] = await Promise.all([
      this.repo.studioNames(records.map((r) => r.studioId).filter((v): v is string => v !== null)),
      this.repo.getGenresFor(ids),
      this.repo.getTagsFor(ids),
      this.history.liveSponsorshipsFor(ids),
    ]);
    const mediaIds = [
      ...records.flatMap((r) => [r.thumbnailMediaId, r.videoMediaId]),
      ...[...sponsorships.values(), ...commercials.values()].map((s) => s.bannerMediaId),
    ].filter((v): v is string => typeof v === 'string');
    const media = await this.media.findRecords(mediaIds);
    const urlOf = (id: string | null): string | null => {
      const m = id ? media.get(id) : undefined;
      return m ? this.media.urlOf(m) : null;
    };
    return records.map((c) => {
      const video = c.videoMediaId ? media.get(c.videoMediaId) : undefined;
      const commercial = commercials.get(c.id);
      const sponsorship = sponsorships.get(c.id);
      const ad: FeedAd | undefined = commercial ? toFeedAd(commercial, urlOf(commercial.bannerMediaId)) : undefined;
      return toEnrichedPublicContent(c, {
        studioName: c.studioId ? (studioNames.get(c.studioId) ?? null) : null,
        genres: genres.get(c.id) ?? [],
        tags: tags.get(c.id) ?? [],
        thumbnailUrl: urlOf(c.thumbnailMediaId),
        videoWidth: video?.width ?? null,
        videoHeight: video?.height ?? null,
        sponsorName: sponsorship?.sponsorName ?? null,
        commercial: ad,
      });
    });
  }

  // ─── Admin (fresh; mutations bust the cache) ──────────────────────────────────

  /** Attach cross-table admin signals to many rows with a fixed number of batched queries. */
  async enrich(records: ContentRecord[]): Promise<ContentResponseDto[]> {
    if (records.length === 0) return [];
    const ids = records.map((r) => r.id);
    const thumbIds = records.map((r) => r.thumbnailMediaId).filter((v): v is string => v !== null);
    const [signals, genres, tags, regions, thumbs] = await Promise.all([
      this.repo.adminSignals(ids),
      this.repo.getGenresFor(ids),
      this.repo.getTagsFor(ids),
      this.repo.getRegionsFor(ids),
      this.media.publicUrls(thumbIds),
    ]);
    return records.map((c) =>
      toEnrichedAdminContent(c, {
        signals: signals.get(c.id),
        genres: genres.get(c.id) ?? [],
        tags: tags.get(c.id) ?? [],
        regions: regions.get(c.id) ?? [],
        thumbnailUrl: c.thumbnailMediaId ? (thumbs.get(c.thumbnailMediaId) ?? null) : null,
      }),
    );
  }

  private async enrichOne(c: ContentRecord): Promise<ContentResponseDto> {
    const [enriched] = await this.enrich([c]);
    return enriched!;
  }

  toFilters(q: ContentListQueryDto): ContentListFilters {
    return {
      statuses: q.status,
      contentType: q.contentType,
      studioId: q.studioId,
      parentContentId: q.parentContentId,
      hasParent: q.hasParent,
      q: q.q,
      region: q.region,
      isBoosted: q.isBoosted,
      isSponsored: q.isSponsored,
      licenseStatuses: q.licenseStatus,
      createdFrom: q.createdFrom,
      createdTo: q.createdTo,
      scheduledFrom: q.scheduledFrom,
      scheduledTo: q.scheduledTo,
      licenseExpiresFrom: q.licenseExpiresFrom,
      licenseExpiresTo: q.licenseExpiresTo,
      sort: q.sort,
      page: q.page,
      limit: q.limit,
    };
  }

  async adminList(query: ContentListQueryDto): Promise<PaginatedContent> {
    const filters = this.toFilters(query);
    const { items, total } = await this.repo.list(filters);
    return { items: await this.enrich(items), pagination: this.paginate(total, filters) };
  }

  async getAdmin(id: string): Promise<ContentResponseDto> {
    const c = await this.requireContent(id);
    const [enriched, cast] = await Promise.all([this.enrichOne(c), this.repo.getCast(id)]);
    return { ...enriched, cast };
  }

  /** Replace the cast list on a content (admin editor). Busts the detail cache. */
  async setCast(adminId: string, id: string, members: CastInput[]): Promise<ContentResponseDto> {
    await this.requireContent(id);
    await this.assertRelations({ cast: members });
    await this.repo.setCast(id, members);
    await this.history.recordChange(id, 'updated', adminId, `Cast updated (${members.length})`);
    await this.bust();
    return this.getAdmin(id);
  }

  /** Validate referenced ids up front (a bad FK would otherwise surface as a 500). */
  private async assertRelations(rel: ContentRelationsInput & { studioId?: string | undefined }): Promise<void> {
    if (rel.primaryGenreId && !rel.genreIds) {
      throw new BadRequestException('primaryGenreId requires genreIds');
    }
    if (rel.primaryGenreId && rel.genreIds && !rel.genreIds.includes(rel.primaryGenreId)) {
      throw new BadRequestException('primaryGenreId must be one of genreIds');
    }
    const checks: Array<['genre' | 'tag' | 'studio' | 'person', string[]]> = [
      ['genre', rel.genreIds ?? []],
      ['tag', rel.tagIds ?? []],
      ['studio', rel.studioId ? [rel.studioId] : []],
      ['person', [...new Set((rel.cast ?? []).map((m) => m.personId))]],
    ];
    for (const [kind, ids] of checks) {
      if (ids.length === 0) continue;
      const found = await this.repo.existingIds(kind, ids);
      const missing = ids.filter((i) => !found.has(i));
      if (missing.length > 0) {
        throw new BadRequestException(`Unknown ${kind} id(s): ${missing.join(', ')}`);
      }
    }
  }

  private assertFuture(value: string | null | undefined, field: string): void {
    if (value && new Date(value).getTime() <= Date.now()) {
      throw new BadRequestException(`${field} must be in the future`);
    }
  }

  /** A parent must exist and itself be a primary title (one level of nesting). */
  private async assertParent(parentContentId: string | undefined, selfId?: string): Promise<void> {
    if (!parentContentId) return;
    if (parentContentId === selfId) throw new BadRequestException('Content cannot be its own parent');
    const parent = await this.repo.findById(parentContentId);
    if (!parent) throw new BadRequestException('parentContentId not found');
    if (parent.parentContentId) throw new BadRequestException('Parent must be a primary title (not a BTS/clip)');
  }

  private splitRelations<T extends RelationFields>(dto: T): { rel: ContentRelationsInput; rest: Omit<T, keyof RelationFields> } {
    const { genreIds, primaryGenreId, tagIds, cast, studioName: _s, tagNames: _t, durationSeconds: _d, studioId: _i, ...rest } = dto;
    return { rel: { genreIds, primaryGenreId, tagIds, cast }, rest };
  }

  /**
   * Free-text studio / tags (admin form) → ids, find-or-create case-insensitively. Runs after the
   * id-based validation so a bad tagId can't leave freshly created tags behind for nothing.
   */
  private async resolveFreeText(dto: RelationFields, rel: ContentRelationsInput): Promise<{ studioId: string | null | undefined }> {
    if (dto.studioName !== undefined && dto.studioId !== undefined) {
      throw new BadRequestException('Send either studioId or studioName, not both');
    }
    let studioId = dto.studioId;
    if (dto.studioName !== undefined) {
      studioId = (await this.taxonomy.findOrCreateStudioByName(dto.studioName)).id;
    }
    if (dto.tagNames !== undefined) {
      const names = normalizeNames(dto.tagNames);
      const created = await this.taxonomy.findOrCreateTagsByNames(names);
      const merged = [...new Set([...(rel.tagIds ?? []), ...created.map((t) => t.id)])];
      if (merged.length > MAX_TAGS) {
        throw new BadRequestException(`At most ${MAX_TAGS} tags (tagIds + tagNames)`);
      }
      rel.tagIds = merged;
    }
    return { studioId };
  }

  /** durationSeconds: number → manual override; null → back to the media duration; omitted → untouched. */
  private durationPatch(value: number | null | undefined): Pick<UpdateContentInput, 'durationSeconds' | 'durationManual'> {
    if (value === undefined) return {};
    if (value === null) return { durationManual: false };
    return { durationSeconds: value, durationManual: true };
  }

  async create(adminId: string, dto: CreateContentDto): Promise<ContentResponseDto> {
    const { rel, rest } = this.splitRelations(dto);
    await this.assertRelations({ ...rel, studioId: dto.studioId ?? undefined });
    await this.assertParent(dto.parentContentId);
    this.assertFuture(dto.availableUntil, 'availableUntil');
    const { studioId } = await this.resolveFreeText(dto, rel);
    const c = await this.repo.createWithRelations(
      {
        ...rest,
        ...(studioId ? { studioId } : {}),
        ...this.durationPatch(dto.durationSeconds ?? undefined),
        slug: this.slugify(dto.title),
        createdBy: adminId,
      },
      rel,
    );
    await this.history.recordChange(c.id, 'created', adminId, `Created "${c.title}"`);
    await this.bust();
    return this.getAdmin(c.id);
  }

  async update(adminId: string, id: string, dto: UpdateContentDto): Promise<ContentResponseDto> {
    await this.requireContent(id);
    const { rel, rest } = this.splitRelations(dto);
    await this.assertRelations({ ...rel, studioId: dto.studioId ?? undefined });
    await this.assertParent(dto.parentContentId, id);
    this.assertFuture(dto.availableUntil, 'availableUntil');
    const { studioId } = await this.resolveFreeText(dto, rel);
    const c = await this.repo.updateWithRelations(
      id,
      {
        ...rest,
        ...(studioId !== undefined ? { studioId } : {}),
        ...this.durationPatch(dto.durationSeconds),
        updatedBy: adminId,
      },
      rel,
    );
    if (!c) throw new NotFoundException('Content not found');
    const changed = Object.keys(dto).filter((k) => (dto as Record<string, unknown>)[k] !== undefined);
    await this.history.recordChange(id, 'updated', adminId, `Updated: ${changed.join(', ') || 'no fields'}`, {
      fields: changed,
    });
    await this.bust();
    return this.getAdmin(id);
  }

  /** Approve & publish (now) or schedule for a future go-live. */
  async publish(adminId: string, id: string, scheduledAt?: string): Promise<ContentResponseDto> {
    if (scheduledAt) this.assertFuture(scheduledAt, 'scheduledAt');
    const c = scheduledAt
      ? await this.repo.setStatus(id, 'scheduled', { scheduledAt, approvedBy: adminId, updatedBy: adminId })
      : await this.repo.setStatus(id, 'published', { publishedAt: true, approvedBy: adminId, updatedBy: adminId });
    if (!c) throw new NotFoundException('Content not found');
    await this.history.recordChange(
      id,
      scheduledAt ? 'scheduled' : 'published',
      adminId,
      scheduledAt ? `Approved & scheduled for ${scheduledAt}` : 'Approved & published',
    );
    await this.bust();
    return this.enrichOne(c);
  }

  /** Pull a scheduled go-live back into review (scheduled → pending_approval). */
  async unschedule(adminId: string, id: string): Promise<ContentResponseDto> {
    const current = await this.requireContent(id);
    if (current.status !== 'scheduled') {
      throw new ConflictException(`Only scheduled content can be unscheduled (status: ${current.status})`);
    }
    const c = await this.repo.unschedule(id, adminId);
    if (!c) throw new ConflictException('Content is no longer scheduled');
    await this.history.recordChange(id, 'unscheduled', adminId, `Unscheduled (was ${current.scheduledAt ?? 'unset'})`);
    await this.bust();
    return this.enrichOne(c);
  }

  async reject(adminId: string, id: string, reason: string): Promise<ContentResponseDto> {
    const c = await this.repo.setStatus(id, 'rejected', { approvedBy: adminId, rejectionReason: reason, updatedBy: adminId });
    if (!c) throw new NotFoundException('Content not found');
    await this.history.recordChange(id, 'rejected', adminId, reason);
    await this.bust();
    return this.enrichOne(c);
  }

  async archive(adminId: string, id: string): Promise<ContentResponseDto> {
    const c = await this.repo.setStatus(id, 'archived', { updatedBy: adminId });
    if (!c) throw new NotFoundException('Content not found');
    await this.history.recordChange(id, 'archived', adminId, 'Archived');
    await this.bust();
    return this.enrichOne(c);
  }

  /** Submit a draft for review (draft → pending_approval). */
  async submit(adminId: string, id: string): Promise<ContentResponseDto> {
    const c = await this.repo.setStatus(id, 'pending_approval', { updatedBy: adminId });
    if (!c) throw new NotFoundException('Content not found');
    await this.history.recordChange(id, 'submitted', adminId, 'Submitted for review');
    await this.bust();
    return this.enrichOne(c);
  }

  /** Boost / un-boost content in the feed (window + channels). */
  async boost(adminId: string, id: string, dto: BoostContentDto): Promise<ContentResponseDto> {
    const boosted = dto.boosted ?? true;
    if (boosted) {
      if (dto.startsAt && dto.until && new Date(dto.until) <= new Date(dto.startsAt)) {
        throw new BadRequestException('until must be after startsAt');
      }
      this.assertFuture(dto.until, 'until');
    }
    const c = await this.repo.setBoost(id, {
      boosted,
      priority: dto.priority ?? 100,
      startsAt: dto.startsAt,
      until: dto.until,
      channels: dto.channels,
    });
    if (!c) throw new NotFoundException('Content not found');
    const note = boosted
      ? `Boosted (priority ${c.boostPriority}${dto.until ? ` until ${dto.until}` : ''}${
          dto.channels?.length ? `; ${dto.channels.join(', ')}` : ''
        })`
      : 'Boost cleared';
    await this.history.recordChange(id, 'boosted', adminId, note);
    if (boosted && c.boostChannels.some((ch) => ch === 'notifications' || ch === 'subscribers')) {
      await this.boostNotifier.notifyIfActive(id); // no-op unless active + published + not yet announced
    }
    await this.bust();
    const fresh = await this.repo.findById(id);
    return this.enrichOne(fresh ?? c);
  }

  async remove(adminId: string, id: string): Promise<{ message: string }> {
    await this.requireContent(id);
    await this.history.recordChange(id, 'deleted', adminId, 'Deleted');
    await this.repo.softDelete(id);
    await this.bust();
    return { message: 'Content deleted' };
  }

  /** Everything the editor/detail page needs in one call. */
  async getFull(id: string) {
    const content = await this.getAdmin(id);
    const [license, sponsorship, regions, history, games] = await Promise.all([
      this.history.getLicense(id),
      this.history.getSponsorship(id),
      this.history.getRegions(id),
      this.history.listHistory(id),
      this.linkedGames(id),
    ]);
    const adPerformance = sponsorship ? adMetrics(await this.adEvents.lifetime(sponsorship.id)) : null;
    return {
      content,
      license,
      sponsorship,
      adPerformance,
      regions: { regions: regions.map((r) => r.region), liveRegions: regions.filter((r) => r.live).map((r) => r.region), items: regions },
      history,
      linkedGames: games,
    };
  }

  /** Games attached to a content. */
  async linkedGames(id: string) {
    await this.requireContent(id);
    const games = await this.repo.linkedGames(id);
    return { total: games.predictions.length + games.auctions.length + games.quests.length, ...games };
  }

  /** Thumbnail candidates: current, transcoder poster, and stored stills/posters. */
  async thumbnailCandidates(id: string) {
    const c = await this.requireContent(id);
    const stills = await this.history.listContentMedia(id);
    const ids = [...new Set([...(c.thumbnailMediaId ? [c.thumbnailMediaId] : []), ...stills.map((s) => s.mediaId)])];
    const [urls, posterUrl] = await Promise.all([
      this.media.publicUrls(ids),
      c.videoMediaId ? this.media.posterPreviewUrl(c.videoMediaId) : Promise.resolve(null),
    ]);
    const candidates: Array<{ mediaId: string | null; url: string | null; source: string; isCurrent: boolean }> = [];
    if (c.thumbnailMediaId) {
      candidates.push({ mediaId: c.thumbnailMediaId, url: urls.get(c.thumbnailMediaId) ?? null, source: 'current', isCurrent: true });
    }
    if (posterUrl) {
      candidates.push({ mediaId: null, url: posterUrl, source: 'transcoder_poster', isCurrent: false });
    }
    for (const s of stills) {
      if (s.mediaId === c.thumbnailMediaId) continue;
      candidates.push({ mediaId: s.mediaId, url: urls.get(s.mediaId) ?? null, source: s.kind, isCurrent: false });
    }
    return candidates;
  }

  /** Use the transcoder poster of the content's video as its thumbnail. */
  async useTranscoderPoster(adminId: string, id: string): Promise<ContentResponseDto> {
    const c = await this.requireContent(id);
    if (!c.videoMediaId) throw new BadRequestException('Content has no video');
    const poster = await this.media.registerPosterAsThumbnail(c.videoMediaId, adminId);
    await this.repo.update(id, { thumbnailMediaId: poster.id, updatedBy: adminId });
    await this.history.recordChange(id, 'updated', adminId, 'Thumbnail set from transcoder poster');
    await this.bust();
    return this.getAdmin(id);
  }
}
