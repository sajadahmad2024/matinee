import { Flame, Share2, Target, Trophy, type LucideIcon } from "lucide-react";

/** Fixed game types (backed by our DB). Types are fixed; their RULES are dynamic. */
export type GameTypeSlug = "daily-streak" | "quests" | "shared-content" | "predictive";

export interface GameTypeDef {
  slug: GameTypeSlug;
  name: string;
  description: string;
  /** What the player does to earn/spend. */
  tagline: string;
  icon: LucideIcon;
  /** Autonomous = system computes from events (no per-instance admin scheduling). */
  autonomous: boolean;
  /** The DB tables this maps to (shown to operators for transparency). */
  dbMapping: string;
  /** Noun for an admin-created entry within this type (null for autonomous types). */
  instanceNoun: string | null;
  // mock stats for the card (replace with API later)
  activeInstances: number;
  totalPlays: number;
}

export const GAME_TYPES: GameTypeDef[] = [
  {
    slug: "daily-streak",
    name: "Daily Streak",
    description: "Autonomous — time on app + engagement earns points every day.",
    tagline: "Time + Engagement = Points",
    icon: Flame,
    autonomous: true,
    dbMapping: "reward_rules['daily_streak'] · user_streaks",
    instanceNoun: null,
    activeInstances: 1,
    totalPlays: 128500,
  },
  {
    slug: "quests",
    name: "Weekly Quests",
    description: "Curated lists of videos to watch within a window for points.",
    tagline: "Watch the set, earn points",
    icon: Trophy,
    autonomous: false,
    dbMapping: "quests · quest_contents · quest_participations",
    instanceNoun: "Quest",
    activeInstances: 5,
    totalPlays: 45600,
  },
  {
    slug: "shared-content",
    name: "Shared Content",
    description: "Points for sharing content internally/externally + referrals.",
    tagline: "Share & refer = Points",
    icon: Share2,
    autonomous: false,
    dbMapping: "content_shares · referral_redemptions",
    instanceNoun: "Share Rule",
    activeInstances: 1,
    totalPlays: 23400,
  },
  {
    slug: "predictive",
    name: "Predictive",
    description: "Predict real-world outcomes; spend points to play, win a multiplier.",
    tagline: "Spend points, predict, multiply",
    icon: Target,
    autonomous: false,
    dbMapping: "predictions · prediction_options · prediction_entries",
    instanceNoun: "Prediction",
    activeInstances: 5,
    totalPlays: 89200,
  },
  // Bidding lives in the Rewards module (see spec-03), not in games.
];

export function getGameType(slug: string): GameTypeDef | undefined {
  return GAME_TYPES.find((t) => t.slug === slug);
}
