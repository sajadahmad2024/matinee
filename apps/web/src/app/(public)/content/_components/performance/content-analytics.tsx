"use client";

import {
  DollarSign,
  Film,
  Filter,
  Frown,
  Gamepad2,
  Meh,
  MessageSquare,
  Share2,
  Smile,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";

import { CardContent } from "@/components/ui/card";

import { AnalyticsCardHeader } from "@/components/custom/analytics-card-header";
import { GlassCard } from "@/components/custom/glass-card";

import { EMPTY } from "../../_shared/content-format";
import type { ContentRegionKey } from "../../_shared/content-types";
import { formatCount } from "../listing/listing-config";
import { buildFinancialMetrics, buildFunnelStages, formatChange } from "./performance-config";
import { useContentPerformance } from "./use-content-performance";

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  iconColor: string;
}

function MetricCard({ title, value, subValue, icon: Icon, iconColor }: MetricCardProps) {
  return (
    <div className="bg-background-tertiary border-border rounded-lg border p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        <span className="text-foreground-secondary text-xs font-medium">{title}</span>
      </div>
      <p className="font-gaming text-foreground text-2xl font-bold">{value}</p>
      {subValue && <p className="text-foreground-muted mt-1 text-xs">{subValue}</p>}
    </div>
  );
}

/** "2026-10-21T12:00:00Z" → "12:00" in the viewer's time. */
const formatHour = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : EMPTY;

const FINANCIAL_ICONS = [
  { icon: DollarSign, iconColor: "text-success" },
  { icon: Gamepad2, iconColor: "text-accent" },
  { icon: Film, iconColor: "text-primary" },
  { icon: TrendingUp, iconColor: "text-warning" },
];

/**
 * Financial & conversion, the engagement funnel, and social & sentiment for the last 30 days —
 * the same query (and cache) as the Performance tiles above.
 */
export function ContentAnalytics({ region }: { region: ContentRegionKey }) {
  const { performance } = useContentPerformance(region);

  // The tiles above own the loading / error states; these cards wait for the same response.
  if (!performance) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="bg-muted/20 h-64 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  const financial = buildFinancialMetrics(performance);
  const funnel = buildFunnelStages(performance);
  // Percentages are of impressions (the first stage).
  const funnelTop = funnel?.[0]?.value ?? 0;
  const totals = performance?.totals;
  const sentiment = performance?.sentiment;
  // The API's split of likes / comments / dislikes (sums to 100). A dash when there's nothing yet.
  const hasSentiment =
    (sentiment?.positivePct ?? 0) + (sentiment?.neutralPct ?? 0) + (sentiment?.negativePct ?? 0) >
    0;
  const positivePct = hasSentiment ? (sentiment?.positivePct ?? 0) : null;
  const neutralPct = hasSentiment ? (sentiment?.neutralPct ?? 0) : null;
  const negativePct = hasSentiment ? (sentiment?.negativePct ?? 0) : null;
  const shareVelocity = performance?.shareVelocity;
  const hourlyShares = shareVelocity?.hourly ?? [];
  const peakShares = Math.max(...hourlyShares.map((h) => h?.shares ?? 0), 0);
  const sentimentParts = [
    {
      key: "positive",
      pct: positivePct,
      label: "Positive",
      bar: "bg-success",
      text: "text-success",
      icon: Smile,
    },
    {
      key: "neutral",
      pct: neutralPct,
      label: "Neutral",
      bar: "bg-warning",
      text: "text-warning",
      icon: Meh,
    },
    {
      key: "negative",
      pct: negativePct,
      label: "Negative",
      bar: "bg-destructive",
      text: "text-destructive",
      icon: Frown,
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Financial & Conversion Performance */}
      <GlassCard>
        <AnalyticsCardHeader
          title="Financial & Conversion"
          icon={DollarSign}
          iconColor="text-success"
        />
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {financial?.map((metric, i) => (
              <MetricCard key={metric?.title} {...metric} {...FINANCIAL_ICONS[i]!} />
            ))}
          </div>
        </CardContent>
      </GlassCard>

      {/* Engagement Funnel */}
      <GlassCard>
        <AnalyticsCardHeader title="Engagement Funnel" icon={Filter} iconColor="text-primary" />
        <CardContent>
          <div className="space-y-2">
            {funnel?.map((item) => {
              const value = item?.value ?? 0;
              const percentage = funnelTop ? (value / funnelTop) * 100 : 0;
              return (
                <div key={item?.stage} className="flex items-center gap-3">
                  <span className="text-foreground-secondary w-24 truncate text-xs">
                    {item?.stage}
                  </span>
                  <div className="bg-background h-6 flex-1 overflow-hidden rounded-lg">
                    <div
                      className="from-primary to-accent flex h-full items-center justify-end bg-gradient-to-r px-2 transition-all duration-500"
                      style={{ width: `${Math.min(percentage, 100)}%` }}>
                      {value > 0 && (
                        <span className="text-[10px] font-medium text-white">
                          {formatCount(value)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-foreground w-12 text-right text-xs font-medium">
                    {funnelTop ? `${percentage?.toFixed(0)}%` : EMPTY}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </GlassCard>

      {/* Social & Sentiment */}
      <GlassCard>
        <AnalyticsCardHeader
          title="Social & Sentiment"
          icon={MessageSquare}
          iconColor="text-accent"
        />
        <CardContent>
          {/* Interaction Volume */}
          <div className="mb-4 grid grid-cols-4 gap-2">
            {[
              { icon: ThumbsUp, tone: "text-success", value: totals?.likes, label: "Likes" },
              {
                icon: ThumbsDown,
                tone: "text-destructive",
                value: sentiment?.dislikes,
                label: "Dislikes",
              },
              {
                icon: MessageSquare,
                tone: "text-primary",
                value: totals?.comments,
                label: "Comments",
              },
              { icon: Share2, tone: "text-accent", value: totals?.shares, label: "Shares" },
            ]?.map(({ icon: Icon, tone, value, label }) => (
              <div key={label} className="bg-background-tertiary rounded-lg p-2 text-center">
                <Icon className={`${tone} mx-auto mb-1 h-4 w-4`} />
                <p className="text-foreground text-sm font-bold">{formatCount(value ?? 0)}</p>
              </div>
            ))}
          </div>

          {/* Sentiment Bar */}
          <div className="mb-4">
            <p className="text-foreground-secondary mb-2 text-xs">Sentiment Analysis</p>
            <div className="bg-background flex h-4 overflow-hidden rounded-lg">
              {sentimentParts?.map(({ key, pct, bar, icon: Icon }) =>
                pct ? (
                  <div
                    key={key}
                    className={`${bar} flex items-center justify-center`}
                    style={{ width: `${pct}%` }}>
                    {pct >= 10 && <Icon className="h-3 w-3 text-white" />}
                  </div>
                ) : null,
              )}
            </div>
            <div className="text-foreground-secondary mt-1 flex justify-between text-[10px]">
              {sentimentParts?.map(({ key, pct, label, text }) => (
                <span key={key} className={text}>
                  {pct == null ? EMPTY : `${pct}%`} {label}
                </span>
              ))}
            </div>
          </div>

          {/* Share Velocity — shares per hour over the last 24 h, oldest first */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-2 text-xs">
              <p className="text-foreground-secondary">Share Velocity (24h)</p>
              <p className="text-foreground-muted">
                {formatCount(shareVelocity?.last24h ?? 0)} shares
                {formatChange(shareVelocity?.changePct) &&
                  ` · ${formatChange(shareVelocity?.changePct)}`}
              </p>
            </div>
            {peakShares > 0 ? (
              <div className="bg-background-tertiary flex h-16 items-end gap-0.5 rounded-lg p-2">
                {hourlyShares?.map((h) => (
                  <div
                    key={h?.hour}
                    title={`${formatHour(h?.hour)} · ${formatCount(h?.shares ?? 0)} shares`}
                    className="bg-accent/80 min-h-0.5 flex-1 rounded-sm"
                    style={{ height: `${((h?.shares ?? 0) / peakShares) * 100}%` }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-background-tertiary text-muted-foreground flex h-16 items-center justify-center rounded-lg text-sm">
                {EMPTY}
              </div>
            )}
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}
