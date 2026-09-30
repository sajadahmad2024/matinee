import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
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
  ValidateIf,
  ValidateNested,
} from 'class-validator';

const TYPES = ['trailer', 'bts', 'clip'];
const TIERS = ['free', 'exclusive'];
const REGIONS = ['global', 'NA', 'EU', 'APAC', 'LATAM', 'MEA'];
const RECS = ['promoted', 'normal', 'deprioritized'];
export const WATCH_PLATFORMS = ['Netflix', 'Prime Video', 'Disney+', 'Apple TV', 'In cinemas', 'Other'];
export const BOOST_CHANNELS = ['homepage', 'notifications', 'regional', 'subscribers'];
export const CAST_ROLES = ['actor', 'director', 'writer', 'producer', 'other'];

export class WatchLinkInputDto {
  @ApiProperty({ enum: WATCH_PLATFORMS })
  @IsIn(WATCH_PLATFORMS)
  platform!: string;

  @ApiPropertyOptional({ maxLength: 60, description: 'Required when platform = Other' })
  @ValidateIf((o: WatchLinkInputDto) => o.platform === 'Other' || o.label !== undefined)
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  label?: string;

  @ApiPropertyOptional({ example: 'https://netflix.com/title/80192098' })
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(500)
  url?: string;
}

export class CastMemberInputDto {
  @ApiProperty({ format: 'uuid', description: 'people.id' }) @IsUUID() personId!: string;
  @ApiPropertyOptional({ enum: CAST_ROLES, default: 'actor' })
  @IsOptional() @IsIn(CAST_ROLES) role?: string;
  @ApiPropertyOptional({ example: 'Tony Stark' }) @IsOptional() @IsString() @MaxLength(200) characterName?: string;
  @ApiPropertyOptional({ minimum: 0, description: 'Lower sorts first; defaults to array order' })
  @IsOptional() @IsInt() @Min(0) billingOrder?: number;
}

export class CreateContentDto {
  @ApiProperty({ example: 'Neon Nights — Official Trailer' })
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ enum: TYPES, default: 'trailer' })
  @IsOptional()
  @IsIn(TYPES)
  contentType?: string;

  @ApiPropertyOptional({ enum: TIERS, default: 'free' })
  @IsOptional()
  @IsIn(TIERS)
  accessTier?: string;

  @ApiPropertyOptional({ description: 'Unlock cost when accessTier=exclusive' })
  @IsOptional()
  @IsInt()
  @Min(0)
  unlockPoints?: number;

  @ApiPropertyOptional({ nullable: true, description: 'Studio id; null clears (update). Use studioName for free text.' })
  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsUUID()
  studioId?: string | null;

  @ApiPropertyOptional({ example: 'Apex Films', description: 'Free-text studio — find-or-create (case-insensitive). Not with studioId.' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  studioName?: string;

  @ApiPropertyOptional({ nullable: true, minimum: 0, maximum: 86400, description: 'Manual duration override; null returns to the video media duration' })
  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsInt()
  @Min(0)
  @Max(86400)
  durationSeconds?: number | null;

  @ApiPropertyOptional({ description: 'HLS video media id' })
  @IsOptional()
  @IsUUID()
  videoMediaId?: string;

  @ApiPropertyOptional({ description: 'Primary thumbnail media id' })
  @IsOptional()
  @IsUUID()
  thumbnailMediaId?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional({ enum: REGIONS, default: 'global' })
  @IsOptional()
  @IsIn(REGIONS)
  rightsRegion?: string;

  @ApiPropertyOptional({ description: 'Primary title (for a BTS/clip)' })
  @IsOptional()
  @IsUUID()
  parentContentId?: string;

  @ApiPropertyOptional({ enum: RECS, default: 'normal' })
  @IsOptional()
  @IsIn(RECS)
  recommendation?: string;

  @ApiPropertyOptional({ type: [String], format: 'uuid', description: 'Full genre set (≤10); replaces when present' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  genreIds?: string[];

  @ApiPropertyOptional({ format: 'uuid', description: 'Must be one of genreIds' })
  @IsOptional()
  @IsUUID()
  primaryGenreId?: string;

  @ApiPropertyOptional({ type: [String], format: 'uuid', description: 'Full tag set (≤30); replaces when present' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ type: [String], example: ['noir', 'heist'], description: 'Free-text tags (≤30) — find-or-create, merged with tagIds' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  // "a, b, ,c".split(',') friendly: entries are trimmed and blanks dropped
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value) ? value.map((v) => (typeof v === 'string' ? v.trim() : v)).filter((v) => v !== '') : value,
  )
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  tagNames?: string[];

  @ApiPropertyOptional({ type: [CastMemberInputDto], description: 'Full cast list (≤100); replaces when present' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CastMemberInputDto)
  cast?: CastMemberInputDto[];

  @ApiPropertyOptional({ type: [WatchLinkInputDto], description: '"Where to watch" CTAs (≤3)' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => WatchLinkInputDto)
  watchLinks?: WatchLinkInputDto[];

  @ApiPropertyOptional({ nullable: true, example: '2026-12-31T00:00:00Z', description: 'End of the live window; null clears' })
  @IsOptional()
  @IsISO8601()
  availableUntil?: string | null;
}

export class UpdateContentDto extends PartialType(CreateContentDto) {}

export class RejectContentDto {
  @ApiProperty({ example: 'Audio out of sync after 0:12' })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export class ScheduleContentDto {
  @ApiProperty({ example: '2026-07-01T09:00:00Z', description: 'Go-live timestamp (ISO, future)' })
  @IsISO8601()
  scheduledAt!: string;
}


export class SetCastDto {
  @ApiProperty({ type: [CastMemberInputDto], description: 'Full replacement cast list (≤100)' })
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CastMemberInputDto)
  cast!: CastMemberInputDto[];
}

export class BoostContentDto {
  @ApiPropertyOptional({ default: true, description: 'true to boost, false to clear every boost field' })
  @IsOptional()
  @IsBoolean()
  boosted?: boolean;

  @ApiPropertyOptional({ minimum: 0, default: 100, description: 'Higher = ranked first in the feed' })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({ description: 'Boost starts at (ISO); default now' })
  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @ApiPropertyOptional({ description: 'Auto-expire boost at (ISO); must be after startsAt' })
  @IsOptional()
  @IsISO8601()
  until?: string;

  @ApiPropertyOptional({ enum: BOOST_CHANNELS, isArray: true, description: 'Empty = everywhere in the feed' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(BOOST_CHANNELS, { each: true })
  channels?: string[];
}
