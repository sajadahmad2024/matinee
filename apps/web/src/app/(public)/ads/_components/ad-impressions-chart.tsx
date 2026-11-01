"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCount, formatShortDate } from "@/app/_libs/utils/format";

const GRID = "hsl(217, 33%, 22%)";
const AXIS = { fontSize: 11, fill: "hsl(215, 20%, 65%)" };
const SERIES = "hsl(217, 91%, 60%)";
const TOOLTIP_STYLE = {
  backgroundColor: "hsl(217, 33%, 14%)",
  border: `1px solid ${GRID}`,
  borderRadius: "6px",
  fontSize: "11px",
};

interface AdImpressionsChartProps {
  /** One row per day; `day` is `YYYY-MM-DD` as the API sends it. */
  data: { day: string; impressions: number }[];
  /** `line` for one ad's flight, `bar` for platform totals. */
  variant?: "line" | "bar";
}

/** Impressions per day for an ad or the whole platform. */
export function AdImpressionsChart({ data, variant = "line" }: AdImpressionsChartProps) {
  const rows =
    data?.map((d) => ({ label: formatShortDate(d.day), impressions: d.impressions })) ?? [];
  // an array, not a fragment: recharts 2 finds axes / grid / tooltip among the chart's direct
  // children and doesn't look inside a fragment, so they'd silently not render
  const axes = [
    <CartesianGrid key="grid" strokeDasharray="3 3" stroke={GRID} vertical={false} />,
    <XAxis key="x" dataKey="label" tick={AXIS} minTickGap={24} />,
    <YAxis key="y" tick={AXIS} tickFormatter={(v: number) => formatCount(v)} />,
    <Tooltip
      key="tooltip"
      contentStyle={TOOLTIP_STYLE}
      cursor={variant === "bar" ? { fill: GRID, opacity: 0.4 } : undefined}
      formatter={(v) => [Number(v).toLocaleString(), "Impressions"]}
    />,
  ];

  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        {variant === "bar" ? (
          <BarChart data={rows} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            {axes}
            <Bar dataKey="impressions" fill={SERIES} radius={[3, 3, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={rows} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
            {axes}
            <Line
              type="monotone"
              dataKey="impressions"
              stroke={SERIES}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
