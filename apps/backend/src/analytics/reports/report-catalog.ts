/**
 * Report-builder metric catalog — mirrors apps/web `reports/_components/report-builder.tsx`
 * (METRIC_GROUPS / PRESETS). Labels are the UI strings; keys are the API contract.
 */
export type ReportUnit = 'count' | 'percent' | 'usd' | 'seconds' | 'hours' | 'points' | 'ratio' | 'score';

export interface ReportMetricDef {
  key: string;
  label: string;
  unit: ReportUnit;
  description: string;
}

export const REPORT_GROUPS: ReadonlyArray<{ group: string; metrics: readonly ReportMetricDef[] }> = [
  {
    group: 'Users',
    metrics: [
      { key: 'total_users', label: 'Total Users', unit: 'count', description: 'Customers (not deleted) in scope, now' },
      { key: 'signed_up', label: 'Signed Up', unit: 'count', description: 'Customers created in the window' },
      { key: 'active_users', label: 'Active Users', unit: 'count', description: 'Distinct users with a view, session or app event in the window' },
      { key: 'churn_rate', label: 'Churn Rate', unit: 'percent', description: 'Subscriptions cancelled in the window ÷ paying subscriptions at window start' },
      { key: 'retention', label: 'Retention (D1/D7/D30)', unit: 'percent', description: 'Signup-cohort activity on day 1 / 7 / 30' },
    ],
  },
  {
    group: 'Engagement',
    metrics: [
      { key: 'watch_rate', label: 'Watch Rate', unit: 'percent', description: 'Counted views ÷ view sessions started' },
      { key: 'completion_rate', label: 'Completion Rate', unit: 'percent', description: 'Completed sessions ÷ sessions started' },
      { key: 'avg_session_length', label: 'Avg Session Length', unit: 'seconds', description: 'Mean derived app-session length' },
      { key: 'dau_mau', label: 'DAU/MAU', unit: 'percent', description: 'Average daily actives ÷ 30-day actives ending at `to`' },
    ],
  },
  {
    group: 'Monetization',
    metrics: [
      { key: 'mrr', label: 'MRR', unit: 'usd', description: 'Current monthly recurring revenue (active + trialing)' },
      { key: 'arpu', label: 'ARPU', unit: 'usd', description: 'Paid revenue in window ÷ customers' },
      { key: 'ltv', label: 'LTV', unit: 'usd', description: 'Lifetime paid revenue ÷ paying users' },
      { key: 'conversion_rate', label: 'Conversion Rate', unit: 'percent', description: 'Window signups who subscribed ÷ window signups' },
      { key: 'revenue_by_platform', label: 'Revenue by Platform', unit: 'usd', description: 'Paid invoice revenue by platform (provider fallback)' },
    ],
  },
  {
    group: 'Gamification',
    metrics: [
      { key: 'points_issued', label: 'Points Issued', unit: 'points', description: 'Points earned in the window' },
      { key: 'points_redeemed', label: 'Points Redeemed', unit: 'points', description: 'Points spent in the window' },
      { key: 'redemption_rate', label: 'Redemption Rate', unit: 'percent', description: 'Redeemed ÷ issued' },
      { key: 'leaderboard_participation', label: 'Leaderboard Participation', unit: 'percent', description: 'Active users with leaderboard XP in the window months ÷ active users' },
    ],
  },
  {
    group: 'Moderation',
    metrics: [
      { key: 'reports_volume', label: 'Reports Volume', unit: 'count', description: 'Moderation + comment reports filed in the window' },
      { key: 'resolution_time', label: 'Resolution Time', unit: 'hours', description: 'Mean ticket open → resolved time for tickets resolved in the window' },
      { key: 'safety_score', label: 'Safety Score', unit: 'score', description: '100 − actioned violations per 1,000 active users (floored at 0)' },
      { key: 'violations_by_category', label: 'Violations by Category', unit: 'count', description: 'Tickets opened in the window by category' },
    ],
  },
  {
    group: 'Content',
    metrics: [
      { key: 'videos_published', label: 'Videos Published', unit: 'count', description: 'Contents published in the window' },
      { key: 'views', label: 'Views', unit: 'count', description: 'Counted views in the window' },
      { key: 'watch_time', label: 'Watch Time', unit: 'hours', description: 'Watch hours of counted views in the window' },
      { key: 'licensing_status', label: 'Licensing Status', unit: 'count', description: 'Current catalog by licence status' },
    ],
  },
];

export const REPORT_METRICS: ReadonlyMap<string, ReportMetricDef & { group: string }> = new Map(
  REPORT_GROUPS.flatMap((g) => g.metrics.map((m) => [m.key, { ...m, group: g.group }] as const)),
);

export const REPORT_PRESETS: Readonly<Record<string, { label: string; metrics: readonly string[] }>> = {
  custom: { label: 'Custom', metrics: [] },
  executive: { label: 'Executive Summary', metrics: ['total_users', 'mrr', 'churn_rate', 'conversion_rate', 'retention', 'safety_score'] },
  marketing: { label: 'Marketing', metrics: ['signed_up', 'conversion_rate', 'watch_rate', 'points_issued', 'dau_mau'] },
  finance: { label: 'Finance', metrics: ['mrr', 'arpu', 'ltv', 'revenue_by_platform', 'conversion_rate'] },
  content: { label: 'Content Team', metrics: ['videos_published', 'views', 'watch_time', 'completion_rate', 'licensing_status'] },
  moderation: { label: 'Trust & Safety', metrics: ['reports_volume', 'resolution_time', 'safety_score', 'violations_by_category'] },
};

export const REPORT_RANGES = ['7d', '30d', '90d', 'ytd', 'custom'] as const;
export type ReportRange = (typeof REPORT_RANGES)[number];

export interface ReportRow {
  group: string;
  key: string;
  label: string;
  value: number;
  unit: ReportUnit;
}

const csvCell = (v: string | number): string => {
  const s = String(v);
  return /[",\r\n]/.test(s) || /^[=+\-@]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV with a small preamble (Report / Range / Region / From / To) then `Group,Metric,Key,Value,Unit`. */
export function toCsv(meta: Array<[string, string]>, rows: readonly ReportRow[]): string {
  const lines = [
    ...meta.map(([k, v]) => `${csvCell(k)},${csvCell(v)}`),
    '',
    'Group,Metric,Key,Value,Unit',
    ...rows.map((r) => [r.group, r.label, r.key, r.value, r.unit].map(csvCell).join(',')),
  ];
  return `${lines.join('\r\n')}\r\n`;
}
