import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { oauthAccounts, otpCodes } from '@db/drizzle/schema';
import { and, desc, eq, gt, isNull, sql } from 'drizzle-orm';

export type OtpChannel = 'sms' | 'email';
export type OtpPurpose = 'login' | 'phone_verification' | 'email_verification' | 'password_reset';

export interface OtpRecord {
  id: string;
  userId: string | null;
  destination: string;
  codeHash: string;
  attempts: number;
  maxAttempts: number;
}

@Injectable()
export class IdentityRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  // ─── OTP codes ─────────────────────────────────────────────────────────────

  /** Create a fresh OTP, atomically invalidating any prior live codes for the same destination+purpose. */
  async createOtp(
    input: {
      userId?: string | null;
      destination: string;
      channel: OtpChannel;
      purpose: OtpPurpose;
      codeHash: string;
      expiresInSeconds: number;
      maxAttempts?: number;
    },
    tx?: DBExecutor,
  ): Promise<string> {
    const run = async (db: DBExecutor): Promise<string> => {
      await db
        .update(otpCodes)
        .set({ consumedAt: sql`now()` })
        .where(and(eq(otpCodes.destination, input.destination), eq(otpCodes.purpose, input.purpose), isNull(otpCodes.consumedAt)));
      const rows = await db
        .insert(otpCodes)
        .values({
          userId: input.userId ?? null,
          destination: input.destination,
          channel: input.channel,
          purpose: input.purpose,
          codeHash: input.codeHash,
          expiresAt: sql`now() + (${input.expiresInSeconds} * interval '1 second')`,
          maxAttempts: input.maxAttempts ?? 5,
        })
        .returning({ id: otpCodes.id });
      return rows[0]!.id;
    };
    return tx ? run(tx) : this.dbService.transaction(run);
  }

  async findActiveOtp(destination: string, purpose: OtpPurpose, tx?: DBExecutor): Promise<OtpRecord | null> {
    const rows = await this.exec(tx)
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.destination, destination),
          eq(otpCodes.purpose, purpose),
          isNull(otpCodes.consumedAt),
          gt(otpCodes.expiresAt, sql`now()`),
        ),
      )
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);
    const row = rows[0];
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      userId: row.userId,
      destination: row.destination,
      codeHash: row.codeHash,
      attempts: row.attempts,
      maxAttempts: row.maxAttempts,
    };
  }

  async incrementOtpAttempts(id: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).update(otpCodes).set({ attempts: sql`${otpCodes.attempts} + 1` }).where(eq(otpCodes.id, id));
  }

  async consumeOtp(id: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).update(otpCodes).set({ consumedAt: sql`now()` }).where(eq(otpCodes.id, id));
  }

  // ─── OAuth accounts ────────────────────────────────────────────────────────

  async findOauth(provider: string, providerUserId: string, tx?: DBExecutor): Promise<{ userId: string } | null> {
    const rows = await this.exec(tx)
      .select({ userId: oauthAccounts.userId })
      .from(oauthAccounts)
      .where(and(eq(oauthAccounts.provider, provider), eq(oauthAccounts.providerUserId, providerUserId)));
    return rows[0] ?? null;
  }

  async upsertOauth(
    input: { userId: string; provider: string; providerUserId: string; email?: string | null; rawProfile?: Record<string, unknown> | null },
    tx?: DBExecutor,
  ): Promise<void> {
    await this.exec(tx)
      .insert(oauthAccounts)
      .values({
        userId: input.userId,
        provider: input.provider,
        providerUserId: input.providerUserId,
        email: input.email ?? null,
        rawProfile: input.rawProfile ?? null,
      })
      .onConflictDoUpdate({
        target: [oauthAccounts.provider, oauthAccounts.providerUserId],
        set: { email: input.email ?? null, rawProfile: input.rawProfile ?? null, updatedAt: sql`now()` },
      });
  }
}
