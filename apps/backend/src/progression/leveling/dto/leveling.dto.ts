import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class UpdateLevelingDto {
  @ApiProperty({ minimum: 1, description: 'XP to advance from level 1' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  baseXp!: number;

  @ApiProperty({ minimum: 1, maximum: 5, description: 'Per-level growth factor (>1)' })
  @Type(() => Number)
  @IsNumber()
  @Min(1.01)
  @Max(5)
  growthMultiplier!: number;

  @ApiProperty({ minimum: 1, maximum: 500 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  maxLevelCap!: number;
}

export class LevelDefDto {
  @ApiProperty() level!: number;
  @ApiProperty({ description: 'XP to advance to the next level' }) xpToAdvance!: number;
  @ApiProperty({ description: 'Cumulative XP to reach this level' }) cumulativeToReach!: number;
}

export class LevelingConfigDto {
  @ApiProperty() baseXp!: number;
  @ApiProperty() growthMultiplier!: number;
  @ApiProperty() maxLevelCap!: number;
  @ApiProperty() version!: number;
  @ApiProperty({ type: [LevelDefDto] }) curve!: LevelDefDto[];
}
