import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const REGIONS = ['NA', 'EU', 'APAC', 'LATAM', 'MEA'];

export class LicenseDto {
  @ApiProperty({ example: 'Global Rights Co' }) @IsString() @MinLength(1) @MaxLength(200) licensorName!: string;
  @ApiPropertyOptional({ enum: ['exclusive', 'non_exclusive'] }) @IsOptional() @IsIn(['exclusive', 'non_exclusive']) licenseType?: string;
  @ApiPropertyOptional({ example: '2026-01-01T00:00:00Z' }) @IsOptional() @IsISO8601() startsAt?: string;
  @ApiPropertyOptional({ example: '2026-12-31T00:00:00Z' }) @IsOptional() @IsISO8601() expiresAt?: string;
  @ApiPropertyOptional({ enum: ['renewing', 'in_negotiation', 'expiring', 'lapsed', 'auto_renew'] })
  @IsOptional() @IsIn(['renewing', 'in_negotiation', 'expiring', 'lapsed', 'auto_renew']) renewalStatus?: string;
  @ApiPropertyOptional({ description: 'License cost in cents' }) @IsOptional() @IsInt() @Min(0) licenseCostCents?: number;
  @ApiPropertyOptional({ example: 'USD' }) @IsOptional() @IsString() @MaxLength(3) currency?: string;
  @ApiPropertyOptional({ description: 'Attributed revenue in cents' }) @IsOptional() @IsInt() @Min(0) revenueGeneratedCents?: number;
  @ApiPropertyOptional({ example: 'Ads + Subs' }) @IsOptional() @IsString() @MaxLength(100) revenueSource?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) terms?: string;
}

export class SponsorshipDto {
  @ApiPropertyOptional({
    enum: ['sponsored', 'commercial'],
    default: 'sponsored',
    description: '`commercial` is rejected — feed commercials are Ad Sales campaigns (POST /v1/admin/ads/campaigns)',
  })
  @IsOptional() @IsIn(['sponsored', 'commercial']) adFormat?: string;
  @ApiProperty({ example: 'Nike' }) @IsString() @MinLength(1) @MaxLength(200) sponsorName!: string;
  @ApiPropertyOptional({ description: 'Sponsor banner/logo media id' }) @IsOptional() @IsUUID() bannerMediaId?: string;
  @ApiPropertyOptional({ example: 15 }) @IsOptional() @IsInt() @Min(0) adDurationSeconds?: number;
  @ApiPropertyOptional({
    enum: ['pre-roll', 'mid-roll', 'post-roll', 'overlay', 'icon-overlay'],
    description: '`icon-overlay` is accepted as an alias and stored/returned as `overlay`',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (value === 'icon-overlay' ? 'overlay' : value))
  @IsIn(['pre-roll', 'mid-roll', 'post-roll', 'overlay'])
  placement?: string;
  @ApiPropertyOptional({ description: 'Commercial: insert every N videos in the feed' }) @IsOptional() @IsInt() @Min(1) feedFrequency?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) skippableAfterSeconds?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) revenueCents?: number;
  @ApiPropertyOptional({ example: 'USD' }) @IsOptional() @IsString() @MaxLength(3) currency?: string;
  @ApiPropertyOptional({ example: '2026-10-01T00:00:00Z', description: 'Deal start (default now)' })
  @IsOptional() @IsISO8601() startsAt?: string;
  @ApiPropertyOptional({ example: '2026-10-31T00:00:00Z', description: 'Deal end; must be after startsAt' })
  @IsOptional() @IsISO8601() endsAt?: string;
  @ApiPropertyOptional({ minimum: 1, maximum: 3650, description: 'Convenience: endsAt = (startsAt ?? now) + N days (ignored when endsAt is sent)' })
  @IsOptional() @IsInt() @Min(1) @Max(3650) overlayDays?: number;
  @ApiPropertyOptional({ description: 'Video creative for a roll ad (video media id)' }) @IsOptional() @IsUUID() creativeMediaId?: string;
  @ApiPropertyOptional({ example: 'https://nike.com/run' })
  @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) @MaxLength(500) clickUrl?: string;
  @ApiPropertyOptional({ example: 'Shop now' }) @IsOptional() @IsString() @MinLength(1) @MaxLength(40) ctaLabel?: string;
  @ApiPropertyOptional({ description: 'Mid-roll cue point (required for placement=mid-roll)' }) @IsOptional() @IsInt() @Min(0) midRollAtSeconds?: number;
  @ApiPropertyOptional({ description: 'Overlay window start inside the video' }) @IsOptional() @IsInt() @Min(0) overlayStartSeconds?: number;
  @ApiPropertyOptional({ description: 'Overlay window length (default: whole video)' }) @IsOptional() @IsInt() @Min(1) overlayDurationSeconds?: number;
  @ApiPropertyOptional({ description: 'Variable revenue per 1000 impressions (cents)' }) @IsOptional() @IsInt() @Min(0) cpmCents?: number;
  @ApiPropertyOptional({ description: 'Variable revenue per click (cents)' }) @IsOptional() @IsInt() @Min(0) cpcCents?: number;
  @ApiPropertyOptional({ format: 'uuid', description: 'Ad Sales advertiser (default: find-or-create by sponsorName)' })
  @IsOptional() @IsUUID() advertiserId?: string;
  @ApiPropertyOptional({ format: 'uuid', description: 'Ad Sales sponsorship campaign this deal belongs to (same advertiser)' })
  @IsOptional() @IsUUID() campaignId?: string;
}

export class SetRegionsDto {
  @ApiProperty({ enum: REGIONS, isArray: true, example: ['NA', 'EU', 'APAC'], description: 'Macro-regions to publish to' })
  @IsArray()
  @ArrayUnique()
  @IsIn(REGIONS, { each: true })
  regions!: string[];

  @ApiPropertyOptional({ enum: REGIONS, isArray: true, example: ['APAC'], description: 'Selected but switched Off (subset of regions)' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(REGIONS, { each: true })
  offRegions?: string[];
}
