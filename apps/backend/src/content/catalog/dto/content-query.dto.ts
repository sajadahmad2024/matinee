import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayUnique, IsBoolean, IsIn, IsInt, IsISO8601, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

const REGIONS = ['NA', 'EU', 'APAC', 'LATAM', 'MEA'];
const STATUSES = ['draft', 'pending_approval', 'scheduled', 'published', 'rejected', 'archived'];
const TYPES = ['trailer', 'bts', 'clip'];
const LICENSE_STATUSES = ['original', 'licensed', 'expiring', 'expired'];
export const CONTENT_SORTS = [
  'newest',
  'oldest',
  'most_viewed',
  'least_viewed',
  'recently_updated',
  'scheduled_asc',
  'license_expiry_asc',
  'title_asc',
] as const;

/** `a,b` (or repeated `?x=a&x=b`) → string[] */
const toCsvArray = ({ value }: { value: unknown }): unknown => {
  if (value === undefined || value === null || value === '') return undefined;
  const parts = (Array.isArray(value) ? value : [value]).flatMap((v) => String(v).split(','));
  return parts.map((p) => p.trim()).filter(Boolean);
};

/** 'true' / 'false' query strings → boolean (anything else stays as-is and fails validation). */
const toBool = ({ value }: { value: unknown }): unknown => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
};

class PageQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}

/** Customer feed query. */
export class FeedQueryDto extends PageQuery {
  @ApiPropertyOptional({ enum: REGIONS, description: "Limit to the viewer's macro-region" })
  @IsOptional()
  @IsIn(REGIONS)
  region?: string;
}

/** Admin content directory query. */
export class ContentListQueryDto extends PageQuery {
  @ApiPropertyOptional({
    description: `Comma-separated statuses (${STATUSES.join(', ')}), e.g. \`published,scheduled\``,
    example: 'published,scheduled',
  })
  @IsOptional()
  @Transform(toCsvArray)
  @ArrayUnique()
  @IsIn(STATUSES, { each: true })
  status?: string[];

  @ApiPropertyOptional({ enum: TYPES })
  @IsOptional()
  @IsIn(TYPES)
  contentType?: string;

  @ApiPropertyOptional({ description: 'Filter by studio id' })
  @IsOptional()
  @IsUUID()
  studioId?: string;

  @ApiPropertyOptional({ description: 'Children (BTS/clips) of this primary title' })
  @IsOptional()
  @IsUUID()
  parentContentId?: string;

  @ApiPropertyOptional({ description: 'false → primary titles only (parent picker); true → children only' })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  hasParent?: boolean;

  @ApiPropertyOptional({ description: 'Search title or studio name (case-insensitive)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({ enum: REGIONS, description: 'Available in this macro-region (live publish region, or global rights)' })
  @IsOptional()
  @IsIn(REGIONS)
  region?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  isBoosted?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  isSponsored?: boolean;

  @ApiPropertyOptional({ description: `Comma-separated license statuses (${LICENSE_STATUSES.join(', ')})` })
  @IsOptional()
  @Transform(toCsvArray)
  @ArrayUnique()
  @IsIn(LICENSE_STATUSES, { each: true })
  licenseStatus?: string[];

  @ApiPropertyOptional({ description: 'Created on/after (ISO)' }) @IsOptional() @IsISO8601() createdFrom?: string;
  @ApiPropertyOptional({ description: 'Created on/before (ISO)' }) @IsOptional() @IsISO8601() createdTo?: string;
  @ApiPropertyOptional({ description: 'Scheduled go-live on/after (ISO)' }) @IsOptional() @IsISO8601() scheduledFrom?: string;
  @ApiPropertyOptional({ description: 'Scheduled go-live on/before (ISO)' }) @IsOptional() @IsISO8601() scheduledTo?: string;
  @ApiPropertyOptional({ description: 'License expires on/after (ISO)' }) @IsOptional() @IsISO8601() licenseExpiresFrom?: string;
  @ApiPropertyOptional({ description: 'License expires on/before (ISO)' }) @IsOptional() @IsISO8601() licenseExpiresTo?: string;

  @ApiPropertyOptional({ enum: CONTENT_SORTS, default: 'newest' })
  @IsOptional()
  @IsIn(CONTENT_SORTS)
  sort?: (typeof CONTENT_SORTS)[number];
}

/** Region-scoped stats query. */
export class ContentStatsQueryDto {
  @ApiPropertyOptional({ enum: REGIONS })
  @IsOptional()
  @IsIn(REGIONS)
  region?: string;
}
