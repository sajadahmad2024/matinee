import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DBService } from '@db/db.service';

// Repositories — centralized data access layer
import { UsersRepository } from './repositories/users/users.repository';
import { RbacRepository } from './repositories/auth/rbac.repository';
import { IdentityRepository } from './repositories/auth/identity.repository';
import { ReferralRepository } from './repositories/auth/referral.repository';
import { EnforcementRepository } from './repositories/auth/enforcement.repository';
import { DeviceRepository } from './repositories/auth/device.repository';
import { MediaRepository } from './repositories/media/media.repository';
import { ContentRepository } from './repositories/content/content.repository';
import { TaxonomyRepository } from './repositories/content/taxonomy.repository';
import { ContentExtrasRepository } from './repositories/content/content-extras.repository';
import { ContentUnlockRepository } from './repositories/content/unlock.repository';
import { ProfileRepository } from './repositories/users/profile.repository';
import { WalletRepository } from './repositories/tokenomics/wallet.repository';
import { LedgerRepository } from './repositories/tokenomics/ledger.repository';
import { NotificationRepository } from './repositories/notifications/notification.repository';
import { SubscriptionRepository } from './repositories/subscriptions/subscription.repository';
import { ReactionRepository } from './repositories/engagement/reaction.repository';
import { ShareRepository } from './repositories/engagement/share.repository';
import { WatchlistRepository } from './repositories/engagement/watchlist.repository';
import { CommentRepository } from './repositories/engagement/comment.repository';
import { CommentReactionRepository } from './repositories/engagement/comment-reaction.repository';
import { CommentReportRepository } from './repositories/engagement/comment-report.repository';
import { ViewRepository } from './repositories/engagement/view.repository';
import { RewardRuleRepository } from './repositories/tokenomics/reward-rule.repository';
import { LevelRepository } from './repositories/progression/level.repository';
import { LeaderboardRepository } from './repositories/progression/leaderboard.repository';
import { RewardCatalogRepository } from './repositories/redemption/reward-catalog.repository';
import { RewardRedemptionRepository } from './repositories/redemption/reward-redemption.repository';
import { SubscriptionPlanRepository } from './repositories/subscriptions/subscription-plan.repository';
import { SubscriptionInvoiceRepository } from './repositories/subscriptions/subscription-invoice.repository';
import { BadgeRepository } from './repositories/badges/badge.repository';
import { QuestRepository } from './repositories/games/quest.repository';
import { PredictionRepository } from './repositories/games/prediction.repository';
import { AuctionRepository } from './repositories/games/auction.repository';
import { StreakRepository } from './repositories/games/streak.repository';
import { ModerationRepository } from './repositories/moderation/moderation.repository';
import { AnalyticsRepository } from './repositories/analytics/analytics.repository';
import { AdminUser360Repository } from './repositories/users/user-360.repository';
import { NotificationCampaignRepository } from './repositories/notifications/notification-campaign.repository';
import { AppSettingsRepository } from './repositories/platform/app-settings.repository';
import { GamesMetaRepository } from './repositories/games/games-meta.repository';
import { EventRepository } from './repositories/events/event.repository';

const repositories = [
  UsersRepository,
  RbacRepository,
  IdentityRepository,
  ReferralRepository,
  EnforcementRepository,
  DeviceRepository,
  MediaRepository,
  ContentRepository,
  TaxonomyRepository,
  ContentExtrasRepository,
  ContentUnlockRepository,
  ProfileRepository,
  WalletRepository,
  LedgerRepository,
  NotificationRepository,
  SubscriptionRepository,
  ReactionRepository,
  ShareRepository,
  WatchlistRepository,
  CommentRepository,
  CommentReactionRepository,
  CommentReportRepository,
  ViewRepository,
  RewardRuleRepository,
  LevelRepository,
  LeaderboardRepository,
  RewardCatalogRepository,
  RewardRedemptionRepository,
  SubscriptionPlanRepository,
  SubscriptionInvoiceRepository,
  BadgeRepository,
  QuestRepository,
  PredictionRepository,
  AuctionRepository,
  StreakRepository,
  ModerationRepository,
  AnalyticsRepository,
  AdminUser360Repository,
  NotificationCampaignRepository,
  AppSettingsRepository,
  GamesMetaRepository,
  EventRepository,
];

@Global()
@Module({
  imports: [ConfigModule],
  providers: [DBService, ...repositories],
  exports: [DBService, ...repositories],
})
export class DBModule {}
