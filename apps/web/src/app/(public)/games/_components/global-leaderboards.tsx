"use client";

import { useCallback } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Calendar, Crown, ExternalLink, Gamepad2, Medal, Star, Trophy, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { GlassCard } from "./glass-card";

// --- Types ---
export interface GameInstance {
  id: string;
  gameName: string;
  videoTitle: string;
  format: "Predict" | "Streak" | "Contest";
  dateCreated: string;
  totalPlayers: number;
}

export interface TopPlayer {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  totalWins: number;
  totalXP: number;
  gamesPlayed: number;
}

// --- Mock Data ---
const mockInstances: GameInstance[] = [
  {
    id: "1",
    gameName: "Avengers Prediction",
    videoTitle: "Avengers: Endgame Trailer",
    format: "Predict",
    dateCreated: "2024-01-15",
    totalPlayers: 4523,
  },
  {
    id: "2",
    gameName: "Batman Streak Challenge",
    videoTitle: "The Batman Returns",
    format: "Streak",
    dateCreated: "2024-01-14",
    totalPlayers: 3245,
  },
  {
    id: "3",
    gameName: "Marvel Watch Streak",
    videoTitle: "Marvel Phase 5 Recap",
    format: "Streak",
    dateCreated: "2024-01-12",
    totalPlayers: 2890,
  },
  {
    id: "4",
    gameName: "Dune Prediction",
    videoTitle: "Dune: Part Two Preview",
    format: "Predict",
    dateCreated: "2024-01-10",
    totalPlayers: 1987,
  },
  {
    id: "5",
    gameName: "Weekly Watch Contest",
    videoTitle: "Best of 2024",
    format: "Contest",
    dateCreated: "2024-01-08",
    totalPlayers: 5672,
  },
];

const mockTopPlayers: TopPlayer[] = [
  {
    rank: 1,
    userId: "USR_001",
    name: "GameMaster_Pro",
    totalWins: 156,
    totalXP: 45200,
    gamesPlayed: 342,
  },
  {
    rank: 2,
    userId: "USR_002",
    name: "QuizChampion",
    totalWins: 143,
    totalXP: 41800,
    gamesPlayed: 298,
  },
  {
    rank: 3,
    userId: "USR_003",
    name: "StreakKing",
    totalWins: 128,
    totalXP: 38500,
    gamesPlayed: 276,
  },
  {
    rank: 4,
    userId: "USR_004",
    name: "MovieBuff2024",
    totalWins: 115,
    totalXP: 35200,
    gamesPlayed: 254,
  },
  {
    rank: 5,
    userId: "USR_005",
    name: "PredictorElite",
    totalWins: 102,
    totalXP: 32100,
    gamesPlayed: 231,
  },
  {
    rank: 6,
    userId: "USR_006",
    name: "TrailerHunter",
    totalWins: 98,
    totalXP: 29800,
    gamesPlayed: 218,
  },
  {
    rank: 7,
    userId: "USR_007",
    name: "CinemaGuru",
    totalWins: 89,
    totalXP: 27400,
    gamesPlayed: 195,
  },
  {
    rank: 8,
    userId: "USR_008",
    name: "SpeedWatcher",
    totalWins: 82,
    totalXP: 25100,
    gamesPlayed: 187,
  },
];

// --- Internal Helpers ---

function RankIcon({ rank }: { rank: number }) {
  switch (rank) {
    case 1:
      return <Crown className="text-warning h-5 w-5" />;
    case 2:
      return <Medal className="text-muted-foreground h-5 w-5" />;
    case 3:
      return <Medal className="text-accent h-5 w-5" />;
    default:
      return (
        <span className="text-muted-foreground flex h-5 w-5 items-center justify-center font-mono text-sm">
          {rank}
        </span>
      );
  }
}

function InstanceRow({ instance }: { instance: GameInstance }) {
  return (
    <TableRow className="border-border/30 hover:bg-muted/20 cursor-pointer">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="bg-accent/10 rounded-lg p-2">
            <Gamepad2 className="text-accent h-4 w-4" />
          </div>
          <span className="text-foreground font-medium">{instance.gameName}</span>
        </div>
      </TableCell>
      <TableCell className="text-foreground-secondary max-w-[200px] truncate">
        {instance.videoTitle}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {instance.format}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Calendar className="h-3 w-3" />
          {instance.dateCreated}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Users className="text-muted-foreground h-4 w-4" />
          <span className="text-foreground font-mono">
            {instance.totalPlayers.toLocaleString()}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          View
        </Button>
      </TableCell>
    </TableRow>
  );
}

function PodiumCard({ player, isWinner }: { player: TopPlayer; isWinner: boolean }) {
  return (
    <GlassCard className={isWinner ? "ring-accent/30 scale-105 ring-2" : "text-center"}>
      <CardContent className="pt-6 pb-4 text-center">
        <div className="relative mb-3 inline-block">
          <Avatar className="border-border h-16 w-16 border-2">
            <AvatarImage src={player.avatar} />
            <AvatarFallback className="bg-accent/10 text-accent font-bold">
              {player.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -top-2 -right-2">
            <RankIcon rank={player.rank} />
          </div>
        </div>
        <h4 className="text-foreground mb-1 font-semibold">{player.name}</h4>
        <code className="text-muted-foreground font-mono text-xs">{player.userId}</code>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div>
            <p className="text-accent font-gaming text-lg font-bold">{player.totalWins}</p>
            <p className="text-muted-foreground text-xs">Wins</p>
          </div>
          <div>
            <p className="text-success font-gaming text-lg font-bold">
              {(player.totalXP / 1000).toFixed(1)}K
            </p>
            <p className="text-muted-foreground text-xs">XP</p>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}

// --- Main Component ---

export function GlobalLeaderboards() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const subtab = searchParams.get("subtab") || "instances";
  const formatFilter = searchParams.get("format") || "all";

  const updateQuery = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="space-y-6">
      <Tabs value={subtab} onValueChange={(v) => updateQuery("subtab", v)} className="space-y-6">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="instances" className="cursor-pointer gap-2">
            <Gamepad2 className="h-4 w-4" />
            Game Instances
          </TabsTrigger>
          <TabsTrigger value="hall-of-fame" className="cursor-pointer gap-2">
            <Trophy className="h-4 w-4" />
            Hall of Fame
          </TabsTrigger>
        </TabsList>

        <TabsContent value="instances" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-foreground text-lg font-semibold">Game Instances</h3>
              <p className="text-muted-foreground text-sm">All active games attached to videos</p>
            </div>
            <Select value={formatFilter} onValueChange={(v) => updateQuery("format", v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by format" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card z-50">
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="streak">Watch Streak</SelectItem>
                <SelectItem value="contest">Weekly Contest</SelectItem>
                <SelectItem value="predict">Predict Outcome</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <GlassCard>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Game Name</TableHead>
                      <TableHead className="text-muted-foreground">Linked Video</TableHead>
                      <TableHead className="text-muted-foreground">Format</TableHead>
                      <TableHead className="text-muted-foreground">Created</TableHead>
                      <TableHead className="text-muted-foreground text-right">Players</TableHead>
                      <TableHead className="text-muted-foreground w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockInstances.map((instance) => (
                      <InstanceRow key={instance.id} instance={instance} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </GlassCard>
        </TabsContent>

        <TabsContent value="hall-of-fame" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-foreground text-lg font-semibold">Global Hall of Fame</h3>
              <p className="text-muted-foreground text-sm">Top users across all games</p>
            </div>
            <Select value={formatFilter} onValueChange={(v) => updateQuery("format", v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by format" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card z-50">
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="streak">Streak Champions</SelectItem>
                <SelectItem value="contest">Contest Winners</SelectItem>
                <SelectItem value="predict">Best Predictors</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4">
            <PodiumCard player={mockTopPlayers[1]} isWinner={false} />
            <PodiumCard player={mockTopPlayers[0]} isWinner={true} />
            <PodiumCard player={mockTopPlayers[2]} isWinner={false} />
          </div>

          <GlassCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="text-warning h-4 w-4" />
                Complete Rankings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-muted-foreground w-[80px]">Rank</TableHead>
                      <TableHead className="text-muted-foreground">User</TableHead>
                      <TableHead className="text-muted-foreground text-right">Total Wins</TableHead>
                      <TableHead className="text-muted-foreground text-right">Total XP</TableHead>
                      <TableHead className="text-muted-foreground text-right">
                        Games Played
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTopPlayers.map((player) => (
                      <TableRow key={player.userId} className="border-border/30 hover:bg-muted/20">
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <RankIcon rank={player.rank} />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={player.avatar} />
                              <AvatarFallback className="bg-accent/10 text-accent text-xs">
                                {player.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-foreground font-medium">{player.name}</p>
                              <code className="text-muted-foreground font-mono text-xs">
                                {player.userId}
                              </code>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground text-right font-mono">
                          {player.totalWins}
                        </TableCell>
                        <TableCell className="text-success text-right font-mono">
                          {player.totalXP.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right font-mono">
                          {player.gamesPlayed}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
