import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
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
  @ApiPropertyOptional({ enum: ['sponsored', 'commercial'], default: 'sponsored' })
  @IsOptional() @IsIn(['sponsored', 'commercial']) adFormat?: string;
  @ApiProperty({ example: 'Nike' }) @IsString() @MinLength(1) @MaxLength(200) sponsorName!: string;
  @ApiPropertyOptional({ description: 'Sponsor banner/logo media id' }) @IsOptional() @IsUUID() bannerMediaId?: string;
  @ApiPropertyOptional({ example: 15 }) @IsOptional() @IsInt() @Min(0) adDurationSeconds?: number;
  @ApiPropertyOptional({ enum: ['pre-roll', 'mid-roll', 'post-roll', 'overlay'] })
  @IsOptional() @IsIn(['pre-roll', 'mid-roll', 'post-roll', 'overlay']) placement?: string;
  @ApiPropertyOptional({ description: 'Commercial: insert every N videos in the feed' }) @IsOptional() @IsInt() @Min(1) feedFrequency?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) skippableAfterSeconds?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) revenueCents?: number;
  @ApiPropertyOptional({ example: 'USD' }) @IsOptional() @IsString() @MaxLength(3) currency?: string;
}

export class SetRegionsDto {
  @ApiProperty({ enum: REGIONS, isArray: true, example: ['NA', 'EU'], description: 'Macro-regions to publish to' })
  @IsArray()
  @ArrayUnique()
  @IsIn(REGIONS, { each: true })
  regions!: string[];
}
