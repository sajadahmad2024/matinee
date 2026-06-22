"use client";

import { useState } from "react";

import {
  AlertTriangle,
  Award,
  Crown,
  Flame,
  Plus,
  Settings,
  Star,
  Trophy,
  TrendingDown,
  Upload,
  Users,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** A badge is "underperforming" when few users have earned it, or it's inactive. */
const LOW_ADOPTION_THRESHOLD = 600;
const isUnderperforming = (b: BadgeItem) => !b.isActive || b.usersEarned < LOW_ADOPTION_THRESHOLD;
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { GlassCard } from "./glass-card";

// --- Types ---
export type BadgeTrigger =
  | "total_games_played"
  | "total_watch_time"
  | "watch_streak"
  | "quizzes_completed"
  | "first_place_wins"
  | "fast_completions"
  | "referrals_completed"
  | "prediction_accuracy";

export type BadgeOperator = "greater_than" | "equals" | "less_than" | "greater_or_equal";

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  iconType: "trophy" | "flame" | "star" | "zap" | "crown" | "users";
  trigger: BadgeTrigger;
  operator: BadgeOperator;
  value: number;
  bonusPoints: number;
  usersEarned: number;
  isActive: boolean;
}

// --- Constants ---
const ICON_MAP = {
  trophy: <Trophy className="h-6 w-6" />,
  flame: <Flame className="h-6 w-6" />,
  star: <Star className="h-6 w-6" />,
  zap: <Zap className="h-6 w-6" />,
  crown: <Crown className="h-6 w-6" />,
  users: <Users className="h-6 w-6" />,
};

const TRIGGER_OPTIONS: { value: BadgeTrigger; label: string }[] = [
  { value: "total_games_played", label: "Total Games Played" },
  { value: "total_watch_time", label: "Total Watch Time (mins)" },
  { value: "watch_streak", label: "Watch Streak (days)" },
  { value: "quizzes_completed", label: "Quizzes Completed" },
  { value: "first_place_wins", label: "First Place Wins" },
  { value: "fast_completions", label: "Fast Completions" },
  { value: "referrals_completed", label: "Referrals Completed" },
  { value: "prediction_accuracy", label: "Prediction Accuracy (%)" },
];

const OPERATOR_OPTIONS: { value: BadgeOperator; label: string }[] = [
  { value: "greater_than", label: "Greater than" },
  { value: "equals", label: "Equals" },
  { value: "less_than", label: "Less than" },
  { value: "greater_or_equal", label: "Greater or equal" },
];

const mockBadges: BadgeItem[] = [
  {
    id: "1",
    name: "Quiz Master",
    description: "Complete 50 quizzes with 80%+ accuracy",
    iconType: "trophy",
    trigger: "quizzes_completed",
    operator: "greater_than",
    value: 50,
    bonusPoints: 500,
    usersEarned: 1234,
    isActive: true,
  },
  {
    id: "2",
    name: "Streak Champion",
    description: "Maintain a 30-day watch streak",
    iconType: "flame",
    trigger: "watch_streak",
    operator: "equals",
    value: 30,
    bonusPoints: 1000,
    usersEarned: 456,
    isActive: true,
  },
  {
    id: "3",
    name: "Binge Watcher",
    description: "Watch over 100 hours of content",
    iconType: "star",
    trigger: "total_watch_time",
    operator: "greater_than",
    value: 6000,
    bonusPoints: 750,
    usersEarned: 2341,
    isActive: true,
  },
  {
    id: "4",
    name: "Speed Demon",
    description: "Complete 10 games in under 5 minutes each",
    iconType: "zap",
    trigger: "fast_completions",
    operator: "greater_than",
    value: 10,
    bonusPoints: 300,
    usersEarned: 567,
    isActive: true,
  },
  {
    id: "5",
    name: "First Place",
    description: "Win first place in any leaderboard",
    iconType: "crown",
    trigger: "first_place_wins",
    operator: "greater_than",
    value: 1,
    bonusPoints: 200,
    usersEarned: 890,
    isActive: true,
  },
  {
    id: "6",
    name: "Social Butterfly",
    description: "Refer 5 friends who complete their first game",
    iconType: "users",
    trigger: "referrals_completed",
    operator: "greater_than",
    value: 5,
    bonusPoints: 400,
    usersEarned: 234,
    isActive: false,
  },
];

// --- Sub-components ---

function BadgeCard({ badge }: { badge: BadgeItem }) {
  const triggerLabel = TRIGGER_OPTIONS.find((t) => t.value === badge.trigger)?.label;
  const operatorLabel = OPERATOR_OPTIONS.find((o) => o.value === badge.operator)?.label;
  const lowAdoption = badge.isActive && badge.usersEarned < LOW_ADOPTION_THRESHOLD;

  return (
    <GlassCard
      className={
        !badge.isActive
          ? "opacity-60"
          : lowAdoption
            ? "border-warning/30 hover:border-warning/50 transition-colors"
            : "hover:border-accent/30 transition-colors"
      }>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-xl p-3 ${badge.isActive ? "from-accent/20 to-accent/5 text-accent bg-gradient-to-br" : "bg-muted/50 text-muted-foreground"}`}>
              {ICON_MAP[badge.iconType]}
            </div>
            <div>
              <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                {badge.name}
                {!badge.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Inactive
                  </Badge>
                )}
                {lowAdoption && (
                  <span className="text-warning bg-warning/10 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium">
                    <TrendingDown className="h-3 w-3" />
                    Low adoption
                  </span>
                )}
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-xs">{badge.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-muted/30 rounded-lg p-3 font-mono text-xs">
          <span className="text-accent">{triggerLabel}</span>{" "}
          <span className="text-muted-foreground">{operatorLabel}</span>{" "}
          <span className="text-success">{badge.value}</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Users className="text-muted-foreground h-4 w-4" />
            <span className="text-foreground-secondary text-sm">
              {badge.usersEarned.toLocaleString()} earned
            </span>
          </div>
          {badge.bonusPoints > 0 && (
            <Badge variant="outline" className="text-xs">
              +{badge.bonusPoints} pts
            </Badge>
          )}
        </div>
      </CardContent>
    </GlassCard>
  );
}

function CreateBadgeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Badge
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-card max-w-2xl!">
        <DialogHeader>
          <DialogTitle>Create New Badge</DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] space-y-4 overflow-y-auto py-4">
          <div className="space-y-2">
            <Label>Badge Name</Label>
            <Input placeholder="e.g., Quiz Master" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Describe how to earn this badge..." rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Icon (Active & Inactive States)</Label>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="bg-accent/10 border-accent/30 mb-1 flex h-16 w-16 items-center justify-center rounded-lg border border-dashed">
                  <Upload className="text-accent h-6 w-6" />
                </div>
                <span className="text-muted-foreground text-xs">Active</span>
              </div>
              <div className="text-center">
                <div className="bg-muted/50 border-border mb-1 flex h-16 w-16 items-center justify-center rounded-lg border border-dashed">
                  <Upload className="text-muted-foreground h-6 w-6" />
                </div>
                <span className="text-muted-foreground text-xs">Inactive</span>
              </div>
            </div>
          </div>
          <div className="border-border border-t pt-4">
            <Label className="text-sm font-semibold">Criteria Engine</Label>
            <p className="text-muted-foreground mb-4 text-xs">
              Define the logic to unlock this badge
            </p>
            <div className="bg-muted/30 space-y-4 rounded-lg p-4">
              <div className="space-y-2">
                <Label className="text-xs">Trigger</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger..." />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card z-50">
                    {TRIGGER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Operator</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-card z-50">
                      {OPERATOR_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Value</Label>
                  <Input type="number" placeholder="50" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bonus Points (Optional)</Label>
            <Input type="number" placeholder="500" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onOpenChange(false)}>Create Badge</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Component ---

export function BadgeManagement() {
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Performance summary + most-adopted first so admins see impact before scrolling.
  const activeCount = mockBadges.filter((b) => b.isActive).length;
  const totalEarned = mockBadges.reduce((sum, b) => sum + b.usersEarned, 0);
  const underperformers = mockBadges.filter(isUnderperforming);
  const sortedBadges = [...mockBadges].sort((a, b) => b.usersEarned - a.usersEarned);

  const summary = [
    { label: "Total badges", value: String(mockBadges.length), tone: "accent", icon: Award },
    { label: "Active", value: `${activeCount}/${mockBadges.length}`, tone: "success", icon: Trophy },
    { label: "Total earned", value: totalEarned.toLocaleString(), tone: "success", icon: Users },
    {
      label: "Need attention",
      value: String(underperformers.length),
      tone: "warning",
      icon: AlertTriangle,
    },
  ] as const;
  const tone: Record<string, string> = {
    accent: "text-accent",
    success: "text-success",
    warning: "text-warning",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">Badge Management</h3>
          <p className="text-muted-foreground text-sm">Create static milestones users can earn</p>
        </div>
        <CreateBadgeDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
      </div>

      {/* Performance summary — identify underperformers without opening each card */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">{s.label}</span>
                  <Icon className={`h-4 w-4 ${tone[s.tone]}`} />
                </div>
                <p className="text-foreground mt-2 text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {underperformers.length > 0 && (
        <p className="text-muted-foreground text-xs">
          Sorted by adoption ·{" "}
          <span className="text-warning">{underperformers.length} badge(s) flagged</span> for low
          adoption or inactive status.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedBadges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  );
}
