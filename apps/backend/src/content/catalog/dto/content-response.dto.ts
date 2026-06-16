import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** One cast/crew credit embedded in content detail. */
export class CastMemberDto {
  @ApiProperty() personId!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiPropertyOptional({ nullable: true }) photoMediaId!: string | null;
  @ApiProperty({ enum: ['actor', 'director', 'writer', 'producer', 'other'] }) role!: string;
  @ApiPropertyOptional({ nullable: true }) characterName!: string | null;
  @ApiProperty() billingOrder!: number;
}

/** Public-facing content shape (feed item + detail; admin reuses with extra fields). */
export class ContentResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() slug!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty({ enum: ['trailer', 'bts', 'clip'] }) contentType!: string;
  @ApiProperty({ enum: ['free', 'exclusive'] }) accessTier!: string;
  @ApiPropertyOptional({ nullable: true }) unlockPoints!: number | null;
  @ApiPropertyOptional({ nullable: true }) studioId!: string | null;
  @ApiPropertyOptional({ nullable: true }) videoMediaId!: string | null;
  @ApiPropertyOptional({ nullable: true }) thumbnailMediaId!: string | null;
  @ApiPropertyOptional({ nullable: true }) durationSeconds!: number | null;
  @ApiPropertyOptional({ nullable: true }) language!: string | null;
  @ApiProperty() status!: string;
  @ApiProperty() isBoosted!: boolean;
  @ApiProperty() rightsRegion!: string;
  @ApiPropertyOptional({ nullable: true }) parentContentId!: string | null;

  @ApiProperty() viewCount!: number;
  @ApiProperty() likeCount!: number;
  @ApiProperty() dislikeCount!: number;
  @ApiProperty() commentCount!: number;
  @ApiProperty() shareCount!: number;

  // admin-only signals (present on admin endpoints)
  @ApiPropertyOptional() recommendation?: string;
  @ApiPropertyOptional() isSponsored?: boolean;
  @ApiPropertyOptional() isAdCommercial?: boolean;
  @ApiPropertyOptional() licenseStatus?: string;
  @ApiPropertyOptional({ nullable: true }) licenseExpiresAt?: string | null;
  @ApiPropertyOptional({ nullable: true }) scheduledAt?: string | null;
  @ApiPropertyOptional({ nullable: true }) publishedAt?: string | null;
  @ApiPropertyOptional({ nullable: true }) rejectionReason?: string | null;

  // populated on detail responses (omitted on list/feed for payload size)
  @ApiPropertyOptional({ type: [CastMemberDto], description: 'Cast & crew (detail only)' })
  cast?: CastMemberDto[];

  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}
