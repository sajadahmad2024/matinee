import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

const TEN_GB = 10 * 1024 * 1024 * 1024;

export class CompleteUploadDto {
  @ApiPropertyOptional({ description: 'Client-computed checksum (etag/sha256) for integrity/dedupe' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  checksum?: string;

  @ApiPropertyOptional({ description: 'Actual uploaded size in bytes' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(TEN_GB)
  sizeBytes?: number;
}
