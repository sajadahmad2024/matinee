import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { userEnforcementActions } from '@db/drizzle/schema';
import { desc, eq } from 'drizzle-orm';

export type EnforcementAction = 'suspend' | 'ban' | 'reinstate' | 'disable' | 'enable';

export interface EnforcementRecord {
  id: string;
  userId: string;
  action: string;
  reason: string | null;
  expiresAt: string | null;
  performedBy: string | null;
  createdAt: string;
}

@Injectable()
export class EnforcementRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  async create(
    input: { userId: string; action: EnforcementAction; reason?: string | undefined; expiresAt?: string | undefined; performedBy: string },
    tx?: DBExecutor,
  ): Promise<EnforcementRecord> {
    const rows = await this.exec(tx)
      .insert(userEnforcementActions)
      .values({
        userId: input.userId,
        action: input.action,
        performedBy: input.performedBy,
        ...(input.reason ? { reason: input.reason } : {}),
        ...(input.expiresAt ? { expiresAt: input.expiresAt } : {}),
      })
      .returning();
    return rows[0]! as EnforcementRecord;
  }

  async listForUser(userId: string): Promise<EnforcementRecord[]> {
    const rows = await this.dbService.db
      .select()
      .from(userEnforcementActions)
      .where(eq(userEnforcementActions.userId, userId))
      .orderBy(desc(userEnforcementActions.createdAt));
    return rows as EnforcementRecord[];
  }
}
