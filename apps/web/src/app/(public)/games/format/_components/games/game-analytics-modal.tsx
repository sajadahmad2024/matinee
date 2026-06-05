"use client";

import { BarChart3, Coins, TrendingUp, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { cn } from "@/app/_libs/utils/cn";

import { GlassCard } from "../../../_components/glass-card";
import type { GameInstance } from "./game-instances-list";

interface GameAnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game: GameInstance | null;
}

const timeOfDayData = [
  { hour: "6am", plays: 120 },
  { hour: "9am", plays: 450 },
  { hour: "12pm", plays: 780 },
  { hour: "3pm", plays: 920 },
  { hour: "6pm", plays: 1400 },
  { hour: "9pm", plays: 1850 },
  { hour: "12am", plays: 680 },
];

export function GameAnalyticsModal({ open, onOpenChange, game }: GameAnalyticsModalProps) {
  if (!game) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="text-accent h-5 w-5" />
              {game.name} - Analytics
            </DialogTitle>
            <Badge
              variant={game.status === "active" ? "default" : "secondary"}
              className={cn(
                game.status === "active" && "bg-success/20 text-success border-success/30",
              )}>
              {game.status === "active" ? "Active" : "Ended"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            {[
              {
                label: "Participants",
                value: game.participants.toLocaleString(),
                icon: Users,
                color: "text-accent",
              },
              {
                label: "Completions",
                value: game.completions.toLocaleString(),
                icon: TrendingUp,
                color: "text-success",
              },
              {
                label: "Points Distributed",
                value: `${(game.pointsDistributed / 1000).toFixed(0)}K`,
                icon: Coins,
                color: "text-warning",
              },
              {
                label: "Completion Rate",
                value: `${((game.completions / game.participants) * 100).toFixed(1)}%`,
                icon: BarChart3,
                color: "text-primary",
              },
            ].map((metric, i) => (
              <GlassCard key={i} className="bg-muted/30!">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("bg-muted/50 rounded-lg p-2")}>
                      <metric.icon className={cn("h-4 w-4", metric.color)} />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">{metric.label}</p>
                      <p className="font-gaming text-foreground text-xl font-bold">
                        {metric.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </GlassCard>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <GlassCard>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Activity by Hour</CardTitle>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ChartContainer
                  config={{ plays: { label: "Plays", color: "hsl(var(--accent))" } }}
                  className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeOfDayData}>
                      <XAxis dataKey="hour" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis hide />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="plays" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </GlassCard>

            <GlassCard>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Performance Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ChartContainer
                  config={{ plays: { label: "Trend", color: "hsl(var(--success))" } }}
                  className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeOfDayData}>
                      <XAxis dataKey="hour" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis hide />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="plays"
                        stroke="hsl(var(--success))"
                        fill="hsl(var(--success) / 0.1)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </GlassCard>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
