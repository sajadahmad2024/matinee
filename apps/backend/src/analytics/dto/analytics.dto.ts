import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsISO8601, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { TREND_INTERVALS, TREND_METRICS, type TrendInterval, type TrendMetric } from '@db/repositories/analytics/analytics.repository';

// ─── Query DTOs ────────────────────────────────────────────────────────────────
/** `[from, to)` window. Defaults to the last 30 days; max 366 days. */
export class AnalyticsWindowQueryDto {
  @ApiPropertyOptional({ description: 'Window start (ISO-8601). Default: `to` − 30 days', example: '2026-09-01T00:00:00Z' })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({ description: 'Window end, exclusive (ISO-8601). Default: now', example: '2026-10-01T00:00:00Z' })
  @IsOptional()
  @IsISO8601()
  to?: string;
}

export class ContentLibraryQueryDto extends AnalyticsWindowQueryDto {
  @ApiPropertyOptional({ description: "Viewer region (matches `users.region`, e.g. 'NA')", maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;

  @ApiPropertyOptional({ description: 'Views in the window for a published title to count as a hit', default: 1000, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000_000_000)
  hitThreshold?: number;
}

export class TrendsQueryDto extends AnalyticsWindowQueryDto {
  @ApiPropertyOptional({
    type: String,
    description: `CSV of metrics (default: all). Any of: ${TREND_METRICS.join(', ')}`,
    example: 'signups,views,revenue',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value.split(',').map((v) => v.trim()).filter((v) => v.length > 0)
      : value,
  )
  @IsArray()
  @ArrayMaxSize(TREND_METRICS.length)
  @IsIn(TREND_METRICS, { each: true })
  metrics?: TrendMetric[];

  @ApiPropertyOptional({ enum: TREND_INTERVALS, default: 'day' })
  @IsOptional()
  @IsIn(TREND_INTERVALS)
  interval?: TrendInterval;

  @ApiPropertyOptional({ description: "User region (matches `users.region`, e.g. 'NA')", maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  region?: string;
}

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

export class ContentDailySourceDto {
  @ApiProperty({ nullable: true, type: String, description: 'First day served from content_daily_stats (YYYY-MM-DD)' }) rollupFrom!: string | null;
  @ApiProperty({ nullable: true, type: String, description: 'Last day served from content_daily_stats; other days are live' }) rollupThrough!: string | null;
}

export class ContentPeriodChangeDto {
  @ApiProperty({ description: 'Views in the window' }) views!: number;
  @ApiProperty({ description: 'Views in the previous window of equal length' }) prevViews!: number;
  @ApiProperty({ description: '% change (1 dp); 100 when previous = 0 and current > 0' }) viewsPct!: number;
  @ApiProperty() watchSeconds!: number;
  @ApiProperty() prevWatchSeconds!: number;
  @ApiProperty() watchSecondsPct!: number;
}

export class ContentRetentionPointDto {
  @ApiProperty({ description: 'Playhead bucket 0..100 step 10' }) percent!: number;
  @ApiProperty({ description: 'Distinct viewers whose furthest position reached the bucket' }) viewers!: number;
  @ApiProperty({ description: 'viewers / viewers at 0 % (0..1)' }) ratio!: number;
}

export class ContentTrafficSourceDto {
  @ApiProperty({ enum: ['feed', 'search', 'share', 'notification', 'profile', 'deeplink', 'other', 'unknown'] }) source!: string;
  @ApiProperty() views!: number;
}

export class ContentGenderBreakdownDto {
  @ApiProperty({ description: "users.gender ('unknown' when unset)" }) gender!: string;
  @ApiProperty() views!: number;
  @ApiProperty() viewers!: number;
}

export class ContentDeviceBreakdownDto {
  @ApiProperty({ description: "ios | android | web | 'unknown'" }) device!: string;
  @ApiProperty() views!: number;
  @ApiProperty() viewers!: number;
}

export class ContentDemographicsDto {
  @ApiProperty({ type: [ContentGenderBreakdownDto] }) gender!: ContentGenderBreakdownDto[];
  @ApiProperty({ type: [ContentDeviceBreakdownDto] }) device!: ContentDeviceBreakdownDto[];
}

export class ContentGeoDto {
  @ApiProperty({ description: "Viewer users.country_code ('unknown' when unset)" }) countryCode!: string;
  @ApiProperty() views!: number;
  @ApiProperty() watchSeconds!: number;
}

export class ContentGamesStatsDto {
  @ApiProperty() predictions!: number;
  @ApiProperty() predictionEntries!: number;
  @ApiProperty() auctions!: number;
  @ApiProperty() bids!: number;
  @ApiProperty() quests!: number;
  @ApiProperty({ description: 'Distinct users participating in linked quests' }) questParticipants!: number;
  @ApiProperty({ description: 'Distinct users who completed a linked quest' }) questCompletions!: number;
}

export class ContentBtsChildDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() contentType!: string;
  @ApiProperty({ description: 'Views in the window' }) views!: number;
}

export class ContentBtsDto {
  @ApiProperty({ type: [ContentBtsChildDto] }) children!: ContentBtsChildDto[];
  @ApiProperty({ description: 'Distinct viewers of this content in the window' }) parentViewers!: number;
  @ApiProperty({ description: 'Parent viewers who also viewed any child in the window' }) childViewers!: number;
  @ApiProperty({ description: 'childViewers / parentViewers (0..1)' }) ctr!: number;
}

export class ContentAnalyticsDto {
  @ApiProperty() viewCount!: number;
  @ApiProperty() uniqueViewerCount!: number;
  @ApiProperty() likeCount!: number;
  @ApiProperty() dislikeCount!: number;
  @ApiProperty() commentCount!: number;
  @ApiProperty() shareCount!: number;
  @ApiProperty({ description: 'View sessions recorded (lifetime)' }) sessions!: number;
  @ApiProperty({ description: 'Lifetime distinct viewers' }) distinctViewers!: number;
  @ApiProperty({ description: 'Average completion % (lifetime)' }) avgCompletion!: number;
  @ApiProperty({ description: 'Lifetime watch seconds' }) totalWatchSeconds!: number;
  @ApiProperty({ type: [ContentDailyStatDto], description: 'Daily rollups within the window (newest first)' }) daily!: ContentDailyStatDto[];
  @ApiProperty({ type: ContentDailySourceDto, description: 'Which days of `daily` came from the rollup' }) dailySource!: ContentDailySourceDto;
  @ApiProperty({ description: 'Window start (ISO)' }) from!: string;
  @ApiProperty({ description: 'Window end, exclusive (ISO)' }) to!: string;
  @ApiProperty({ type: ContentPeriodChangeDto }) periodChange!: ContentPeriodChangeDto;
  @ApiProperty({ type: [ContentRetentionPointDto] }) retention!: ContentRetentionPointDto[];
  @ApiProperty({ type: [ContentTrafficSourceDto] }) trafficSources!: ContentTrafficSourceDto[];
  @ApiProperty({ type: ContentDemographicsDto }) demographics!: ContentDemographicsDto;
  @ApiProperty({ type: [ContentGeoDto], description: 'Top 100 countries by views' }) geo!: ContentGeoDto[];
  @ApiProperty({ type: ContentGamesStatsDto, description: 'Lifetime' }) games!: ContentGamesStatsDto;
  @ApiProperty({ type: ContentBtsDto }) bts!: ContentBtsDto;
}

// ─── Content library ───────────────────────────────────────────────────────────
export class LibraryTotalsDto {
  @ApiProperty() views!: number;
  @ApiProperty() uniqueViewers!: number;
  @ApiProperty() watchSeconds!: number;
  @ApiProperty() avgWatchSeconds!: number;
  @ApiProperty({ description: 'Average completion % across sessions' }) avgCompletion!: number;
  @ApiProperty() likes!: number;
  @ApiProperty() comments!: number;
  @ApiProperty() shares!: number;
  @ApiProperty({ description: '(likes + comments + shares) / views × 100' }) engagementRate!: number;
}

export class LibraryRegionDto {
  @ApiProperty({ description: "users.region ('unknown' when unset)" }) region!: string;
  @ApiProperty() views!: number;
  @ApiProperty() watchSeconds!: number;
  @ApiProperty() avgWatchSeconds!: number;
}

export class LibraryHitRateDto {
  @ApiProperty() threshold!: number;
  @ApiProperty() publishedTitles!: number;
  @ApiProperty({ description: 'Published titles with ≥ threshold views in the window' }) hits!: number;
  @ApiProperty({ description: '0..100' }) percent!: number;
}

export class LibraryGameConversionDto {
  @ApiProperty() viewers!: number;
  @ApiProperty({ description: 'Viewers who joined a game linked to content they watched' }) players!: number;
  @ApiProperty({ description: '0..100' }) percent!: number;
}

export class LibraryFunnelDto {
  @ApiProperty() viewers!: number;
  @ApiProperty({ description: 'Viewers who reacted, commented or shared in the window' }) engaged!: number;
  @ApiProperty() gamePlayers!: number;
  @ApiProperty({ description: 'Viewers who unlocked content in the window' }) unlockers!: number;
}

export class LibraryRevenueAttributionDto {
  @ApiProperty({ description: 'Active licences revenue_generated_cents (not windowed)' }) licenseRevenueCents!: number;
  @ApiProperty({ description: 'Active sponsorships revenue_cents (not windowed)' }) sponsorshipRevenueCents!: number;
  @ApiProperty({ description: 'Points spent on unlocks in the window' }) unlockPointsSpent!: number;
}

export class LibraryBtsUpsellDto {
  @ApiProperty() parentViewers!: number;
  @ApiProperty() btsViewers!: number;
  @ApiProperty({ description: '0..1' }) ctr!: number;
}

export class LibrarySentimentDto {
  @ApiProperty() likes!: number;
  @ApiProperty() dislikes!: number;
  @ApiProperty({ description: 'likes / (likes + dislikes), 0..1' }) positiveRatio!: number;
}

export class LibraryShareVelocityDto {
  @ApiProperty({ description: 'Shares in the 24h before `to`' }) last24h!: number;
  @ApiProperty() prev24h!: number;
  @ApiProperty() changePct!: number;
}

export class LibraryTopContentDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() contentType!: string;
  @ApiProperty() views!: number;
  @ApiProperty() uniqueViewers!: number;
  @ApiProperty() watchSeconds!: number;
  @ApiProperty() avgCompletion!: number;
}

export class ContentLibraryAnalyticsDto {
  @ApiProperty() from!: string;
  @ApiProperty() to!: string;
  @ApiPropertyOptional({ nullable: true, type: String }) region!: string | null;
  @ApiProperty({ type: LibraryTotalsDto }) totals!: LibraryTotalsDto;
  @ApiProperty({ type: [LibraryRegionDto] }) byRegion!: LibraryRegionDto[];
  @ApiProperty({ type: LibraryHitRateDto }) hitRate!: LibraryHitRateDto;
  @ApiProperty({ type: LibraryGameConversionDto }) gameConversion!: LibraryGameConversionDto;
  @ApiProperty({ type: LibraryFunnelDto }) funnel!: LibraryFunnelDto;
  @ApiProperty({ type: LibraryRevenueAttributionDto }) revenueAttribution!: LibraryRevenueAttributionDto;
  @ApiProperty({ type: LibraryBtsUpsellDto }) btsUpsell!: LibraryBtsUpsellDto;
  @ApiProperty({ type: LibrarySentimentDto }) sentiment!: LibrarySentimentDto;
  @ApiProperty({ type: LibraryShareVelocityDto }) shareVelocity!: LibraryShareVelocityDto;
  @ApiProperty({ type: [LibraryTopContentDto], description: 'Top 10 by views in the window' }) topContent!: LibraryTopContentDto[];
}

// ─── Trends ────────────────────────────────────────────────────────────────────
export class TrendPointDto {
  @ApiProperty({ description: 'UTC bucket start (YYYY-MM-DD)', example: '2026-09-01' }) bucket!: string;
  @ApiProperty() value!: number;
}

export class TrendsSeriesDto {
  @ApiPropertyOptional({ type: [TrendPointDto], description: 'Customer signups' }) signups?: TrendPointDto[];
  @ApiPropertyOptional({ type: [TrendPointDto], description: 'Distinct viewers per bucket' }) active_users?: TrendPointDto[];
  @ApiPropertyOptional({ type: [TrendPointDto] }) views?: TrendPointDto[];
  @ApiPropertyOptional({ type: [TrendPointDto] }) watch_seconds?: TrendPointDto[];
  @ApiPropertyOptional({ type: [TrendPointDto] }) points_earned?: TrendPointDto[];
  @ApiPropertyOptional({ type: [TrendPointDto] }) points_spent?: TrendPointDto[];
  @ApiPropertyOptional({ type: [TrendPointDto], description: 'Paid subscription invoices (cents)' }) revenue?: TrendPointDto[];
}

export class TrendsDto {
  @ApiProperty({ enum: TREND_INTERVALS }) interval!: TrendInterval;
  @ApiProperty() from!: string;
  @ApiProperty() to!: string;
  @ApiPropertyOptional({ nullable: true, type: String }) region!: string | null;
  @ApiProperty({ type: TrendsSeriesDto, description: 'Only the requested metrics are present' }) series!: TrendsSeriesDto;
}
