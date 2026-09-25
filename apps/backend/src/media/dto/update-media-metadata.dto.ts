import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { MAX_DIMENSION, MAX_DURATION_SECONDS } from './complete-upload.dto';

/** Admin override of probed/transcoded metadata. `null` clears a field. */
export class UpdateMediaMetadataDto {
  @ApiPropertyOptional({ nullable: true, example: 142.5 })
  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(MAX_DURATION_SECONDS)
  durationSeconds?: number | null;

  @ApiPropertyOptional({ nullable: true, example: 1920 })
  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsInt()
  @Min(1)
  @Max(MAX_DIMENSION)
  width?: number | null;

  @ApiPropertyOptional({ nullable: true, example: 1080 })
  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsInt()
  @Min(1)
  @Max(MAX_DIMENSION)
  height?: number | null;

  @ApiPropertyOptional({ nullable: true, maxLength: 500 })
  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @MaxLength(500)
  altText?: string | null;
}
