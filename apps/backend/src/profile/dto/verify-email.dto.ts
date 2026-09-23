import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class RequestEmailOtpDto {
  @ApiProperty({ example: 'jordan@example.com', description: 'Email to verify (case-insensitive)' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(255)
  email!: string;
}

export class VerifyEmailOtpDto {
  @ApiProperty({ description: 'Short-lived challenge returned by /email/verify/request' })
  @IsString()
  otpToken!: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP the user received' })
  @IsString()
  @MaxLength(8)
  code!: string;
}
