import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

// ─── Query ────────────────────────────────────────────────────────────────────
export class LicenseListQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
  @ApiPropertyOptional({ description: 'Search title or licensor' }) @IsOptional() @IsString() @MaxLength(200) q?: string;
  @ApiPropertyOptional({ example: 90, description: 'Only agreements expiring within N days' })
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(3650) expiresWithinDays?: number;
  @ApiPropertyOptional({ enum: ['renewing', 'in_negotiation', 'expiring', 'lapsed', 'auto_renew'] })
  @IsOptional() @IsIn(['renewing', 'in_negotiation', 'expiring', 'lapsed', 'auto_renew']) renewalStatus?: string;
  @ApiPropertyOptional({ enum: ['exclusive', 'non_exclusive'] }) @IsOptional() @IsIn(['exclusive', 'non_exclusive']) licenseType?: string;
  @ApiPropertyOptional({ enum: ['expires_asc', 'revenue_desc', 'cost_desc', 'roi_desc'], default: 'expires_asc' })
  @IsOptional() @IsIn(['expires_asc', 'revenue_desc', 'cost_desc', 'roi_desc'])
  sort?: 'expires_asc' | 'revenue_desc' | 'cost_desc' | 'roi_desc';
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export class ContentStatusCountsDto {
  @ApiProperty() draft!: number;
  @ApiProperty() pending_approval!: number;
  @ApiProperty() scheduled!: number;
  @ApiProperty() published!: number;
  @ApiProperty() rejected!: number;
  @ApiProperty() archived!: number;
}

export class ContentPipelineDto {
  @ApiProperty() draft!: number;
  @ApiProperty() inReview!: number;
  @ApiProperty() scheduled!: number;
}

export class ContentStatsDto {
  @ApiProperty() total!: number;
  @ApiProperty({ type: ContentStatusCountsDto }) byStatus!: ContentStatusCountsDto;
  @ApiProperty() boosted!: number;
  @ApiProperty() sponsored!: number;
  @ApiProperty({ description: 'Published titles' }) activeLibrary!: number;
  @ApiProperty() addedThisMonth!: number;
  @ApiProperty() addedLast30d!: number;
  @ApiProperty() addedPrev30d!: number;
  @ApiPropertyOptional({ nullable: true, description: 'Last 30d vs previous 30d, % (null when no baseline)' })
  addedLast30dChangePct!: number | null;
  @ApiProperty({ type: ContentPipelineDto }) pipeline!: ContentPipelineDto;
  @ApiPropertyOptional({ nullable: true, description: 'Created → published, titles published in the last 90 days' })
  avgTimeToPublishHours!: number | null;
  @ApiProperty() expiringThisMonth!: number;
  @ApiProperty() expiringNextMonth!: number;
  @ApiProperty() licensed!: number;
  @ApiProperty() original!: number;
}

// ─── Licences ─────────────────────────────────────────────────────────────────
export class LicenseAgreementDto {
  @ApiProperty() licenseId!: string;
  @ApiProperty() contentId!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional({ nullable: true }) thumbnailUrl!: string | null;
  @ApiProperty() licensorName!: string;
  @ApiProperty({ enum: ['exclusive', 'non_exclusive'] }) licenseType!: string;
  @ApiPropertyOptional({ nullable: true }) startsAt!: string | null;
  @ApiPropertyOptional({ nullable: true }) expiresAt!: string | null;
  @ApiPropertyOptional({ nullable: true, description: 'Negative when already expired' }) daysLeft!: number | null;
  @ApiProperty() renewalStatus!: string;
  @ApiProperty() licenseCostCents!: number;
  @ApiProperty() revenueGeneratedCents!: number;
  @ApiPropertyOptional({ nullable: true }) revenueSource!: string | null;
  @ApiProperty() currency!: string;
  @ApiPropertyOptional({ nullable: true, description: 'revenue / cost' }) roi!: number | null;
  @ApiProperty() views!: number;
  @ApiPropertyOptional({ nullable: true }) terms!: string | null;
}

export class MonthlyCostPointDto {
  @ApiProperty({ example: '2026-09' }) month!: string;
  @ApiProperty() costCents!: number;
}

export class LicenseSummaryDto {
  @ApiProperty() licensedCount!: number;
  @ApiProperty() originalCount!: number;
  @ApiProperty() activeAgreements!: number;
  @ApiProperty() totalCostCents!: number;
  @ApiProperty() totalRevenueCents!: number;
  @ApiProperty({ description: 'Active agreement cost spread over each term (open-ended = 12 months)' }) monthlyCostCents!: number;
  @ApiProperty({ description: 'Total active licence cost / views of licensed content' }) costPerStreamCents!: number;
  @ApiProperty() expiringIn30!: number;
  @ApiProperty() expiringIn60!: number;
  @ApiProperty() expiringIn90!: number;
  @ApiProperty({ type: [MonthlyCostPointDto], description: 'Last 6 months' }) monthlyCostTrend!: MonthlyCostPointDto[];
}
