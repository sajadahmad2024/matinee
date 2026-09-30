import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { sql, type SQL } from 'drizzle-orm';

export interface MarketingSpendRow {
  id: string;
  channel: string;
  periodMonth: string;
  spendCents: number;
  currency: string;
  newUsers: number;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingSpendUpsert {
  channel: string;
  periodMonth: string; // YYYY-MM-01
  spendCents: number;
  currency: string;
  newUsers: number;
}

export interface SocialMentionRow {
  id: string;
  platform: string;
  externalId: string | null;
  authorHandle: string | null;
  url: string | null;
  content: string | null;
  sentiment: string | null;
  impressions: number;
  engagement: number;
  emvCents: number;
  isViralMoment: boolean;
  countryCode: string | null;
  mentionedAt: string | null;
  ingestedAt: string;
}

export interface SocialMentionInput {
  platform: string;
  externalId: string | null;
  authorHandle: string | null;
  url: string | null;
  content: string | null;
  sentiment: string | null;
  impressions: number;
  engagement: number;
  emvCents: number;
  isViralMoment: boolean;
  countryCode: string | null;
  mentionedAt: string | null;
}

export type SocialMentionPatch = Partial<Omit<SocialMentionInput, 'platform' | 'externalId'>>;

export interface SocialMentionFilter {
  platform?: string;
  sentiment?: string;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}

const toSpend = (r: Record<string, unknown>): MarketingSpendRow => ({
  id: String(r['id']),
  channel: String(r['channel']),
  periodMonth: String(r['periodMonth']),
  spendCents: Number(r['spendCents'] ?? 0),
  currency: String(r['currency']),
  newUsers: Number(r['newUsers'] ?? 0),
  createdAt: String(r['createdAt']),
  updatedAt: String(r['updatedAt']),
});

const toMention = (r: Record<string, unknown>): SocialMentionRow => ({
  id: String(r['id']),
  platform: String(r['platform']),
  externalId: (r['externalId'] as string | null) ?? null,
  authorHandle: (r['authorHandle'] as string | null) ?? null,
  url: (r['url'] as string | null) ?? null,
  content: (r['content'] as string | null) ?? null,
  sentiment: (r['sentiment'] as string | null) ?? null,
  impressions: Number(r['impressions'] ?? 0),
  engagement: Number(r['engagement'] ?? 0),
  emvCents: Number(r['emvCents'] ?? 0),
  isViralMoment: Boolean(r['isViralMoment']),
  countryCode: (r['countryCode'] as string | null) ?? null,
  mentionedAt: r['mentionedAt'] ? new Date(String(r['mentionedAt'])).toISOString() : null,
  ingestedAt: new Date(String(r['ingestedAt'])).toISOString(),
});

const SPEND_COLS = sql`id, channel, to_char(period_month, 'YYYY-MM-DD') as "periodMonth", spend_cents as "spendCents", currency,
  new_users as "newUsers", created_at as "createdAt", updated_at as "updatedAt"`;
const MENTION_COLS = sql`id, platform, external_id as "externalId", author_handle as "authorHandle", url, content, sentiment,
  impressions, engagement, emv_cents as "emvCents", is_viral_moment as "isViralMoment", country_code as "countryCode",
  mentioned_at as "mentionedAt", ingested_at as "ingestedAt"`;

/** Admin-maintained marketing inputs: `marketing_spend` (CAC / LTV:CAC) and `social_mentions` (Community — External). */
@Injectable()
export class MarketingRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  private async rows(query: SQL, tx?: DBExecutor): Promise<Array<Record<string, unknown>>> {
    return ((await this.exec(tx).execute(query)) as unknown as { rows: Array<Record<string, unknown>> }).rows;
  }

  // ─── Marketing spend ────────────────────────────────────────────────────────

  async listSpend(fromMonth: string | null, toMonth: string | null, tx?: DBExecutor): Promise<MarketingSpendRow[]> {
    const f = fromMonth !== null ? sql`and period_month >= ${fromMonth}::date` : sql``;
    const t = toMonth !== null ? sql`and period_month <= ${toMonth}::date` : sql``;
    const r = await this.rows(sql`select ${SPEND_COLS} from marketing_spend where true ${f} ${t} order by period_month desc, channel`, tx);
    return r.map(toSpend);
  }

  async upsertSpend(v: MarketingSpendUpsert, tx?: DBExecutor): Promise<MarketingSpendRow> {
    const r = await this.rows(sql`
      insert into marketing_spend (channel, period_month, spend_cents, currency, new_users)
      values (${v.channel}, ${v.periodMonth}::date, ${v.spendCents}, ${v.currency}, ${v.newUsers})
      on conflict (channel, period_month) do update set spend_cents = excluded.spend_cents, currency = excluded.currency,
        new_users = excluded.new_users, updated_at = now()
      returning ${SPEND_COLS}`, tx);
    return toSpend(r[0] ?? {});
  }

  async deleteSpend(id: string, tx?: DBExecutor): Promise<boolean> {
    const r = await this.rows(sql`delete from marketing_spend where id = ${id} returning id`, tx);
    return r.length > 0;
  }

  // ─── Social mentions ────────────────────────────────────────────────────────

  async listMentions(f: SocialMentionFilter, tx?: DBExecutor): Promise<{ items: SocialMentionRow[]; total: number }> {
    const conds: SQL[] = [sql`true`];
    if (f.platform) {
      conds.push(sql`platform = ${f.platform}`);
    }
    if (f.sentiment) {
      conds.push(sql`sentiment = ${f.sentiment}`);
    }
    if (f.from) {
      conds.push(sql`coalesce(mentioned_at, ingested_at) >= ${f.from}::timestamptz`);
    }
    if (f.to) {
      conds.push(sql`coalesce(mentioned_at, ingested_at) < ${f.to}::timestamptz`);
    }
    const where = sql.join(conds, sql` and `);
    const [items, total] = await Promise.all([
      this.rows(sql`select ${MENTION_COLS} from social_mentions where ${where}
        order by coalesce(mentioned_at, ingested_at) desc, id desc limit ${f.limit} offset ${(f.page - 1) * f.limit}`, tx),
      this.rows(sql`select count(*)::int as n from social_mentions where ${where}`, tx),
    ]);
    return { items: items.map(toMention), total: Number(total[0]?.['n'] ?? 0) };
  }

  /** Batch ingest; rows with an `externalId` upsert on (platform, external_id). Returns rows written. */
  async ingestMentions(items: readonly SocialMentionInput[], tx?: DBExecutor): Promise<number> {
    if (items.length === 0) {
      return 0;
    }
    const values = items.map(
      (m) => sql`(${m.platform}, ${m.externalId}, ${m.authorHandle}, ${m.url}, ${m.content}, ${m.sentiment}, ${m.impressions},
        ${m.engagement}, ${m.emvCents}, ${m.isViralMoment}, ${m.countryCode}, ${m.mentionedAt}::timestamptz)`,
    );
    const r = await this.rows(sql`
      insert into social_mentions (platform, external_id, author_handle, url, content, sentiment, impressions, engagement,
        emv_cents, is_viral_moment, country_code, mentioned_at)
      values ${sql.join(values, sql`, `)}
      on conflict (platform, external_id) where external_id is not null do update set
        author_handle = excluded.author_handle, url = excluded.url, content = excluded.content, sentiment = excluded.sentiment,
        impressions = excluded.impressions, engagement = excluded.engagement, emv_cents = excluded.emv_cents,
        is_viral_moment = excluded.is_viral_moment, country_code = excluded.country_code, mentioned_at = excluded.mentioned_at
      returning id`, tx);
    return r.length;
  }

  async updateMention(id: string, patch: SocialMentionPatch, tx?: DBExecutor): Promise<SocialMentionRow | null> {
    const cols: Array<[keyof SocialMentionPatch, string]> = [
      ['authorHandle', 'author_handle'], ['url', 'url'], ['content', 'content'], ['sentiment', 'sentiment'],
      ['impressions', 'impressions'], ['engagement', 'engagement'], ['emvCents', 'emv_cents'],
      ['isViralMoment', 'is_viral_moment'], ['countryCode', 'country_code'], ['mentionedAt', 'mentioned_at'],
    ];
    const sets = cols
      .filter(([k]) => patch[k] !== undefined)
      .map(([k, col]) => (k === 'mentionedAt' ? sql`${sql.raw(col)} = ${patch[k] ?? null}::timestamptz` : sql`${sql.raw(col)} = ${patch[k] ?? null}`));
    if (sets.length === 0) {
      const cur = await this.rows(sql`select ${MENTION_COLS} from social_mentions where id = ${id}`, tx);
      return cur[0] ? toMention(cur[0]) : null;
    }
    const r = await this.rows(sql`update social_mentions set ${sql.join(sets, sql`, `)} where id = ${id} returning ${MENTION_COLS}`, tx);
    return r[0] ? toMention(r[0]) : null;
  }

  async deleteMention(id: string, tx?: DBExecutor): Promise<boolean> {
    const r = await this.rows(sql`delete from social_mentions where id = ${id} returning id`, tx);
    return r.length > 0;
  }
}
