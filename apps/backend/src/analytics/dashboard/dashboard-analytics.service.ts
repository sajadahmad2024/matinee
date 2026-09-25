import { Injectable } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { DashboardAnalyticsRepository, DashboardParams, num } from '@db/repositories/analytics/dashboard-analytics.repository';
import { AnalyticsService } from '../analytics.service';
import { AnalyticsWindowQueryDto } from '../dto/analytics.dto';
import {
  CommunityData,
  GamificationData,
  GraphsData,
  MonetizationData,
  RETENTION_OFFSETS,
  ScreenTimeData,
  StripData,
  UserAnalyticsData,
  round,
  shapeCommunity,
  shapeGamification,
  shapeGraphs,
  shapeMonetization,
  shapeScreenTime,
  shapeStrip,
  shapeUserAnalytics,
  weeksIn,
} from './dashboard-shapes';
import { COUNTRIES, MACRO_REGIONS, MACRO_REGION_LABELS, RegionScope, macroForCountry, resolveRegionScope } from './regions';

const TTL = 60; // seconds
export const DEFAULT_UPLOAD_HIT_THRESHOLD = 10_000;

export interface ResolvedQuery {
  scope: RegionScope;
  params: DashboardParams;
}

export interface RegionAnalytics {
  code: string;
  name: string;
  macro: string | null;
  factor: number;
  from: string;
  to: string;
  strip: StripData;
  userAnalytics: UserAnalyticsData;
  gamification: GamificationData;
  screenTime: ScreenTimeData;
  monetization: MonetizationData;
  community: CommunityData;
  graphs: GraphsData;
}

export interface RegionsSummary {
  from: string;
  to: string;
  regions: Array<{ code: string; name: string; users: number; subscribers: number; revenue: number; points: number; viewers: number; gamified: number }>;
  countries: Array<{ code: string; name: string; macro: string | null; users: number; revenue: number; points: number; intensity: number }>;
  unassignedUsers: number;
}

/**
 * Admin dashboard sections (master + /dashboard/region/[code]). Each section is one
 * repository aggregate shaped by the pure functions in dashboard-shapes.ts, cached 60 s per
 * (section, scope, window).
 */
@Injectable()
export class DashboardAnalyticsService {
  constructor(
    private readonly repo: DashboardAnalyticsRepository,
    private readonly cache: CacheService,
    private readonly analytics: AnalyticsService,
  ) {}

  resolve(q: AnalyticsWindowQueryDto, region: string | null | undefined): ResolvedQuery {
    const { from, to } = this.analytics.resolveWindow(q);
    const scope = resolveRegionScope(region);
    return { scope, params: { from, to, countries: scope.countries } };
  }

  private cached<T>(section: string, r: ResolvedQuery, extra: string, fn: () => Promise<T>): Promise<T> {
    const key = `analytics:dash:${section}:${r.scope.code}:${r.params.from}:${r.params.to}:${extra}`;
    return this.cache.getOrSet(key, TTL, fn);
  }

  strip(r: ResolvedQuery): Promise<StripData> {
    // Live counters — short-lived cache only via the minute-floored window key.
    return this.cached('strip', r, '', async () => shapeStrip(await this.repo.strip(r.params)));
  }

  userAnalytics(r: ResolvedQuery, hitThreshold = DEFAULT_UPLOAD_HIT_THRESHOLD): Promise<UserAnalyticsData> {
    return this.cached('user', r, String(hitThreshold), async () =>
      shapeUserAnalytics(await this.repo.userAnalytics(r.params, hitThreshold), hitThreshold),
    );
  }

  gamification(r: ResolvedQuery): Promise<GamificationData> {
    return this.cached('gamification', r, '', async () =>
      shapeGamification(await this.repo.gamification(r.params), weeksIn(r.params.from, r.params.to)),
    );
  }

  screenTime(r: ResolvedQuery): Promise<ScreenTimeData> {
    return this.cached('screen', r, '', async () => shapeScreenTime(await this.repo.screenTime(r.params)));
  }

  monetization(r: ResolvedQuery): Promise<MonetizationData> {
    return this.cached('monetization', r, '', async () => {
      const [raw, factor] = await Promise.all([this.repo.monetization(r.params), this.factor(r)]);
      return shapeMonetization(raw, factor);
    });
  }

  community(r: ResolvedQuery): Promise<CommunityData> {
    return this.cached('community', r, '', async () => {
      const [inApp, social] = await Promise.all([this.repo.communityInApp(r.params), this.repo.socialSummary(r.params)]);
      return shapeCommunity(inApp, social.totals, weeksIn(r.params.from, r.params.to));
    });
  }

  graphs(r: ResolvedQuery): Promise<GraphsData> {
    return this.cached('graphs', r, '', async () => {
      const span = Date.parse(r.params.to) - Date.parse(r.params.from);
      const prev: DashboardParams = {
        ...r.params,
        from: new Date(Date.parse(r.params.from) - span).toISOString(),
        to: r.params.from,
      };
      const [current, previous, kFactor, velocity] = await Promise.all([
        this.repo.retention(r.params, RETENTION_OFFSETS),
        this.repo.retention(prev, RETENTION_OFFSETS),
        this.repo.kFactor(r.params),
        this.repo.velocity(r.params),
      ]);
      return shapeGraphs({ current, previous, kFactor, velocity });
    });
  }

  /** Scope customers ÷ all customers (1 for global). */
  async factor(r: ResolvedQuery): Promise<number> {
    if (r.scope.kind === 'global') {
      return 1;
    }
    const [scoped, total] = await Promise.all([this.strip(r), this.repo.totalCustomers()]);
    return total > 0 ? round(scoped.users / total, 4) : 0;
  }

  /** Full RegionAnalytics for /dashboard/region/[code]. */
  async region(code: string, q: AnalyticsWindowQueryDto, hitThreshold?: number): Promise<RegionAnalytics> {
    const r = this.resolve(q, code);
    const [strip, userAnalytics, gamification, screenTime, monetization, community, graphs, factor] = await Promise.all([
      this.strip(r),
      this.userAnalytics(r, hitThreshold ?? DEFAULT_UPLOAD_HIT_THRESHOLD),
      this.gamification(r),
      this.screenTime(r),
      this.monetization(r),
      this.community(r),
      this.graphs(r),
      this.factor(r),
    ]);
    return {
      code: r.scope.code, name: r.scope.name, macro: r.scope.macro, factor,
      from: r.params.from, to: r.params.to,
      strip, userAnalytics, gamification, screenTime, monetization, community, graphs,
    };
  }

  /** Master dashboard: per-macro rollup (viewership split) + per-country cells (activity map). */
  regions(q: AnalyticsWindowQueryDto): Promise<RegionsSummary> {
    const r = this.resolve(q, 'global');
    return this.cached('regions', r, '', async () => {
      const [rows, total] = await Promise.all([this.repo.byCountry(r.params), this.repo.totalCustomers()]);
      const macros = new Map(
        MACRO_REGIONS.map((m) => [m, { code: m, name: MACRO_REGION_LABELS[m], users: 0, subscribers: 0, revenue: 0, points: 0, viewers: 0, gamified: 0 }]),
      );
      const maxUsers = rows.reduce((m, row) => Math.max(m, num(row['users'])), 0);
      let assigned = 0;
      const countries = rows.map((row) => {
        const code = String(row['countryCode']);
        const macro = macroForCountry(code);
        const users = num(row['users']);
        const revenue = round(num(row['revenueCents']) / 100, 2);
        const points = num(row['points']);
        assigned += users;
        const agg = macro ? macros.get(macro) : undefined;
        if (agg) {
          agg.users += users;
          agg.subscribers += num(row['subscribers']);
          agg.revenue = round(agg.revenue + revenue, 2);
          agg.points += points;
          agg.viewers += num(row['viewers']);
          agg.gamified += num(row['gamified']);
        }
        return { code, name: COUNTRIES[code]?.[1] ?? code, macro, users, revenue, points, intensity: maxUsers > 0 ? round(users / maxUsers, 2) : 0 };
      });
      return { from: r.params.from, to: r.params.to, regions: [...macros.values()], countries, unassignedUsers: Math.max(total - assigned, 0) };
    });
  }
}
