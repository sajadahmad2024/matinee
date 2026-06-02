import { ConflictException, Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { users } from '@db/drizzle/schema';
import { and, eq, isNull, sql, count, desc, ilike, or } from 'drizzle-orm';
import { AccountType } from '@auth/interfaces/jwt-payload.interface';
import { AccountStatus } from '@auth/interfaces/auth-context.interface';

/** A row of the `users` table as used by the auth/identity layer. */
export interface UserRecord {
  id: string;
  accountType: AccountType;
  email: string | null;
  passwordHash: string | null;
  phone: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  avatarUrl: string | null;
  primaryAuthMethod: string | null;
  countryCode: string | null;
  tokenVersion: number;
  status: AccountStatus;
  suspendedUntil: string | null;
  statusReason: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface CreateAdminInput {
  email: string;
  passwordHash: string | null;
  firstName?: string | undefined;
  lastName?: string | undefined;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  // ─── Lookups ────────────────────────────────────────────────────────────────

  async findById(id: string, tx?: DBExecutor): Promise<UserRecord | null> {
    const rows = await this.exec(tx)
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)));
    return this.map(rows[0]);
  }

  async findByPhone(phone: string, tx?: DBExecutor): Promise<UserRecord | null> {
    const rows = await this.exec(tx)
      .select()
      .from(users)
      .where(and(eq(users.phone, phone), isNull(users.deletedAt)));
    return this.map(rows[0]);
  }

  async findByEmail(email: string, tx?: DBExecutor): Promise<UserRecord | null> {
    const rows = await this.exec(tx)
      .select()
      .from(users)
      .where(and(sql`lower(${users.email}) = ${email.toLowerCase()}`, isNull(users.deletedAt)));
    return this.map(rows[0]);
  }

  async findByUsername(username: string, tx?: DBExecutor): Promise<UserRecord | null> {
    const rows = await this.exec(tx)
      .select()
      .from(users)
      .where(and(sql`lower(${users.username}) = ${username.toLowerCase()}`, isNull(users.deletedAt)));
    return this.map(rows[0]);
  }

  // ─── Creation / lifecycle ────────────────────────────────────────────────────

  async createGuest(tx?: DBExecutor): Promise<UserRecord> {
    const rows = await this.exec(tx).insert(users).values({ accountType: 'guest' }).returning();
    return this.map(rows[0])!;
  }

  /** Turn an existing guest row into a customer in place (preserves id/engagement).
   *  Guarded to `accountType = 'guest'` so an already-upgraded customer/admin can never be
   *  silently mutated by a replayed/forged guest token. */
  async upgradeGuestToCustomer(
    id: string,
    data: { phone?: string; email?: string; primaryAuthMethod: string; isPhoneVerified?: boolean; isEmailVerified?: boolean },
    tx?: DBExecutor,
  ): Promise<UserRecord> {
    const rows = await this.exec(tx)
      .update(users)
      .set({
        accountType: 'customer',
        ...(data.phone ? { phone: data.phone, isPhoneVerified: data.isPhoneVerified ?? true } : {}),
        ...(data.email ? { email: data.email, isEmailVerified: data.isEmailVerified ?? false } : {}),
        primaryAuthMethod: data.primaryAuthMethod,
        lastLoginAt: sql`now()`,
        updatedAt: sql`now()`,
      })
      .where(and(eq(users.id, id), eq(users.accountType, 'guest'), isNull(users.deletedAt)))
      .returning();
    const upgraded = this.map(rows[0]);
    if (!upgraded) {
      // The row was not an active guest (already upgraded, merged, or gone).
      throw new ConflictException('Account is no longer an upgradable guest');
    }
    return upgraded;
  }

  async createCustomer(
    data: { phone?: string; email?: string; primaryAuthMethod: string; isPhoneVerified?: boolean; isEmailVerified?: boolean },
    tx?: DBExecutor,
  ): Promise<UserRecord> {
    const rows = await this.exec(tx)
      .insert(users)
      .values({
        accountType: 'customer',
        ...(data.phone ? { phone: data.phone } : {}),
        ...(data.email ? { email: data.email } : {}),
        primaryAuthMethod: data.primaryAuthMethod,
        isPhoneVerified: data.isPhoneVerified ?? false,
        isEmailVerified: data.isEmailVerified ?? false,
        lastLoginAt: sql`now()`,
      })
      .returning();
    return this.map(rows[0])!;
  }

  async createAdmin(input: CreateAdminInput, tx?: DBExecutor): Promise<UserRecord> {
    const rows = await this.exec(tx)
      .insert(users)
      .values({
        accountType: 'admin',
        email: input.email,
        passwordHash: input.passwordHash,
        primaryAuthMethod: 'email',
        isEmailVerified: true,
        ...(input.firstName ? { firstName: input.firstName } : {}),
        ...(input.lastName ? { lastName: input.lastName } : {}),
      })
      .returning();
    return this.map(rows[0])!;
  }

  async updateProfile(
    id: string,
    data: Partial<{ username: string; gender: string; firstName: string; lastName: string; avatarUrl: string }>,
    tx?: DBExecutor,
  ): Promise<UserRecord | null> {
    await this.exec(tx)
      .update(users)
      .set({ ...data, updatedAt: sql`now()` })
      .where(and(eq(users.id, id), isNull(users.deletedAt)));
    return this.findById(id, tx);
  }

  async setPassword(id: string, passwordHash: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .update(users)
      .set({ passwordHash, tokenVersion: sql`${users.tokenVersion} + 1`, updatedAt: sql`now()` })
      .where(eq(users.id, id));
  }

  async setStatus(
    id: string,
    data: { status: AccountStatus; suspendedUntil?: string | null; reason?: string | null; changedBy?: string | null },
    tx?: DBExecutor,
  ): Promise<UserRecord | null> {
    await this.exec(tx)
      .update(users)
      .set({
        status: data.status,
        suspendedUntil: data.suspendedUntil ?? null,
        statusReason: data.reason ?? null,
        statusChangedBy: data.changedBy ?? null,
        statusChangedAt: sql`now()`,
        tokenVersion: sql`${users.tokenVersion} + 1`,
        updatedAt: sql`now()`,
      })
      .where(eq(users.id, id));
    return this.findById(id, tx);
  }

  async bumpTokenVersion(id: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .update(users)
      .set({ tokenVersion: sql`${users.tokenVersion} + 1`, updatedAt: sql`now()` })
      .where(eq(users.id, id));
  }

  async touchLastLogin(id: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).update(users).set({ lastLoginAt: sql`now()` }).where(eq(users.id, id));
  }

  /**
   * Idempotently mark a guest merged into a real user + soft-delete it.
   * Returns false if the guest was already merged (so callers skip side effects).
   */
  async mergeGuestInto(guestId: string, targetUserId: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .update(users)
      .set({ mergedIntoUserId: targetUserId, deletedAt: sql`now()`, updatedAt: sql`now()` })
      .where(and(eq(users.id, guestId), eq(users.accountType, 'guest'), isNull(users.mergedIntoUserId), isNull(users.deletedAt)))
      .returning({ id: users.id });
    return rows.length > 0;
  }

  // ─── Admin listing ───────────────────────────────────────────────────────────

  async list(
    accountType: AccountType,
    opts: { page: number; pageSize: number; search?: string; status?: AccountStatus },
  ): Promise<{ data: UserRecord[]; total: number }> {
    const filters = [eq(users.accountType, accountType), isNull(users.deletedAt)];
    if (opts.status) {
      filters.push(eq(users.status, opts.status));
    }
    if (opts.search) {
      // Escape LIKE metacharacters (\ % _) and clamp length so a crafted term can't turn
      // into a wildcard scan or an expensive pattern.
      const escaped = opts.search.slice(0, 100).replace(/[\\%_]/g, (c) => `\\${c}`);
      const term = `%${escaped}%`;
      const match = or(ilike(users.email, term), ilike(users.username, term), ilike(users.phone, term));
      if (match) {
        filters.push(match);
      }
    }
    const where = and(...filters);
    const offset = (opts.page - 1) * opts.pageSize;
    const [totalRes, rows] = await Promise.all([
      this.dbService.db.select({ c: count() }).from(users).where(where),
      this.dbService.db.select().from(users).where(where).orderBy(desc(users.createdAt)).limit(opts.pageSize).offset(offset),
    ]);
    return { data: rows.map((r) => this.map(r)!).filter(Boolean), total: totalRes[0]?.c ?? 0 };
  }

  private map(row: typeof users.$inferSelect | undefined): UserRecord | null {
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      accountType: row.accountType as AccountType,
      email: row.email,
      passwordHash: row.passwordHash,
      phone: row.phone,
      username: row.username,
      firstName: row.firstName,
      lastName: row.lastName,
      gender: row.gender,
      avatarUrl: row.avatarUrl,
      primaryAuthMethod: row.primaryAuthMethod,
      countryCode: row.countryCode,
      tokenVersion: row.tokenVersion,
      status: row.status as AccountStatus,
      suspendedUntil: row.suspendedUntil,
      statusReason: row.statusReason,
      isEmailVerified: row.isEmailVerified,
      isPhoneVerified: row.isPhoneVerified,
      lastLoginAt: row.lastLoginAt,
      createdAt: row.createdAt,
    };
  }
}
