import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { sql } from 'drizzle-orm';

export interface Row {
  [k: string]: string | number | null;
}
function rows(res: unknown): Row[] {
  return (res as { rows: Row[] }).rows;
}

/** Cross-game-type reads for the admin "all instances" + "formats library" views. */
@Injectable()
export class GamesMetaRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Unified list of every game instance across types, newest first. */
  async instances(page: number, limit: number, type?: string, tx?: DBExecutor): Promise<{ items: Row[]; total: number }> {
    const typeFilter = type ? sql`where type = ${type}` : sql``;
    const union = sql`
      select 'quest' as type, id, name as title, status, created_at as "createdAt" from quests
      union all
      select 'prediction' as type, id, question as title, status, created_at as "createdAt" from predictions
      union all
      select 'auction' as type, id, title, status, created_at as "createdAt" from auctions`;
    const list = await this.exec(tx).execute(sql`
      with all_instances as (${union})
      select * from all_instances ${typeFilter} order by "createdAt" desc limit ${limit} offset ${(page - 1) * limit}`);
    const count = await this.exec(tx).execute(sql`
      with all_instances as (${union})
      select count(*)::int as n from all_instances ${typeFilter}`);
    return { items: rows(list), total: (rows(count)[0]?.['n'] as number) ?? 0 };
  }

  /** Per-type summary (the formats library cards). */
  async types(tx?: DBExecutor): Promise<Row> {
    const res = await this.exec(tx).execute(sql`
      select
        (select count(*)::int from quests) as "quest_total",
        (select count(*)::int from quests where status='active') as "quest_active",
        (select count(*)::int from predictions) as "prediction_total",
        (select count(*)::int from predictions where status='open') as "prediction_active",
        (select count(*)::int from auctions) as "auction_total",
        (select count(*)::int from auctions where status='open') as "auction_active"`);
    const r = rows(res)[0] ?? {};
    return {
      ...r,
      daily_streak_total: 1, // fixed autonomous types
      shared_content_total: 1,
    };
  }
}
