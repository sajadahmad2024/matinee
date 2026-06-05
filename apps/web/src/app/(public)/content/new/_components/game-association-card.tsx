"use client";

import { format } from "date-fns";
import {
  Infinity,
  Calendar,
  Clock,
  Gamepad2,
  GripVertical,
  Link2,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { GlassCard } from "@/app/(public)/games/_components/glass-card";
import { cn } from "@/app/_libs/utils/cn";

export interface GameInstance {
  id: string;
  formatId: string;
  name: string;
  description: string;
  rewardPoints: number;
  experiencePoints: number;
  // Scheduling fields
  startDate?: Date;
  startTime?: string;
  endDate?: Date;
  endTime?: string;
  // Watch Streak specific
  streakDuration?: number | null; // null means forever
  // Weekly Contest specific
  weekCount?: number; // Number of weeks (auto-calculates end date)
  selectedVideos?: string[]; // For Weekly Contest - list of video IDs
}

const gameFormats = [
  { id: "watch_streak", name: "Watch Streak", icon: "🔥", requiresVideo: false },
  { id: "predict_outcome", name: "Predict Outcome", icon: "🎯", requiresVideo: true },
  { id: "weekly_quest", name: "Weekly Contest", icon: "📅", requiresVideo: false },
];

interface GameAssociationCardProps {
  gameInstances: GameInstance[];
  onSetGameInstances: (instances: GameInstance[]) => void;
  selectedFormat: string;
  onSetSelectedFormat: (val: string) => void;
  onAddGameInstance: () => void;
  onRemoveGameInstance: (id: string) => void;
}

export function GameAssociationCard({
  gameInstances,
  onSetGameInstances,
  selectedFormat,
  onSetSelectedFormat,
  onAddGameInstance,
  onRemoveGameInstance,
}: GameAssociationCardProps) {
  const updateGameInstance = (id: string, updates: Partial<GameInstance>) => {
    onSetGameInstances(gameInstances.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-accent flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          Game Association
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Game Format */}
        <div className="flex gap-2">
          <Select value={selectedFormat} onValueChange={onSetSelectedFormat}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select game format to add" />
            </SelectTrigger>
            <SelectContent className="border-border bg-popover z-50">
              {gameFormats.map((format) => (
                <SelectItem key={format.id} value={format.id}>
                  <span className="flex items-center gap-2">
                    <span>{format.icon}</span>
                    {format.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={onAddGameInstance} disabled={!selectedFormat}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>

        {/* Game Instances */}
        <div className="space-y-3">
          {gameInstances.map((game) => {
            const gameFormat = gameFormats.find((f) => f.id === game.formatId);
            return (
              <div
                key={game.id}
                className="bg-background-secondary border-border rounded-lg border p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="text-foreground-muted h-4 w-4 cursor-grab" />
                    <span className="text-xl">{gameFormat?.icon}</span>
                    <span className="text-foreground font-medium">{gameFormat?.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveGameInstance(game.id)}
                    className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Custom Name</Label>
                    <Input
                      value={game.name}
                      onChange={(e) => updateGameInstance(game.id, { name: e.target.value })}
                      placeholder="e.g., Avengers Binge Challenge"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={game.description}
                      onChange={(e) => updateGameInstance(game.id, { description: e.target.value })}
                      placeholder="Instructions for players"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Reward Points</Label>
                    <Input
                      type="number"
                      value={game.rewardPoints}
                      onChange={(e) =>
                        updateGameInstance(game.id, {
                          rewardPoints: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Experience Points (XP)</Label>
                    <Input
                      type="number"
                      value={game.experiencePoints}
                      onChange={(e) =>
                        updateGameInstance(game.id, {
                          experiencePoints: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Dynamic Fields based on format */}

                {/* Predict Outcome - No scheduling, one-time play */}
                {game.formatId === "predict_outcome" && (
                  <div className="border-border mt-3 space-y-3 border-t pt-3">
                    <Label className="text-accent text-xs">Prediction Question</Label>
                    <Input placeholder="What will happen next?" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Option A" />
                      <Input placeholder="Option B" />
                      <Input placeholder="Option C" />
                      <Input placeholder="Correct Answer" />
                    </div>
                    <div className="border-border/50 bg-muted/30 rounded-lg border p-3">
                      <p className="text-muted-foreground flex items-center gap-2 text-xs">
                        <Clock className="h-3 w-3" />
                        One-time gameplay per user — no start/end date required
                      </p>
                    </div>
                  </div>
                )}

                {/* Watch Streak - Optional duration */}
                {game.formatId === "watch_streak" && (
                  <div className="border-border mt-3 space-y-3 border-t pt-3">
                    <Label className="text-accent text-xs">Streak Milestones</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="3 days = 50 pts" />
                      <Input placeholder="7 days = 150 pts" />
                      <Input placeholder="14 days = 400 pts" />
                    </div>

                    {/* Duration Settings */}
                    <div className="border-border/50 bg-muted/30 space-y-3 rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-xs">Limited Duration</Label>
                          <p className="text-muted-foreground text-xs">
                            Set a specific number of days, or leave off for forever
                          </p>
                        </div>
                        <Switch
                          checked={
                            game.streakDuration !== null && game.streakDuration !== undefined
                          }
                          onCheckedChange={(checked) =>
                            updateGameInstance(game.id, {
                              streakDuration: checked ? 30 : null,
                            })
                          }
                        />
                      </div>

                      {game.streakDuration !== null && game.streakDuration !== undefined ? (
                        <div className="space-y-2">
                          <Label className="text-xs">Duration (days)</Label>
                          <Input
                            type="number"
                            value={game.streakDuration}
                            onChange={(e) =>
                              updateGameInstance(game.id, {
                                streakDuration: parseInt(e.target.value) || 30,
                              })
                            }
                            min={1}
                            placeholder="Number of days"
                          />
                        </div>
                      ) : (
                        <div className="text-success flex items-center gap-2">
                          <Infinity className="h-4 w-4" />
                          <span className="text-xs font-medium">Runs forever</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Weekly Contest - Start date with auto-calculated end + video selection */}
                {game.formatId === "weekly_quest" && (
                  <div className="border-border mt-3 space-y-4 border-t pt-3">
                    <Label className="text-accent text-xs">Contest Schedule</Label>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Start Date */}
                      <div className="space-y-2">
                        <Label className="text-xs">Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !game.startDate && "text-muted-foreground",
                              )}>
                              <Calendar className="mr-2 h-4 w-4" />
                              {game.startDate ? format(game.startDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="z-50 w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={game.startDate}
                              onSelect={(date) => updateGameInstance(game.id, { startDate: date })}
                              initialFocus
                              className="pointer-events-auto p-3"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Start Time */}
                      <div className="space-y-2">
                        <Label className="text-xs">Start Time (UTC)</Label>
                        <Input
                          type="time"
                          value={game.startTime || "00:00"}
                          onChange={(e) =>
                            updateGameInstance(game.id, { startTime: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    {/* Number of Weeks */}
                    <div className="space-y-2">
                      <Label className="text-xs">Number of Weeks</Label>
                      <Select
                        value={String(game.weekCount || 1)}
                        onValueChange={(value) =>
                          updateGameInstance(game.id, { weekCount: parseInt(value) })
                        }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent className="border-border bg-popover z-50">
                          <SelectItem value="1">1 Week</SelectItem>
                          <SelectItem value="2">2 Weeks</SelectItem>
                          <SelectItem value="3">3 Weeks</SelectItem>
                          <SelectItem value="4">4 Weeks</SelectItem>
                          <SelectItem value="8">8 Weeks</SelectItem>
                          <SelectItem value="12">12 Weeks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Auto-calculated End Date Display */}
                    {game.startDate && (
                      <div className="border-success/30 bg-success/10 rounded-lg border p-3">
                        <p className="text-success flex items-center gap-2 text-xs font-medium">
                          <Calendar className="h-3 w-3" />
                          Auto-calculated End Date:{" "}
                          {format(
                            new Date(
                              game.startDate.getTime() +
                                (game.weekCount || 1) * 7 * 24 * 60 * 60 * 1000,
                            ),
                            "PPP",
                          )}{" "}
                          at {game.startTime || "00:00"} UTC
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Note for game formats that don't require video linking */}
                {(game.formatId === "watch_streak" || game.formatId === "weekly_quest") && (
                  <div className="border-primary/20 bg-primary/5 mt-3 rounded-lg border p-3">
                    <p className="text-primary flex items-center gap-2 text-xs">
                      <Link2 className="h-3 w-3" />
                      This game format works independently — no video linking required
                    </p>
                  </div>
                )}

                {/* Note for Predict Outcome that requires video */}
                {game.formatId === "predict_outcome" && (
                  <div className="border-warning/30 bg-warning/5 mt-3 rounded-lg border p-3">
                    <p className="text-warning flex items-center gap-2 text-xs">
                      <Link2 className="h-3 w-3" />
                      This game is linked to the current video — required for predictions
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {gameInstances.length === 0 && (
            <div className="text-foreground-secondary py-8 text-center">
              <Gamepad2 className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>No games linked yet. Add a game format above.</p>
            </div>
          )}
        </div>
      </CardContent>
    </GlassCard>
  );
}
