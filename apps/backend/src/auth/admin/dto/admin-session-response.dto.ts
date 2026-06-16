import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserResponseDto } from '../../dto/auth-responses.dto';

export class AdminSessionResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;

  @ApiPropertyOptional({ description: 'Access token (mobile only; web uses cookies)' })
  accessToken?: string;

  @ApiPropertyOptional({ description: 'Refresh token (mobile only; web uses cookies)' })
  refreshToken?: string;
}
