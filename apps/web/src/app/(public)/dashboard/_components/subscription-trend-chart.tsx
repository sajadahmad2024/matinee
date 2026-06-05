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

const data = [
  { date: "Jan 1", newSubs: 1200, cancellations: 180 },
  { date: "Jan 8", newSubs: 1450, cancellations: 210 },
  { date: "Jan 15", newSubs: 1380, cancellations: 165 },
  { date: "Jan 22", newSubs: 1620, cancellations: 195 },
  { date: "Jan 29", newSubs: 1780, cancellations: 220 },
  { date: "Feb 5", newSubs: 1550, cancellations: 175 },
  { date: "Feb 12", newSubs: 1890, cancellations: 240 },
  { date: "Feb 19", newSubs: 2100, cancellations: 198 },
  { date: "Feb 26", newSubs: 1950, cancellations: 215 },
  { date: "Mar 5", newSubs: 2250, cancellations: 185 },
];

export function SubscriptionTrendChart() {
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
