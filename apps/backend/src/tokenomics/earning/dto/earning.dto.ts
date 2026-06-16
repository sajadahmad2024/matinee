import { ApiProperty } from '@nestjs/swagger';

export class DailyLoginResultDto {
  @ApiProperty({ description: 'Points credited (0 if already claimed today)' }) points!: number;
  @ApiProperty({ description: 'XP credited (0 if already claimed today)' }) xp!: number;
  @ApiProperty({ description: 'True if the bonus was already claimed today' }) alreadyClaimed!: boolean;
}
