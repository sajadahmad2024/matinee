import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

const STATUSES = ['open', 'in_review', 'resolved', 'dismissed', 'escalated'];
const SEVERITIES = ['high', 'medium', 'low'];
const CATEGORIES = ['hate_speech', 'spam', 'nudity', 'violence', 'harassment', 'other'];
const RESOLUTIONS = ['content_removed', 'user_warned', 'user_suspended', 'user_banned', 'no_action'];

export class TicketsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 20, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit = 20;
  @ApiPropertyOptional({ enum: STATUSES }) @IsOptional() @IsIn(STATUSES) status?: string;
  @ApiPropertyOptional({ enum: SEVERITIES }) @IsOptional() @IsIn(SEVERITIES) severity?: string;
  @ApiPropertyOptional({ enum: CATEGORIES }) @IsOptional() @IsIn(CATEGORIES) category?: string;
}

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: ['in_review', 'escalated', 'open'] }) @IsIn(['in_review', 'escalated', 'open']) status!: 'in_review' | 'escalated' | 'open';
}

export class ResolveTicketDto {
  @ApiProperty({ enum: RESOLUTIONS, description: 'Action to take; no_action dismisses' }) @IsIn(RESOLUTIONS) resolution!: string;
  @ApiPropertyOptional({ maxLength: 500 }) @IsOptional() @IsString() @MaxLength(500) note?: string;
}

export class TicketDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: ['comment', 'content', 'user'] }) subjectType!: string;
  @ApiPropertyOptional({ nullable: true }) subjectId!: string | null;
  @ApiPropertyOptional({ nullable: true }) offenderUserId!: string | null;
  @ApiPropertyOptional({ nullable: true }) offenderUsername?: string | null;
  @ApiProperty() severity!: string;
  @ApiProperty() category!: string;
  @ApiProperty() reportCount!: number;
  @ApiProperty() status!: string;
  @ApiPropertyOptional({ nullable: true }) resolution!: string | null;
  @ApiProperty() createdAt!: string;
}

/**
 * Ticket counts keyed by status (dynamic keys, e.g. `{ open: 3, resolved: 5 }`).
 * Free-form `string → number` map.
 */
export class ModerationStatsDto {
  [status: string]: number;
}

export class ModerationReportDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional({ nullable: true }) reporterUserId!: string | null;
  @ApiPropertyOptional({ nullable: true }) reporterUsername!: string | null;
  @ApiProperty() reason!: string;
  @ApiPropertyOptional({ nullable: true }) note!: string | null;
  @ApiProperty() createdAt!: string;
}

/** Full ticket record plus the attached reports — the moderation detail view. */
export class TicketDetailDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: ['comment', 'content', 'user'] }) subjectType!: string;
  @ApiPropertyOptional({ nullable: true }) subjectId!: string | null;
  @ApiPropertyOptional({ nullable: true }) offenderUserId!: string | null;
  @ApiPropertyOptional({ nullable: true }) offenderUsername?: string | null;
  @ApiProperty() severity!: string;
  @ApiProperty() category!: string;
  @ApiPropertyOptional({ nullable: true }) contentSnapshot!: string | null;
  @ApiProperty() reportCount!: number;
  @ApiProperty() isRepeatOffender!: boolean;
  @ApiProperty() status!: string;
  @ApiPropertyOptional({ nullable: true }) assignedTo!: string | null;
  @ApiPropertyOptional({ nullable: true }) resolution!: string | null;
  @ApiPropertyOptional({ nullable: true }) resolutionNote!: string | null;
  @ApiPropertyOptional({ nullable: true }) resolvedAt!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty({ type: [ModerationReportDto] }) reports!: ModerationReportDto[];
}

/** Result of assigning a ticket to the current admin. */
export class TicketAssignedDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: 'in_review' }) status!: string;
  @ApiProperty({ description: 'Admin the ticket is now assigned to' }) assignedTo!: string;
}

/** Result of a ticket status change. */
export class TicketStatusDto {
  @ApiProperty() id!: string;
  @ApiProperty() status!: string;
}

/** Result of resolving a ticket. */
export class TicketResolvedDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: RESOLUTIONS }) resolution!: string;
  @ApiProperty({ enum: ['resolved', 'dismissed'] }) status!: string;
}
