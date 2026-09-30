import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserResponseDto } from '../../dto/auth-responses.dto';

export class AdminSessionResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;

  @ApiPropertyOptional({ description: 'Access token (mobile only; web uses cookies)' })
  accessToken?: string;

  @ApiPropertyOptional({ description: 'Refresh token (mobile only; web uses cookies)' })
  refreshToken?: string;

  @ApiPropertyOptional({
    description:
      'Double-submit CSRF token (web only). Also set as the `csrf` cookie; cross-site frontends must keep it in memory and send it as `x-csrf-token` on mutations.',
  })
  csrfToken?: string;
}
