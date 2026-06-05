"use client";

import { format } from "date-fns";
import { BarChart3, Eye, Gamepad2, Link2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";

import { cn } from "@/app/_libs/utils/cn";

import { GlassCard } from "../../../_components/glass-card";

export interface GameInstance {
  id: string;
  name: string;
  videoTitle: string | null;
  videoId: string | null;
  status: string;
  startDate: Date;
  endDate: Date;
  participants: number;
  completions: number;
  pointsDistributed: number;
}

interface GameInstancesListProps {
  gameInstances: GameInstance[];
  formatIcon: React.ElementType;
  onOpenAnalytics: (game: GameInstance) => void;
  onViewVideo: (videoId: string) => void;
}

export function GameInstancesList({
  gameInstances,
  formatIcon: FormatIcon,
  onOpenAnalytics,
  onViewVideo,
}: GameInstancesListProps) {
  return (
    <div className="space-y-3">
      {gameInstances.map((game) => (
        <GlassCard
          key={game.id}
          className={cn(
            "hover:border-accent/30 transition-colors",
            game.status === "ended" && "opacity-70",
          )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-accent/10 rounded-lg p-2">
                  <FormatIcon className="text-accent h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-foreground font-medium">{game.name}</h4>
                    <Badge
                      variant={game.status === "active" ? "default" : "secondary"}
                      className={cn(
                        game.status === "active" && "bg-success/20 text-success border-success/30",
                      )}>
                      {game.status === "active" ? "Active" : "Ended"}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                    {game.videoTitle ? (
                      <span className="flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        {game.videoTitle}
                      </span>
                    ) : (
                      <span className="text-warning flex items-center gap-1">
                        <Gamepad2 className="h-3 w-3" />
                        Standalone Game
                      </span>
                    )}
                    <span>•</span>
                    <span>
                      {format(game.startDate, "MMM d")} - {format(game.endDate, "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-foreground text-sm font-medium">
                    {game.participants.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-xs">Participants</p>
                </div>
                <div className="text-right">
                  <p className="text-success text-sm font-medium">
                    {game.completions.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-xs">Completions</p>
                </div>
                <div className="text-right">
                  <p className="text-accent text-sm font-medium">
                    {(game.pointsDistributed / 1000).toFixed(0)}K
                  </p>
                  <p className="text-muted-foreground text-xs">Points</p>
                </div>
                <div className="flex items-center gap-2">
                  {game.videoId && (
                    <Button variant="outline" size="sm" onClick={() => onViewVideo(game.videoId!)}>
                      <Eye className="mr-1 h-4 w-4" />
                      Video
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => onOpenAnalytics(game)}>
                    <BarChart3 className="mr-1 h-4 w-4" />
                    Analytics
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </GlassCard>
      ))}
    </div>
  );
}
