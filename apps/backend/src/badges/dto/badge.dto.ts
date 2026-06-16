import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

const OPERATORS = ['gt', 'gte', 'eq', 'lt', 'lte'];

export class CreateBadgeDto {
  @ApiProperty({ maxLength: 150 }) @IsString() @MaxLength(150) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ description: 'badge_trigger key (e.g. watch_streak_days)' }) @IsString() @MaxLength(50) triggerKey!: string;
  @ApiProperty({ enum: OPERATORS }) @IsIn(OPERATORS) operator!: 'gt' | 'gte' | 'eq' | 'lt' | 'lte';
  @ApiProperty({ description: 'Threshold the metric is compared against' }) @Type(() => Number) @IsNumber() threshold!: number;
  @ApiPropertyOptional({ minimum: 0, default: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) rewardPoints?: number;
  @ApiPropertyOptional({ minimum: 0, default: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) rewardXp?: number;
}

export class UpdateBadgeDto {
  @ApiPropertyOptional({ maxLength: 150 }) @IsOptional() @IsString() @MaxLength(150) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) triggerKey?: string;
  @ApiPropertyOptional({ enum: OPERATORS }) @IsOptional() @IsIn(OPERATORS) operator?: 'gt' | 'gte' | 'eq' | 'lt' | 'lte';
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() threshold?: number;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) rewardPoints?: number;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) rewardXp?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class BadgeDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty() triggerKey!: string;
  @ApiProperty() operator!: string;
  @ApiProperty() threshold!: number;
  @ApiProperty() rewardPoints!: number;
  @ApiProperty() rewardXp!: number;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() earnedCount!: number;
}

export class CustomerBadgeDto extends BadgeDto {
  @ApiProperty({ description: 'Whether the caller has earned this badge' }) earned!: boolean;
}

export class EarnedBadgeDto extends BadgeDto {
  @ApiProperty() earnedAt!: string;
}

export class BadgeTriggerDto {
  @ApiProperty() key!: string;
  @ApiProperty() label!: string;
  @ApiPropertyOptional({ nullable: true }) unit!: string | null;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
}
