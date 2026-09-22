"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { REGION_ANALYTICS, type MonetizationData } from "../constants";

// Revenue composition — region-scoped via the `data` prop; defaults to the global baseline.
interface RevenueCompositionChartProps {
  data?: MonetizationData["revenueTrend"];
}

export function RevenueCompositionChart({
  data = REGION_ANALYTICS["global"]!.monetization.revenueTrend,
}: RevenueCompositionChartProps) {
  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" vertical={false} />
          <XAxis
            dataKey="month"
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
            tickFormatter={(value) => `$${value / 1000}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(217, 33%, 14%)",
              border: "1px solid hsl(217, 33%, 22%)",
              borderRadius: "8px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
            labelStyle={{ color: "hsl(210, 40%, 96%)" }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px" }}
          />
          <Area
            type="monotone"
            dataKey="subscriptions"
            name="Subscriptions"
            stroke="hsl(217, 91%, 60%)"
            fill="url(#colorSubs)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
