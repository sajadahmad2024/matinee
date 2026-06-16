import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

const INTERVALS = ['monthly', 'yearly'];
const REGIONS = ['NA', 'EU', 'APAC', 'LATAM', 'MEA'];

export class CreatePlanDto {
  @ApiProperty({ maxLength: 150 }) @IsString() @MaxLength(150) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) description?: string;
  @ApiProperty({ minimum: 0, description: 'Base price in cents' }) @Type(() => Number) @IsInt() @Min(0) basePriceCents!: number;
  @ApiPropertyOptional({ default: 'USD' }) @IsOptional() @IsString() @MaxLength(3) baseCurrency?: string;
  @ApiProperty({ enum: INTERVALS }) @IsIn(INTERVALS) interval!: 'monthly' | 'yearly';
  @ApiPropertyOptional({ minimum: 0, default: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) trialDays?: number;
  @ApiPropertyOptional({ type: [String], description: 'Feature bullet list' }) @IsOptional() @IsArray() @IsString({ each: true }) features?: string[];
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() isPopular?: boolean;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) sortOrder?: number;
}

export class UpdatePlanDto {
  @ApiPropertyOptional({ maxLength: 150 }) @IsOptional() @IsString() @MaxLength(150) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) description?: string;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) basePriceCents?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(3) baseCurrency?: string;
  @ApiPropertyOptional({ enum: INTERVALS }) @IsOptional() @IsIn(INTERVALS) interval?: 'monthly' | 'yearly';
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) trialDays?: number;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) features?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPopular?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) sortOrder?: number;
}

export class SetRegionPriceDto {
  @ApiProperty({ enum: REGIONS }) @IsIn(REGIONS) region!: string;
  @ApiProperty({ minimum: 0, description: 'Price in cents for this region' }) @Type(() => Number) @IsInt() @Min(0) priceCents!: number;
  @ApiPropertyOptional({ default: 'USD' }) @IsOptional() @IsString() @MaxLength(3) currency?: string;
}

class RegionPriceDto {
  @ApiProperty() region!: string;
  @ApiProperty() priceCents!: number;
  @ApiProperty() currency!: string;
}

export class PlanDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty() basePriceCents!: number;
  @ApiProperty() baseCurrency!: string;
  @ApiProperty({ enum: INTERVALS }) interval!: string;
  @ApiProperty() trialDays!: number;
  @ApiProperty({ type: [String] }) features!: unknown;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() isPopular!: boolean;
  @ApiProperty() sortOrder!: number;
}

export class CustomerPlanDto extends PlanDto {
  @ApiProperty({ description: "Price resolved for the caller's region" })
  price!: { priceCents: number; currency: string; region: string | null };
}

export class AdminPlanDto extends PlanDto {
  @ApiProperty({ type: [RegionPriceDto] }) regionPrices!: RegionPriceDto[];
}

/** Result of upserting a region price for a plan. */
export class RegionPriceResultDto {
  @ApiProperty({ enum: REGIONS }) region!: string;
  @ApiProperty() priceCents!: number;
  @ApiProperty() currency!: string;
}
