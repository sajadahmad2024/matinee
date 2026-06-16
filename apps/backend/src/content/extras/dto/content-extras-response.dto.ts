import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Active content license row (mirrors `content_licenses`). */
export class LicenseResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() contentId!: string;
  @ApiProperty() licensorName!: string;
  @ApiProperty({ enum: ['exclusive', 'non_exclusive'] }) licenseType!: string;
  @ApiPropertyOptional({ nullable: true }) startsAt!: string | null;
  @ApiPropertyOptional({ nullable: true }) expiresAt!: string | null;
  @ApiProperty({ enum: ['renewing', 'in_negotiation', 'expiring', 'lapsed', 'auto_renew'] }) renewalStatus!: string;
  @ApiProperty({ description: 'License cost in cents' }) licenseCostCents!: number;
  @ApiProperty() currency!: string;
  @ApiProperty({ description: 'Attributed revenue in cents' }) revenueGeneratedCents!: number;
  @ApiPropertyOptional({ nullable: true }) revenueSource!: string | null;
  @ApiPropertyOptional({ nullable: true }) terms!: string | null;
  @ApiProperty() isActive!: boolean;
  @ApiPropertyOptional({ nullable: true }) createdBy!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

/** Active content sponsorship / ad-commercial row (mirrors `content_sponsorships`). */
export class SponsorshipResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() contentId!: string;
  @ApiProperty() sponsorName!: string;
  @ApiPropertyOptional({ nullable: true }) bannerMediaId!: string | null;
  @ApiProperty() adDurationSeconds!: number;
  @ApiProperty({ enum: ['pre-roll', 'mid-roll', 'post-roll', 'overlay'] }) placement!: string;
  @ApiProperty({ description: 'Attributed revenue in cents' }) revenueCents!: number;
  @ApiProperty() currency!: string;
  @ApiPropertyOptional({ nullable: true }) startsAt!: string | null;
  @ApiPropertyOptional({ nullable: true }) endsAt!: string | null;
  @ApiProperty() isActive!: boolean;
  @ApiPropertyOptional({ nullable: true }) createdBy!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
  @ApiProperty({ enum: ['sponsored', 'commercial'] }) adFormat!: string;
  @ApiPropertyOptional({ nullable: true }) feedFrequency!: number | null;
  @ApiPropertyOptional({ nullable: true }) skippableAfterSeconds!: number | null;
}

/** Publish-regions (availability) for a content item. */
export class RegionsResponseDto {
  @ApiProperty({ isArray: true, type: String, example: ['NA', 'EU'] }) regions!: string[];
}

/** One workflow / change-history entry (mirrors `content_change_history`). */
export class ContentHistoryEntryDto {
  @ApiProperty() id!: string;
  @ApiProperty() contentId!: string;
  @ApiPropertyOptional({ nullable: true }) changedBy!: string | null;
  @ApiProperty({
    enum: ['created', 'updated', 'submitted', 'approved', 'rejected', 'scheduled', 'published', 'boosted', 'archived'],
  })
  action!: string;
  @ApiProperty({ type: 'object', additionalProperties: true }) changes!: Record<string, unknown>;
  @ApiPropertyOptional({ nullable: true }) note!: string | null;
  @ApiProperty() createdAt!: string;
}
