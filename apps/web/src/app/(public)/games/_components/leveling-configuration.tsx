"use client";

import { useMemo, useState } from "react";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Save,
  TrendingUp,
  Users,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Progression health (mock) — surfaces real-user outcomes, not just raw config.
const PROGRESSION_HEALTH = [
  { label: "Median level", value: "Lvl 6", icon: Activity, cls: "text-accent" },
  { label: "Reached Lvl 5+", value: "62%", icon: Users, cls: "text-success" },
  { label: "Biggest drop-off", value: "Lvl 7", icon: AlertTriangle, cls: "text-warning" },
  { label: "Avg days to Lvl 10", value: "18d", icon: TrendingUp, cls: "text-accent" },
];
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { GlassCard } from "./glass-card";

// --- Types ---
interface LevelStep {
  level: number;
  xpRequired: number;
  cumulativeXP: number;
  display: string;
}

// --- Sub-components ---

function LevelingHeader({ onReset, onSave }: { onReset: () => void; onSave: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-foreground text-lg font-semibold">Leveling Configuration</h3>
        <p className="text-muted-foreground text-sm">
          Define the mathematical curve for user progression
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={onReset}>
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
        <Button size="sm" className="gap-2" onClick={onSave}>
          <Save className="h-4 w-4" /> Save
        </Button>
      </div>
    </div>
  );
}

function CurveVisualizer({ data }: { data: LevelStep[] }) {
  return (
    <GlassCard className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="text-accent h-4 w-4" /> XP Curve Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ xpRequired: { label: "XP Required", color: "hsl(var(--accent))" } }}
          className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="display"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="xpRequired"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                fill="url(#xpGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </GlassCard>
  );
}

// --- Main Component ---

export function LevelingConfiguration() {
  const [config, setConfig] = useState({ baseXP: 20, multiplier: 1.5, maxLevel: 100 });
  const [showTable, setShowTable] = useState(false);

  const levelData = useMemo(() => {
    const data: LevelStep[] = [];
    let cumulativeXP = 0;
    for (let level = 1; level <= 20; level++) {
      const xpRequired = Math.round(config.baseXP * Math.pow(config.multiplier, level - 1));
      cumulativeXP += xpRequired;
      data.push({ level, xpRequired, cumulativeXP, display: `Lvl ${level}` });
    }
    return data;
  }, [config.baseXP, config.multiplier]);

  const status = useMemo(() => {
    const lastXP = levelData[19]?.xpRequired || 0;
    return { isSteep: lastXP > 50000, isFlat: lastXP < 100 };
  }, [levelData]);

  const updateConfig = (key: keyof typeof config, value: number) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      <LevelingHeader
        onReset={() => setConfig({ baseXP: 20, multiplier: 1.5, maxLevel: 100 })}
        onSave={() => {}}
      />

      {/* Progression health — where real users are, and where they stall */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {PROGRESSION_HEALTH.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">{s.label}</span>
                  <Icon className={`h-4 w-4 ${s.cls}`} />
                </div>
                <p className="text-foreground mt-2 text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-warning/10 border-warning/20 flex items-start gap-2 rounded-lg border p-3">
        <AlertTriangle className="text-warning mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-muted-foreground text-sm">
          <span className="text-warning font-medium">Progression bottleneck:</span> most users stop
          advancing at <span className="text-foreground font-medium">Level 7</span> — consider
          easing the curve between Lvl 6–8.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Base XP (Level 1 → 2)</Label>
              <Input
                type="number"
                value={config.baseXP}
                onChange={(e) => updateConfig("baseXP", Number(e.target.value))}
                min={1}
                max={1000}
              />
            </div>
            <div className="space-y-2">
              <Label>Growth Multiplier</Label>
              <Input
                type="number"
                value={config.multiplier}
                onChange={(e) => updateConfig("multiplier", Number(e.target.value))}
                min={1}
                max={3}
                step={0.1}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Level Cap</Label>
              <Input
                type="number"
                value={config.maxLevel}
                onChange={(e) => updateConfig("maxLevel", Number(e.target.value))}
                min={10}
                max={1000}
              />
            </div>

            {status.isSteep && (
              <div className="bg-warning/10 border-warning/20 flex items-start gap-2 rounded-lg border p-3">
                <AlertCircle className="text-warning mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-warning text-sm font-medium">Steep Curve</p>
                  <p className="text-muted-foreground text-xs">
                    Level 20 requires {levelData[19]?.xpRequired.toLocaleString()} XP.
                  </p>
                </div>
              </div>
            )}
            {status.isFlat && (
              <div className="bg-accent/10 border-accent/20 flex items-start gap-2 rounded-lg border p-3">
                <AlertCircle className="text-accent mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-accent text-sm font-medium">Flat Curve</p>
                  <p className="text-muted-foreground text-xs">Progression may feel too fast.</p>
                </div>
              </div>
            )}
          </CardContent>
        </GlassCard>

        <CurveVisualizer data={levelData} />
      </div>

      <GlassCard>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Level Requirements Table</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setShowTable((v) => !v)}>
              {showTable ? (
                <>
                  Hide <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show full table <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {showTable && (
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border/50 border-b">
                  <th className="text-muted-foreground p-2 px-3 text-left text-xs font-medium">
                    Level
                  </th>
                  {levelData.map((l) => (
                    <th
                      key={l.level}
                      className="text-muted-foreground p-2 px-3 text-center text-xs font-medium">
                      {l.level}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-border/30 divide-y">
                <tr>
                  <td className="text-foreground-secondary px-3 py-3 text-sm">XP Required</td>
                  {levelData.map((l) => (
                    <td
                      key={l.level}
                      className="text-foreground px-3 py-3 text-center font-mono text-sm">
                      {l.xpRequired >= 1000 ? `${(l.xpRequired / 1000).toFixed(1)}k` : l.xpRequired}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-foreground-secondary px-3 py-3 text-sm">Cumulative</td>
                  {levelData.map((l) => (
                    <td
                      key={l.level}
                      className="text-muted-foreground px-3 py-3 text-center font-mono text-xs">
                      {l.cumulativeXP >= 1000
                        ? `${(l.cumulativeXP / 1000).toFixed(1)}k`
                        : l.cumulativeXP}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <Badge variant="outline">
              Total XP to Lvl 20: {levelData[19]?.cumulativeXP.toLocaleString()}
            </Badge>
            <Badge variant="outline">Max Level: {config.maxLevel}</Badge>
          </div>
        </CardContent>
        )}
      </GlassCard>
    </div>
  );
}
