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
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CardContent } from "@/components/ui/card";

import { AnalyticsHeader } from "../../games/_components/analytics-header";
import { GlassCard } from "../../games/_components/glass-card";
import { CONTENT_FUNNEL_DATA, SHARE_VELOCITY_DATA } from "../constants";

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

export function ContentAnalytics() {
  const sentimentData = { positive: 68, neutral: 22, negative: 10 };
  const interactions = { likes: 124500, dislikes: 8200, comments: 45800, shares: 28400 };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Financial & Conversion Performance */}
      <GlassCard>
        <AnalyticsHeader
          title="Financial & Conversion"
          icon={DollarSign}
          iconColor="text-success"
        />
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              title="Revenue Attribution"
              value="$48.2K"
              subValue="Ads: $32K | Subs: $16.2K"
              icon={DollarSign}
              iconColor="text-success"
            />
            <MetricCard
              title="Game Conversion"
              value="38.9%"
              subValue="Viewer → Player"
              icon={Gamepad2}
              iconColor="text-accent"
            />
            <MetricCard
              title="BTS Upsell CTR"
              value="12.4%"
              subValue="+2.1% vs last month"
              icon={Film}
              iconColor="text-primary"
            />
            <MetricCard
              title="Avg Watch Time"
              value="18:42"
              subValue="of 24:00 avg duration"
              icon={TrendingUp}
              iconColor="text-warning"
            />
          </div>
        </CardContent>
      </GlassCard>

      {/* Engagement Funnel */}
      <GlassCard>
        <AnalyticsHeader title="Engagement Funnel" icon={Filter} iconColor="text-primary" />
        <CardContent>
          <div className="space-y-2">
            {CONTENT_FUNNEL_DATA.map((item) => {
              const percentage = (item.value / CONTENT_FUNNEL_DATA[0].value) * 100;
              return (
                <div key={item.stage} className="flex items-center gap-3">
                  <span className="text-foreground-secondary w-24 truncate text-xs">
                    {item.stage}
                  </span>
                  <div className="bg-background h-6 flex-1 overflow-hidden rounded-lg">
                    <div
                      className="from-primary to-accent flex h-full items-center justify-end bg-gradient-to-r px-2 transition-all duration-500"
                      style={{ width: `${percentage}%` }}>
                      <span className="text-[10px] font-medium text-white">
                        {(item.value / 1000).toFixed(1)}K
                      </span>
                    </div>
                  </div>
                  <span className="text-foreground w-12 text-right text-xs font-medium">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </GlassCard>

      {/* Social & Sentiment */}
      <GlassCard>
        <AnalyticsHeader title="Social & Sentiment" icon={MessageSquare} iconColor="text-accent" />
        <CardContent>
          {/* Interaction Volume */}
          <div className="mb-4 grid grid-cols-4 gap-2">
            <div className="bg-background-tertiary rounded-lg p-2 text-center">
              <ThumbsUp className="text-success mx-auto mb-1 h-4 w-4" />
              <p className="text-foreground text-sm font-bold">
                {(interactions.likes / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="bg-background-tertiary rounded-lg p-2 text-center">
              <ThumbsDown className="text-destructive mx-auto mb-1 h-4 w-4" />
              <p className="text-foreground text-sm font-bold">
                {(interactions.dislikes / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="bg-background-tertiary rounded-lg p-2 text-center">
              <MessageSquare className="text-primary mx-auto mb-1 h-4 w-4" />
              <p className="text-foreground text-sm font-bold">
                {(interactions.comments / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="bg-background-tertiary rounded-lg p-2 text-center">
              <Share2 className="text-accent mx-auto mb-1 h-4 w-4" />
              <p className="text-foreground text-sm font-bold">
                {(interactions.shares / 1000).toFixed(1)}K
              </p>
            </div>
          </div>

          {/* Sentiment Bar */}
          <div className="mb-4">
            <p className="text-foreground-secondary mb-2 text-xs">Sentiment Analysis</p>
            <div className="flex h-4 overflow-hidden rounded-lg">
              <div
                className="bg-success flex items-center justify-center"
                style={{ width: `${sentimentData.positive}%` }}>
                <Smile className="h-3 w-3 text-white" />
              </div>
              <div
                className="bg-warning flex items-center justify-center"
                style={{ width: `${sentimentData.neutral}%` }}>
                <Meh className="h-3 w-3 text-white" />
              </div>
              <div
                className="bg-destructive flex items-center justify-center"
                style={{ width: `${sentimentData.negative}%` }}>
                <Frown className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="text-foreground-secondary mt-1 flex justify-between text-[10px]">
              <span className="text-success">{sentimentData.positive}% Positive</span>
              <span className="text-warning">{sentimentData.neutral}% Neutral</span>
              <span className="text-destructive">{sentimentData.negative}% Negative</span>
            </div>
          </div>

          {/* Share Velocity */}
          <div>
            <p className="text-foreground-secondary mb-2 text-xs">Share Velocity (24h)</p>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SHARE_VELOCITY_DATA}>
                  <defs>
                    <linearGradient id="shareGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(270, 91%, 65%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(270, 91%, 65%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(217, 33%, 14%)",
                      border: "1px solid hsl(217, 33%, 22%)",
                      borderRadius: "6px",
                      fontSize: "11px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="shares"
                    stroke="hsl(270, 91%, 65%)"
                    fill="url(#shareGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}
