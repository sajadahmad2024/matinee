import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PageQuery } from '../../dto/engagement-query.dto';

const REPORT_REASONS = ['nudity_sexual', 'violence_gore', 'hate_speech', 'harassment_bullying', 'other'];

// ─── Write ───────────────────────────────────────────────────────────────────
export class CreateCommentDto {
  @ApiProperty({ minLength: 1, maxLength: 2000 })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  body!: string;
}

export class SetCommentReactionDto {
  @ApiProperty({ enum: ['like', 'dislike'] })
  @IsIn(['like', 'dislike'])
  reaction!: 'like' | 'dislike';
}

export class ReportCommentDto {
  @ApiProperty({ enum: REPORT_REASONS })
  @IsIn(REPORT_REASONS)
  reason!: 'nudity_sexual' | 'violence_gore' | 'hate_speech' | 'harassment_bullying' | 'other';

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

// ─── Admin ─────────────────────────────────────────────────────────────────────
export class ModerateCommentDto {
  @ApiProperty({ enum: ['visible', 'hidden', 'deleted'], description: 'hide / restore / delete a comment' })
  @IsIn(['visible', 'hidden', 'deleted'])
  status!: 'visible' | 'hidden' | 'deleted';
}

export class ResolveReportDto {
  @ApiProperty({ enum: ['actioned', 'dismissed'] })
  @IsIn(['actioned', 'dismissed'])
  status!: 'actioned' | 'dismissed';
}

export class ReportsQueryDto extends PageQuery {
  @ApiPropertyOptional({ enum: ['pending', 'actioned', 'dismissed'] })
  @IsOptional()
  @IsIn(['pending', 'actioned', 'dismissed'])
  status?: string;
}

// ─── Responses ───────────────────────────────────────────────────────────────
export class CommentAuthorDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional({ nullable: true }) username!: string | null;
  @ApiPropertyOptional({ nullable: true }) firstName!: string | null;
  @ApiPropertyOptional({ nullable: true }) avatarUrl!: string | null;
}

export class CommentDto {
  @ApiProperty() id!: string;
  @ApiProperty() contentId!: string;
  @ApiPropertyOptional({ nullable: true }) parentCommentId!: string | null;
  @ApiProperty() body!: string;
  @ApiProperty() likeCount!: number;
  @ApiProperty() dislikeCount!: number;
  @ApiProperty() replyCount!: number;
  @ApiPropertyOptional({ enum: ['like', 'dislike'], nullable: true }) myReaction!: 'like' | 'dislike' | null;
  @ApiProperty({ type: CommentAuthorDto }) author!: CommentAuthorDto;
  @ApiProperty() createdAt!: string;
}

/** Result of reporting a comment — the report id and the moderation ticket it rolled into. */
export class ReportResultDto {
  @ApiProperty({ format: 'uuid', description: 'The created report id' }) reportId!: string;
  @ApiProperty({ format: 'uuid', description: 'The moderation ticket this report was rolled into' }) ticketId!: string;
}

/** Result of an admin comment-moderation action (resolve report / set comment status). */
export class CommentActionResultDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ description: 'Resulting status' }) status!: string;
}

export class CommentReportDto {
  @ApiProperty() id!: string;
  @ApiProperty() commentId!: string;
  @ApiProperty() commentBody!: string;
  @ApiProperty() reason!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty() status!: string;
  @ApiProperty() reportedBy!: string;
  @ApiPropertyOptional({ nullable: true }) reporterUsername!: string | null;
  @ApiProperty() createdAt!: string;
}
