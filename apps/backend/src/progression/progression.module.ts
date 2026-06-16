import { Module } from '@nestjs/common';
import { LevelingController } from './leveling/leveling.controller';
import { AdminLevelingController } from './leveling/admin-leveling.controller';
import { LevelingService } from './leveling/leveling.service';
import { LeaderboardController } from './leaderboard/leaderboard.controller';
import { AdminLeaderboardController } from './leaderboard/admin-leaderboard.controller';
import { LeaderboardService } from './leaderboard/leaderboard.service';

/**
 * Progression module — leveling (XP→level curve + admin config) and the monthly XP
 * leaderboard (badges to follow). Read-models over data the tokenomics ledger writes:
 * the leveling curve is regenerated from the 'leveling' reward-rule; the leaderboard is
 * accumulated by the ledger trigger. Feature-foldered per the auth pattern.
 */
@Module({
  controllers: [
    LevelingController,
    AdminLevelingController,
    LeaderboardController,
    AdminLeaderboardController,
  ],
  providers: [LevelingService, LeaderboardService],
})
export class ProgressionModule {}
