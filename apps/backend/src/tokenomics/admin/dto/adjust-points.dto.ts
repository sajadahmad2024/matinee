import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsString, MaxLength, MinLength } from 'class-validator';

export class AdjustPointsDto {
  @ApiProperty({ enum: ['points', 'xp'] })
  @IsIn(['points', 'xp'])
  currency!: 'points' | 'xp';

  @ApiProperty({ description: 'Signed delta (e.g. 500 to grant, -200 to deduct)', example: 500 })
  @Type(() => Number)
  @IsInt()
  amount!: number;

  @ApiProperty({ minLength: 3, maxLength: 200, description: 'Audit reason (required)' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  reason!: string;
}

export class AdjustResultDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() balanceAfter!: number;
  @ApiProperty() applied!: boolean;
}
