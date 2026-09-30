import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { AnalyticsWindowQueryDto } from './analytics.dto';

const REGION_DESC = "Scope: 'global' (default), a macro-region (NA, EU, APAC, LATAM, MEA) or an ISO alpha-2 country (US, IN…)";
export const REGION_PATTERN = /^(global|[a-z]{2}|apac|latam|mea)$/i;

export class DashboardQueryDto extends AnalyticsWindowQueryDto {
  @ApiPropertyOptional({ description: REGION_DESC, example: 'NA' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Matches(REGION_PATTERN, { message: 'region must be global, a macro-region or an ISO alpha-2 country' })
  region?: string;
}

export class UserAnalyticsQueryDto extends DashboardQueryDto {
  @ApiPropertyOptional({ description: 'Counted views within 30 days of publish for a new upload to be a hit', default: 10000, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000_000_000)
  hitThreshold?: number;
}

/** Region drill-down: region comes from the path. */
export class RegionAnalyticsQueryDto extends AnalyticsWindowQueryDto {
  @ApiPropertyOptional({ default: 10000, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000_000_000)
  hitThreshold?: number;
}

// ─── Response DTOs (Swagger) ─────────────────────────────────────────────────

export class StripDto {
  @ApiProperty() users!: number;
  @ApiProperty() subscribers!: number;
  @ApiProperty({ description: 'Distinct users with a view heartbeat / app event in the last 5 min' }) onlineNow!: number;
  @ApiProperty({ description: 'Distinct users with a game event / entry / bid in the last 5 min' }) playingNow!: number;
}

export class UserAnalyticsDataDto {
  @ApiProperty() starts!: number;
  @ApiProperty() completes!: number;
  @ApiProperty() avgWatchPct!: number;
  @ApiProperty() avgWatchSecs!: number;
  @ApiProperty() avgClipSecs!: number;
  @ApiProperty({ description: '% of sessions watched < 3 s (lower is better)' }) swipeThroughPct!: number;
  @ApiProperty() rewatchLoops!: number;
  @ApiProperty() engagementPerSession!: number;
  @ApiProperty() videosPerSession!: number;
  @ApiProperty() videosPerDay!: number;
  @ApiProperty() completionLivePct!: number;
  @ApiProperty() hitRatePct!: number;
  @ApiProperty() hitThreshold!: number;
  @ApiProperty({ description: 'Derived sessions in the window (0 → per-session metrics fall back to per user-day)' }) sessionsTracked!: number;
}

export class SourceSliceDto {
  @ApiProperty() name!: string;
  @ApiProperty({ description: '% of earned points' }) value!: number;
  @ApiProperty() points!: number;
  @ApiProperty() color!: string;
}
export class BucketPctDto {
  @ApiProperty() bucket!: string;
  @ApiProperty() pct!: number;
}
export class EconomyWeekDto {
  @ApiProperty({ example: 'Week 1' }) period!: string;
  @ApiProperty({ example: '2026-09-07' }) weekStart!: string;
  @ApiProperty() distributed!: number;
  @ApiProperty() redeemed!: number;
}
export class RedemptionWeekDto {
  @ApiProperty({ example: 'W1' }) week!: string;
  @ApiProperty() weekStart!: string;
  @ApiProperty() rate!: number;
}
export class GamificationDataDto {
  @ApiProperty() earnedPerUserDay!: number;
  @ApiProperty() redemptionPct!: number;
  @ApiProperty() pointsOutstanding!: number;
  @ApiProperty() streakAvgDays!: number;
  @ApiProperty() streakLongestDays!: number;
  @ApiProperty() leaderboardChecksPerWeek!: number;
  @ApiProperty() rankChangeAvgWeek!: number;
  @ApiProperty() challengeParticipationPct!: number;
  @ApiProperty() challengeCompletionPct!: number;
  @ApiProperty({ type: [SourceSliceDto] }) earnedBySource!: SourceSliceDto[];
  @ApiProperty({ type: [BucketPctDto] }) balanceBuckets!: BucketPctDto[];
  @ApiProperty({ type: [EconomyWeekDto] }) economyTrend!: EconomyWeekDto[];
  @ApiProperty({ type: [RedemptionWeekDto] }) redemptionTrend!: RedemptionWeekDto[];
}

export class ScreenTimeDataDto {
  @ApiProperty() viewers!: number;
  @ApiProperty() gamified!: number;
  @ApiProperty() sessionAvgSecs!: number;
  @ApiProperty() sessionMedianSecs!: number;
  @ApiProperty({ type: [BucketPctDto] }) sessionBuckets!: BucketPctDto[];
  @ApiProperty({ type: 'array', items: { type: 'array', items: { type: 'number' } }, description: '7 rows (Mon..Sun, UTC) × 24 hours, 0..1' })
  heatmap!: number[][];
  @ApiProperty() bgFgPerSession!: number;
  @ApiProperty() doomscrollVideos!: number;
  @ApiProperty() doomscrollMinutes!: number;
  @ApiProperty() sessionsTracked!: number;
}

export class FunnelDto {
  @ApiProperty() signups!: number;
  @ApiProperty() firstSession!: number;
  @ApiProperty() engaged!: number;
  @ApiProperty() subscribed!: number;
  @ApiProperty() referred!: number;
}
export class ChannelEconomicsDto {
  @ApiProperty({ example: 'Paid social' }) channel!: string;
  @ApiProperty({ example: 'paid_social' }) key!: string;
  @ApiProperty({ description: 'Lifetime paid revenue per user ($)' }) ltv!: number;
  @ApiProperty({ description: 'Spend ÷ new users ($)' }) cac!: number;
  @ApiProperty() spend!: number;
  @ApiProperty() newUsers!: number;
}
export class SubsWeekDto {
  @ApiProperty({ example: '2026-09-07' }) date!: string;
  @ApiProperty() newSubs!: number;
  @ApiProperty() cancellations!: number;
}
export class RevenueMonthDto {
  @ApiProperty({ example: '2026-09' }) month!: string;
  @ApiProperty({ description: 'Paid subscription revenue ($)' }) subscriptions!: number;
}
export class MonetizationDataDto {
  @ApiProperty() arpu!: number;
  @ApiProperty() arpdau!: number;
  @ApiProperty() trialToPaidPct!: number;
  @ApiProperty() ltvCacRatio!: number;
  @ApiProperty({ description: 'Current MRR ($)' }) mrr!: number;
  @ApiProperty({ description: 'Paid revenue in window ($)' }) revenue!: number;
  @ApiProperty({ description: 'Lifetime paid revenue ÷ paying users ($)' }) ltv!: number;
  @ApiProperty({ type: FunnelDto }) funnel!: FunnelDto;
  @ApiProperty({ type: [ChannelEconomicsDto] }) channels!: ChannelEconomicsDto[];
  @ApiProperty({ type: [SubsWeekDto] }) subsTrend!: SubsWeekDto[];
  @ApiProperty({ type: [RevenueMonthDto] }) revenueTrend!: RevenueMonthDto[];
}

export class CommunityInAppDto {
  @ApiProperty() commentsPerUserWeek!: number;
  @ApiProperty() replyRatePct!: number;
  @ApiProperty() reactionToViewPct!: number;
  @ApiProperty() sharesPerVideo!: number;
}
export class CommunityExternalDto {
  @ApiProperty() mentionsPerWeek!: number;
  @ApiProperty({ type: [Number], description: '% positive, neutral, negative' }) sentiment!: [number, number, number];
  @ApiProperty() viralMoments!: number;
  @ApiProperty() organicImpressions!: number;
  @ApiProperty({ description: '$' }) earnedMediaValue!: number;
  @ApiProperty() topAdvocates!: number;
  @ApiProperty() mentions!: number;
}
export class CommunityDataDto {
  @ApiProperty({ type: CommunityInAppDto }) inApp!: CommunityInAppDto;
  @ApiProperty({ type: CommunityExternalDto }) external!: CommunityExternalDto;
}

export class RetentionPointDto {
  @ApiProperty({ example: 'D7' }) day!: string;
  @ApiProperty() current!: number;
  @ApiProperty() previous!: number;
}
export class RetentionDto {
  @ApiProperty() d1!: number;
  @ApiProperty() d7!: number;
  @ApiProperty() d30!: number;
  @ApiProperty() cohortSize!: number;
  @ApiProperty({ type: [RetentionPointDto] }) series!: RetentionPointDto[];
}
export class KFactorPointDto {
  @ApiProperty({ example: '2026-09' }) month!: string;
  @ApiProperty() k!: number;
  @ApiProperty() referred!: number;
  @ApiProperty() organic!: number;
}
export class VelocityPointDto {
  @ApiProperty({ example: '2026-09-21' }) day!: string;
  @ApiProperty({ example: 'Mon' }) weekday!: string;
  @ApiProperty() players!: number;
}
export class GraphsDataDto {
  @ApiProperty({ type: RetentionDto }) retention!: RetentionDto;
  @ApiProperty({ type: [KFactorPointDto] }) kFactor!: KFactorPointDto[];
  @ApiProperty({ type: [VelocityPointDto] }) velocity!: VelocityPointDto[];
}

export class RegionAnalyticsDto {
  @ApiProperty({ example: 'NA' }) code!: string;
  @ApiProperty({ example: 'North America' }) name!: string;
  @ApiPropertyOptional({ nullable: true, type: String, description: 'Parent macro-region for country scopes' }) macro!: string | null;
  @ApiProperty({ description: 'Scope customers ÷ all customers' }) factor!: number;
  @ApiProperty() from!: string;
  @ApiProperty() to!: string;
  @ApiProperty({ type: StripDto }) strip!: StripDto;
  @ApiProperty({ type: UserAnalyticsDataDto }) userAnalytics!: UserAnalyticsDataDto;
  @ApiProperty({ type: GamificationDataDto }) gamification!: GamificationDataDto;
  @ApiProperty({ type: ScreenTimeDataDto }) screenTime!: ScreenTimeDataDto;
  @ApiProperty({ type: MonetizationDataDto }) monetization!: MonetizationDataDto;
  @ApiProperty({ type: CommunityDataDto }) community!: CommunityDataDto;
  @ApiProperty({ type: GraphsDataDto }) graphs!: GraphsDataDto;
}

export class MacroRegionSummaryDto {
  @ApiProperty() code!: string;
  @ApiProperty() name!: string;
  @ApiProperty() users!: number;
  @ApiProperty() subscribers!: number;
  @ApiProperty({ description: 'Paid revenue in window ($)' }) revenue!: number;
  @ApiProperty({ description: 'Points earned in window' }) points!: number;
  @ApiProperty() viewers!: number;
  @ApiProperty() gamified!: number;
}
export class CountrySummaryDto {
  @ApiProperty() code!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true, type: String }) macro!: string | null;
  @ApiProperty() users!: number;
  @ApiProperty() revenue!: number;
  @ApiProperty() points!: number;
  @ApiProperty({ description: 'users ÷ max users, 0..1' }) intensity!: number;
}
export class RegionsSummaryDto {
  @ApiProperty() from!: string;
  @ApiProperty() to!: string;
  @ApiProperty({ type: [MacroRegionSummaryDto] }) regions!: MacroRegionSummaryDto[];
  @ApiProperty({ type: [CountrySummaryDto] }) countries!: CountrySummaryDto[];
  @ApiProperty({ description: 'Customers without a country_code' }) unassignedUsers!: number;
}
