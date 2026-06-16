import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Daily-streak status — current state, milestones, and the month's qualified-day calendar. */
export class StreakStatusDto {
  @ApiProperty() currentStreak!: number;
  @ApiProperty() longestStreak!: number;
  @ApiProperty() totalQualifiedDays!: number;
  @ApiPropertyOptional({ nullable: true, description: 'Last date (YYYY-MM-DD) the user qualified' }) lastQualifiedDate!: string | null;
  @ApiProperty({ description: 'Whether the user has already qualified today' }) qualifiedToday!: boolean;
  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    description: 'Streak-length → bonus-points thresholds',
    example: { '7': 50, '30': 300 },
  })
  milestones!: Record<string, number>;
  @ApiProperty({ example: '2026-06', description: 'Calendar month (YYYY-MM) for the history' }) month!: string;
  @ApiProperty({ type: [String], description: 'Dates (YYYY-MM-DD) the user qualified within the month' }) history!: string[];
}

/** Result of a daily check-in. */
export class StreakCheckInResultDto {
  @ApiProperty() currentStreak!: number;
  @ApiProperty({ description: 'True if the user had already checked in today (no-op)' }) alreadyCheckedIn!: boolean;
  @ApiProperty() awardedPoints!: number;
  @ApiProperty() awardedXp!: number;
  @ApiProperty({ description: 'Extra points awarded for hitting a milestone (0 if none)' }) milestoneBonus!: number;
}
