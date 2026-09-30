import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsIn, IsInt, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export const CONTENT_MEDIA_KINDS = ['thumbnail', 'poster', 'still', 'banner'];

export class AddContentMediaDto {
  @ApiProperty({ format: 'uuid', description: 'Image media id (must exist, not deleted)' })
  @IsUUID()
  mediaId!: string;

  @ApiPropertyOptional({ enum: CONTENT_MEDIA_KINDS, default: 'still' })
  @IsOptional()
  @IsIn(CONTENT_MEDIA_KINDS)
  kind?: string;

  @ApiPropertyOptional({ minimum: 0, description: 'Frame position in the video (auto-thumbnail timecode)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @Max(86400)
  timecodeSeconds?: number;

  @ApiPropertyOptional({ minimum: 0, description: 'Default: end of the list' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class ReorderContentMediaDto {
  @ApiProperty({ type: [String], format: 'uuid', description: 'Media ids in display order (listed first; the rest keep their order after)' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  mediaIds!: string[];
}

export class ContentMediaItemDto {
  @ApiProperty() id!: string;
  @ApiProperty() mediaId!: string;
  @ApiProperty({ enum: CONTENT_MEDIA_KINDS }) kind!: string;
  @ApiProperty() sortOrder!: number;
  @ApiPropertyOptional({ nullable: true }) timecodeSeconds!: number | null;
  @ApiPropertyOptional({ nullable: true, description: 'Public URL when the media is ready + public' }) url!: string | null;
  @ApiProperty() status!: string;
  @ApiPropertyOptional({ nullable: true }) width!: number | null;
  @ApiPropertyOptional({ nullable: true }) height!: number | null;
  @ApiProperty() createdAt!: string;
}
