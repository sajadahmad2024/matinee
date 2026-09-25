import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlaybackDto } from '@media/dto/media-response.dto';

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

/** Entitlement-checked playback descriptor for a content's video. */
export class ContentPlaybackDto {
  @ApiProperty() contentId!: string;
  @ApiProperty() mediaId!: string;
  @ApiProperty({ enum: ['free', 'exclusive'] }) accessTier!: string;
  @ApiPropertyOptional({ nullable: true }) durationSeconds!: number | null;
  @ApiPropertyOptional({ nullable: true }) width!: number | null;
  @ApiPropertyOptional({ nullable: true }) height!: number | null;
  @ApiProperty({ type: PlaybackDto }) playback!: PlaybackDto;
}
