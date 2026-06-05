"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { period: "Week 1", distributed: 125000, redeemed: 42000 },
  { period: "Week 2", distributed: 148000, redeemed: 55000 },
  { period: "Week 3", distributed: 132000, redeemed: 48000 },
  { period: "Week 4", distributed: 165000, redeemed: 62000 },
];

const distributionBreakdown = [
  { type: "Game Rewards", value: 45, color: "hsl(217, 91%, 60%)" },
  { type: "Referral Bonus", value: 30, color: "hsl(142, 76%, 45%)" },
  { type: "Badge Unlocks", value: 25, color: "hsl(270, 91%, 65%)" },
];

const redemptionBreakdown = [
  { type: "Store Items", value: 55, color: "hsl(25, 95%, 53%)" },
  { type: "Auction Bids", value: 45, color: "hsl(199, 89%, 48%)" },
];

export function PointsEconomyChart() {
  return (
    <div className="flex h-[280px] flex-col gap-6 md:flex-row">
      {/* Main Chart */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" vertical={false} />
            <XAxis
              dataKey="period"
              stroke="hsl(215, 20%, 65%)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(215, 20%, 65%)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value / 1000}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(217, 33%, 14%)",
                border: "1px solid hsl(217, 33%, 22%)",
                borderRadius: "8px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
              labelStyle={{ color: "hsl(210, 40%, 96%)" }}
              formatter={(value: number) => [value.toLocaleString() + " pts", ""]}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px" }}
            />
            <Bar
              dataKey="distributed"
              name="Distributed"
              fill="hsl(217, 91%, 60%)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="redeemed"
              name="Redeemed"
              fill="hsl(25, 95%, 53%)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown Legend */}
      <div className="w-full space-y-4 md:w-44">
        <div>
          <p className="text-foreground-secondary mb-2 text-xs font-medium">Distribution</p>
          <div className="space-y-1.5">
            {distributionBreakdown.map((item) => (
              <div key={item.type} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-foreground-secondary">{item.type}</span>
                </div>
                <span className="text-foreground font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-foreground-secondary mb-2 text-xs font-medium">Redemption</p>
          <div className="space-y-1.5">
            {redemptionBreakdown.map((item) => (
              <div key={item.type} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-foreground-secondary">{item.type}</span>
                </div>
                <span className="text-foreground font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
