import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { AccessLevel, MediaType, UsageType } from '../constants/media.constant';

const TEN_GB = 10 * 1024 * 1024 * 1024;

export class RequestUploadDto {
  @ApiProperty({ enum: MediaType, description: 'Intrinsic asset kind' })
  @IsEnum(MediaType)
  mediaType!: MediaType;

  @ApiProperty({ enum: UsageType, description: 'What the asset is for (drives default access tier)' })
  @IsEnum(UsageType)
  usageType!: UsageType;

  @ApiProperty({ example: 'trailer-final.mp4' })
  @IsString()
  @MaxLength(500)
  filename!: string;

  @ApiProperty({ example: 'video/mp4' })
  @IsString()
  @MaxLength(150)
  mimeType!: string;

  @ApiProperty({ example: 524288000, description: 'Declared size in bytes' })
  @IsInt()
  @Min(1)
  @Max(TEN_GB)
  sizeBytes!: number;

  @ApiPropertyOptional({ enum: AccessLevel, description: 'Override the default security tier' })
  @IsOptional()
  @IsEnum(AccessLevel)
  accessLevel?: AccessLevel;

  @ApiPropertyOptional({ description: 'Alt text (images, a11y)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  altText?: string;
}
