import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { appSettings } from '@db/drizzle/schema';
import { eq, sql } from 'drizzle-orm';

export interface SettingRow {
  key: string;
  value: unknown;
  description: string | null;
}

@Injectable()
export class AppSettingsRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  async listByCategory(category: string, tx?: DBExecutor): Promise<SettingRow[]> {
    return this.exec(tx)
      .select({ key: appSettings.key, value: appSettings.value, description: appSettings.description })
      .from(appSettings)
      .where(eq(appSettings.category, category));
  }

  /** Upsert a setting (creates if absent). */
  async upsert(key: string, value: unknown, category: string, adminId: string, description?: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .insert(appSettings)
      .values({ key, value, category, updatedBy: adminId, ...(description ? { description } : {}) })
      .onConflictDoUpdate({ target: appSettings.key, set: { value, updatedBy: adminId, updatedAt: sql`now()` } });
  }
}
