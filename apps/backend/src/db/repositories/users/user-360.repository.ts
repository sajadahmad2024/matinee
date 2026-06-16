import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { userRoles, roles } from '@db/drizzle/schema';
import { eq, inArray, sql } from 'drizzle-orm';

export interface Row {
  [k: string]: string | number | null;
}
function rows(res: unknown): Row[] {
  return (res as { rows: Row[] }).rows;
}

/** Cross-domain admin reads for the user-detail screen tabs + role assignment. */
@Injectable()
export class AdminUser360Repository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  async watchHistory(userId: string, limit: number, tx?: DBExecutor): Promise<Row[]> {
    const res = await this.exec(tx).execute(sql`
      select cv.content_id as "contentId", c.title, cv.watched_seconds as "watchedSeconds",
             cv.completion_percent as "completionPercent", cv.is_completed as "isCompleted", cv.started_at as "startedAt"
      from content_views cv join contents c on c.id = cv.content_id
      where cv.user_id = ${userId} order by cv.started_at desc limit ${limit}`);
    return rows(res);
  }

  async referrals(userId: string, tx?: DBExecutor): Promise<{ code: string | null; invited: Row[]; counts: Row }> {
    const code = await this.exec(tx).execute(sql`select code from referral_codes where user_id = ${userId} limit 1`);
    const invited = await this.exec(tx).execute(sql`
      select rr.referee_id as "refereeId", u.username, rr.status, rr.created_at as "createdAt"
      from referral_redemptions rr left join users u on u.id = rr.referee_id
      where rr.referrer_id = ${userId} order by rr.created_at desc limit 100`);
    const counts = await this.exec(tx).execute(sql`
      select count(*)::int as total,
             count(*) filter (where status in ('qualified','rewarded'))::int as completed
      from referral_redemptions where referrer_id = ${userId}`);
    return { code: (rows(code)[0]?.['code'] as string) ?? null, invited: rows(invited), counts: rows(counts)[0] ?? {} };
  }

  async gamesActivity(userId: string, tx?: DBExecutor): Promise<Row> {
    const res = await this.exec(tx).execute(sql`
      select
        (select count(*)::int from quest_participations where user_id = ${userId}) as "questsJoined",
        (select count(*)::int from quest_participations where user_id = ${userId} and is_completed) as "questsCompleted",
        (select count(*)::int from prediction_entries where user_id = ${userId}) as "predictionsEntered",
        (select count(*)::int from prediction_entries where user_id = ${userId} and is_correct) as "predictionsWon",
        (select count(*)::int from bids where user_id = ${userId}) as "bidsPlaced",
        (select count(*)::int from bids where user_id = ${userId} and status = 'won') as "auctionsWon"`);
    return rows(res)[0] ?? {};
  }

  async reportsActivity(userId: string, tx?: DBExecutor): Promise<{ against: Row[]; madeCount: number }> {
    const against = await this.exec(tx).execute(sql`
      select id, subject_type as "subjectType", category, severity, status, report_count as "reportCount", created_at as "createdAt"
      from moderation_tickets where offender_user_id = ${userId} order by created_at desc limit 50`);
    const made = await this.exec(tx).execute(sql`select count(*)::int as n from moderation_reports where reporter_user_id = ${userId}`);
    return { against: rows(against), madeCount: (rows(made)[0]?.['n'] as number) ?? 0 };
  }

  // ─── Roles ─────────────────────────────────────────────────────────────────
  async getRoleNames(userId: string, tx?: DBExecutor): Promise<string[]> {
    const r = await this.exec(tx).select({ name: roles.name }).from(userRoles).innerJoin(roles, eq(roles.id, userRoles.roleId)).where(eq(userRoles.userId, userId));
    return r.map((x) => x.name);
  }

  /** Replace the user's roles with the given role names (returns false if any name is unknown). */
  async setRoles(userId: string, roleNames: string[]): Promise<boolean> {
    return this.dbService.transaction(async (tx) => {
      const found = await tx.select({ id: roles.id }).from(roles).where(inArray(roles.name, roleNames.length ? roleNames : ['__none__']));
      if (found.length !== roleNames.length) {
        return false;
      }
      await tx.delete(userRoles).where(eq(userRoles.userId, userId));
      if (found.length) {
        await tx.insert(userRoles).values(found.map((f) => ({ userId, roleId: f.id }))).onConflictDoNothing();
      }
      return true;
    });
  }
}
