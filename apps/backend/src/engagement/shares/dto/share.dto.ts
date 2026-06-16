import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

const CHANNELS = ['whatsapp', 'instagram', 'facebook', 'x', 'telegram', 'copy_link', 'other'];

export class ShareContentDto {
  @ApiPropertyOptional({ enum: CHANNELS, description: 'Where it was shared (optional)' })
  @IsOptional()
  @IsIn(CHANNELS)
  channel?: string;
}

export class ShareResultDto {
  @ApiProperty({ format: 'uuid' }) shareId!: string;
  @ApiProperty() shareCount!: number;
}
