import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { contentShares } from '@db/drizzle/schema';

/**
 * Content shares. Append-only (every share is an event — drives the share counter via the
 * `share_counts` trigger and the "shared_content" earning rule). No uniqueness: a user can
 * share the same content many times (capped/awarded downstream by tokenomics).
 */
@Injectable()
export class ShareRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  async record(userId: string, contentId: string, channel: string | undefined, tx?: DBExecutor): Promise<string> {
    const rows = await this.exec(tx)
      .insert(contentShares)
      .values({ contentId, userId, ...(channel ? { channel } : {}) })
      .returning({ id: contentShares.id });
    return rows[0]!.id;
  }
}
