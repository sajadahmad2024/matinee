"use client";

import { useState } from "react";

import { Check, Download, FileText, ListChecks, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Metric catalog grouped by area — admins pick exactly what a stakeholder needs.
const METRIC_GROUPS: Record<string, string[]> = {
  Users: ["Total Users", "Signed Up", "Active Users", "Churn Rate", "Retention (D1/D7/D30)"],
  Engagement: ["Watch Rate", "Completion Rate", "Avg Session Length", "DAU/MAU"],
  Monetization: ["MRR", "ARPU", "LTV", "Conversion Rate", "Revenue by Platform"],
  Gamification: ["Points Issued", "Points Redeemed", "Redemption Rate", "Leaderboard Participation"],
  Moderation: ["Reports Volume", "Resolution Time", "Safety Score", "Violations by Category"],
  Content: ["Videos Published", "Views", "Watch Time", "Licensing Status"],
};

// Stakeholder presets — selecting one pre-checks the relevant metrics.
const PRESETS: Record<string, string[]> = {
  custom: [],
  executive: ["Total Users", "MRR", "Churn Rate", "Conversion Rate", "Retention (D1/D7/D30)", "Safety Score"],
  marketing: ["Signed Up", "Conversion Rate", "Watch Rate", "Points Issued", "DAU/MAU"],
  finance: ["MRR", "ARPU", "LTV", "Revenue by Platform", "Conversion Rate"],
  content: ["Videos Published", "Views", "Watch Time", "Completion Rate", "Licensing Status"],
  moderation: ["Reports Volume", "Resolution Time", "Safety Score", "Violations by Category"],
};

const PRESET_LABELS: Record<string, string> = {
  custom: "Custom",
  executive: "Executive Summary",
  marketing: "Marketing",
  finance: "Finance",
  content: "Content Team",
  moderation: "Trust & Safety",
};

interface SavedTemplate {
  name: string;
  metricCount: number;
  range: string;
}

export function ReportBuilder() {
  const [preset, setPreset] = useState<string>("executive");
  const [selected, setSelected] = useState<Set<string>>(new Set(PRESETS.executive));
  const [range, setRange] = useState("30d");
  const [format, setFormat] = useState("csv");
  const [templates, setTemplates] = useState<SavedTemplate[]>([
    { name: "Weekly Executive Brief", metricCount: 6, range: "7d" },
    { name: "Monthly Finance Pack", metricCount: 5, range: "30d" },
  ]);

  const applyPreset = (value: string) => {
    setPreset(value);
    if (value !== "custom") setSelected(new Set(PRESETS[value]));
  };

  const toggle = (metric: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(metric)) next.delete(metric);
      else next.add(metric);
      return next;
    });
    setPreset("custom");
  };

  const rangeLabel =
    ({ "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days", ytd: "Year to date" } as Record<string, string>)[
      range
    ] ?? range;

  const generate = () => {
    if (selected.size === 0) {
      toast.error("Select at least one metric to include in the report.");
      return;
    }
    const rows = [
      ["Report", PRESET_LABELS[preset] ?? "Custom"],
      ["Range", rangeLabel],
      ["Format", format.toUpperCase()],
      ["", ""],
      ["Metric", "Value (sample)"],
      ...Array.from(selected).map((m) => [m, "—"]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(PRESET_LABELS[preset] ?? "custom").toLowerCase().replace(/\s+/g, "-")}-report.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Report generated · ${selected.size} metrics · ${rangeLabel}`);
  };

  const saveTemplate = () => {
    if (selected.size === 0) {
      toast.error("Select metrics before saving a template.");
      return;
    }
    const name = `${PRESET_LABELS[preset] ?? "Custom"} · ${rangeLabel}`;
    setTemplates((prev) => [{ name, metricCount: selected.size, range }, ...prev]);
    toast.success("Template saved");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Configuration */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="text-accent h-4 w-4" /> Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-foreground-secondary text-xs font-medium">Stakeholder</label>
            <Select value={preset} onValueChange={applyPreset}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card">
                {Object.keys(PRESETS).map((k) => (
                  <SelectItem key={k} value={k}>
                    {PRESET_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Presets pre-select the right metrics; tweak below for a custom report.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-foreground-secondary text-xs font-medium">Date range</label>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card">
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="ytd">Year to date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-foreground-secondary text-xs font-medium">Format</label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card">
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-border/50 flex items-center justify-between border-t pt-3">
            <span className="text-muted-foreground text-xs">{selected.size} metrics selected</span>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 gap-2" onClick={generate}>
              <Download className="h-4 w-4" /> Generate
            </Button>
            <Button variant="outline" className="gap-2" onClick={saveTemplate}>
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metric selection */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {Object.entries(METRIC_GROUPS).map(([group, metrics]) => (
            <div key={group}>
              <p className="text-foreground-secondary mb-2 text-xs font-semibold tracking-wide uppercase">
                {group}
              </p>
              <div className="flex flex-wrap gap-2">
                {metrics.map((m) => {
                  const on = selected.has(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggle(m)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        on
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border/50 text-muted-foreground hover:text-foreground"
                      }`}>
                      {on && <Check className="h-3 w-3" />}
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Saved templates */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="text-accent h-4 w-4" /> Saved Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {templates.map((t, i) => (
            <div
              key={`${t.name}-${i}`}
              className="border-border/40 flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-foreground text-sm font-medium">{t.name}</p>
                <p className="text-muted-foreground text-xs">
                  {t.metricCount} metrics ·{" "}
                  {({ "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days" } as Record<string, string>)[
                    t.range
                  ] ?? t.range}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => toast.success(`Running "${t.name}"`)}>
                <Download className="h-3.5 w-3.5" /> Run
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
