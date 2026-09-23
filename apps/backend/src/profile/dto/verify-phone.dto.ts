import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

/**
 * Body for updating the customer's phone number.
 *
 * The client runs Firebase Phone Auth, gets a Firebase ID token, and posts it here.
 * The server verifies the token, reads the (already-verified) phone number from the
 * token itself, and writes it to the user. No server-side OTP is sent.
 */
export class UpdatePhoneDto {
  @ApiProperty({ description: 'Firebase ID token from the client-side Firebase Phone Auth flow' })
  @IsString()
  firebaseToken!: string;
}
