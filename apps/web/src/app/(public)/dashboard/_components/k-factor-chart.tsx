"use client";

import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Viral coefficient: invites sent × conversion. >1 = organic growth, <1 = paid-dependent.
const data = [
  { month: "Jan", k: 0.62 },
  { month: "Feb", k: 0.71 },
  { month: "Mar", k: 0.78 },
  { month: "Apr", k: 0.85 },
  { month: "May", k: 0.94 },
  { month: "Jun", k: 1.06 },
];

export function KFactorChart() {
  const latest = data[data.length - 1]!.k;
  return (
    <div>
      <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
        <span className="text-foreground text-lg font-bold">{latest.toFixed(2)}</span> K-factor
        <span className={latest >= 1 ? "text-success" : "text-warning"}>
          {latest >= 1 ? "self-sustaining (>1)" : "paid-dependent (<1)"}
        </span>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215, 20%, 65%)" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(215, 20%, 65%)" }} domain={[0, 1.5]} />
            <ReferenceLine y={1} stroke="hsl(142, 71%, 45%)" strokeDasharray="4 4" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(217, 33%, 14%)",
                border: "1px solid hsl(217, 33%, 22%)",
                borderRadius: "6px",
                fontSize: "11px",
              }}
            />
            <Bar dataKey="k" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.k >= 1 ? "hsl(142, 71%, 45%)" : "hsl(270, 91%, 65%)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
