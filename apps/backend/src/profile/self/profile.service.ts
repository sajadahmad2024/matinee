import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { CacheService } from '@cache/cache.service';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import {
  ProfileRecord,
  ProfileRepository,
  ProfileUpdate,
  StreakRecord,
} from '@db/repositories/users/profile.repository';
import { WalletRepository, WalletView } from '@db/repositories/tokenomics/wallet.repository';
import { LedgerEntry, LedgerRepository } from '@db/repositories/tokenomics/ledger.repository';
import { NotificationRepository } from '@db/repositories/notifications/notification.repository';
import { ReferralRepository } from '@db/repositories/auth/referral.repository';
import { ActiveSubscription, SubscriptionRepository } from '@db/repositories/subscriptions/subscription.repository';
import { LeaderboardRepository, MyRank } from '@db/repositories/progression/leaderboard.repository';
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
    private readonly wallets: WalletRepository,
    private readonly ledger: LedgerRepository,
    private readonly notifications: NotificationRepository,
    private readonly referral: ReferralRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly leaderboard: LeaderboardRepository,
    private readonly cache: CacheService,
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
