import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsISO8601, IsInt, IsOptional, IsString, IsUUID, Min, MaxLength } from 'class-validator';

const CATEGORIES = ['experience', 'merch', 'perk', 'content', 'voucher'];
const REGIONS = ['NA', 'EU', 'APAC', 'LATAM', 'MEA'];

export class CatalogQueryDto {
  @ApiPropertyOptional({ enum: CATEGORIES })
  @IsOptional()
  @IsIn(CATEGORIES)
  category?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit = 20;
}

export class CreateCatalogItemDto {
  @ApiProperty({ maxLength: 200 }) @IsString() @MaxLength(200) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ enum: CATEGORIES }) @IsIn(CATEGORIES) category!: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() imageMediaId?: string;
  @ApiProperty({ minimum: 1, description: 'Points cost to redeem' }) @Type(() => Number) @IsInt() @Min(1) costPoints!: number;
  @ApiPropertyOptional({ minimum: 0, description: 'Total stock (omit for unlimited)' }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) stockTotal?: number;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() requiresSubscription?: boolean;
  @ApiPropertyOptional({ enum: REGIONS, description: 'Region-lock (omit = global)' }) @IsOptional() @IsIn(REGIONS) region?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() startsAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() endsAt?: string;
}

export class UpdateCatalogItemDto {
  @ApiPropertyOptional({ maxLength: 200 }) @IsOptional() @IsString() @MaxLength(200) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: CATEGORIES }) @IsOptional() @IsIn(CATEGORIES) category?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() imageMediaId?: string;
  @ApiPropertyOptional({ minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) costPoints?: number;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) stockTotal?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() requiresSubscription?: boolean;
  @ApiPropertyOptional({ enum: REGIONS }) @IsOptional() @IsIn(REGIONS) region?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() startsAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() endsAt?: string;
}

export class CatalogItemDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty() category!: string;
  @ApiPropertyOptional({ nullable: true }) imageMediaId!: string | null;
  @ApiProperty() costPoints!: number;
  @ApiPropertyOptional({ nullable: true }) stockTotal!: number | null;
  @ApiPropertyOptional({ nullable: true }) stockRemaining!: number | null;
  @ApiProperty() requiresSubscription!: boolean;
  @ApiPropertyOptional({ nullable: true }) region!: string | null;
  @ApiProperty() isActive!: boolean;
  @ApiPropertyOptional({ nullable: true }) startsAt!: string | null;
  @ApiPropertyOptional({ nullable: true }) endsAt!: string | null;
}
