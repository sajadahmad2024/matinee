import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: ['guest', 'customer', 'admin'] }) accountType!: string;
  @ApiProperty({ nullable: true }) email!: string | null;
  @ApiProperty({ nullable: true }) phone!: string | null;
  @ApiProperty({ nullable: true }) username!: string | null;
  @ApiProperty({ nullable: true }) firstName!: string | null;
  @ApiProperty({ nullable: true }) lastName!: string | null;
  @ApiProperty({ nullable: true }) gender!: string | null;
  @ApiProperty({ nullable: true }) avatarUrl!: string | null;
  @ApiProperty({ enum: ['active', 'suspended', 'banned', 'disabled'] }) status!: string;
  @ApiProperty() isPhoneVerified!: boolean;
  @ApiProperty() isEmailVerified!: boolean;
  @ApiProperty({ nullable: true }) countryCode!: string | null;
  @ApiProperty({ type: [String] }) roles!: string[];
  @ApiProperty({ type: [String] }) permissions!: string[];
  @ApiProperty() createdAt!: string;
}

export class AuthResponseDto {
  @ApiProperty() accessToken!: string;
  @ApiProperty() refreshToken!: string;
  @ApiProperty({ type: UserResponseDto }) user!: UserResponseDto;
  @ApiProperty() isNewUser!: boolean;
  @ApiProperty({ description: 'true when username is not yet set (show create-account screen)' })
  needsProfile!: boolean;
}

export class OtpDeliveryResponseDto {
  @ApiProperty({ enum: ['sent', 'client_managed'] })
  delivery!: string;

  @ApiProperty({ description: 'Short-lived challenge token — pass it to /auth/phone/verify' })
  otpToken!: string;
}

export class RefreshResponseDto {
  @ApiProperty({ description: 'New access token (mobile). Web receives it as a cookie.' })
  accessToken!: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Logged out' })
  message!: string;
}
