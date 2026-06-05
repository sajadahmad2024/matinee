"use client";

import { useState } from "react";

import { Crown, Flame, Plus, Settings, Star, Trophy, Upload, Users, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <GlassCard
      className={!badge.isActive ? "opacity-60" : "hover:border-accent/30 transition-colors"}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-xl p-3 ${badge.isActive ? "from-accent/20 to-accent/5 text-accent bg-gradient-to-br" : "bg-muted/50 text-muted-foreground"}`}>
              {ICON_MAP[badge.iconType]}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                {badge.name}
                {!badge.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Inactive
                  </Badge>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">Badge Management</h3>
          <p className="text-muted-foreground text-sm">Create static milestones users can earn</p>
        </div>
        <CreateBadgeDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockBadges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  );
}
