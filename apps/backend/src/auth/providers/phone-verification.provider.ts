export interface PhoneVerifyInput {
  phone: string;
  code?: string | undefined;
  firebaseToken?: string | undefined;
}

/**
 * Pluggable phone verification. Selected by `PHONE_VERIFICATION_PROVIDER`:
 *  - `twilio`   → backend OTP (otp_codes + SMS)
 *  - `firebase` → client-managed; verify a Firebase ID token
 */
export abstract class PhoneVerificationProvider {
  abstract requestOtp(phone: string): Promise<{ delivery: 'sent' | 'client_managed' }>;
  abstract verify(input: PhoneVerifyInput): Promise<{ phone: string; verified: boolean }>;
}
