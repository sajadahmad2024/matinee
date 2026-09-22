"use client";

import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { REGION_ANALYTICS, type GraphsData } from "../constants";

// Viral coefficient: invites sent × conversion. >1 = organic growth, <1 = paid-dependent.
// Region-scoped via the `data` prop; defaults to the global baseline.
interface KFactorChartProps {
  data?: GraphsData["kFactor"];
}

export function KFactorChart({ data = REGION_ANALYTICS["global"]!.graphs.kFactor }: KFactorChartProps) {
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
