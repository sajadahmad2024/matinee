import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { StreakTodayDto } from '../../../engagement/views/dto/view.dto';

export class StreakNextLevelDto {
  @ApiProperty() level!: number;
  @ApiProperty() minWatchSeconds!: number;
}

export class StreakLevelProgressDto {
  @ApiProperty() current!: number;
  @ApiProperty({ description: 'Daily requirement at this level' }) minWatchSeconds!: number;
  @ApiProperty({ description: 'Qualifying days to complete the level' }) days!: number;
  @ApiProperty({ description: 'Days done in the current level run (0 when the streak is broken)' }) progressDays!: number;
  @ApiProperty() remainingDays!: number;
  @ApiPropertyOptional({ type: StreakNextLevelDto, nullable: true }) next!: StreakNextLevelDto | null;
}

export class StreakLevelTrackDto {
  @ApiProperty() level!: number;
  @ApiProperty() minWatchSeconds!: number;
  @ApiProperty() days!: number;
  @ApiProperty() pointsPerDay!: number;
  @ApiProperty() completionBonus!: number;
  @ApiProperty({ enum: ['completed', 'current', 'locked'] }) status!: string;
}

export class StreakCalendarDayDto {
  @ApiProperty({ example: '2026-09-01' }) date!: string;
  @ApiProperty({ description: 'Level the day was played at' }) level!: number;
}

export class StreakBadgeProgressDto {
  @ApiProperty() current!: number;
  @ApiProperty() target!: number;
  @ApiProperty() percent!: number;
}

export class StreakBadgeDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty() earned!: boolean;
  @ApiPropertyOptional({ nullable: true }) earnedAt!: string | null;
  @ApiProperty({ type: StreakBadgeProgressDto }) progress!: StreakBadgeProgressDto;
}

/** Daily-streak status — state, level track, today's session, calendar, badges. */
export class StreakStatusDto {
  @ApiProperty({ description: '0 when the streak is broken' }) currentStreak!: number;
  @ApiProperty() longestStreak!: number;
  @ApiProperty() totalQualifiedDays!: number;
  @ApiProperty({ description: 'Same as totalQualifiedDays (Figma "Active Days")' }) activeDays!: number;
  @ApiPropertyOptional({ nullable: true, description: 'Last date (YYYY-MM-DD) the user qualified' }) lastQualifiedDate!: string | null;
  @ApiProperty({ description: 'Whether the user has already qualified today' }) qualifiedToday!: boolean;
  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    description: 'Streak-length → bonus-points thresholds',
    example: { '7': 50, '30': 300 },
  })
  milestones!: Record<string, number>;
  @ApiProperty({ type: StreakLevelProgressDto }) level!: StreakLevelProgressDto;
  @ApiProperty({ type: [StreakLevelTrackDto] }) levels!: StreakLevelTrackDto[];
  @ApiProperty({ type: StreakTodayDto }) today!: StreakTodayDto;
  @ApiProperty({ example: '2026-06', description: 'Calendar month (YYYY-MM) for the history' }) month!: string;
  @ApiProperty({ type: [String], description: 'Dates (YYYY-MM-DD) the user qualified within the month' }) history!: string[];
  @ApiProperty({ type: [StreakCalendarDayDto] }) calendar!: StreakCalendarDayDto[];
  @ApiProperty({ type: [StreakBadgeDto] }) badges!: StreakBadgeDto[];
}

/** Result of evaluating today (POST /check-in). */
export class StreakCheckInResultDto {
  @ApiProperty({ description: 'Today counts toward the streak' }) qualified!: boolean;
  @ApiProperty({ description: 'True if today had already qualified (no new reward)' }) alreadyCheckedIn!: boolean;
  @ApiProperty() alreadyQualified!: boolean;
  @ApiProperty() currentStreak!: number;
  @ApiProperty() level!: number;
  @ApiProperty() awardedPoints!: number;
  @ApiProperty() awardedXp!: number;
  @ApiProperty({ description: 'Extra points awarded for hitting a milestone (0 if none)' }) milestoneBonus!: number;
  @ApiProperty({ description: 'This day completed a level ("7-Day Ritual Complete!")' }) levelCompleted!: boolean;
  @ApiProperty() completionBonus!: number;
  @ApiProperty({ type: StreakTodayDto }) today!: StreakTodayDto;
}

export class StreakActivityQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 30, minimum: 1, maximum: 100 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 30;
}

/** One qualified day in the activity log. */
export class StreakActivityItemDto {
  @ApiProperty({ example: '2026-07-09' }) date!: string;
  @ApiProperty() level!: number;
  @ApiProperty() watchSeconds!: number;
  @ApiProperty() requiredSeconds!: number;
  @ApiProperty({ description: 'Streak length on that day' }) streakDay!: number;
  @ApiProperty({ description: 'Day points + milestone + level bonus' }) pointsAwarded!: number;
  @ApiProperty() levelCompleted!: boolean;
  @ApiProperty() completionBonus!: number;
  @ApiProperty({ type: [String], description: 'Streak badges unlocked that day' }) badges!: string[];
}
