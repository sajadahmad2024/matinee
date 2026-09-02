"use client";

import { CalendarClock } from "lucide-react";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { GlassCard } from "@/app/(public)/games/_components/glass-card";

import type { ExperienceStatus } from "../../constants";

// Status control covers the pre-settlement states; ended/archived are set by the settle flow.
const STATUS_OPTIONS: { value: ExperienceStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "live", label: "Live" },
];

interface ExperienceScheduleCardProps {
  experienceAt: string; // yyyy-MM (month granularity)
  status: ExperienceStatus;
  onExperienceAtChange: (v: string) => void;
  onStatusChange: (v: ExperienceStatus) => void;
}

export function ExperienceScheduleCard({
  experienceAt,
  status,
  onExperienceAtChange,
  onStatusChange,
}: ExperienceScheduleCardProps) {
  const editableStatus = STATUS_OPTIONS.some((o) => o.value === status);

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="text-info h-4 w-4" /> Schedule
        </CardTitle>
        <CardDescription>
          Independent of the bidding window — bidding can close in Nov 2026 for a Jan 2027
          experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="exp-when">Experience timeframe</Label>
          <Input
            id="exp-when"
            type="month"
            value={experienceAt}
            onChange={(e) => onExperienceAtChange(e.target.value)}
          />
          <p className="text-muted-foreground text-xs">Month granularity is enough for planning.</p>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          {editableStatus ? (
            <Select
              value={status}
              onValueChange={(v) => onStatusChange(v as ExperienceStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card">
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-muted-foreground border-border/60 rounded-md border px-3 py-2 text-sm capitalize">
              {status} — managed by the settle flow
            </p>
          )}
        </div>
      </CardContent>
    </GlassCard>
  );
}
