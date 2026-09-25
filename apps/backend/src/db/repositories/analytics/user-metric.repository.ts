import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { sql } from 'drizzle-orm';

/**
 * Counter-style writes to `user_metrics` (the badge engine's input — the
 * `evaluate_badges` trigger awards any active badge whose rule the new value meets).
 */
@Injectable()
export class UserMetricRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Atomically add `delta` to a user's metric (creating it at `delta`). Returns the new value. */
  async increment(userId: string, metricKey: string, delta = 1, tx?: DBExecutor): Promise<number> {
    const res = (await this.exec(tx).execute(sql`
      insert into user_metrics (user_id, metric_key, value) values (${userId}, ${metricKey}, ${delta})
      on conflict (user_id, metric_key) do update set value = user_metrics.value + excluded.value, updated_at = now()
      returning value`)) as unknown as { rows: Array<{ value: string | number }> };
    return Number(res.rows[0]?.value ?? 0);
  }
}
