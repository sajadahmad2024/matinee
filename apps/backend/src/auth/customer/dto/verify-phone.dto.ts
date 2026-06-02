import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class VerifyPhoneDto {
  @ApiProperty({ description: 'OTP challenge token returned by POST /auth/phone/otp' })
  @IsString()
  otpToken!: string;

  @ApiPropertyOptional({ example: '1234', description: 'OTP code (Twilio path)' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Firebase ID token (Firebase path)' })
  @IsOptional()
  @IsString()
  firebaseToken?: string;

  @ApiPropertyOptional({ description: 'Current guest token to merge/carry over' })
  @IsOptional()
  @IsString()
  guestToken?: string;
}
