import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshDto {
  @ApiPropertyOptional({ description: 'Refresh token (mobile). Web sends it via cookie.' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
