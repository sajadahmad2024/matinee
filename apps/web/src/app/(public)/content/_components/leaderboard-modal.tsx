"use client";

import { useState } from "react";

import { CheckCircle, Clock, Gift, Medal, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { cn } from "@/app/_libs/utils/cn";

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  score: number;
  timeTaken: string;
  rewardStatus: "pending" | "distributed";
}

interface GameInstance {
  id: string;
  name: string;
  type: string;
  participants: number;
  entries: LeaderboardEntry[];
}

const mockGameInstances: GameInstance[] = [
  {
    id: "1",
    name: "Avengers Quiz",
    type: "predict_outcome",
    participants: 2450,
    entries: [
      {
        rank: 1,
        id: "u1",
        name: "Alex Kim",
        avatar: "🏆",
        score: 980,
        timeTaken: "02:15",
        rewardStatus: "distributed",
      },
      {
        rank: 2,
        id: "u2",
        name: "Sarah Chen",
        avatar: "🥈",
        score: 945,
        timeTaken: "02:42",
        rewardStatus: "distributed",
      },
      {
        rank: 3,
        id: "u3",
        name: "Mike Johnson",
        avatar: "🥉",
        score: 920,
        timeTaken: "03:05",
        rewardStatus: "distributed",
      },
      {
        rank: 4,
        id: "u4",
        name: "Emma Davis",
        avatar: "👤",
        score: 890,
        timeTaken: "03:28",
        rewardStatus: "pending",
      },
      {
        rank: 5,
        id: "u5",
        name: "James Wilson",
        avatar: "👤",
        score: 875,
        timeTaken: "03:45",
        rewardStatus: "pending",
      },
      {
        rank: 6,
        id: "u6",
        name: "Lily Zhang",
        avatar: "👤",
        score: 860,
        timeTaken: "04:02",
        rewardStatus: "pending",
      },
    ],
  },
  {
    id: "2",
    name: "Binge Streak Challenge",
    type: "watch_streak",
    participants: 1820,
    entries: [
      {
        rank: 1,
        id: "u7",
        name: "Chris Park",
        avatar: "🏆",
        score: 7,
        timeTaken: "7 days",
        rewardStatus: "distributed",
      },
      {
        rank: 2,
        id: "u8",
        name: "Nina Patel",
        avatar: "🥈",
        score: 6,
        timeTaken: "6 days",
        rewardStatus: "distributed",
      },
      {
        rank: 3,
        id: "u9",
        name: "Tom Brown",
        avatar: "🥉",
        score: 5,
        timeTaken: "5 days",
        rewardStatus: "distributed",
      },
    ],
  },
];

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
}

export function LeaderboardModal({ isOpen, onClose, videoTitle }: LeaderboardModalProps) {
  const [selectedGame, setSelectedGame] = useState(mockGameInstances[0].id);
  const [rewardTarget, setRewardTarget] = useState<"top" | "manual">("top");
  const [topCount, setTopCount] = useState("10");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [pointsReward, setPointsReward] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("");

  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-border bg-card h-[95vh] max-w-3xl! overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Trophy className="text-warning h-5 w-5" />
            {videoTitle} - Game Results
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedGame} onValueChange={setSelectedGame} className="mt-4">
          <TabsList className="bg-background-secondary">
            {mockGameInstances.map((game) => (
              <TabsTrigger key={game.id} value={game.id} className="gap-2">
                {game.name}
                <span className="text-muted-foreground text-xs">({game.participants})</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {mockGameInstances.map((game) => (
            <TabsContent key={game.id} value={game.id} className="mt-4 space-y-4">
              {/* Auto Distribution Banner */}
              <div className="bg-success/10 border-success/20 text-foreground-secondary flex items-center gap-2 rounded-lg border p-3 text-sm">
                <Gift className="text-success h-4 w-4" />
                <span>
                  <span className="text-success font-medium">Auto-Distribution:</span> Top 3
                  received 100 XP automatically
                </span>
              </div>

              {/* Leaderboard Table */}
              <div className="border-border overflow-hidden rounded-lg border">
                <table className="w-full">
                  <thead className="bg-background-tertiary">
                    <tr>
                      <th className="text-foreground-secondary w-8 p-3 text-left text-xs font-medium"></th>
                      <th className="text-foreground-secondary p-3 text-left text-xs font-medium">
                        Rank
                      </th>
                      <th className="text-foreground-secondary p-3 text-left text-xs font-medium">
                        User
                      </th>
                      <th className="text-foreground-secondary p-3 text-left text-xs font-medium">
                        Score
                      </th>
                      <th className="text-foreground-secondary p-3 text-left text-xs font-medium">
                        Time
                      </th>
                      <th className="text-foreground-secondary p-3 text-left text-xs font-medium">
                        Reward
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {game.entries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-border hover:bg-background-secondary/50 border-t">
                        <td className="p-3">
                          <Checkbox
                            checked={selectedUsers.includes(entry.id)}
                            onCheckedChange={() => handleUserSelect(entry.id)}
                            disabled={rewardTarget !== "manual"}
                          />
                        </td>
                        <td className="p-3">
                          <span
                            className={cn(
                              "font-gaming font-bold",
                              entry.rank === 1 && "text-warning",
                              entry.rank === 2 && "text-foreground-secondary",
                              entry.rank === 3 && "text-featured",
                            )}>
                            #{entry.rank}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{entry.avatar}</span>
                            <span className="text-foreground font-medium">{entry.name}</span>
                          </div>
                        </td>
                        <td className="text-foreground p-3 font-mono">{entry.score}</td>
                        <td className="text-foreground-secondary flex items-center gap-1 p-3">
                          <Clock className="h-3 w-3" />
                          {entry.timeTaken}
                        </td>
                        <td className="p-3">
                          {entry.rewardStatus === "distributed" ? (
                            <span className="text-success flex items-center gap-1 text-sm">
                              <CheckCircle className="h-4 w-4" />
                              Distributed
                            </span>
                          ) : (
                            <span className="text-warning text-sm">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Reward Distribution */}
              <div className="bg-background-secondary border-border rounded-lg border p-4">
                <h4 className="text-foreground mb-4 flex items-center gap-2 font-semibold">
                  <Medal className="text-accent h-4 w-4" />
                  Send Custom Rewards
                </h4>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Target Selection */}
                  <div className="space-y-3">
                    <Label className="text-foreground-secondary">Target Selection</Label>
                    <RadioGroup
                      value={rewardTarget}
                      onValueChange={(v) => setRewardTarget(v as "top" | "manual")}>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="top" id="top" />
                        <Label htmlFor="top" className="flex cursor-pointer items-center gap-2">
                          Top
                          <Input
                            type="number"
                            value={topCount}
                            onChange={(e) => setTopCount(e.target.value)}
                            className="h-8 w-16"
                            disabled={rewardTarget !== "top"}
                          />
                          Players
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="manual" id="manual" />
                        <Label htmlFor="manual" className="cursor-pointer">
                          Manual Selection ({selectedUsers.length} selected)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Reward Type */}
                  <div className="space-y-3">
                    <Label className="text-foreground-secondary">Reward Type</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="w-16">Points:</Label>
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={pointsReward}
                          onChange={(e) => setPointsReward(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="w-16">Badge:</Label>
                        <Select value={selectedBadge} onValueChange={setSelectedBadge}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select a badge" />
                          </SelectTrigger>
                          <SelectContent className="border-border bg-popover">
                            <SelectItem value="quiz_master">🎯 Quiz Master</SelectItem>
                            <SelectItem value="streak_king">🔥 Streak King</SelectItem>
                            <SelectItem value="top_player">⭐ Top Player</SelectItem>
                            <SelectItem value="champion">🏆 Champion</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="mt-4 w-full">
                  <Gift className="mr-2 h-4 w-4" />
                  Distribute Rewards
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
