import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

const CURRENCIES = ['points', 'xp'];
const DIRECTIONS = ['earn', 'spend', 'refund', 'purchase', 'adjust'];

/** Shared page/limit base for every paginated list in the profile module. */
export class PageQuery {
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

/** My-Earns ledger query. */
export class EarnsQueryDto extends PageQuery {
  @ApiPropertyOptional({ enum: CURRENCIES, description: 'points (coins) or xp' })
  @IsOptional()
  @IsIn(CURRENCIES)
  currency?: 'points' | 'xp';

  @ApiPropertyOptional({ enum: DIRECTIONS })
  @IsOptional()
  @IsIn(DIRECTIONS)
  direction?: 'earn' | 'spend' | 'refund' | 'purchase' | 'adjust';
}

/** Notifications inbox query. */
export class NotificationsQueryDto extends PageQuery {
  @ApiPropertyOptional({ description: 'Filter by category, e.g. content / game / system' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  category?: string;

  @ApiPropertyOptional({ description: 'Only unread', default: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  unread?: boolean;
}
