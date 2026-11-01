import { Share2 } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { ContentAnalyticsDto } from "@/app/_libs/hooks/api/use-admin-analytics";

import { CHART_TOOLTIP_STYLE, trafficSourceRows } from "../video-analytics-config";
import { AnalyticsCard } from "./analytics-card";

/** Where the window's views came from, as a donut + legend. */
export function TrafficSourcesCard({ analytics }: { analytics?: ContentAnalyticsDto }) {
  const sources = trafficSourceRows(analytics);
  const hasTraffic = sources?.some((source) => source?.value > 0);

  return (
    <AnalyticsCard title="Traffic Sources" icon={Share2} tone="text-accent">
      <div className="relative h-[200px]">
        {!hasTraffic && analytics && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-gaming text-foreground text-xl font-bold">0</span>
            <span className="text-muted-foreground text-[10px] tracking-wide uppercase">views</span>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* No traffic yet: an empty grey ring in place of the slices. */}
            <Pie
              data={hasTraffic ? sources : [{ name: "No data", value: 1 }]}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={hasTraffic ? 4 : 0}
              dataKey="value"
              isAnimationActive={hasTraffic}>
              {hasTraffic ? (
                sources?.map((entry, index) => <Cell key={index} fill={entry.color} />)
              ) : (
                <Cell fill="hsl(217, 33%, 22%)" stroke="none" />
              )}
            </Pie>
            {hasTraffic && <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />}
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* The empty ring already says "0 views" — just a short caption under it. */}
      {!hasTraffic && analytics && (
        <div className="mt-2 text-center">
          <p className="text-foreground text-sm font-medium">No traffic in this period</p>
          <p className="text-muted-foreground text-xs">Sources appear once the video gets views.</p>
        </div>
      )}
      {hasTraffic && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {sources?.map((source) => (
            <div key={source.name} className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: source.color }} />
              <span className="text-foreground-secondary">{source.name}</span>
              <span className="text-foreground ml-auto font-medium">{source.value}%</span>
            </div>
          ))}
        </div>
      )}
    </AnalyticsCard>
  );
}
