import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import {
  contentLicenses,
  contentSponsorships,
  contentRegions,
  contentChangeHistory,
  contents,
} from '@db/drizzle/schema';
import { and, desc, eq, sql } from 'drizzle-orm';

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

  // ─── Publish regions (availability M2M) ─────────────────────────────────────
  async getRegions(contentId: string, tx?: DBExecutor): Promise<string[]> {
    const rows = await this.exec(tx)
      .select({ region: contentRegions.region })
      .from(contentRegions)
      .where(eq(contentRegions.contentId, contentId));
    return rows.map((r) => r.region);
  }

  async setRegions(contentId: string, regions: string[]): Promise<string[]> {
    return this.dbService.transaction(async (tx) => {
      await tx.delete(contentRegions).where(eq(contentRegions.contentId, contentId));
      if (regions.length > 0) {
        await tx.insert(contentRegions).values(regions.map((region) => ({ contentId, region })));
      }
      return regions;
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

  async listHistory(contentId: string, tx?: DBExecutor) {
    return this.exec(tx)
      .select()
      .from(contentChangeHistory)
      .where(eq(contentChangeHistory.contentId, contentId))
      .orderBy(desc(contentChangeHistory.createdAt));
  }
}
