import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── User analytics ────────────────────────────────────────────────────────────
export class UserAnalyticsRegionDto {
  @ApiProperty() region!: string;
  @ApiProperty() count!: number;
}

export class UserAnalyticsStatusDto {
  @ApiProperty() status!: string;
  @ApiProperty() count!: number;
}

export class UserAnalyticsDto {
  @ApiProperty() totalCustomers!: number;
  @ApiProperty({ description: 'New customers in the last 7 days' }) newLast7d!: number;
  @ApiProperty({ description: 'New customers in the last 30 days' }) newLast30d!: number;
  @ApiProperty({ description: 'Customers active in the last 30 days' }) activeLast30d!: number;
  @ApiProperty({ type: [UserAnalyticsRegionDto] }) byRegion!: UserAnalyticsRegionDto[];
  @ApiProperty({ type: [UserAnalyticsStatusDto] }) byStatus!: UserAnalyticsStatusDto[];
}

// ─── Subscription analytics ────────────────────────────────────────────────────
export class SubscriptionAnalyticsByPlanDto {
  @ApiPropertyOptional({ nullable: true }) planName!: string | null;
  @ApiProperty() count!: number;
  @ApiProperty() mrrCents!: number;
}

export class SubscriptionAnalyticsByRegionDto {
  @ApiProperty() region!: string;
  @ApiProperty() count!: number;
  @ApiProperty() mrrCents!: number;
}

export class SubscriptionAnalyticsDto {
  @ApiProperty({ description: 'Active + trialing subscriptions' }) active!: number;
  @ApiProperty() trialing!: number;
  @ApiProperty() canceled!: number;
  @ApiProperty({ description: 'Sum of active subscription amounts (cents)' }) mrrCents!: number;
  @ApiProperty({ description: 'Sum of paid invoices (cents)' }) grossRevenueCents!: number;
  @ApiProperty({ type: [SubscriptionAnalyticsByPlanDto] }) byPlan!: SubscriptionAnalyticsByPlanDto[];
  @ApiProperty({ type: [SubscriptionAnalyticsByRegionDto] }) byRegion!: SubscriptionAnalyticsByRegionDto[];
}

// ─── Game analytics ────────────────────────────────────────────────────────────
export class GameAnalyticsDto {
  @ApiProperty() questsTotal!: number;
  @ApiProperty() questsActive!: number;
  @ApiProperty() questParticipants!: number;
  @ApiProperty() predictionsTotal!: number;
  @ApiProperty() predictionsOpen!: number;
  @ApiProperty() predictionEntries!: number;
  @ApiProperty() auctionsTotal!: number;
  @ApiProperty() auctionsOpen!: number;
  @ApiProperty() bidsTotal!: number;
  @ApiProperty() activeStreakers!: number;
}

// ─── Realtime pulse ────────────────────────────────────────────────────────────
export class RealtimeAnalyticsDto {
  @ApiProperty({ description: 'Distinct viewers with a heartbeat in the last 5 minutes' }) liveViewers!: number;
  @ApiProperty({ description: 'Views started in the last hour' }) viewsLastHour!: number;
  @ApiProperty({ description: 'Customer signups today' }) signupsToday!: number;
  @ApiProperty({ description: 'Points earned today' }) pointsEarnedToday!: number;
}

// ─── Licensing rollup ──────────────────────────────────────────────────────────
export class LicensingStatusDto {
  @ApiProperty() status!: string;
  @ApiProperty() count!: number;
}

export class LicensingExpiringDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional({ nullable: true }) licensorName!: string | null;
  @ApiPropertyOptional({ nullable: true }) expiresAt!: string | null;
  @ApiPropertyOptional({ nullable: true }) licenseStatus!: string | null;
}

export class LicensingAnalyticsDto {
  @ApiProperty({ type: [LicensingStatusDto] }) byStatus!: LicensingStatusDto[];
  @ApiProperty({ type: [LicensingExpiringDto], description: 'Titles expiring within 30 days (max 50)' }) expiringSoon!: LicensingExpiringDto[];
}

export class DashboardOverviewDto {
  @ApiProperty() totalCustomers!: number;
  @ApiProperty({ description: 'Logged in within 30 days' }) activeCustomers!: number;
  @ApiProperty() activeSubscriptions!: number;
  @ApiProperty({ description: 'Sum of active subscription amounts (cents)' }) mrrCents!: number;
  @ApiProperty({ description: 'Sum of paid invoices (cents)' }) grossRevenueCents!: number;
  @ApiProperty({ description: 'Lifetime points earned' }) pointsIssued!: number;
  @ApiProperty({ description: 'Lifetime points spent' }) pointsSpent!: number;
  @ApiProperty({ description: 'Points currently held in wallets' }) pointsOutstanding!: number;
  @ApiProperty() publishedContent!: number;
  @ApiProperty() totalRedemptions!: number;
  @ApiProperty() activeQuests!: number;
  @ApiProperty() openPredictions!: number;
  @ApiProperty() openAuctions!: number;
  @ApiProperty() openModerationTickets!: number;
}

export class ContentDailyStatDto {
  @ApiProperty() date!: string;
  @ApiProperty() views!: number;
  @ApiProperty() uniqueViewers!: number;
  @ApiProperty() watchSeconds!: number;
  @ApiProperty() avgCompletion!: number;
}

export class ContentAnalyticsDto {
  @ApiProperty() viewCount!: number;
  @ApiProperty() uniqueViewerCount!: number;
  @ApiProperty() likeCount!: number;
  @ApiProperty() dislikeCount!: number;
  @ApiProperty() commentCount!: number;
  @ApiProperty() shareCount!: number;
  @ApiProperty({ description: 'View sessions recorded' }) sessions!: number;
  @ApiProperty() distinctViewers!: number;
  @ApiProperty({ description: 'Average completion %' }) avgCompletion!: number;
  @ApiProperty() totalWatchSeconds!: number;
  @ApiProperty({ type: [ContentDailyStatDto], description: 'Last 30 days' }) daily!: ContentDailyStatDto[];
}
