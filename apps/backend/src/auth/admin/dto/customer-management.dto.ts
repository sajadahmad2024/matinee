import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminUpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;
}

export class SuspendUserDto {
  @ApiProperty({ example: 'Spam / abuse' })
  @IsString()
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional({ description: 'ISO8601; omit for indefinite suspension', example: '2026-07-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  until?: string;
}

export class BanUserDto {
  @ApiProperty({ example: 'Repeated violations' })
  @IsString()
  @MaxLength(500)
  reason!: string;
}

export class ReinstateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
