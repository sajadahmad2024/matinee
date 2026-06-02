import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { referralCodes, referralRedemptions } from '@db/drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ReferralRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  async findCodeByUser(userId: string, tx?: DBExecutor): Promise<string | null> {
    const rows = await this.exec(tx).select({ code: referralCodes.code }).from(referralCodes).where(eq(referralCodes.userId, userId));
    return rows[0]?.code ?? null;
  }

  /** Insert a code; returns true only if a row was actually created (false on any unique conflict). */
  async createCode(userId: string, code: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .insert(referralCodes)
      .values({ userId, code })
      .onConflictDoNothing()
      .returning({ id: referralCodes.id });
    return rows.length > 0;
  }

  async findOwnerByCode(code: string, tx?: DBExecutor): Promise<{ userId: string } | null> {
    const rows = await this.exec(tx).select({ userId: referralCodes.userId }).from(referralCodes).where(eq(referralCodes.code, code));
    return rows[0] ?? null;
  }

  async hasRedemption(refereeId: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .select({ id: referralRedemptions.id })
      .from(referralRedemptions)
      .where(eq(referralRedemptions.refereeId, refereeId))
      .limit(1);
    return rows.length > 0;
  }

  async createRedemption(input: { code: string; referrerId: string; refereeId: string }, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .insert(referralRedemptions)
      .values({ code: input.code, referrerId: input.referrerId, refereeId: input.refereeId, status: 'pending' })
      .onConflictDoNothing();
  }
}
