import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateRewardRuleDto {
  @ApiPropertyOptional({ maxLength: 150 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Master on/off for this earning rule' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true, description: 'Rule config (amounts, caps, behaviors)' })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class RewardRuleDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: 'shared_content' }) ruleKey!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty() isEnabled!: boolean;
  @ApiProperty({ type: 'object', additionalProperties: true }) config!: unknown;
  @ApiProperty() version!: number;
  @ApiProperty() updatedAt!: string;
}

export class RewardRuleVersionDto {
  @ApiProperty() version!: number;
  @ApiProperty({ type: 'object', additionalProperties: true }) config!: unknown;
  @ApiPropertyOptional({ nullable: true }) changedBy!: string | null;
  @ApiProperty() createdAt!: string;
}

/** Customer-facing "what you can earn" projection (no admin/version fields). */
export class EarnRuleDto {
  @ApiProperty({ example: 'daily_streak' }) ruleKey!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty({ type: 'object', additionalProperties: true }) config!: unknown;
}
