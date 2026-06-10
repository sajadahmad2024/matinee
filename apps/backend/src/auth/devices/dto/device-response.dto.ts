import { ApiProperty } from '@nestjs/swagger';

export class DeviceResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: ['ios', 'android', 'web'] }) platform!: string;
  @ApiProperty({ type: [String] }) topics!: string[];
}
