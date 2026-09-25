import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import {
  contentLicenses,
  contentSponsorships,
  contentRegions,
  contentChangeHistory,
  contentMedia,
  contents,
} from '@db/drizzle/schema';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
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
      await tx
        .update(contents)
        .set({
          licenseStatus: 'licensed',
          licensorName: input.licensorName,
          ...(input.expiresAt ? { licenseExpiresAt: input.expiresAt } : {}),
          ...(input.terms ? { licenseTerms: input.terms } : {}),
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
