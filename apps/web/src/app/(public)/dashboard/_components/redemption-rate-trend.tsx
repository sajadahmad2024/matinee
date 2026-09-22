"use client";

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { REGION_ANALYTICS, type GamificationData } from "../constants";

// % of distributed points that actually get redeemed — signals whether users trust points have value.
// Region-scoped via the `data` prop; defaults to the global baseline.
interface RedemptionRateTrendProps {
  data?: GamificationData["redemptionTrend"];
}

export function RedemptionRateTrend({
  data = REGION_ANALYTICS["global"]!.gamification.redemptionTrend,
}: RedemptionRateTrendProps) {
  const latest = data[data.length - 1]!.rate;
  const delta = latest - data[0]!.rate;
  return (
    <div>
      <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
        <span className="text-foreground text-lg font-bold">{latest}%</span> redeemed this week
        <span className="text-success">↑ {delta >= 0 ? "+" : ""}{Math.round(delta)}pts since W1</span>
        <span className="ml-auto">healthy &gt; 40%</span>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="redemptionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(215, 20%, 65%)" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(215, 20%, 65%)" }} unit="%" domain={[0, 100]} />
            <ReferenceLine y={40} stroke="hsl(38, 92%, 50%)" strokeDasharray="4 4" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(217, 33%, 14%)",
                border: "1px solid hsl(217, 33%, 22%)",
                borderRadius: "6px",
                fontSize: "11px",
              }}
            />
            <Area type="monotone" dataKey="rate" stroke="hsl(142, 71%, 45%)" fill="url(#redemptionGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
