import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

const TEN_GB = 10 * 1024 * 1024 * 1024;
export const MAX_DURATION_SECONDS = 86_400;
export const MAX_DIMENSION = 16_384;

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

  @ApiPropertyOptional({ example: 142.52, description: 'Client-probed duration (videos/audio). Fills only empty columns.' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @Max(MAX_DURATION_SECONDS)
  durationSeconds?: number;

  @ApiPropertyOptional({ example: 1080, description: 'Client-probed width in px' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_DIMENSION)
  width?: number;

  @ApiPropertyOptional({ example: 1920, description: 'Client-probed height in px' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_DIMENSION)
  height?: number;
}
