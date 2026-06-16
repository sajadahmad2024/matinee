import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

const REGIONS = ['NA', 'EU', 'APAC', 'LATAM', 'MEA'];
const STATUSES = ['draft', 'pending_approval', 'scheduled', 'published', 'rejected', 'archived'];
const TYPES = ['trailer', 'bts', 'clip'];

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
  @ApiPropertyOptional({ enum: STATUSES })
  @IsOptional()
  @IsIn(STATUSES)
  status?: string;

  @ApiPropertyOptional({ enum: TYPES })
  @IsOptional()
  @IsIn(TYPES)
  contentType?: string;

  @ApiPropertyOptional({ description: 'Filter by studio id' })
  @IsOptional()
  @IsUUID()
  studioId?: string;

  @ApiPropertyOptional({ description: 'Search by title' })
  @IsOptional()
  @IsString()
  q?: string;
}
