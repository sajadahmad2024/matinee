import { Target } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { AnalyticsCardHeader } from "@/components/custom/analytics-card-header";
import { GlassCard } from "@/components/custom/glass-card";

import type { ProposedGamesTrendsDto } from "../../_libs/game-types";

const CHART_CONFIG = {
  wins: { label: "Wins", color: "hsl(var(--success))" },
  losses: { label: "Losses", color: "hsl(var(--destructive))" },
};

/** Win share per format — how balanced each format's difficulty is. */
export function WinLossCard({ data }: { data: ProposedGamesTrendsDto["winLoss"] }) {
  return (
    <GlassCard>
      <AnalyticsCardHeader
        title="Win/Loss Ratio"
        description="Balance per format"
        icon={Target}
        iconColor="text-warning"
      />
      <CardContent>
        <ChartContainer config={CHART_CONFIG} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="format"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="wins" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </GlassCard>
  );
}
