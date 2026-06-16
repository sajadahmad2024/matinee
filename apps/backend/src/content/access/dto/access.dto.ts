import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EntitlementDto {
  @ApiProperty() contentId!: string;
  @ApiProperty({ enum: ['free', 'exclusive'] }) accessTier!: string;
  @ApiProperty({ description: 'Points required to unlock (0 for free)' }) unlockPoints!: number;
  @ApiProperty({ description: 'True if exclusive and not yet unlocked by the caller' }) isLocked!: boolean;
  @ApiProperty() isUnlocked!: boolean;
}

export class UnlockResultDto {
  @ApiProperty() isUnlocked!: boolean;
  @ApiProperty({ description: 'True if it was already unlocked (no points spent)' }) alreadyUnlocked!: boolean;
  @ApiProperty() pointsSpent!: number;
  @ApiPropertyOptional({ nullable: true, description: 'Points balance after the spend' }) pointsBalance!: number | null;
}
