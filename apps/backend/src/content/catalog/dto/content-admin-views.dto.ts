import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ContentHistoryEntryDto,
  LicenseResponseDto,
  RegionsResponseDto,
  SponsorshipResponseDto,
} from '../../extras/dto/content-extras-response.dto';
import { ContentResponseDto } from './content-response.dto';

export class LinkedGameDto {
  @ApiProperty() id!: string;
  @ApiProperty({ description: 'Question (prediction), title (auction) or name (quest)' }) title!: string;
  @ApiProperty() status!: string;
}

export class LinkedGamesDto {
  @ApiProperty() total!: number;
  @ApiProperty({ type: [LinkedGameDto] }) predictions!: LinkedGameDto[];
  @ApiProperty({ type: [LinkedGameDto] }) auctions!: LinkedGameDto[];
  @ApiProperty({ type: [LinkedGameDto] }) quests!: LinkedGameDto[];
}

export class ThumbnailCandidateDto {
  @ApiPropertyOptional({ nullable: true, description: 'null for the transcoder poster — use POST /:id/thumbnail/from-poster' })
  mediaId!: string | null;
  @ApiPropertyOptional({ nullable: true }) url!: string | null;
  @ApiProperty({ enum: ['current', 'transcoder_poster', 'thumbnail', 'poster', 'still'] }) source!: string;
  @ApiProperty() isCurrent!: boolean;
}

export class ContentFullDto {
  @ApiProperty({ type: ContentResponseDto }) content!: ContentResponseDto;
  @ApiPropertyOptional({ type: LicenseResponseDto, nullable: true }) license!: LicenseResponseDto | null;
  @ApiPropertyOptional({ type: SponsorshipResponseDto, nullable: true }) sponsorship!: SponsorshipResponseDto | null;
  @ApiProperty({ type: RegionsResponseDto }) regions!: RegionsResponseDto;
  @ApiProperty({ type: [ContentHistoryEntryDto] }) history!: ContentHistoryEntryDto[];
  @ApiProperty({ type: LinkedGamesDto }) linkedGames!: LinkedGamesDto;
}
