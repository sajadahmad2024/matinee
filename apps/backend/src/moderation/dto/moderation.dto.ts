import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const STATUSES = ['open', 'in_review', 'resolved', 'dismissed', 'escalated'];
export const SEVERITIES = ['high', 'medium', 'low'];
export const CATEGORIES = ['hate_speech', 'spam', 'nudity', 'violence', 'harassment', 'other'];
export const RESOLUTIONS = ['content_removed', 'user_warned', 'user_suspended', 'user_banned', 'no_action'];
export const SUSPEND_DURATIONS = ['24h', '7d', '30d'] as const;
export type SuspendDuration = (typeof SUSPEND_DURATIONS)[number];
export const BULK_ACTIONS = ['dismiss', 'resolve', 'assign', 'escalate'] as const;
export type BulkAction = (typeof BULK_ACTIONS)[number];
export const TICKET_SORTS = ['newest', 'oldest', 'severity', 'reports'] as const;
/** Customer report reasons: the moderation vocabulary + the comment-report aliases. */
export const CUSTOMER_REPORT_REASONS = [...CATEGORIES, 'nudity_sexual', 'violence_gore', 'harassment_bullying'];

const trim = ({ value }: { value: unknown }): unknown => (typeof value === 'string' ? value.trim() : value);
const toBool = ({ value }: { value: unknown }): unknown => (value === 'true' ? true : value === 'false' ? false : value);
const typeAlias = ({ value }: { value: unknown }): unknown => (value === 'video' ? 'content' : value);
const UUID_OR = (words: string) => new RegExp(`^(${words}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$`, 'i');

// ─── Queries ─────────────────────────────────────────────────────────────────

export class TicketsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
  @ApiPropertyOptional({ enum: [...STATUSES, 'pending'], description: "'pending' = open + in_review + escalated" })
  @IsOptional()
  @IsIn([...STATUSES, 'pending'])
  status?: string;
  @ApiPropertyOptional({ enum: SEVERITIES }) @IsOptional() @IsIn(SEVERITIES) severity?: string;
  @ApiPropertyOptional({ enum: CATEGORIES }) @IsOptional() @IsIn(CATEGORIES) category?: string;
  @ApiPropertyOptional({ enum: ['comment', 'content', 'video', 'user'], description: "'video' is an alias of 'content'" })
  @IsOptional()
  @Transform(typeAlias)
  @IsIn(['comment', 'content', 'user'])
  type?: 'comment' | 'content' | 'user';
  @ApiPropertyOptional({ description: "'me', 'unassigned' or an admin id" })
  @IsOptional()
  @Matches(UUID_OR('me|unassigned'), { message: "assignee must be 'me', 'unassigned' or a UUID" })
  assignee?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() offenderId?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(toBool) @IsBoolean() repeatOffender?: boolean;
  @ApiPropertyOptional({ maxLength: 100, description: 'Offender username / name, offender / subject / ticket id, snapshot text' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  q?: string;
  @ApiPropertyOptional({ description: 'ISO date — createdAt >= from' }) @IsOptional() @IsISO8601() from?: string;
  @ApiPropertyOptional({ description: 'ISO date — createdAt <= to' }) @IsOptional() @IsISO8601() to?: string;
  @ApiPropertyOptional({ enum: TICKET_SORTS, default: 'newest' }) @IsOptional() @IsIn(TICKET_SORTS) sort?: (typeof TICKET_SORTS)[number];
}

export class AuditQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 100 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 50;
  @ApiPropertyOptional() @IsOptional() @IsUUID() ticketId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() actorId?: string;
}

// ─── Writes ──────────────────────────────────────────────────────────────────

export class AssignTicketDto {
  @ApiPropertyOptional({ description: 'Admin to assign to (default: me)' }) @IsOptional() @IsUUID() assigneeId?: string;
}

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: ['in_review', 'escalated', 'open'], description: "'open' returns the ticket to the queue (unassigned)" })
  @IsIn(['in_review', 'escalated', 'open'])
  status!: 'in_review' | 'escalated' | 'open';
  @ApiPropertyOptional({ maxLength: 1000, description: 'Stored as an internal note (e.g. escalation reason)' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  note?: string;
}

export class AddTicketNoteDto {
  @ApiProperty({ minLength: 1, maxLength: 1000 }) @Transform(trim) @IsString() @MinLength(1) @MaxLength(1000) body!: string;
}

export class ResolveTicketDto {
  @ApiProperty({ enum: RESOLUTIONS, description: 'Action to take; no_action dismisses' }) @IsIn(RESOLUTIONS) resolution!: string;
  @ApiPropertyOptional({ maxLength: 500 }) @IsOptional() @IsString() @MaxLength(500) note?: string;
  @ApiPropertyOptional({ enum: SUSPEND_DURATIONS, description: 'user_suspended only (default 7d). Permanent = user_banned' })
  @IsOptional()
  @IsIn(SUSPEND_DURATIONS)
  suspendDuration?: SuspendDuration;
  @ApiPropertyOptional({ description: 'user_suspended only — explicit ISO end (future, ≤ 1 year); exclusive with suspendDuration' })
  @IsOptional()
  @IsISO8601({ strict: true })
  suspendUntil?: string;
}

export class BulkTicketsDto {
  @ApiProperty({ type: [String], minItems: 1, maxItems: 100 })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  ticketIds!: string[];

  @ApiProperty({ enum: BULK_ACTIONS, description: 'Ignore All → dismiss; Delete Content → resolve+content_removed; Ban Users → resolve+user_banned' })
  @IsIn(BULK_ACTIONS)
  action!: BulkAction;

  @ApiPropertyOptional({ enum: RESOLUTIONS, description: "Required for action 'resolve'" })
  @IsOptional()
  @IsIn(RESOLUTIONS)
  resolution?: string;

  @ApiPropertyOptional({ maxLength: 500, description: 'Resolution note (resolve/dismiss) or internal note (escalate)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
  @ApiPropertyOptional({ enum: SUSPEND_DURATIONS }) @IsOptional() @IsIn(SUSPEND_DURATIONS) suspendDuration?: SuspendDuration;
  @ApiPropertyOptional() @IsOptional() @IsISO8601({ strict: true }) suspendUntil?: string;
  @ApiPropertyOptional({ description: "action 'assign' — default: me" }) @IsOptional() @IsUUID() assigneeId?: string;
}

export class CustomerReportDto {
  @ApiProperty({ enum: CUSTOMER_REPORT_REASONS }) @IsIn(CUSTOMER_REPORT_REASONS) reason!: string;
  @ApiPropertyOptional({ maxLength: 500 }) @IsOptional() @Transform(trim) @IsString() @MaxLength(500) note?: string;
}

// ─── Responses ───────────────────────────────────────────────────────────────

export class TicketDto {
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
  @ApiPropertyOptional({ nullable: true }) assigneeName?: string | null;
  @ApiPropertyOptional({ nullable: true }) resolution!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

class StatusCountsDto {
  [status: string]: number;
}

class BacklogDto {
  @ApiProperty() total!: number;
  @ApiProperty({ enum: ['healthy', 'elevated', 'critical'] }) health!: string;
  @ApiProperty({ type: Object, example: { open: 9, in_review: 2, escalated: 1 } }) byStatus!: StatusCountsDto;
  @ApiProperty({ type: Object, example: { high: 4, medium: 5, low: 3 } }) bySeverity!: StatusCountsDto;
  @ApiProperty({ type: Object, example: { comment: 8, content: 2, user: 2 } }) byType!: StatusCountsDto;
}

class AvgResolutionDto {
  @ApiPropertyOptional({ nullable: true, description: 'Minutes, tickets closed in the last 7 days' }) current!: number | null;
  @ApiPropertyOptional({ nullable: true, description: 'Minutes, the 7 days before' }) previous!: number | null;
  @ApiPropertyOptional({ nullable: true, description: 'Negative = faster' }) changePct!: number | null;
}

class ResolvedTodayDto {
  @ApiProperty() today!: number;
  @ApiProperty() yesterday!: number;
  @ApiProperty() delta!: number;
}

class SafetyScoreDto {
  @ApiProperty({ description: '100 × (1 − flagged / total), 0.1 precision' }) score!: number;
  @ApiProperty() windowDays!: number;
  @ApiProperty() totalItems!: number;
  @ApiProperty() flaggedItems!: number;
}

class VolumeBucketDto {
  @ApiProperty() hour!: string;
  @ApiProperty() reports!: number;
}

class ReportVolumeDto {
  @ApiProperty() total!: number;
  @ApiProperty() previous24h!: number;
  @ApiProperty({ type: [VolumeBucketDto] }) buckets!: VolumeBucketDto[];
}

class ViolationDto {
  @ApiProperty({ enum: CATEGORIES }) category!: string;
  @ApiProperty() count!: number;
  @ApiProperty() percentage!: number;
}

/** Moderation dashboard analytics. */
export class ModerationStatsDto {
  @ApiProperty({ type: BacklogDto }) backlog!: BacklogDto;
  @ApiProperty({ type: Object, description: 'All-time ticket counts by status' }) byStatus!: StatusCountsDto;
  @ApiProperty({ type: AvgResolutionDto }) avgResolutionMinutes!: AvgResolutionDto;
  @ApiProperty({ type: ResolvedTodayDto }) resolvedToday!: ResolvedTodayDto;
  @ApiProperty({ type: SafetyScoreDto }) safetyScore!: SafetyScoreDto;
  @ApiProperty({ type: ReportVolumeDto }) reportVolume24h!: ReportVolumeDto;
  @ApiProperty({ type: [ViolationDto] }) violationBreakdown!: ViolationDto[];
}

export class ModerationReportDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional({ nullable: true }) reporterUserId!: string | null;
  @ApiPropertyOptional({ nullable: true }) reporterUsername!: string | null;
  @ApiProperty() reason!: string;
  @ApiPropertyOptional({ nullable: true }) note!: string | null;
  @ApiProperty() createdAt!: string;
}

export class TicketNoteDto {
  @ApiProperty() id!: string;
  @ApiProperty() body!: string;
  @ApiPropertyOptional({ nullable: true }) authorId!: string | null;
  @ApiPropertyOptional({ nullable: true }) authorName!: string | null;
  @ApiProperty() createdAt!: string;
}

export class AuditEntryDto {
  @ApiProperty() id!: string;
  @ApiProperty() action!: string;
  @ApiPropertyOptional({ nullable: true }) actorId!: string | null;
  @ApiPropertyOptional({ nullable: true }) actorLabel!: string | null;
  @ApiPropertyOptional({ nullable: true }) targetType!: string | null;
  @ApiPropertyOptional({ nullable: true }) targetId!: string | null;
  @ApiProperty({ type: Object }) metadata!: unknown;
  @ApiProperty() createdAt!: string;
}

class OffenderDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional({ nullable: true }) username!: string | null;
  @ApiPropertyOptional({ nullable: true }) name!: string | null;
  @ApiPropertyOptional({ nullable: true }) avatarUrl!: string | null;
  @ApiProperty() status!: string;
  @ApiPropertyOptional({ nullable: true }) suspendedUntil!: string | null;
  @ApiProperty() joinedAt!: string;
}

class PriorTicketDto {
  @ApiProperty() id!: string;
  @ApiProperty() subjectType!: string;
  @ApiProperty() category!: string;
  @ApiProperty() severity!: string;
  @ApiProperty() status!: string;
  @ApiPropertyOptional({ nullable: true }) resolution!: string | null;
  @ApiProperty() createdAt!: string;
}

class EnforcementDto {
  @ApiProperty() id!: string;
  @ApiProperty() action!: string;
  @ApiPropertyOptional({ nullable: true }) reason!: string | null;
  @ApiPropertyOptional({ nullable: true }) expiresAt!: string | null;
  @ApiPropertyOptional({ nullable: true }) performedBy!: string | null;
  @ApiProperty() createdAt!: string;
}

class OffenderTotalsDto {
  @ApiProperty() tickets!: number;
  @ApiProperty() actioned!: number;
  @ApiProperty() dismissed!: number;
  @ApiProperty() open!: number;
}

class OffenderHistoryDto {
  @ApiProperty({ type: OffenderTotalsDto }) totals!: OffenderTotalsDto;
  @ApiProperty({ type: [PriorTicketDto] }) priorTickets!: PriorTicketDto[];
  @ApiProperty({ type: [EnforcementDto] }) enforcements!: EnforcementDto[];
}

/** Full ticket + evidence (reports, subject preview, offender + history, notes, activity). */
export class TicketDetailDto extends TicketDto {
  @ApiPropertyOptional({ nullable: true }) resolutionNote!: string | null;
  @ApiPropertyOptional({ nullable: true }) resolvedBy!: string | null;
  @ApiPropertyOptional({ nullable: true }) resolvedAt!: string | null;
  @ApiProperty({ type: [ModerationReportDto] }) reports!: ModerationReportDto[];
  @ApiPropertyOptional({ type: Object, nullable: true, description: 'Subject preview (comment / content / user)' }) subject!: Record<string, unknown> | null;
  @ApiPropertyOptional({ type: OffenderDto, nullable: true }) offender!: OffenderDto | null;
  @ApiPropertyOptional({ type: OffenderHistoryDto, nullable: true }) offenderHistory!: OffenderHistoryDto | null;
  @ApiProperty({ type: [TicketNoteDto] }) notes!: TicketNoteDto[];
  @ApiProperty({ type: [AuditEntryDto] }) activity!: AuditEntryDto[];
}

/** Result of assigning a ticket. */
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

class EnforcementResultDto {
  @ApiProperty({ enum: ['warn', 'suspend', 'ban'] }) action!: string;
  @ApiPropertyOptional({ nullable: true }) expiresAt!: string | null;
}

/** Result of resolving a ticket. */
export class TicketResolvedDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: RESOLUTIONS }) resolution!: string;
  @ApiProperty({ enum: ['resolved', 'dismissed'] }) status!: string;
  @ApiProperty({ description: 'Pending comment reports closed with the ticket (comment tickets)' }) reportsClosed!: number;
  @ApiPropertyOptional({ type: EnforcementResultDto, nullable: true }) enforcement!: EnforcementResultDto | null;
}

class BulkItemResultDto {
  @ApiProperty() id!: string;
  @ApiProperty() ok!: boolean;
  @ApiPropertyOptional() status?: string;
  @ApiPropertyOptional() resolution?: string;
  @ApiPropertyOptional() error?: string;
}

export class BulkResultDto {
  @ApiProperty() processed!: number;
  @ApiProperty() succeeded!: number;
  @ApiProperty() failed!: number;
  @ApiProperty({ type: [BulkItemResultDto] }) results!: BulkItemResultDto[];
}

export class ReportReceivedDto {
  @ApiProperty() ticketId!: string;
  @ApiProperty({ example: 'received' }) status!: string;
}
