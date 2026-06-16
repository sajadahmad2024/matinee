"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Coins, Flame, Swords, Trophy } from "lucide-react";

import { MetricTile } from "./metric-tile";

// Points earned per day, broken down by source — which actions actually drive engagement.
const earnedBySource = [
  { name: "Watching", value: 42, color: "hsl(217, 91%, 60%)" },
  { name: "Streaks", value: 23, color: "hsl(38, 92%, 50%)" },
  { name: "Sharing", value: 16, color: "hsl(270, 91%, 65%)" },
  { name: "Referrals", value: 12, color: "hsl(142, 71%, 45%)" },
  { name: "Challenges", value: 7, color: "hsl(0, 84%, 60%)" },
];

// Points balance distribution — who is hoarding points.
const balanceBuckets = [
  { bucket: "0–500", pct: 38 },
  { bucket: "500–2K", pct: 31 },
  { bucket: "2K–10K", pct: 22 },
  { bucket: "10K+", pct: 9 },
];

export function PointsEconomySection() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Earned / user / day" value="312" sub="avg points issued" icon={Coins} accent="text-warning" trend={{ direction: "up", label: "+6%" }} />
        <MetricTile label="Spent / redeemed" value="49%" sub="of issued points redeemed" icon={Coins} accent="text-success" trend={{ direction: "up", label: "+15pts" }} />
        <MetricTile label="Current streak (avg)" value="6.4d" sub="longest 41d" icon={Flame} accent="text-destructive" trend={{ direction: "up", label: "+0.3d" }} />
        <MetricTile label="Challenge participation" value="27%" sub="of actives · 62% completion" icon={Swords} accent="text-accent" trend={{ direction: "up", label: "+3%" }} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Earned by source */}
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

        {/* Balance distribution */}
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
          <p className="text-muted-foreground mt-2 text-[11px]">9% hold 10K+ — watch for hoarding.</p>
        </div>

        {/* Leaderboard engagement */}
        <div className="border-border bg-card/50 rounded-lg border p-4">
          <p className="text-foreground mb-3 flex items-center gap-1.5 text-sm font-medium">
            <Trophy className="text-warning h-4 w-4" /> Leaderboard
          </p>
          <div className="space-y-2 text-sm">
            <Row label="Avg rank change / week" value="±142" />
            <Row label="Users checking leaderboard" value="34%" />
            <Row label="Top-100 churn / month" value="18%" />
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
