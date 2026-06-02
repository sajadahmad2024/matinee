import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

const E164 = /^\+[1-9]\d{6,14}$/;

export class RequestPhoneOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'Phone number in E.164 format' })
  @IsString()
  @Matches(E164, { message: 'phone must be in E.164 format (e.g. +919876543210)' })
  phone!: string;
}
