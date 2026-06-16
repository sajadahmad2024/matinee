import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeviceResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: ['ios', 'android', 'web'] }) platform!: string;
  @ApiProperty({ type: [String] }) topics!: string[];
}

export class DeviceListItemDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: ['ios', 'android', 'web'] }) platform!: string;
  @ApiPropertyOptional({ nullable: true }) deviceId!: string | null;
  @ApiPropertyOptional({ nullable: true }) appVersion!: string | null;
  @ApiProperty() isActive!: boolean;
  @ApiPropertyOptional({ nullable: true }) lastSeenAt!: string | null;
  @ApiProperty() createdAt!: string;
}
