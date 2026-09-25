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

export class ContentGenreRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() isPrimary!: boolean;
}

export class ContentTagRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
}

export class WatchLinkDto {
  @ApiProperty({ enum: ['Netflix', 'Prime Video', 'Disney+', 'Apple TV', 'In cinemas', 'Other'] }) platform!: string;
  @ApiPropertyOptional({ description: 'Display label (required when platform = Other)' }) label?: string;
  @ApiPropertyOptional({ description: 'https:// deep link' }) url?: string;
}

export class PublishRegionDto {
  @ApiProperty({ enum: ['NA', 'EU', 'APAC', 'LATAM', 'MEA'] }) region!: string;
  @ApiProperty({ description: 'Live in this region (false = selected but switched off)' }) live!: boolean;
}

export class ActorRefDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional({ nullable: true }) name!: string | null;
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
  @ApiPropertyOptional({ nullable: true, description: 'End of the live window (hidden from the feed after)' })
  availableUntil!: string | null;
  @ApiProperty({ type: [WatchLinkDto] }) watchLinks!: WatchLinkDto[];

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
  @ApiPropertyOptional({ nullable: true }) licensorName?: string | null;
  @ApiPropertyOptional({ nullable: true }) licenseTerms?: string | null;
  @ApiPropertyOptional() boostPriority?: number;
  @ApiPropertyOptional({ nullable: true }) boostStartsAt?: string | null;
  @ApiPropertyOptional({ nullable: true }) boostedUntil?: string | null;
  @ApiPropertyOptional({ enum: ['homepage', 'notifications', 'regional', 'subscribers'], isArray: true })
  boostChannels?: string[];
  @ApiPropertyOptional({ description: 'Boosted and now within the boost window' }) isBoostActive?: boolean;

  // admin enrichment (list + detail)
  @ApiPropertyOptional({ nullable: true }) studioName?: string | null;
  @ApiPropertyOptional({ nullable: true, description: 'Public URL of the ready thumbnail' }) thumbnailUrl?: string | null;
  @ApiPropertyOptional({ type: [ContentGenreRefDto] }) genres?: ContentGenreRefDto[];
  @ApiPropertyOptional({ type: [ContentTagRefDto] }) tags?: ContentTagRefDto[];
  @ApiPropertyOptional({ type: [PublishRegionDto] }) publishRegions?: PublishRegionDto[];
  @ApiPropertyOptional({ description: 'Predictions + auctions + quests referencing this content' }) linkedGamesCount?: number;
  @ApiPropertyOptional({ nullable: true }) sponsorName?: string | null;
  @ApiPropertyOptional({ nullable: true, enum: ['pre-roll', 'mid-roll', 'post-roll', 'overlay'] }) adPlacement?: string | null;
  @ApiPropertyOptional({ description: 'Average completion % across view sessions' }) completionRate?: number;
  @ApiPropertyOptional({ enum: ['up', 'flat', 'down'], description: 'Views last 7d vs previous 7d (±10% = flat)' })
  viewsTrend?: string;
  @ApiPropertyOptional({ description: '(license + sponsorship revenue) / views × 1000, in cents' }) revenuePer1kCents?: number;
  @ApiPropertyOptional({ description: 'Open moderation tickets on this content' }) unresolvedFlags?: number;
  @ApiPropertyOptional({ type: ActorRefDto, nullable: true }) createdBy?: ActorRefDto | null;
  @ApiPropertyOptional({ type: ActorRefDto, nullable: true }) updatedBy?: ActorRefDto | null;

  // populated on detail responses (omitted on list/feed for payload size)
  @ApiPropertyOptional({ type: [CastMemberDto], description: 'Cast & crew (detail only)' })
  cast?: CastMemberDto[];

  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}
