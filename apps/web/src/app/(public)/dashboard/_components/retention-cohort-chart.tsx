"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { REGION_ANALYTICS, type GraphsData } from "../constants";

// D0 → D30 retention curve for recent cohorts (the single most important consumer-app chart).
// Region-scoped via the `retention` prop; defaults to the global baseline.
interface RetentionCohortChartProps {
  retention?: GraphsData["retention"];
}

export function RetentionCohortChart({
  retention = REGION_ANALYTICS["global"]!.graphs.retention,
}: RetentionCohortChartProps) {
  const data = retention.series.map((r) => ({
    day: r.day,
    "May cohort": r.current,
    "Apr cohort": r.previous,
  }));
  return (
    <div>
      <div className="text-muted-foreground mb-2 flex items-center gap-4 text-xs">
        <span>D1 <b className="text-foreground">{retention.d1}%</b></span>
        <span>D7 <b className="text-foreground">{retention.d7}%</b></span>
        <span>D30 <b className="text-foreground">{retention.d30}%</b></span>
        <span className="text-success">↑ improving vs Apr</span>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(215, 20%, 65%)" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(215, 20%, 65%)" }} unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(217, 33%, 14%)",
                border: "1px solid hsl(217, 33%, 22%)",
                borderRadius: "6px",
                fontSize: "11px",
              }}
            />
            <Line type="monotone" dataKey="May cohort" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Apr cohort" stroke="hsl(270, 91%, 65%)" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
