import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

const TYPES = ['trailer', 'bts', 'clip'];
const TIERS = ['free', 'exclusive'];
const REGIONS = ['global', 'NA', 'EU', 'APAC', 'LATAM', 'MEA'];
const RECS = ['promoted', 'normal', 'deprioritized'];

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studioId?: string;

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
}

export class UpdateContentDto extends PartialType(CreateContentDto) {
  @ApiPropertyOptional({ enum: RECS })
  @IsOptional()
  @IsIn(RECS)
  recommendation?: string;
}

export class RejectContentDto {
  @ApiProperty({ example: 'Audio out of sync after 0:12' })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export class ScheduleContentDto {
  @ApiProperty({ example: '2026-07-01T09:00:00Z', description: 'Go-live timestamp (ISO)' })
  @IsString()
  scheduledAt!: string;
}

export class CastMemberInputDto {
  @ApiProperty({ format: 'uuid', description: 'people.id' }) @IsUUID() personId!: string;
  @ApiPropertyOptional({ enum: ['actor', 'director', 'writer', 'producer', 'other'], default: 'actor' })
  @IsOptional() @IsIn(['actor', 'director', 'writer', 'producer', 'other']) role?: string;
  @ApiPropertyOptional({ example: 'Tony Stark' }) @IsOptional() @IsString() @MaxLength(200) characterName?: string;
  @ApiPropertyOptional({ minimum: 0, description: 'Lower sorts first; defaults to array order' })
  @IsOptional() @IsInt() @Min(0) billingOrder?: number;
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
  @ApiPropertyOptional({ default: true, description: 'true to boost, false to clear' })
  @IsOptional()
  boosted?: boolean;
  @ApiPropertyOptional({ minimum: 0, default: 100, description: 'Higher = ranked first in the feed' })
  @IsOptional()
  @IsInt()
  priority?: number;
  @ApiPropertyOptional({ description: 'Auto-expire boost at (ISO)' })
  @IsOptional()
  @IsString()
  until?: string;
}
