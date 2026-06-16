import { Module } from '@nestjs/common';
import { QuestController } from './quests/quest.controller';
import { AdminQuestController } from './quests/admin-quest.controller';
import { QuestService } from './quests/quest.service';
import { PredictionController } from './predictions/prediction.controller';
import { AdminPredictionController } from './predictions/admin-prediction.controller';
import { PredictionService } from './predictions/prediction.service';
import { AuctionController } from './bidding/auction.controller';
import { AdminAuctionController } from './bidding/admin-auction.controller';
import { AuctionService } from './bidding/auction.service';
import { StreakController } from './streak/streak.controller';
import { StreakService } from './streak/streak.service';
import { AdminGamesController } from './admin-games.controller';

/**
 * Games module — gamified earning. Feature-foldered per game type (quests / predictions /
 * bidding / daily-streak), plus the admin games-overview (all instances + formats library).
 * Each game spends/earns through the shared LedgerRepository with atomic/idempotent rigor.
 */
@Module({
  controllers: [
    QuestController, AdminQuestController,
    PredictionController, AdminPredictionController,
    AuctionController, AdminAuctionController,
    StreakController,
    AdminGamesController,
  ],
  providers: [QuestService, PredictionService, AuctionService, StreakService],
})
export class GamesModule {}
