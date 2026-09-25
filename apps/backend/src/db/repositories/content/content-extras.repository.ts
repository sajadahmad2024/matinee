import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import {
  contentLicenses,
  contentSponsorships,
  contentRegions,
  contentChangeHistory,
  contentMedia,
  contents,
  mediaMetadata,
} from '@db/drizzle/schema';
import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { PublishRegion, userDisplayName } from './content.repository';

export interface LicenseInput {
  licensorName: string;
  licenseType?: string | undefined;
  startsAt?: string | undefined;
  expiresAt?: string | undefined;
  renewalStatus?: string | undefined;
  licenseCostCents?: number | undefined;
  currency?: string | undefined;
  revenueGeneratedCents?: number | undefined;
  revenueSource?: string | undefined;
  terms?: string | undefined;
}

export interface SponsorshipInput {
  adFormat?: string | undefined; // sponsored | commercial
  sponsorName: string;
  bannerMediaId?: string | undefined;
  adDurationSeconds?: number | undefined;
  placement?: string | undefined;
  feedFrequency?: number | undefined;
  skippableAfterSeconds?: number | undefined;
  revenueCents?: number | undefined;
  currency?: string | undefined;
  startsAt?: string | undefined;
  endsAt?: string | undefined;
  creativeMediaId?: string | undefined;
  clickUrl?: string | undefined;
  ctaLabel?: string | undefined;
  midRollAtSeconds?: number | undefined;
  overlayStartSeconds?: number | undefined;
  overlayDurationSeconds?: number | undefined;
  cpmCents?: number | undefined;
  cpcCents?: number | undefined;
  advertiserId?: string | undefined;
  campaignId?: string | undefined;
}

export type SponsorshipRow = typeof contentSponsorships.$inferSelect;

/** A `content_media` attachment joined to its media row. */
export interface ContentMediaItem {
  id: string;
  mediaId: string;
  kind: string;
  sortOrder: number;
  timecodeSeconds: number | null;
  createdAt: string;
  mediaStatus: string;
  width: number | null;
  height: number | null;
}

/** History entry joined to the acting admin's display name + role(s). */
export interface ContentHistoryEntry {
  id: string;
  contentId: string;
  changedBy: string | null;
  changedByName: string | null;
  changedByRole: string | null;
  action: string;
  changes: Record<string, unknown>;
  note: string | null;
  createdAt: string;
}

@Injectable()
export class ContentExtrasRepository {
  constructor(private readonly dbService: DBService) {}
  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  // ─── Licensing ──────────────────────────────────────────────────────────────
  async getLicense(contentId: string, tx?: DBExecutor) {
    const rows = await this.exec(tx)
      .select()
      .from(contentLicenses)
      .where(and(eq(contentLicenses.contentId, contentId), eq(contentLicenses.isActive, true)))
      .limit(1);
    return rows[0] ?? null;
  }

  /** Replace the active license + sync the denormalized chip fields on `contents`. */
  async upsertLicense(contentId: string, input: LicenseInput, createdBy: string) {
    return this.dbService.transaction(async (tx) => {
      await tx
        .update(contentLicenses)
        .set({ isActive: false })
        .where(and(eq(contentLicenses.contentId, contentId), eq(contentLicenses.isActive, true)));
      const rows = await tx
        .insert(contentLicenses)
        .values({
          contentId,
          licensorName: input.licensorName,
          ...(input.licenseType ? { licenseType: input.licenseType } : {}),
          ...(input.startsAt ? { startsAt: input.startsAt } : {}),
          ...(input.expiresAt ? { expiresAt: input.expiresAt } : {}),
          ...(input.renewalStatus ? { renewalStatus: input.renewalStatus } : {}),
          ...(input.licenseCostCents !== undefined ? { licenseCostCents: input.licenseCostCents } : {}),
          ...(input.currency ? { currency: input.currency } : {}),
          ...(input.revenueGeneratedCents !== undefined ? { revenueGeneratedCents: input.revenueGeneratedCents } : {}),
          ...(input.revenueSource ? { revenueSource: input.revenueSource } : {}),
          ...(input.terms ? { terms: input.terms } : {}),
          createdBy,
        })
        .returning();
      // Status follows the expiry right away (the maintenance cron keeps it in sync afterwards).
      const expires = input.expiresAt ?? null;
      await tx
        .update(contents)
        .set({
          licenseStatus: sql`case when ${expires}::timestamptz is null then 'licensed'
            when ${expires}::timestamptz <= now() then 'expired'
            when ${expires}::timestamptz <= now() + interval '30 days' then 'expiring'
            else 'licensed' end`,
          licensorName: input.licensorName,
          licenseExpiresAt: expires,
          licenseTerms: input.terms ?? null,
          updatedAt: sql`now()`,
        })
        .where(eq(contents.id, contentId));
      return rows[0]!;
    });
  }

  /** Deactivate the active license and mark the content `original`. Returns whether one existed. */
  async removeLicense(contentId: string): Promise<boolean> {
    return this.dbService.transaction(async (tx) => {
      const rows = await tx
        .update(contentLicenses)
        .set({ isActive: false, updatedAt: sql`now()` })
        .where(and(eq(contentLicenses.contentId, contentId), eq(contentLicenses.isActive, true)))
        .returning({ id: contentLicenses.id });
      await tx
        .update(contents)
        .set({ licenseStatus: 'original', licensorName: null, licenseExpiresAt: null, licenseTerms: null, updatedAt: sql`now()` })
        .where(eq(contents.id, contentId));
      return rows.length > 0;
    });
  }

  // ─── Sponsorship / Ad-Sales ─────────────────────────────────────────────────
  async getSponsorship(contentId: string, tx?: DBExecutor) {
    const rows = await this.exec(tx)
      .select()
      .from(contentSponsorships)
      .where(and(eq(contentSponsorships.contentId, contentId), eq(contentSponsorships.isActive, true)))
      .limit(1);
    return rows[0] ?? null;
  }

  async upsertSponsorship(contentId: string, input: SponsorshipInput, createdBy: string) {
    return this.dbService.transaction(async (tx) => {
      await tx
        .update(contentSponsorships)
        .set({ isActive: false })
        .where(and(eq(contentSponsorships.contentId, contentId), eq(contentSponsorships.isActive, true)));
      const isCommercial = input.adFormat === 'commercial';
      const rows = await tx
        .insert(contentSponsorships)
        .values({
          contentId,
          sponsorName: input.sponsorName,
          ...(input.adFormat ? { adFormat: input.adFormat } : {}),
          ...(input.bannerMediaId ? { bannerMediaId: input.bannerMediaId } : {}),
          ...(input.adDurationSeconds !== undefined ? { adDurationSeconds: input.adDurationSeconds } : {}),
          ...(input.placement ? { placement: input.placement } : {}),
          ...(input.feedFrequency !== undefined ? { feedFrequency: input.feedFrequency } : {}),
          ...(input.skippableAfterSeconds !== undefined ? { skippableAfterSeconds: input.skippableAfterSeconds } : {}),
          ...(input.revenueCents !== undefined ? { revenueCents: input.revenueCents } : {}),
          ...(input.currency ? { currency: input.currency } : {}),
          ...(input.startsAt ? { startsAt: input.startsAt } : {}),
          ...(input.endsAt ? { endsAt: input.endsAt } : {}),
          ...(input.creativeMediaId ? { creativeMediaId: input.creativeMediaId } : {}),
          ...(input.clickUrl ? { clickUrl: input.clickUrl } : {}),
          ...(input.ctaLabel ? { ctaLabel: input.ctaLabel } : {}),
          ...(input.midRollAtSeconds !== undefined ? { midRollAtSeconds: input.midRollAtSeconds } : {}),
          ...(input.overlayStartSeconds !== undefined ? { overlayStartSeconds: input.overlayStartSeconds } : {}),
          ...(input.overlayDurationSeconds !== undefined ? { overlayDurationSeconds: input.overlayDurationSeconds } : {}),
          ...(input.cpmCents !== undefined ? { cpmCents: input.cpmCents } : {}),
          ...(input.cpcCents !== undefined ? { cpcCents: input.cpcCents } : {}),
          ...(input.advertiserId ? { advertiserId: input.advertiserId } : {}),
          ...(input.campaignId ? { campaignId: input.campaignId } : {}),
          createdBy,
        })
        .returning();
      await tx
        .update(contents)
        .set({ isSponsored: true, isAdCommercial: isCommercial, updatedAt: sql`now()` })
        .where(eq(contents.id, contentId));
      return rows[0]!;
    });
  }

  /** Back to organic: deactivate the active sponsorship + clear the sponsor flags. Returns whether one existed. */
  async removeSponsorship(contentId: string): Promise<boolean> {
    return this.dbService.transaction(async (tx) => {
      const rows = await tx
        .update(contentSponsorships)
        .set({ isActive: false, updatedAt: sql`now()` })
        .where(and(eq(contentSponsorships.contentId, contentId), eq(contentSponsorships.isActive, true)))
        .returning({ id: contentSponsorships.id });
      await tx
        .update(contents)
        .set({ isSponsored: false, isAdCommercial: false, updatedAt: sql`now()` })
        .where(eq(contents.id, contentId));
      return rows.length > 0;
    });
  }

  /** Active sponsorship that is inside its deal dates right now (null otherwise). */
  async getLiveSponsorship(contentId: string, tx?: DBExecutor): Promise<SponsorshipRow | null> {
    const map = await this.liveSponsorshipsFor([contentId], tx);
    return map.get(contentId) ?? null;
  }

  /** Live (active + within dates) sponsorships for many contents → map keyed by contentId. */
  async liveSponsorshipsFor(contentIds: string[], tx?: DBExecutor): Promise<Map<string, SponsorshipRow>> {
    const ids = [...new Set(contentIds)];
    if (ids.length === 0) {
      return new Map();
    }
    const rows = await this.exec(tx)
      .select()
      .from(contentSponsorships)
      .where(
        and(
          inArray(contentSponsorships.contentId, ids),
          eq(contentSponsorships.isActive, true),
          sql`(${contentSponsorships.startsAt} is null or ${contentSponsorships.startsAt} <= now())`,
          sql`(${contentSponsorships.endsAt} is null or ${contentSponsorships.endsAt} > now())`,
        ),
      );
    return new Map(rows.map((r) => [r.contentId, r]));
  }

  /**
   * Deactivate active sponsorships past `ends_at` and clear the sponsor flags on their contents
   * (unless another active sponsorship remains). Returns the affected content ids.
   */
  async expireSponsorships(tx?: DBExecutor): Promise<string[]> {
    const run = async (db: DBExecutor) => {
      const rows = await db
        .update(contentSponsorships)
        .set({ isActive: false, updatedAt: sql`now()` })
        .where(and(eq(contentSponsorships.isActive, true), sql`${contentSponsorships.endsAt} <= now()`))
        .returning({ contentId: contentSponsorships.contentId });
      const ids = [...new Set(rows.map((r) => r.contentId))];
      if (ids.length > 0) {
        await db.execute(sql`
          update contents c set is_sponsored = false, is_ad_commercial = false, updated_at = now()
           where ${inArray(sql`c.id`, ids)}
             and not exists (select 1 from content_sponsorships s where s.content_id = c.id and s.is_active)
        `);
      }
      return ids;
    };
    return tx ? run(tx) : this.dbService.transaction(run);
  }

  // ─── Publish regions (availability M2M, per-region live toggle) ──────────────
  async getRegions(contentId: string, tx?: DBExecutor): Promise<PublishRegion[]> {
    return this.exec(tx)
      .select({ region: contentRegions.region, live: contentRegions.isLive })
      .from(contentRegions)
      .where(eq(contentRegions.contentId, contentId))
      .orderBy(asc(contentRegions.region));
  }

  async setRegions(contentId: string, regions: string[], offRegions: string[] = []): Promise<PublishRegion[]> {
    return this.dbService.transaction(async (tx) => {
      await tx.delete(contentRegions).where(eq(contentRegions.contentId, contentId));
      if (regions.length > 0) {
        await tx
          .insert(contentRegions)
          .values(regions.map((region) => ({ contentId, region, isLive: !offRegions.includes(region) })));
      }
      return this.getRegions(contentId, tx);
    });
  }

  // ─── Content media (stills / posters / alt thumbnails) ──────────────────────
  async listContentMedia(contentId: string, kinds: string[] = ['thumbnail', 'poster', 'still'], tx?: DBExecutor) {
    return this.exec(tx)
      .select({ mediaId: contentMedia.mediaId, kind: contentMedia.kind, sortOrder: contentMedia.sortOrder })
      .from(contentMedia)
      .where(and(eq(contentMedia.contentId, contentId), inArray(contentMedia.kind, kinds)))
      .orderBy(asc(contentMedia.sortOrder));
  }

  /** Attachments of a content with their media status/dimensions, in display order. */
  async listContentMediaItems(contentId: string, tx?: DBExecutor): Promise<ContentMediaItem[]> {
    const rows = await this.exec(tx)
      .select({
        id: contentMedia.id,
        mediaId: contentMedia.mediaId,
        kind: contentMedia.kind,
        sortOrder: contentMedia.sortOrder,
        timecodeSeconds: contentMedia.timecodeSeconds,
        createdAt: contentMedia.createdAt,
        mediaStatus: mediaMetadata.status,
        width: mediaMetadata.width,
        height: mediaMetadata.height,
      })
      .from(contentMedia)
      .innerJoin(mediaMetadata, and(eq(mediaMetadata.id, contentMedia.mediaId), isNull(mediaMetadata.deletedAt)))
      .where(eq(contentMedia.contentId, contentId))
      .orderBy(asc(contentMedia.sortOrder), asc(contentMedia.createdAt));
    return rows.map((r) => ({ ...r, timecodeSeconds: r.timecodeSeconds === null ? null : Number(r.timecodeSeconds) }));
  }

  /** Attach a media. Returns null when it is already attached (unique content+media). */
  async addContentMedia(
    contentId: string,
    input: { mediaId: string; kind: string; sortOrder?: number | undefined; timecodeSeconds?: number | undefined },
    tx?: DBExecutor,
  ): Promise<string | null> {
    const rows = await this.exec(tx)
      .insert(contentMedia)
      .values({
        contentId,
        mediaId: input.mediaId,
        kind: input.kind,
        sortOrder:
          input.sortOrder ??
          sql`(select coalesce(max(sort_order) + 1, 0) from content_media where content_id = ${contentId})`,
        ...(input.timecodeSeconds !== undefined ? { timecodeSeconds: String(input.timecodeSeconds) } : {}),
      })
      .onConflictDoNothing({ target: [contentMedia.contentId, contentMedia.mediaId] })
      .returning({ id: contentMedia.id });
    return rows[0]?.id ?? null;
  }

  async removeContentMedia(contentId: string, mediaId: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .delete(contentMedia)
      .where(and(eq(contentMedia.contentId, contentId), eq(contentMedia.mediaId, mediaId)))
      .returning({ id: contentMedia.id });
    return rows.length > 0;
  }

  /** Listed media get sort 0..n-1 (in order); the rest keep their relative order after them. */
  async reorderContentMedia(contentId: string, mediaIds: string[]): Promise<void> {
    await this.dbService.transaction(async (tx) => {
      const current = await tx
        .select({ mediaId: contentMedia.mediaId })
        .from(contentMedia)
        .where(eq(contentMedia.contentId, contentId))
        .orderBy(asc(contentMedia.sortOrder), asc(contentMedia.createdAt));
      const rest = current.map((c) => c.mediaId).filter((id) => !mediaIds.includes(id));
      const order = [...mediaIds, ...rest];
      for (let i = 0; i < order.length; i++) {
        await tx
          .update(contentMedia)
          .set({ sortOrder: i })
          .where(and(eq(contentMedia.contentId, contentId), eq(contentMedia.mediaId, order[i]!)));
      }
    });
  }

  // ─── Workflow / change history ──────────────────────────────────────────────
  async recordChange(
    contentId: string,
    action: string,
    changedBy?: string,
    note?: string,
    changes?: Record<string, unknown>,
    tx?: DBExecutor,
  ): Promise<void> {
    await this.exec(tx)
      .insert(contentChangeHistory)
      .values({
        contentId,
        action,
        ...(changedBy ? { changedBy } : {}),
        ...(note ? { note: note.slice(0, 500) } : {}),
        ...(changes ? { changes } : {}),
      });
  }

  /** Newest first, with the actor's display name and role names (comma-joined). */
  async listHistory(contentId: string, tx?: DBExecutor): Promise<ContentHistoryEntry[]> {
    const res = await this.exec(tx).execute(sql`
      select h.id, h.content_id as "contentId", h.changed_by as "changedBy",
             ${userDisplayName('u')} as "changedByName",
             (select string_agg(r.name, ', ' order by r.name)
                from user_roles ur join roles r on r.id = ur.role_id
               where ur.user_id = h.changed_by) as "changedByRole",
             h.action, h.changes, h.note, h.created_at as "createdAt"
        from ${contentChangeHistory} h
        left join users u on u.id = h.changed_by
       where h.content_id = ${contentId}
       order by h.created_at desc
    `);
    return (res as unknown as { rows: ContentHistoryEntry[] }).rows;
  }
}
