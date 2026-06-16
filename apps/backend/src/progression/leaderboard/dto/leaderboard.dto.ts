import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';

export class LeaderboardQueryDto {
  @ApiPropertyOptional({ example: '2026-06', description: 'Month (YYYY-MM); defaults to current' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be YYYY-MM' })
  month?: string;

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

export class LeaderboardRowDto {
  @ApiProperty() rank!: number;
  @ApiProperty() userId!: string;
  @ApiPropertyOptional({ nullable: true }) username!: string | null;
  @ApiPropertyOptional({ nullable: true }) firstName!: string | null;
  @ApiPropertyOptional({ nullable: true }) avatarUrl!: string | null;
  @ApiProperty() xpEarned!: number;
}

export class MyRankDto {
  @ApiProperty() rank!: number;
  @ApiProperty() xpEarned!: number;
}

export class LeaderboardResponseDto {
  @ApiProperty({ example: '2026-06-01' }) periodMonth!: string;
  @ApiProperty({ type: [LeaderboardRowDto] }) items!: LeaderboardRowDto[];
  @ApiProperty({ type: PaginationDetailsDto }) pagination!: PaginationDetailsDto;
  @ApiPropertyOptional({ type: MyRankDto, nullable: true, description: 'Caller’s rank (null if unranked)' })
  myRank!: MyRankDto | null;
}
