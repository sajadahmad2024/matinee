import { BadRequestException, Injectable } from '@nestjs/common';
import { DashboardAnalyticsRepository, num } from '@db/repositories/analytics/dashboard-analytics.repository';
import { DashboardAnalyticsService, ResolvedQuery } from '../dashboard/dashboard-analytics.service';
import { pct, round } from '../dashboard/dashboard-shapes';
import { ReportExportQueryDto } from '../dto/report.dto';
import { REPORT_GROUPS, REPORT_METRICS, REPORT_PRESETS, ReportRange, ReportRow, toCsv } from './report-catalog';

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_DAYS: Record<Exclude<ReportRange, 'ytd' | 'custom'>, number> = { '7d': 7, '30d': 30, '90d': 90 };

export interface ReportResult {
  report: string;
  generatedAt: string;
  range: string;
  from: string;
  to: string;
  region: string;
  rows: ReportRow[];
}

/** Resolve a report range to an ISO window (`to` = end of the current minute). */
export function reportWindow(range: ReportRange, now: Date, from?: string, to?: string): { from: string; to: string } {
  if (range === 'custom') {
    if (!from || !to) {
      throw new BadRequestException("range 'custom' requires from and to");
    }
    return { from, to };
  }
  const end = new Date((Math.floor(now.getTime() / 60_000) + 1) * 60_000); // end of the current minute
  const start = range === 'ytd' ? new Date(Date.UTC(end.getUTCFullYear(), 0, 1)) : new Date(end.getTime() - RANGE_DAYS[range] * DAY_MS);
  return { from: start.toISOString(), to: end.toISOString() };
}

/** Lazily-evaluated section loader so an export only runs the queries its metrics need. */
class Loader<T> {
  private p: Promise<T> | null = null;
  constructor(private readonly fn: () => Promise<T>) {}
  get(): Promise<T> {
    this.p ??= this.fn();
    return this.p;
  }
}

/**
 * Report builder export: evaluates the requested catalog metrics for a range + region and
 * returns rows (JSON) or a CSV attachment. Reuses the dashboard sections (cached 60 s).
 */
@Injectable()
export class ReportsService {
  constructor(
    private readonly dashboard: DashboardAnalyticsService,
    private readonly repo: DashboardAnalyticsRepository,
  ) {}

  catalog() {
    return {
      groups: REPORT_GROUPS.map((g) => ({ group: g.group, metrics: g.metrics.map((m) => ({ ...m })) })),
      presets: Object.entries(REPORT_PRESETS).map(([key, p]) => ({ key, label: p.label, metrics: [...p.metrics] })),
      ranges: ['7d', '30d', '90d', 'ytd', 'custom'],
    };
  }

  async build(q: ReportExportQueryDto, now: Date = new Date()): Promise<ReportResult> {
    const preset = q.preset ?? 'custom';
    const keys = q.metrics && q.metrics.length > 0 ? q.metrics : [...(REPORT_PRESETS[preset]?.metrics ?? [])];
    if (keys.length === 0) {
      throw new BadRequestException('Select at least one metric (metrics=… or a non-custom preset)');
    }
    const range: ReportRange = q.range ?? (q.from && q.to ? 'custom' : '30d');
    const r = this.dashboard.resolve(reportWindow(range, now, q.from, q.to), q.region);
    const rows = await this.evaluate(r, keys);
    return {
      report: REPORT_PRESETS[preset]?.label ?? 'Custom',
      generatedAt: now.toISOString(),
      range,
      from: r.params.from,
      to: r.params.to,
      region: r.scope.code,
      rows,
    };
  }

  toCsv(report: ReportResult): string {
    return toCsv(
      [['Report', report.report], ['Range', report.range], ['Region', report.region], ['From', report.from], ['To', report.to], ['Generated', report.generatedAt]],
      report.rows,
    );
  }

  private async evaluate(r: ResolvedQuery, keys: readonly string[]): Promise<ReportRow[]> {
    const extras = new Loader(() => this.repo.reportExtras(r.params));
    const strip = new Loader(() => this.dashboard.strip(r));
    const user = new Loader(() => this.dashboard.userAnalytics(r));
    const screen = new Loader(() => this.dashboard.screenTime(r));
    const money = new Loader(() => this.dashboard.monetization(r));
    const graphs = new Loader(() => this.dashboard.graphs(r));
    const days = Math.max((Date.parse(r.params.to) - Date.parse(r.params.from)) / DAY_MS, 1);

    const out: ReportRow[] = [];
    for (const key of keys) {
      const def = REPORT_METRICS.get(key);
      if (!def) {
        continue;
      }
      const row = (value: number, label = def.label, subKey = key): ReportRow => ({ group: def.group, key: subKey, label, value, unit: def.unit });
      const t = async () => (await extras.get()).totals;
      switch (key) {
        case 'total_users': out.push(row((await strip.get()).users)); break;
        case 'signed_up': out.push(row(num((await t())['signups']))); break;
        case 'active_users': out.push(row(num((await t())['activeUsers']))); break;
        case 'churn_rate': { const x = await t(); out.push(row(pct(num(x['cancellations']), num(x['subsAtStart'])))); break; }
        case 'retention': {
          const g = (await graphs.get()).retention;
          out.push(row(g.d1, 'Retention D1', 'retention_d1'), row(g.d7, 'Retention D7', 'retention_d7'), row(g.d30, 'Retention D30', 'retention_d30'));
          break;
        }
        case 'watch_rate': out.push(row(pct(num((await t())['views']), (await user.get()).starts))); break;
        case 'completion_rate': { const u = await user.get(); out.push(row(pct(u.completes, u.starts))); break; }
        case 'avg_session_length': out.push(row((await screen.get()).sessionAvgSecs)); break;
        case 'dau_mau': { const x = await t(); out.push(row(pct(num(x['activeUserDays']) / days, num(x['mau'])))); break; }
        case 'mrr': out.push(row((await money.get()).mrr)); break;
        case 'arpu': out.push(row((await money.get()).arpu)); break;
        case 'ltv': out.push(row((await money.get()).ltv)); break;
        case 'conversion_rate': { const f = (await money.get()).funnel; out.push(row(pct(f.subscribed, f.signups))); break; }
        case 'revenue_by_platform': {
          const list = (await extras.get()).revenueByPlatform;
          if (list.length === 0) out.push(row(0, `${def.label} — none`, `${key}:none`));
          for (const p of list) {
            const name = String(p['platform']);
            out.push(row(round(num(p['revenueCents']) / 100, 2), `${def.label} — ${name}`, `${key}:${name}`));
          }
          break;
        }
        case 'points_issued': out.push(row(num((await t())['pointsIssued']))); break;
        case 'points_redeemed': out.push(row(num((await t())['pointsSpent']))); break;
        case 'redemption_rate': { const x = await t(); out.push(row(pct(num(x['pointsSpent']), num(x['pointsIssued'])))); break; }
        case 'leaderboard_participation': { const x = await t(); out.push(row(pct(num(x['leaderboardUsers']), num(x['activeUsers'])))); break; }
        case 'reports_volume': out.push(row(num((await t())['reports']))); break;
        case 'resolution_time': out.push(row(round(num((await t())['resolutionHours'])))); break;
        case 'safety_score': {
          const x = await t();
          const perK = num(x['activeUsers']) > 0 ? (num(x['actionedViolations']) / num(x['activeUsers'])) * 1000 : 0;
          out.push(row(round(Math.max(0, 100 - perK))));
          break;
        }
        case 'violations_by_category': {
          const list = (await extras.get()).violations;
          if (list.length === 0) out.push(row(0, `${def.label} — none`, `${key}:none`));
          for (const v of list) {
            const c = String(v['category']);
            out.push(row(num(v['count']), `${def.label} — ${c}`, `${key}:${c}`));
          }
          break;
        }
        case 'videos_published': out.push(row(num((await t())['published']))); break;
        case 'views': out.push(row(num((await t())['views']))); break;
        case 'watch_time': out.push(row(round(num((await t())['watchSeconds']) / 3600))); break;
        case 'licensing_status': {
          for (const l of (await extras.get()).licensing) {
            const s = String(l['status']);
            out.push(row(num(l['count']), `${def.label} — ${s}`, `${key}:${s}`));
          }
          break;
        }
        default: break;
      }
    }
    return out;
  }
}
