import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { users, userStreaks } from '@db/drizzle/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';

/** The editable + displayable profile view of a user (richer than the auth UserRecord). */
export interface ProfileRecord {
  id: string;
  accountType: string;
  email: string | null;
  phone: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  gender: string | null;
  avatarUrl: string | null;
  avatarMediaId: string | null;
  countryCode: string | null;
  region: string | null;
  timezone: string | null;
  status: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
}

export interface StreakRecord {
  currentStreak: number;
  longestStreak: number;
  totalQualifiedDays: number;
  lastQualifiedDate: string | null;
}

/** Editable profile fields (everything here is user-settable on the Edit-profile screen). */
export type ProfileUpdate = Partial<{
  firstName: string;
  lastName: string;
  bio: string;
  gender: string;
  avatarUrl: string;
  avatarMediaId: string;
  countryCode: string;
  timezone: string;
  // identity (handled specially by the service — setting/changing email resets verification)
  email: string;
  isEmailVerified: boolean;
}>;

@Injectable()
export class ProfileRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  async getProfile(userId: string, tx?: DBExecutor): Promise<ProfileRecord | null> {
    const rows = await this.exec(tx)
      .select()
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);
    return this.map(rows[0]);
  }

  /** Update only the provided editable fields; returns the fresh profile (or null if gone). */
  async updateProfile(userId: string, data: ProfileUpdate, tx?: DBExecutor): Promise<ProfileRecord | null> {
    if (Object.keys(data).length > 0) {
      await this.exec(tx)
        .update(users)
        .set({ ...data, updatedAt: sql`now()` })
        .where(and(eq(users.id, userId), isNull(users.deletedAt)));
    }
    return this.getProfile(userId, tx);
  }

  async getStreak(userId: string, tx?: DBExecutor): Promise<StreakRecord | null> {
    const rows = await this.exec(tx)
      .select({
        currentStreak: userStreaks.currentStreak,
        longestStreak: userStreaks.longestStreak,
        totalQualifiedDays: userStreaks.totalQualifiedDays,
        lastQualifiedDate: userStreaks.lastQualifiedDate,
      })
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId))
      .limit(1);
    return rows[0] ?? null;
  }

  private map(row: typeof users.$inferSelect | undefined): ProfileRecord | null {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      accountType: row.accountType,
      email: row.email,
      phone: row.phone,
      username: row.username,
      firstName: row.firstName,
      lastName: row.lastName,
      bio: row.bio,
      gender: row.gender,
      avatarUrl: row.avatarUrl,
      avatarMediaId: row.avatarMediaId,
      countryCode: row.countryCode,
      region: row.region,
      timezone: row.timezone,
      status: row.status,
      isEmailVerified: row.isEmailVerified,
      isPhoneVerified: row.isPhoneVerified,
      createdAt: row.createdAt,
    };
  }
}
