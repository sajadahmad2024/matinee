import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { AnalyticsWindowQueryDto } from './analytics.dto';
import { REGION_PATTERN } from './dashboard.dto';

export const SPEND_CHANNELS = ['organic', 'paid_social', 'referral', 'influencer', 'search', 'other'] as const;
export const MENTION_PLATFORMS = ['x', 'tiktok', 'instagram', 'reddit', 'youtube', 'other'] as const;
export const SENTIMENTS = ['positive', 'neutral', 'negative'] as const;
const MONTH = /^\d{4}-(0[1-9]|1[0-2])(-01)?$/;

// ─── Marketing spend ─────────────────────────────────────────────────────────

export class MarketingSpendQueryDto {
  @ApiPropertyOptional({ example: '2026-01', description: 'First month (YYYY-MM), inclusive' })
  @IsOptional()
  @Matches(MONTH, { message: 'fromMonth must be YYYY-MM' })
  fromMonth?: string;

  @ApiPropertyOptional({ example: '2026-12', description: 'Last month (YYYY-MM), inclusive' })
  @IsOptional()
  @Matches(MONTH, { message: 'toMonth must be YYYY-MM' })
  toMonth?: string;
}

export class UpsertMarketingSpendDto {
  @ApiProperty({ enum: SPEND_CHANNELS }) @IsIn(SPEND_CHANNELS) channel!: string;

  @ApiProperty({ example: '2026-09', description: 'Month (YYYY-MM or YYYY-MM-01)' })
  @Matches(MONTH, { message: 'periodMonth must be YYYY-MM or YYYY-MM-01' })
  periodMonth!: string;

  @ApiProperty({ minimum: 0, example: 250000 }) @Type(() => Number) @IsInt() @Min(0) @Max(1e13) spendCents!: number;

  @ApiPropertyOptional({ default: 'USD', example: 'USD' }) @IsOptional() @IsString() @Matches(/^[A-Z]{3}$/) currency?: string;

  @ApiPropertyOptional({ minimum: 0, description: 'Attributed acquisitions (else signups with that acquisition_channel are used)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  newUsers?: number;
}

export class MarketingSpendDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: SPEND_CHANNELS }) channel!: string;
  @ApiProperty({ example: '2026-09-01' }) periodMonth!: string;
  @ApiProperty() spendCents!: number;
  @ApiProperty() currency!: string;
  @ApiProperty() newUsers!: number;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

export class DeletedDto {
  @ApiProperty() deleted!: boolean;
}

// ─── Social mentions ─────────────────────────────────────────────────────────

export class SocialMentionInputDto {
  @ApiProperty({ enum: MENTION_PLATFORMS }) @IsIn(MENTION_PLATFORMS) platform!: string;
  @ApiPropertyOptional({ maxLength: 120, description: 'Id on the source platform (enables idempotent re-ingest)' })
  @IsOptional() @IsString() @MaxLength(120) externalId?: string;
  @ApiPropertyOptional({ maxLength: 120 }) @IsOptional() @IsString() @MaxLength(120) authorHandle?: string;
  @ApiPropertyOptional({ maxLength: 500 }) @IsOptional() @IsUrl({ require_tld: false }) @MaxLength(500) url?: string;
  @ApiPropertyOptional({ maxLength: 5000 }) @IsOptional() @IsString() @MaxLength(5000) content?: string;
  @ApiPropertyOptional({ enum: SENTIMENTS }) @IsOptional() @IsIn(SENTIMENTS) sentiment?: string;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) impressions?: number;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) engagement?: number;
  @ApiPropertyOptional({ minimum: 0, description: 'Earned media value (cents)' }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) emvCents?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isViralMoment?: boolean;
  @ApiPropertyOptional({ example: 'US', description: 'ISO alpha-2 (for regional scoping)' }) @IsOptional() @Matches(/^[A-Z]{2}$/) countryCode?: string;
  @ApiPropertyOptional({ example: '2026-09-20T10:00:00Z' }) @IsOptional() @IsISO8601() mentionedAt?: string;
}

export class IngestSocialMentionsDto {
  @ApiProperty({ type: [SocialMentionInputDto], description: 'Batch (≤ 500)' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => SocialMentionInputDto)
  mentions!: SocialMentionInputDto[];
}

export class UpdateSocialMentionDto {
  @ApiPropertyOptional({ maxLength: 120 }) @IsOptional() @IsString() @MaxLength(120) authorHandle?: string;
  @ApiPropertyOptional({ maxLength: 500 }) @IsOptional() @IsUrl({ require_tld: false }) @MaxLength(500) url?: string;
  @ApiPropertyOptional({ maxLength: 5000 }) @IsOptional() @IsString() @MaxLength(5000) content?: string;
  @ApiPropertyOptional({ enum: SENTIMENTS }) @IsOptional() @IsIn(SENTIMENTS) sentiment?: string;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) impressions?: number;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) engagement?: number;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) emvCents?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isViralMoment?: boolean;
  @ApiPropertyOptional() @IsOptional() @Matches(/^[A-Z]{2}$/) countryCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() mentionedAt?: string;
}

export class SocialMentionsQueryDto {
  @ApiPropertyOptional({ enum: MENTION_PLATFORMS }) @IsOptional() @IsIn(MENTION_PLATFORMS) platform?: string;
  @ApiPropertyOptional({ enum: SENTIMENTS }) @IsOptional() @IsIn(SENTIMENTS) sentiment?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() from?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() to?: string;
  @ApiPropertyOptional({ default: 1, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}

export class SocialSummaryQueryDto extends AnalyticsWindowQueryDto {
  @ApiPropertyOptional({ description: 'global | macro | ISO country (filters on the mention country)' })
  @IsOptional()
  @Matches(REGION_PATTERN)
  region?: string;
}

export class SocialMentionDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: MENTION_PLATFORMS }) platform!: string;
  @ApiProperty({ nullable: true, type: String }) externalId!: string | null;
  @ApiProperty({ nullable: true, type: String }) authorHandle!: string | null;
  @ApiProperty({ nullable: true, type: String }) url!: string | null;
  @ApiProperty({ nullable: true, type: String }) content!: string | null;
  @ApiProperty({ nullable: true, enum: SENTIMENTS }) sentiment!: string | null;
  @ApiProperty() impressions!: number;
  @ApiProperty() engagement!: number;
  @ApiProperty() emvCents!: number;
  @ApiProperty() isViralMoment!: boolean;
  @ApiProperty({ nullable: true, type: String }) countryCode!: string | null;
  @ApiProperty({ nullable: true, type: String }) mentionedAt!: string | null;
  @ApiProperty() ingestedAt!: string;
}

export class SocialMentionPageDto {
  @ApiProperty({ type: [SocialMentionDto] }) items!: SocialMentionDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
}

export class SocialIngestResultDto {
  @ApiProperty() ingested!: number;
}

export class PlatformMentionsDto {
  @ApiProperty() platform!: string;
  @ApiProperty() mentions!: number;
  @ApiProperty() impressions!: number;
  @ApiProperty() positive!: number;
  @ApiProperty() negative!: number;
}

export class SocialSummaryDto {
  @ApiProperty() from!: string;
  @ApiProperty() to!: string;
  @ApiProperty() region!: string;
  @ApiProperty() mentionsPerWeek!: number;
  @ApiProperty({ type: [Number] }) sentiment!: [number, number, number];
  @ApiProperty() viralMoments!: number;
  @ApiProperty() organicImpressions!: number;
  @ApiProperty() earnedMediaValue!: number;
  @ApiProperty() topAdvocates!: number;
  @ApiProperty() mentions!: number;
  @ApiProperty({ type: [PlatformMentionsDto] }) byPlatform!: PlatformMentionsDto[];
}

// ─── Rollup ──────────────────────────────────────────────────────────────────

export class RunRollupDto {
  @ApiProperty({ example: '2026-09-01', description: 'First UTC day (YYYY-MM-DD)' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from!: string;

  @ApiProperty({ example: '2026-09-25', description: 'Last UTC day, inclusive (clamped to today)' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to!: string;
}

export class RollupCoverageDto {
  @ApiProperty({ nullable: true, type: String }) coveredFrom!: string | null;
  @ApiProperty({ nullable: true, type: String }) coveredThrough!: string | null;
}

export class RollupResultDto {
  @ApiProperty() from!: string;
  @ApiProperty() to!: string;
  @ApiProperty({ description: 'content_daily_stats rows written' }) rows!: number;
  @ApiProperty({ type: RollupCoverageDto }) coverage!: RollupCoverageDto;
}
