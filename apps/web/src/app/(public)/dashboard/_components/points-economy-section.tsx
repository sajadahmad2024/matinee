"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Coins, Flame, Swords, Trophy } from "lucide-react";

import { REGION_ANALYTICS, type GamificationData } from "../constants";
import { MetricTile } from "./metric-tile";

// Points economy breakdown — sources, distribution & leaderboard engagement.
// Region-scoped via the `data` prop; defaults to the global baseline.
interface PointsEconomySectionProps {
  data?: GamificationData;
}

export function PointsEconomySection({
  data = REGION_ANALYTICS["global"]!.gamification,
}: PointsEconomySectionProps) {
  const earnedBySource = data.earnedBySource;
  const balanceBuckets = data.balanceBuckets;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Earned / user / day" value={String(data.earnedPerUserDay)} sub="avg points issued" icon={Coins} accent="text-warning" trend={{ direction: "up", label: "+6%" }} />
        <MetricTile label="Spent / redeemed" value={`${data.redemptionPct}%`} sub="of issued points redeemed" icon={Coins} accent="text-success" trend={{ direction: "up", label: "+15pts" }} />
        <MetricTile label="Current streak (avg)" value={`${data.streakAvgDays}d`} sub={`longest ${data.streakLongestDays}d`} icon={Flame} accent="text-destructive" trend={{ direction: "up", label: "+0.3d" }} />
        <MetricTile label="Challenge participation" value={`${data.challengeParticipationPct}%`} sub={`of actives · ${data.challengeCompletionPct}% completion`} icon={Swords} accent="text-accent" trend={{ direction: "up", label: "+3%" }} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Earned by source — which actions drive engagement vs inflate balances */}
        <div className="border-border bg-card/50 rounded-lg border p-4">
          <p className="text-foreground mb-2 text-sm font-medium">Points earned by source</p>
          <div className="flex items-center gap-3">
            <div className="h-[120px] w-[120px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={earnedBySource} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={32} outerRadius={56} paddingAngle={2}>
                    {earnedBySource.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(217, 33%, 14%)", border: "1px solid hsl(217, 33%, 22%)", borderRadius: "6px", fontSize: "11px" }}
                    formatter={(v: number) => `${v}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1">
              {earnedBySource.map((e) => (
                <div key={e.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: e.color }} />
                  <span className="text-muted-foreground flex-1">{e.name}</span>
                  <span className="text-foreground tabular-nums">{e.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Balance distribution — who is holding points */}
        <div className="border-border bg-card/50 rounded-lg border p-4">
          <p className="text-foreground mb-3 text-sm font-medium">Points balance distribution</p>
          <div className="space-y-2">
            {balanceBuckets.map((b) => (
              <div key={b.bucket}>
                <div className="text-muted-foreground mb-0.5 flex justify-between text-xs">
                  <span>{b.bucket}</span>
                  <span className="tabular-nums">{b.pct}%</span>
                </div>
                <div className="bg-muted/30 h-2 overflow-hidden rounded-full">
                  <div className="from-primary to-accent h-full rounded-full bg-gradient-to-r" style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-2 text-[11px]">
            {balanceBuckets[balanceBuckets.length - 1]!.pct}% hold 10K+ — watch for hoarding.
          </p>
        </div>

        {/* Leaderboard engagement — rank changes + how often users check it */}
        <div className="border-border bg-card/50 rounded-lg border p-4">
          <p className="text-foreground mb-3 flex items-center gap-1.5 text-sm font-medium">
            <Trophy className="text-warning h-4 w-4" /> Leaderboard
          </p>
          <div className="space-y-2 text-sm">
            <Row label="Avg rank change / week" value={`±${data.rankChangeAvgWeek}`} />
            <Row label="Leaderboard checks" value={`${data.leaderboardChecksPerWeek} / user / wk`} />
            <Row label="Users checking leaderboard" value="34%" />
          </div>
          <p className="text-muted-foreground mt-2 text-[11px]">Rank volatility keeps competition alive.</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-foreground font-medium tabular-nums">{value}</span>
    </div>
  );
}
