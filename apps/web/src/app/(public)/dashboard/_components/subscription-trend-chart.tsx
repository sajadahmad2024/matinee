"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { REGION_ANALYTICS, type MonetizationData } from "../constants";

// New subs vs cancellations — region-scoped via the `data` prop; defaults to the global baseline.
interface SubscriptionTrendChartProps {
  data?: MonetizationData["subsTrend"];
}

export function SubscriptionTrendChart({
  data = REGION_ANALYTICS["global"]!.monetization.subsTrend,
}: SubscriptionTrendChartProps) {
  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" vertical={false} />
          <XAxis
            dataKey="date"
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
            itemStyle={{ padding: "2px 0" }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px" }}
          />
          <Line
            type="monotone"
            dataKey="newSubs"
            name="New Subscriptions"
            stroke="hsl(142, 76%, 45%)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(142, 76%, 45%)" }}
          />
          <Line
            type="monotone"
            dataKey="cancellations"
            name="Cancellations"
            stroke="hsl(0, 84%, 60%)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(0, 84%, 60%)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
