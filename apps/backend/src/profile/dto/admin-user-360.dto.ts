import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Watch history ─────────────────────────────────────────────────────────────
export class WatchHistoryItemDto {
  @ApiPropertyOptional({ nullable: true }) contentId!: string | null;
  @ApiPropertyOptional({ nullable: true }) title!: string | null;
  @ApiPropertyOptional({ nullable: true }) watchedSeconds!: number | null;
  @ApiPropertyOptional({ nullable: true }) completionPercent!: number | null;
  @ApiPropertyOptional({ nullable: true }) isCompleted!: string | number | null;
  @ApiPropertyOptional({ nullable: true }) startedAt!: string | null;
}

export class WatchHistoryDto {
  @ApiProperty({ type: [WatchHistoryItemDto], description: 'Recent watch history (max 50)' })
  items!: WatchHistoryItemDto[];
}

// ─── Watch stats (user detail "Watch" tab) ─────────────────────────────────────
export class FavoriteGenreDto {
  @ApiProperty() genreId!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ description: "User's watch seconds attributed to the genre" }) watchSeconds!: number;
  @ApiProperty({ description: '% of genre-attributed watch time' }) percent!: number;
}

export class WatchStreakSummaryDto {
  @ApiProperty({ description: '0 when broken' }) currentStreak!: number;
  @ApiProperty() longestStreak!: number;
  @ApiProperty() level!: number;
  @ApiProperty() activeDays!: number;
}

export class WatchStatsDto {
  @ApiProperty({ description: 'Distinct contents with a counted view' }) videosWatched!: number;
  @ApiProperty({ description: 'All viewing sessions' }) sessions!: number;
  @ApiProperty({ description: 'Counted views' }) views!: number;
  @ApiProperty() totalWatchSeconds!: number;
  @ApiProperty({ description: 'Avg watch seconds per session ("Avg. Session")' }) avgSessionSeconds!: number;
  @ApiProperty({ description: '% of counted views completed' }) completionRate!: number;
  @ApiPropertyOptional({ nullable: true }) lastWatchedAt!: string | null;
  @ApiProperty({ type: [FavoriteGenreDto], description: 'Top 10 by watch time' }) favoriteGenres!: FavoriteGenreDto[];
  @ApiProperty({ type: WatchStreakSummaryDto }) streak!: WatchStreakSummaryDto;
}

// ─── Referrals ─────────────────────────────────────────────────────────────────
export class ReferralInviteDto {
  @ApiPropertyOptional({ nullable: true }) refereeId!: string | null;
  @ApiPropertyOptional({ nullable: true }) username!: string | null;
  @ApiPropertyOptional({ nullable: true }) status!: string | null;
  @ApiPropertyOptional({ nullable: true }) createdAt!: string | null;
}

export class ReferralCountsDto {
  @ApiPropertyOptional({ nullable: true }) total!: number | null;
  @ApiPropertyOptional({ nullable: true, description: 'Qualified or rewarded redemptions' }) completed!: number | null;
}

export class ReferralsDto {
  @ApiPropertyOptional({ nullable: true, description: "The customer's referral code" }) code!: string | null;
  @ApiProperty({ type: [ReferralInviteDto], description: 'Invited users (max 100)' }) invited!: ReferralInviteDto[];
  @ApiProperty({ type: ReferralCountsDto }) counts!: ReferralCountsDto;
}

// ─── Games activity ────────────────────────────────────────────────────────────
export class UserGamesActivityDto {
  @ApiPropertyOptional({ nullable: true }) questsJoined!: number | null;
  @ApiPropertyOptional({ nullable: true }) questsCompleted!: number | null;
  @ApiPropertyOptional({ nullable: true }) predictionsEntered!: number | null;
  @ApiPropertyOptional({ nullable: true }) predictionsWon!: number | null;
  @ApiPropertyOptional({ nullable: true }) bidsPlaced!: number | null;
  @ApiPropertyOptional({ nullable: true }) auctionsWon!: number | null;
}

// ─── Reports activity ──────────────────────────────────────────────────────────
export class UserReportAgainstDto {
  @ApiPropertyOptional({ nullable: true }) id!: string | null;
  @ApiPropertyOptional({ nullable: true }) subjectType!: string | null;
  @ApiPropertyOptional({ nullable: true }) category!: string | null;
  @ApiPropertyOptional({ nullable: true }) severity!: string | null;
  @ApiPropertyOptional({ nullable: true }) status!: string | null;
  @ApiPropertyOptional({ nullable: true }) reportCount!: number | null;
  @ApiPropertyOptional({ nullable: true }) createdAt!: string | null;
}

export class UserReportsActivityDto {
  @ApiProperty({ type: [UserReportAgainstDto], description: 'Tickets where the user is the offender (max 50)' })
  against!: UserReportAgainstDto[];
  @ApiProperty({ description: 'Number of reports the user has filed' }) madeCount!: number;
}

// ─── Role assignment ───────────────────────────────────────────────────────────
export class UserRolesDto {
  @ApiProperty({ type: [String], description: "The user's roles after the update" }) roles!: string[];
}

// ─── Warn ──────────────────────────────────────────────────────────────────────
export class UserWarnedDto {
  @ApiProperty({ example: true }) warned!: boolean;
}
