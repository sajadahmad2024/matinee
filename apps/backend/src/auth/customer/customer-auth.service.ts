import { EnvConfig } from '@config/env.config';
import { DBService, DBExecutor } from '@db/db.service';
import { CacheService } from '@cache/cache.service';
import { UsersRepository, UserRecord } from '@db/repositories/users/users.repository';
import { IdentityRepository } from '@db/repositories/auth/identity.repository';
import { ReferralRepository } from '@db/repositories/auth/referral.repository';
import { DeviceRepository } from '@db/repositories/auth/device.repository';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

const OTP_COOLDOWN_SECONDS = 45;
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { TokenService } from '../services/token.service';
import { SessionService } from '../services/session.service';
import { PhoneVerificationProvider } from '../providers/phone-verification.provider';
import { GoogleOAuthProvider } from '../providers/social/google-oauth.provider';
import { AppleOAuthProvider } from '../providers/social/apple-oauth.provider';
import { SocialAuthProvider, SocialProfile, SocialProviderName } from '../providers/social/social-auth.types';
import { toUserDto, UserDto } from '../mappers/user.mapper';
import { TokenPair } from '../interfaces/token.interface';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
  isNewUser: boolean;
  needsProfile: boolean;
}

@Injectable()
export class CustomerAuthService {
  private readonly logger = new Logger(CustomerAuthService.name);

  constructor(
    private readonly db: DBService,
    private readonly cache: CacheService,
    private readonly users: UsersRepository,
    private readonly identity: IdentityRepository,
    private readonly referral: ReferralRepository,
    private readonly devices: DeviceRepository,
    private readonly tokens: TokenService,
    private readonly session: SessionService,
    private readonly phoneProvider: PhoneVerificationProvider,
    private readonly google: GoogleOAuthProvider,
    private readonly apple: AppleOAuthProvider,
    private readonly config: ConfigService<EnvConfig>,
  ) {}

  private get refreshTtl(): number {
    return this.config.get<number>('JWT_REFRESH_TTL') ?? 5184000;
  }

  private issueTokens(user: UserRecord): TokenPair {
    // Customers/guests carry no roles or permissions; status travels in the token.
    return this.tokens.buildPair(
      { sub: user.id, act: user.accountType, plt: 'mobile', tv: user.tokenVersion, status: user.status, roles: [], permissions: [] },
      this.refreshTtl,
    );
  }

  private result(user: UserRecord, isNewUser: boolean): AuthResult {
    const pair = this.issueTokens(user);
    return {
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
      user: toUserDto(user),
      isNewUser,
      needsProfile: user.accountType === 'customer' && !user.username,
    };
  }

  // ─── Guest ───────────────────────────────────────────────────────────────────

  async bootstrapGuest(): Promise<AuthResult> {
    const guest = await this.users.createGuest();
    return this.result(guest, true);
  }

  // ─── Phone ─────────────────────────────────────────────────────────────────

  async requestPhoneOtp(phone: string): Promise<{ delivery: 'sent' | 'client_managed'; otpToken: string }> {
    await this.assertOtpCooldown('phone', phone);
    const result = await this.phoneProvider.requestOtp(phone);
    // Bind the verify step to this request: only the holder of this short-lived token can verify.
    const otpToken = this.tokens.signOtpChallenge(phone, 'login');
    return { ...result, otpToken };
  }

  async verifyPhone(input: {
    otpToken: string;
    code?: string | undefined;
    firebaseToken?: string | undefined;
    guestToken?: string | undefined;
  }): Promise<AuthResult> {
    let challenge;
    try {
      challenge = this.tokens.verifyOtpChallenge(input.otpToken);
    } catch {
      throw new UnauthorizedException('OTP session is invalid or expired — request a new code');
    }
    if (challenge.purpose !== 'login') {
      throw new UnauthorizedException('Invalid OTP session');
    }
    // Phone comes from the signed challenge, not the client — can't verify a number you didn't request.
    const { phone } = await this.phoneProvider.verify({
      phone: challenge.destination,
      code: input.code,
      firebaseToken: input.firebaseToken,
    });

    const existing = await this.users.findByPhone(phone);
    if (existing) {
      await this.mergeGuestIfAny(input.guestToken, existing.id);
      await this.users.touchLastLogin(existing.id);
      return this.result(existing, false);
    }

    // New customer: create/upgrade + own referral code in ONE transaction so a
    // signup can never land without its referral code (or vice-versa).
    const guestId = await this.extractGuestId(input.guestToken);
    try {
      const user = await this.db.transaction(async (tx) => {
        const created = guestId
          ? await this.users.upgradeGuestToCustomer(guestId, { phone, primaryAuthMethod: 'phone', isPhoneVerified: true }, tx)
          : await this.users.createCustomer({ phone, primaryAuthMethod: 'phone', isPhoneVerified: true }, tx);
        await this.ensureOwnReferralCode(created.id, tx);
        return created;
      });
      return this.result(user, true);
    } catch (e) {
      // Two concurrent verifications of the same phone raced to the unique index →
      // resolve the now-existing account rather than surfacing a 500.
      if (this.isUniqueViolation(e)) {
        const recovered = await this.users.findByPhone(phone);
        if (recovered) {
          await this.users.touchLastLogin(recovered.id);
          return this.result(recovered, false);
        }
      }
      throw e;
    }
  }

  // ─── Social (Google / Apple — redirect OAuth) ────────────────────────────────

  /** Build the provider consent URL the client is redirected to. */
  getSocialAuthUrl(provider: SocialProviderName, state: string): string {
    return this.providerFor(provider).getAuthorizationUrl(state);
  }

  /** Signed (tamper-proof) OAuth state carrying the guest token + chosen redirect. */
  encodeOAuthState(data: { guestToken?: string | undefined; redirect?: string | undefined }): string {
    return this.tokens.signOAuthState({
      ...(data.guestToken ? { guestToken: data.guestToken } : {}),
      ...(this.isAllowedRedirect(data.redirect) ? { redirect: data.redirect } : {}),
    });
  }

  decodeOAuthState(state?: string): { guestToken?: string | undefined; redirect?: string | undefined } {
    if (!state) {
      return {};
    }
    try {
      return this.tokens.verifyOAuthState(state);
    } catch {
      return {};
    }
  }

  private defaultRedirect(): string {
    return this.config.get<string>('OAUTH_SUCCESS_REDIRECT') || 'maintinee://auth/callback';
  }

  /** Only allow returning tokens to allowlisted redirect targets (prevents open-redirect token exfiltration). */
  private isAllowedRedirect(redirect?: string): boolean {
    if (!redirect) {
      return false;
    }
    const configured = (this.config.get<string>('OAUTH_ALLOWED_REDIRECTS') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const allowed = configured.length ? configured : [this.defaultRedirect()];
    return allowed.some((prefix) => redirect.startsWith(prefix));
  }

  /** Final redirect back to the app (deep link / web) carrying tokens in the URL fragment. */
  buildSuccessRedirect(result: AuthResult, redirect?: string): string {
    const base = this.isAllowedRedirect(redirect) ? (redirect as string) : this.defaultRedirect();
    const fragment = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      isNewUser: String(result.isNewUser),
      needsProfile: String(result.needsProfile),
    });
    return `${base}#${fragment.toString()}`;
  }

  /** Handle the provider callback: exchange the code, then sign in / sign up. */
  async completeSocialLogin(provider: SocialProviderName, code: string, guestToken?: string): Promise<AuthResult> {
    const profile = await this.providerFor(provider).exchangeCode(code);
    if (!profile.providerUserId) {
      throw new UnauthorizedException('Social profile is missing a subject');
    }
    return this.resolveSocialUser(provider, profile, guestToken);
  }

  private providerFor(provider: SocialProviderName): SocialAuthProvider {
    return provider === 'apple' ? this.apple : this.google;
  }

  private async resolveSocialUser(
    provider: SocialProviderName,
    profile: SocialProfile,
    guestToken?: string,
  ): Promise<AuthResult> {
    const existingLink = await this.identity.findOauth(provider, profile.providerUserId);
    if (existingLink) {
      await this.mergeGuestIfAny(guestToken, existingLink.userId);
      const user = await this.users.findById(existingLink.userId);
      if (!user) {
        throw new NotFoundException('Linked account not found');
      }
      await this.users.touchLastLogin(user.id);
      return this.result(user, false);
    }

    // Account-linking by VERIFIED email only: if the provider asserts a verified email
    // that already belongs to a real (non-guest) account, link this provider to it instead
    // of creating a duplicate. An unverified provider email must NEVER auto-link — that
    // would let an attacker who controls an unverified-email social account hijack a
    // victim's account. Admin accounts are never auto-linked from a social login.
    if (profile.email && profile.emailVerified) {
      const byEmail = await this.users.findByEmail(profile.email);
      if (byEmail && byEmail.accountType === 'customer') {
        await this.identity.upsertOauth({
          userId: byEmail.id,
          provider,
          providerUserId: profile.providerUserId,
          email: profile.email,
          rawProfile: { name: profile.name, picture: profile.picture },
        });
        await this.mergeGuestIfAny(guestToken, byEmail.id);
        await this.users.touchLastLogin(byEmail.id);
        return this.result(byEmail, false);
      }
    }

    // Only persist an email on the new account when the provider verified it; otherwise
    // leave it null so a later verified login can still claim/link it.
    const verifiedEmail = profile.email && profile.emailVerified ? profile.email : null;

    // New social identity → create/upgrade + link + referral code, all atomic.
    const guestId = await this.extractGuestId(guestToken);
    try {
      const user = await this.db.transaction(async (tx) => {
        const created = guestId
          ? await this.users.upgradeGuestToCustomer(
              guestId,
              { ...(verifiedEmail ? { email: verifiedEmail } : {}), primaryAuthMethod: provider, isEmailVerified: !!verifiedEmail },
              tx,
            )
          : await this.users.createCustomer(
              { ...(verifiedEmail ? { email: verifiedEmail } : {}), primaryAuthMethod: provider, isEmailVerified: !!verifiedEmail },
              tx,
            );
        await this.identity.upsertOauth(
          { userId: created.id, provider, providerUserId: profile.providerUserId, email: profile.email, rawProfile: { name: profile.name, picture: profile.picture } },
          tx,
        );
        await this.ensureOwnReferralCode(created.id, tx);
        return created;
      });
      return this.result(user, true);
    } catch (e) {
      // A concurrent request for the same provider identity (or verified email) raced us to
      // the unique index → recover by resolving the now-existing account instead of 500ing.
      if (this.isUniqueViolation(e)) {
        const link = await this.identity.findOauth(provider, profile.providerUserId);
        const recovered = link
          ? await this.users.findById(link.userId)
          : verifiedEmail
            ? await this.users.findByEmail(verifiedEmail)
            : null;
        if (recovered) {
          await this.users.touchLastLogin(recovered.id);
          return this.result(recovered, false);
        }
      }
      throw e;
    }
  }

  // ─── Profile completion (username + referral) ────────────────────────────────

  async completeProfile(
    userId: string,
    input: { username: string; referralCode?: string | undefined; gender?: string | undefined; fullName?: string | undefined },
  ): Promise<UserDto> {
    const taken = await this.users.findByUsername(input.username);
    if (taken && taken.id !== userId) {
      throw new ConflictException('Username already taken');
    }

    // Validate the entered referral code BEFORE any write so a bad code can't half-apply.
    let referral: { code: string; referrerId: string } | null = null;
    if (input.referralCode && !(await this.referral.hasRedemption(userId))) {
      const owner = await this.referral.findOwnerByCode(input.referralCode);
      if (!owner) {
        throw new BadRequestException('Invalid referral code');
      }
      if (owner.userId === userId) {
        throw new BadRequestException('You cannot use your own referral code');
      }
      referral = { code: input.referralCode, referrerId: owner.userId };
    }

    const update: Partial<{ username: string; gender: string; firstName: string; lastName: string }> = {
      username: input.username,
    };
    if (input.gender) {
      update.gender = input.gender;
    }
    if (input.fullName) {
      const [first, ...rest] = input.fullName.trim().split(' ');
      update.firstName = first ?? input.fullName;
      if (rest.length) {
        update.lastName = rest.join(' ');
      }
    }

    try {
      const user = await this.db.transaction(async (tx) => {
        const updated = await this.users.updateProfile(userId, update, tx);
        if (!updated) {
          throw new NotFoundException('User not found');
        }
        await this.ensureOwnReferralCode(userId, tx);
        if (referral) {
          await this.referral.createRedemption({ code: referral.code, referrerId: referral.referrerId, refereeId: userId }, tx);
        }
        return updated;
      });
      return toUserDto(user);
    } catch (e) {
      if (this.isUniqueViolation(e)) {
        throw new ConflictException('Username already taken');
      }
      throw e;
    }
  }

  // ─── Session ─────────────────────────────────────────────────────────────────

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    // Re-reads the DB to mint a fresh access token + enforce token_version/status.
    const { accessToken } = await this.session.refresh(refreshToken, 'mobile');
    return { accessToken };
  }

  async logoutAll(userId: string): Promise<void> {
    // Bumping token_version invalidates every outstanding token at next refresh.
    await this.users.bumpTokenVersion(userId);
  }

  async getProfile(userId: string): Promise<UserDto> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return toUserDto(user);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async extractGuestId(guestToken?: string): Promise<string | null> {
    if (!guestToken) {
      return null;
    }
    try {
      const payload = this.tokens.verifyAccess(guestToken);
      return payload.act === 'guest' ? payload.sub : null;
    } catch {
      try {
        const payload = this.tokens.verifyRefresh(guestToken);
        return payload.act === 'guest' ? payload.sub : null;
      } catch {
        return null;
      }
    }
  }

  /** Guest merge — idempotent + atomic. Repoints devices only if this call did the merge. */
  private async mergeGuestIfAny(guestToken: string | undefined, targetUserId: string): Promise<void> {
    const guestId = await this.extractGuestId(guestToken);
    if (!guestId || guestId === targetUserId) {
      return;
    }
    const merged = await this.db.transaction(async (tx) => {
      const ok = await this.users.mergeGuestInto(guestId, targetUserId, tx);
      if (ok) {
        await this.devices.repointUser(guestId, targetUserId, tx);
      }
      return ok;
    });
    if (merged) {
      this.logger.debug(`Merged guest ${guestId} into ${targetUserId}`);
    }
  }

  /** Guarantees a PERSISTED unique referral code (retries on collision); never returns an unsaved code. */
  private async ensureOwnReferralCode(userId: string, tx?: DBExecutor): Promise<string> {
    const existing = await this.referral.findCodeByUser(userId, tx);
    if (existing) {
      return existing;
    }
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = randomBytes(6).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
      if (await this.referral.createCode(userId, code, tx)) {
        return code;
      }
      const concurrent = await this.referral.findCodeByUser(userId, tx);
      if (concurrent) {
        return concurrent;
      }
    }
    throw new ConflictException('Could not allocate a referral code');
  }

  private async assertOtpCooldown(kind: string, destination: string): Promise<void> {
    const key = `otp:cooldown:${kind}:${destination}`;
    if (await this.cache.get<number>(key)) {
      throw new HttpException('Please wait before requesting another code', HttpStatus.TOO_MANY_REQUESTS);
    }
    await this.cache.set(key, 1, OTP_COOLDOWN_SECONDS);
  }

  private isUniqueViolation(e: unknown): boolean {
    const code = (e as { code?: string })?.code ?? (e as { cause?: { code?: string } })?.cause?.code;
    return code === '23505';
  }
}
