import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { randomBytes, randomInt } from 'crypto';
import { CacheService } from '@cache/cache.service';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import { HashingService } from '@common/hashing/hashing.service';
import {
  ProfileRecord,
  ProfileRepository,
  ProfileUpdate,
  StreakRecord,
} from '@db/repositories/users/profile.repository';
import { UsersRepository } from '@db/repositories/users/users.repository';
import { IdentityRepository } from '@db/repositories/auth/identity.repository';
import { DBService } from '@db/db.service';
import { WalletRepository, WalletView } from '@db/repositories/tokenomics/wallet.repository';
import { LedgerEntry, LedgerRepository } from '@db/repositories/tokenomics/ledger.repository';
import { NotificationRepository } from '@db/repositories/notifications/notification.repository';
import { ReferralRepository } from '@db/repositories/auth/referral.repository';
import { ActiveSubscription, SubscriptionRepository } from '@db/repositories/subscriptions/subscription.repository';
import { LeaderboardRepository, MyRank } from '@db/repositories/progression/leaderboard.repository';
import { TokenService } from '@auth/services/token.service';
import { QueueService } from '@queue/queue.service';
import { JobName, QueueName } from '@queue/queue.constant';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { EarnsQueryDto } from '../dto/profile-query.dto';

const EMPTY_STREAK: StreakRecord = {
  currentStreak: 0,
  longestStreak: 0,
  totalQualifiedDays: 0,
  lastQualifiedDate: null,
};

const PROFILE_TTL = 300; // identity changes rarely; busted on edit
const EDITABLE_KEYS = [
  'firstName',
  'lastName',
  'bio',
  'gender',
  'avatarMediaId',
  'avatarUrl',
  'countryCode',
  'timezone',
] as const;

@Injectable()
export class ProfileService {
  constructor(
    private readonly profiles: ProfileRepository,
    private readonly users: UsersRepository,
    private readonly identity: IdentityRepository,
    private readonly wallets: WalletRepository,
    private readonly ledger: LedgerRepository,
    private readonly notifications: NotificationRepository,
    private readonly referral: ReferralRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly leaderboard: LeaderboardRepository,
    private readonly cache: CacheService,
    private readonly hashing: HashingService,
    private readonly tokens: TokenService,
    private readonly queue: QueueService,
    private readonly db: DBService,
  ) {}

  /** Current leaderboard period key ('YYYY-MM-01'). */
  private currentPeriod(): string {
    return `${new Date().toISOString().slice(0, 7)}-01`;
  }

  /** Per-user cache tag — busted whenever the profile is edited. */
  private tag(userId: string): string {
    return `profile:${userId}`;
  }

  private paginate(total: number, page: number, limit: number): PaginationDetailsDto {
    return { pageNo: page, pageSize: limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  /** Cached identity read (busted on edit). Throws if the user is gone. */
  getProfile(userId: string): Promise<ProfileRecord> {
    return this.cache.getOrSetTagged(`profile:detail:${userId}`, [this.tag(userId)], PROFILE_TTL, async () => {
      const p = await this.profiles.getProfile(userId);
      if (!p) {
        throw new NotFoundException('Profile not found');
      }
      return p;
    });
  }

  /** Everything the Profile screen header needs in one call (wallet/streak/subs are fresh). */
  async getProfileScreen(userId: string): Promise<{
    profile: ProfileRecord;
    wallet: WalletView;
    streak: StreakRecord;
    subscription: ActiveSubscription | null;
    unreadNotifications: number;
  }> {
    const [profile, wallet, streak, subscription, unreadNotifications] = await Promise.all([
      this.getProfile(userId),
      this.wallets.getByUserId(userId),
      this.profiles.getStreak(userId),
      this.subscriptions.getActiveForUser(userId),
      this.notifications.unreadCount(userId),
    ]);
    return { profile, wallet, streak: streak ?? EMPTY_STREAK, subscription, unreadNotifications };
  }

  /**
   * App-open bootstrap — the single "get me" payload: the profile screen plus a computed access
   * block (subscription-based) the client uses to gate premium. One call on launch.
   */
  async getBootstrap(userId: string): Promise<{
    profile: ProfileRecord;
    wallet: WalletView;
    streak: StreakRecord;
    subscription: ActiveSubscription | null;
    unreadNotifications: number;
    leaderboard: MyRank | null;
    access: { isSubscribed: boolean; tier: 'free' | 'premium'; planName: string | null };
  }> {
    const [screen, leaderboard] = await Promise.all([
      this.getProfileScreen(userId),
      this.leaderboard.getMyRank(this.currentPeriod(), userId),
    ]);
    const isSubscribed = screen.subscription != null;
    return {
      ...screen,
      leaderboard,
      access: {
        isSubscribed,
        tier: isSubscribed ? 'premium' : 'free',
        planName: screen.subscription?.planName ?? null,
      },
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<ProfileRecord> {
    const data: ProfileUpdate = {};
    const src = dto as Record<string, unknown>;
    for (const k of EDITABLE_KEYS) {
      const v = src[k];
      if (v !== undefined) {
        (data as Record<string, unknown>)[k] = v;
      }
    }
    // Email is identity: only write when it actually changes, and reset verification so the
    // user must confirm the new address. Unique-violation → 409.
    if (dto.email !== undefined) {
      const current = await this.getProfile(userId);
      if (dto.email !== current.email) {
        data.email = dto.email;
        data.isEmailVerified = false;
      }
    }
    let updated: ProfileRecord | null;
    try {
      updated = await this.profiles.updateProfile(userId, data);
    } catch (e) {
      const code = (e as { code?: string })?.code ?? (e as { cause?: { code?: string } })?.cause?.code;
      if (code === '23505') {
        throw new ConflictException('That email is already in use');
      }
      throw e;
    }
    if (!updated) {
      throw new NotFoundException('Profile not found');
    }
    await this.cache.invalidateTag(this.tag(userId));
    return updated;
  }

  // ─── Email verification (temp-token flow) ───────────────────────────────────────
  //
  // Two-step:
  //   1. requestEmailVerification (needs Bearer) — validates email is free, mints OTP,
  //      enqueues an email job, returns a SIGNED CHALLENGE JWT (otpToken) binding
  //      { email, userId, purpose: 'email_verification' }, 10-min TTL.
  //   2. confirmEmailVerification (Public — no Bearer) — verifies the challenge JWT,
  //      looks up the hashed code in `otp_codes`, compares, and (on match) atomically
  //      writes users.email + isEmailVerified=true. Uses the userId embedded in the JWT
  //      so the flow keeps working even if the caller's session expired mid-way.
  //
  // Nothing is written to users.email on step 1 — a typo can't leave the account with a
  // broken contact address. Only a successful step 2 mutates the row.

  /** Send a 6-digit OTP to the given email. Nothing is written to `users.email` until the
   *  user confirms the code — a typo can't leave the account with a broken contact address.
   *  The returned `otpToken` binds this challenge to (email, userId) so /confirm needs no Bearer. */
  async requestEmailVerification(userId: string, email: string): Promise<{ otpToken: string; delivery: 'sent' }> {
    const existing = await this.users.findByEmail(email);
    if (existing && existing.id !== userId) {
      throw new ConflictException('That email is already in use');
    }
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const codeHash = await this.hashing.hash(code);
    await this.identity.createOtp({
      userId,
      destination: email,
      channel: 'email',
      purpose: 'email_verification',
      codeHash,
      expiresInSeconds: 10 * 60,
    });
    await this.queue.send(QueueName.EMAIL, JobName.OTP_EMAIL, { email, otp: Number(code) });
    const otpToken = this.tokens.signOtpChallenge(email, 'email_verification', userId);
    return { otpToken, delivery: 'sent' };
  }

  /** Confirm the OTP → atomically set `users.email` + `isEmailVerified=true`.
   *  Auth here is the otpToken itself (holds `sub`) — no Bearer required. */
  async confirmEmailVerification(otpToken: string, code: string): Promise<ProfileRecord> {
    let challenge;
    try {
      challenge = this.tokens.verifyOtpChallenge(otpToken);
    } catch {
      throw new UnauthorizedException('Verification session is invalid or expired — request a new code');
    }
    if (challenge.purpose !== 'email_verification' || !challenge.sub) {
      throw new UnauthorizedException('Invalid verification session');
    }
    const userId = challenge.sub;
    const email = challenge.destination;
    // Scope by userId as well as destination: defence-in-depth against another user having
    // created an OTP for the same email in the narrow window before the uniqueness check.
    const otp = await this.identity.findActiveOtp(email, 'email_verification', { userId });
    if (!otp) {
      throw new UnauthorizedException('No active verification code — request a new one');
    }
    if (otp.attempts >= otp.maxAttempts) {
      throw new UnauthorizedException('Too many attempts — request a new code');
    }
    const ok = await this.hashing.compare(code, otp.codeHash);
    if (!ok) {
      await this.identity.incrementOtpAttempts(otp.id);
      throw new UnauthorizedException('Incorrect code');
    }
    // Consume + write email atomically: if the profile update fails, the OTP stays valid
    // and the user isn't forced to request a fresh code.
    const updated = await this.db.transaction(async (tx) => {
      const conflict = await this.users.findByEmail(email, tx);
      if (conflict && conflict.id !== userId) {
        throw new ConflictException('That email is already in use');
      }
      await this.identity.consumeOtp(otp.id, tx);
      const row = await this.profiles.updateProfile(userId, { email, isEmailVerified: true }, tx);
      if (!row) {
        throw new NotFoundException('Profile not found');
      }
      return row;
    });
    await this.cache.invalidateTag(this.tag(userId));
    return updated;
  }

  /** Wallet balances + level — always fresh (money-like; never served stale). */
  getWallet(userId: string): Promise<WalletView> {
    return this.wallets.getByUserId(userId);
  }

  /** Paginated earn/spend history — always fresh. */
  async getEarns(userId: string, query: EarnsQueryDto): Promise<{ items: LedgerEntry[]; pagination: PaginationDetailsDto }> {
    const { items, total } = await this.ledger.listByUser(userId, {
      page: query.page,
      limit: query.limit,
      ...(query.currency ? { currency: query.currency } : {}),
      ...(query.direction ? { direction: query.direction } : {}),
    });
    return { items, pagination: this.paginate(total, query.page, query.limit) };
  }

  /** My referral code (lazily minted if missing) + completed-referral count. */
  async getReferral(userId: string): Promise<{ code: string; completedReferrals: number }> {
    let code = await this.referral.findCodeByUser(userId);
    if (!code) {
      code = await this.mintReferralCode(userId);
    }
    const completedReferrals = await this.referral.countCompletedByReferrer(userId);
    return { code, completedReferrals };
  }

  private async mintReferralCode(userId: string): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = randomBytes(6).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
      if (await this.referral.createCode(userId, candidate)) {
        return candidate;
      }
      // Conflict: either the code collided or this user already has one — re-check.
      const existing = await this.referral.findCodeByUser(userId);
      if (existing) {
        return existing;
      }
    }
    // Extremely unlikely; surface as the existing code if a concurrent writer won.
    const fallback = await this.referral.findCodeByUser(userId);
    if (!fallback) {
      throw new NotFoundException('Could not allocate a referral code');
    }
    return fallback;
  }
}
