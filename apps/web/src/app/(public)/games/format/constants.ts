import { Flame, Target, Trophy } from "lucide-react";
import { type GameInstance } from "./_components/games/game-instances-list";

export const MOCK_GAME_INSTANCES: GameInstance[] = [
  {
    id: "g1",
    name: "Avengers Prediction Challenge",
    videoTitle: "Avengers: Endgame Trailer",
    videoId: "v1",
    status: "active",
    startDate: new Date("2026-01-15"),
    endDate: new Date("2026-01-22"),
    participants: 12500,
    completions: 8200,
    pointsDistributed: 125000,
  },
  {
    id: "g2",
    name: "Batman Finale Prediction",
    videoTitle: "The Batman Returns",
    videoId: "v2",
    status: "active",
    startDate: new Date("2026-01-18"),
    endDate: new Date("2026-01-25"),
    participants: 9800,
    completions: 5400,
    pointsDistributed: 89000,
  },
  {
    id: "g3",
    name: "Dune Outcome Prediction",
    videoTitle: "Dune: Part Two",
    videoId: "v3",
    status: "ended",
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-01-08"),
    participants: 15200,
    completions: 11800,
    pointsDistributed: 185000,
  },
  {
    id: "g4",
    name: "Weekly Watch Marathon",
    videoTitle: null,
    videoId: null,
    status: "active",
    startDate: new Date("2026-01-14"),
    endDate: new Date("2026-01-21"),
    participants: 8400,
    completions: 2100,
    pointsDistributed: 42000,
  },
];

export const AVAILABLE_VIDEOS = [
  { id: "v1", title: "Avengers: Endgame Trailer", duration: "2:30", views: 124500 },
  { id: "v2", title: "The Batman Returns", duration: "2:45", views: 89200 },
  { id: "v3", title: "Dune: Part Two", duration: "3:15", views: 156800 },
  { id: "v4", title: "Oppenheimer", duration: "2:55", views: 98400 },
  { id: "v5", title: "Barbie", duration: "2:20", views: 112300 },
];

export const FORMAT_CONFIGS: Record<
  string,
  { icon: React.ElementType; name: string; requiresVideo: boolean }
> = {
  "1": { icon: Target, name: "Predict Outcome", requiresVideo: true },
  "2": { icon: Flame, name: "Watch Streak", requiresVideo: false },
  "3": { icon: Trophy, name: "Weekly Contest", requiresVideo: false },
};
