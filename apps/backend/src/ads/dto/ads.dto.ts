import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
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
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PlaybackDto } from '@media/dto/media-response.dto';

export const AD_EVENT_TYPES = ['impression', 'click', 'skip', 'complete'] as const;
export const AD_PERFORMANCE_SORTS = ['impressions_desc', 'clicks_desc', 'ctr_desc', 'revenue_desc', 'newest'] as const;

const toBool = ({ value }: { value: unknown }): unknown => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
};

// ─── Tracking ───────────────────────────────────────────────────────────────

export class AdEventInputDto {
  @ApiPropertyOptional({ format: 'uuid', description: 'Per-video sponsor ad (GET /v1/content/:id/ads). One of sponsorshipId / campaignId' })
  @ValidateIf((o: AdEventInputDto) => !o.campaignId) @IsUUID() sponsorshipId?: string;
  @ApiPropertyOptional({ format: 'uuid', description: 'Feed commercial (GET /v1/ads/commercials/:campaignId)' })
  @ValidateIf((o: AdEventInputDto) => !o.sponsorshipId || o.campaignId !== undefined) @IsUUID() campaignId?: string;
  @ApiProperty({ enum: AD_EVENT_TYPES }) @IsIn(AD_EVENT_TYPES) type!: (typeof AD_EVENT_TYPES)[number];
  @ApiProperty({ description: 'View session id (POST /v1/content/:id/views → viewId) — dedupe key', maxLength: 64 })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  viewId!: string;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @IsInt() @Min(0) @Max(86400) positionSeconds?: number;
  @ApiPropertyOptional({ description: 'Client time (ISO); default now; last 7 days … +5 min' }) @IsOptional() @IsISO8601() occurredAt?: string;
}

export class TrackAdEventsDto {
  @ApiProperty({ type: [AdEventInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => AdEventInputDto)
  events!: AdEventInputDto[];
}

export class TrackAdEventsResultDto {
  @ApiProperty({ description: 'Newly recorded events' }) accepted!: number;
  @ApiProperty({ description: 'Already recorded for that view (or repeated in the batch)' }) duplicates!: number;
  @ApiProperty({ description: 'Unknown sponsorship / campaign, both ids sent, or out-of-range time' }) rejected!: number;
  @ApiProperty({ type: [String] }) rejectedSponsorshipIds!: string[];
  @ApiProperty({ type: [String] }) rejectedCampaignIds!: string[];
}

// ─── Serving ────────────────────────────────────────────────────────────────

export class AdOverlayWindowDto {
  @ApiProperty() startSeconds!: number;
  @ApiPropertyOptional({ nullable: true, description: 'null = until the end of the video' }) durationSeconds!: number | null;
}

export class AdDescriptorDto {
  @ApiProperty() sponsorshipId!: string;
  @ApiProperty({ enum: ['sponsored', 'commercial'] }) adFormat!: string;
  @ApiProperty({ enum: ['pre-roll', 'mid-roll', 'post-roll', 'overlay'] }) placement!: string;
  @ApiProperty() sponsorName!: string;
  @ApiPropertyOptional({ nullable: true }) bannerUrl!: string | null;
  @ApiPropertyOptional({ nullable: true }) clickUrl!: string | null;
  @ApiPropertyOptional({ nullable: true }) ctaLabel!: string | null;
  @ApiProperty() adDurationSeconds!: number;
  @ApiPropertyOptional({ nullable: true }) skippableAfterSeconds!: number | null;
  @ApiPropertyOptional({ nullable: true }) midRollAtSeconds!: number | null;
  @ApiPropertyOptional({ type: AdOverlayWindowDto, nullable: true }) overlay!: AdOverlayWindowDto | null;
  @ApiPropertyOptional({ type: PlaybackDto, nullable: true, description: 'Signed video creative (when configured + ready)' })
  creative!: PlaybackDto | null;
  @ApiPropertyOptional({ nullable: true }) startsAt!: string | null;
  @ApiPropertyOptional({ nullable: true }) endsAt!: string | null;
}

export class ContentAdsDto {
  @ApiProperty() contentId!: string;
  @ApiProperty({ description: 'Active subscriber — roll ads suppressed (overlay kept)' }) adFree!: boolean;
  @ApiProperty({ type: [AdDescriptorDto] }) ads!: AdDescriptorDto[];
}

// ─── Reporting ──────────────────────────────────────────────────────────────

export class AdMetricsDto {
  @ApiProperty() impressions!: number;
  @ApiProperty() uniqueViewers!: number;
  @ApiProperty() clicks!: number;
  @ApiProperty({ description: 'clicks / impressions (0..1)' }) ctr!: number;
  @ApiProperty() skips!: number;
  @ApiProperty({ description: 'skips / impressions (0..1)' }) skipRate!: number;
  @ApiProperty() completes!: number;
  @ApiProperty({ description: 'completes / impressions (0..1)' }) completionRate!: number;
  @ApiProperty({ description: 'flat + CPM/CPC revenue, cents' }) revenueCents!: number;
  @ApiProperty({ description: 'revenue per 1000 impressions, cents' }) ecpmCents!: number;
}

export class AdPerformanceItemDto extends AdMetricsDto {
  @ApiProperty() sponsorshipId!: string;
  @ApiPropertyOptional({ nullable: true }) advertiserId!: string | null;
  @ApiPropertyOptional({ nullable: true }) campaignId!: string | null;
  @ApiProperty() contentId!: string;
  @ApiProperty() contentTitle!: string;
  @ApiProperty() sponsorName!: string;
  @ApiProperty({ enum: ['sponsored', 'commercial'] }) adFormat!: string;
  @ApiProperty() placement!: string;
  @ApiProperty() isActive!: boolean;
  @ApiProperty({ description: 'Active and inside its deal dates now' }) isLive!: boolean;
  @ApiPropertyOptional({ nullable: true }) startsAt!: string | null;
  @ApiPropertyOptional({ nullable: true }) endsAt!: string | null;
  @ApiProperty() currency!: string;
}

export class AdDailyPointDto {
  @ApiProperty({ example: '2026-09-25' }) day!: string;
  @ApiProperty() impressions!: number;
  @ApiProperty() clicks!: number;
  @ApiProperty() skips!: number;
  @ApiProperty() completes!: number;
}

export class AdPerformanceQueryDto {
  @ApiPropertyOptional({ description: 'Window start (ISO, inclusive). Default: to − 30 days' }) @IsOptional() @IsISO8601() from?: string;
  @ApiPropertyOptional({ description: 'Window end (ISO, exclusive). Default: now' }) @IsOptional() @IsISO8601() to?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() contentId?: string;
  @ApiPropertyOptional({ enum: ['sponsored', 'commercial'] }) @IsOptional() @IsIn(['sponsored', 'commercial']) adFormat?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(toBool) @IsBoolean() active?: boolean;
  @ApiPropertyOptional({ description: 'Sponsor name or content title' }) @IsOptional() @IsString() @MaxLength(200) q?: string;
  @ApiPropertyOptional({ enum: AD_PERFORMANCE_SORTS, default: 'impressions_desc' })
  @IsOptional()
  @IsIn(AD_PERFORMANCE_SORTS)
  sort?: (typeof AD_PERFORMANCE_SORTS)[number];
  @ApiPropertyOptional({ default: 1, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}

export class AdWindowQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsISO8601() from?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() to?: string;
}
