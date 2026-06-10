import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseAdminService } from '../services/firebase-admin.service';
import { PhoneVerificationProvider, PhoneVerifyInput } from './phone-verification.provider';

/** Firebase Phone Auth: the client obtains the OTP; we verify the Firebase ID token. */
@Injectable()
export class FirebasePhoneProvider extends PhoneVerificationProvider {
  constructor(private readonly firebase: FirebaseAdminService) {
    super();
  }

  async requestOtp(): Promise<{ delivery: 'client_managed' }> {
    // The Firebase client SDK sends the OTP; nothing to do server-side.
    return { delivery: 'client_managed' };
  }

  async verify(input: PhoneVerifyInput): Promise<{ phone: string; verified: boolean }> {
    if (!input.firebaseToken) {
      throw new BadRequestException('firebaseToken is required');
    }
    const identity = await this.firebase.verifyIdToken(input.firebaseToken);
    if (!identity.phone) {
      throw new UnauthorizedException('Firebase token has no verified phone number');
    }
    if (input.phone && input.phone !== identity.phone) {
      throw new UnauthorizedException('Phone does not match the verified token');
    }
    return { phone: identity.phone, verified: true };
  }
}
