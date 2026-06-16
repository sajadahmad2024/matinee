import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: 'customer' }) accountType!: string;
  @ApiPropertyOptional({ nullable: true }) email!: string | null;
  @ApiPropertyOptional({ nullable: true }) phone!: string | null;
  @ApiPropertyOptional({ nullable: true }) username!: string | null;
  @ApiPropertyOptional({ nullable: true }) firstName!: string | null;
  @ApiPropertyOptional({ nullable: true }) lastName!: string | null;
  @ApiPropertyOptional({ nullable: true, description: 'About You' }) bio!: string | null;
  @ApiPropertyOptional({ nullable: true }) gender!: string | null;
  @ApiPropertyOptional({ nullable: true }) avatarUrl!: string | null;
  @ApiPropertyOptional({ nullable: true }) countryCode!: string | null;
  @ApiPropertyOptional({ nullable: true }) timezone!: string | null;
  @ApiProperty() isEmailVerified!: boolean;
  @ApiProperty() isPhoneVerified!: boolean;
  @ApiProperty() createdAt!: string;
}

export class WalletDto {
  @ApiProperty({ description: 'Spendable balance shown as "Coins" (alias of pointsBalance)' }) coins!: number;
  @ApiProperty({ description: 'Spendable coins' }) pointsBalance!: number;
  @ApiProperty({ description: 'Lifetime total earnings' }) pointsEarnedLifetime!: number;
  @ApiProperty() pointsSpentLifetime!: number;
  @ApiProperty() pointsPurchasedLifetime!: number;
  @ApiProperty() xpTotal!: number;
  @ApiProperty() level!: number;
  @ApiProperty() currentLevelXp!: number;
  @ApiPropertyOptional({ nullable: true, description: 'XP to reach next level (null at max)' })
  nextLevelXp!: number | null;
}

export class StreakDto {
  @ApiProperty() currentStreak!: number;
  @ApiProperty() longestStreak!: number;
  @ApiProperty() totalQualifiedDays!: number;
  @ApiPropertyOptional({ nullable: true }) lastQualifiedDate!: string | null;
}

export class SubscriptionSummaryDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional({ nullable: true }) planId!: string | null;
  @ApiPropertyOptional({ nullable: true }) planName!: string | null;
  @ApiProperty() status!: string;
  @ApiPropertyOptional({ nullable: true }) currentPeriodEnd!: string | null;
  @ApiProperty() cancelAtPeriodEnd!: boolean;
}

/** Everything the Profile screen header needs in one call. */
export class ProfileScreenDto {
  @ApiProperty({ type: ProfileDto }) profile!: ProfileDto;
  @ApiProperty({ type: WalletDto }) wallet!: WalletDto;
  @ApiProperty({ type: StreakDto }) streak!: StreakDto;
  @ApiPropertyOptional({ type: SubscriptionSummaryDto, nullable: true })
  subscription!: SubscriptionSummaryDto | null;
  @ApiProperty({ description: 'Unread notification badge count' }) unreadNotifications!: number;
}

export class LeaderboardRankDto {
  @ApiProperty({ description: 'My rank this month (1-based)' }) rank!: number;
  @ApiProperty({ description: 'XP earned this month' }) xpEarned!: number;
}

export class AccessDto {
  @ApiProperty({ description: 'Has an active subscription (gates premium app access)' }) isSubscribed!: boolean;
  @ApiProperty({ enum: ['free', 'premium'] }) tier!: string;
  @ApiPropertyOptional({ nullable: true }) planName!: string | null;
}

/** App-open bootstrap — the single "get me" payload. */
export class AppBootstrapDto extends ProfileScreenDto {
  @ApiPropertyOptional({ type: LeaderboardRankDto, nullable: true, description: 'My monthly leaderboard rank (null if no XP this month)' })
  leaderboard!: LeaderboardRankDto | null;
  @ApiProperty({ type: AccessDto, description: 'Subscription-based access summary' }) access!: AccessDto;
}

export class LedgerEntryDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: 'points' }) currency!: string;
  @ApiProperty({ description: 'Signed amount' }) amount!: number;
  @ApiProperty() balanceAfter!: number;
  @ApiProperty({ example: 'earn' }) direction!: string;
  @ApiProperty({ example: 'daily_streak' }) sourceType!: string;
  @ApiPropertyOptional({ nullable: true }) sourceId!: string | null;
  @ApiPropertyOptional({ nullable: true }) note!: string | null;
  @ApiProperty() createdAt!: string;
}

export class ReferralDto {
  @ApiProperty({ description: 'My shareable referral code' }) code!: string;
  @ApiProperty({ description: 'Friends who completed referral' }) completedReferrals!: number;
}

export class UnreadCountDto {
  @ApiProperty({ description: 'Unread notification badge count' }) count!: number;
}

export class MarkAllReadResultDto {
  @ApiProperty({ description: 'Number of notifications marked read' }) updated!: number;
}

export class NotificationDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: 'content' }) category!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional({ nullable: true }) body!: string | null;
  @ApiPropertyOptional({ nullable: true }) deepLink!: string | null;
  @ApiPropertyOptional({ nullable: true }) imageMediaId!: string | null;
  @ApiProperty() isRead!: boolean;
  @ApiPropertyOptional({ nullable: true }) readAt!: string | null;
  @ApiProperty() createdAt!: string;
}
