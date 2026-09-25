import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsISO8601, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { PageQuery } from '../../dto/engagement-query.dto';

const REPORT_REASONS = ['nudity_sexual', 'violence_gore', 'hate_speech', 'harassment_bullying', 'spam', 'other'];
export const COMMENT_SORTS = ['newest', 'oldest', 'alphabetical'] as const;
export const ADMIN_COMMENT_SORTS = ['newest', 'oldest', 'most_flagged'] as const;

const trim = ({ value }: { value: unknown }): unknown => (typeof value === 'string' ? value.trim() : value);
const toBool = ({ value }: { value: unknown }): unknown => (value === 'true' ? true : value === 'false' ? false : value);

// ─── Write ───────────────────────────────────────────────────────────────────
export class CreateCommentDto {
  @ApiProperty({ minLength: 1, maxLength: 2000, description: 'Trimmed; whitespace-only is rejected' })
  @Transform(trim)
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
  reason!: 'nudity_sexual' | 'violence_gore' | 'hate_speech' | 'harassment_bullying' | 'spam' | 'other';

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

export class AdminCommentsQueryDto extends PageQuery {
  @ApiPropertyOptional({ format: 'uuid', description: 'Only comments on this content' })
  @IsOptional()
  @IsUUID()
  contentId?: string;

  @ApiPropertyOptional({ enum: ['visible', 'hidden', 'deleted'], description: 'Omit for every status' })
  @IsOptional()
  @IsIn(['visible', 'hidden', 'deleted'])
  status?: 'visible' | 'hidden' | 'deleted';

  @ApiPropertyOptional({ description: "A comment id (its replies) or 'top' (top-level comments only)" })
  @IsOptional()
  @Matches(/^(top|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i, { message: "parentId must be a UUID or 'top'" })
  parentId?: string;

  @ApiPropertyOptional({ description: 'true = has pending reports, false = none' })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  flagged?: boolean;

  @ApiPropertyOptional({ enum: ADMIN_COMMENT_SORTS, default: 'newest' })
  @IsOptional()
  @IsIn(ADMIN_COMMENT_SORTS)
  sort?: (typeof ADMIN_COMMENT_SORTS)[number];
}

/** Customer list/replies query — page + sort. */
export class CommentListQueryDto extends PageQuery {
  @ApiPropertyOptional({ enum: COMMENT_SORTS, description: 'Default: newest for comments, oldest for replies' })
  @IsOptional()
  @IsIn(COMMENT_SORTS)
  sort?: (typeof COMMENT_SORTS)[number];
}

export class EnforceCommentAuthorDto {
  @ApiProperty({ enum: ['warn', 'suspend', 'ban'] })
  @IsIn(['warn', 'suspend', 'ban'])
  action!: 'warn' | 'suspend' | 'ban';

  @ApiProperty({ minLength: 3, maxLength: 500, description: 'Shown to the user for warn; stored on the enforcement record' })
  @Transform(trim)
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional({ description: 'suspend only — ISO end time (default now + 7 days)' })
  @ValidateIf((o: EnforceCommentAuthorDto) => o.suspendUntil !== undefined)
  @IsISO8601()
  suspendUntil?: string;

  @ApiPropertyOptional({ description: 'Hide the comment too (default: true for suspend/ban, false for warn)' })
  @IsOptional()
  @IsBoolean()
  hideComment?: boolean;
}

export class EnforceResultDto {
  @ApiProperty() commentId!: string;
  @ApiProperty() userId!: string;
  @ApiProperty({ enum: ['warn', 'suspend', 'ban'] }) action!: string;
  @ApiPropertyOptional({ nullable: true }) expiresAt!: string | null;
  @ApiProperty({ enum: ['visible', 'hidden', 'deleted'] }) commentStatus!: string;
  @ApiProperty({ description: 'Pending reports marked actioned' }) reportsActioned!: number;
  @ApiPropertyOptional({ nullable: true, description: 'Moderation ticket resolved' }) ticketId!: string | null;
}

export class ResolveReportResultDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: ['actioned', 'dismissed'] }) status!: string;
  @ApiProperty() commentId!: string;
  @ApiProperty({ description: 'Pending reports left on the comment' }) pendingReports!: number;
  @ApiPropertyOptional({ nullable: true, description: 'Moderation ticket closed by this resolution' }) ticketClosed!: string | null;
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

export class AdminCommentAuthorDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ description: '"First Last", else username, else "Unknown user"' }) name!: string;
  @ApiPropertyOptional({ nullable: true }) username!: string | null;
  @ApiPropertyOptional({ nullable: true }) avatarUrl!: string | null;
}

/** Admin comment row (any status). */
export class AdminCommentDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) contentId!: string;
  @ApiPropertyOptional({ nullable: true }) contentTitle!: string | null;
  @ApiPropertyOptional({ nullable: true, format: 'uuid' }) parentCommentId!: string | null;
  @ApiProperty() body!: string;
  @ApiProperty({ enum: ['visible', 'hidden', 'deleted'] }) status!: string;
  @ApiProperty() likeCount!: number;
  @ApiProperty() dislikeCount!: number;
  @ApiProperty() replyCount!: number;
  @ApiProperty() flagCount!: number;
  @ApiProperty() isFlagged!: boolean;
  @ApiProperty({ type: [String], description: 'Distinct reasons of pending reports' }) flagReasons!: string[];
  @ApiProperty() pendingReports!: number;
  @ApiProperty({ type: AdminCommentAuthorDto }) author!: AdminCommentAuthorDto;
  @ApiProperty() createdAt!: string;
}

export class OpenTicketRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() status!: string;
}

/** Admin "View in context" thread. */
export class AdminCommentThreadDto {
  @ApiProperty({ type: AdminCommentDto }) comment!: AdminCommentDto;
  @ApiPropertyOptional({ type: AdminCommentDto, nullable: true, description: 'Set when the comment is a reply' }) parent!: AdminCommentDto | null;
  @ApiProperty({ type: [AdminCommentDto], description: 'All replies of the thread (any status), oldest first' }) replies!: AdminCommentDto[];
  @ApiProperty({ type: [CommentReportDto] }) reports!: CommentReportDto[];
  @ApiPropertyOptional({ type: OpenTicketRefDto, nullable: true }) openTicket!: OpenTicketRefDto | null;
}
