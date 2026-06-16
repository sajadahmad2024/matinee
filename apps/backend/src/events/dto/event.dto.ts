import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEnum, IsIn, IsISO8601, IsInt, IsObject, IsOptional, IsString, IsUUID, Min, MaxLength, ValidateNested } from 'class-validator';
import { AppEventName, AppEventType } from '../event-catalog';

const PLATFORMS = ['ios', 'android', 'web'];

export class EventItemDto {
  // The ONLY identifying field the client sends. Bound to the backend-owned catalog enum, so the
  // generated SDK exposes it as a typed enum and unknown names are rejected at ingestion. The
  // category (event_type) is derived server-side from this name — never client-supplied.
  @ApiProperty({ enum: AppEventName, enumName: 'AppEventName', example: AppEventName.ScreenView, description: 'Canonical event (backend-owned catalog)' })
  @IsEnum(AppEventName)
  eventName!: AppEventName;

  @ApiPropertyOptional({ format: 'uuid', description: 'Content context, if any' }) @IsOptional() @IsUUID() contentId?: string;
  @ApiPropertyOptional({ maxLength: 64 }) @IsOptional() @IsString() @MaxLength(64) sessionId?: string;
  @ApiPropertyOptional({ type: 'object', additionalProperties: true, description: 'Arbitrary event payload' }) @IsOptional() @IsObject() properties?: Record<string, unknown>;
  @ApiProperty({ example: '2026-06-16T10:00:00Z' }) @IsISO8601() occurredAt!: string;
}

export class IngestEventsDto {
  @ApiPropertyOptional({ enum: PLATFORMS }) @IsOptional() @IsIn(PLATFORMS) platform?: string;
  @ApiProperty({ type: [EventItemDto], description: 'Batch of events (≤200)' })
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => EventItemDto)
  events!: EventItemDto[];
}

export class EventsQueryDto {
  @ApiPropertyOptional({ default: 100, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit = 100;
  @ApiPropertyOptional({ enum: AppEventName, enumName: 'AppEventName', description: 'Filter by canonical event' }) @IsOptional() @IsEnum(AppEventName) eventName?: AppEventName;
  @ApiPropertyOptional({ enum: AppEventType, enumName: 'AppEventType', description: 'Filter by category' }) @IsOptional() @IsEnum(AppEventType) eventType?: AppEventType;
}

/** Discovery response: the full backend-owned catalog (name → category). */
export class EventCatalogItemDto {
  @ApiProperty({ enum: AppEventName, enumName: 'AppEventName' }) name!: AppEventName;
  @ApiProperty({ enum: AppEventType, enumName: 'AppEventType' }) type!: AppEventType;
}

/** A single stored telemetry event row (admin read view). */
export class EventRecordDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid', nullable: true, description: 'Actor user id; null for anonymous' }) userId!: string | null;
  @ApiProperty({ description: 'Category, derived from the event name' }) eventType!: string;
  @ApiProperty({ description: 'Canonical event name' }) eventName!: string;
  @ApiProperty({ format: 'uuid', nullable: true, description: 'Content context, if any' }) contentId!: string | null;
  @ApiProperty({ type: 'object', additionalProperties: true, description: 'Arbitrary event payload' }) properties!: Record<string, unknown>;
  @ApiProperty({ nullable: true, description: 'Originating platform (ios/android/web)' }) platform!: string | null;
  @ApiProperty({ description: 'When the event occurred (ISO)' }) occurredAt!: string;
}

/** Event volume rollup — count of events grouped by name (and category). */
export class EventVolumeDto {
  @ApiProperty({ description: 'Category of the event' }) eventType!: string;
  @ApiProperty({ description: 'Canonical event name' }) eventName!: string;
  @ApiProperty({ description: 'Number of occurrences in the window' }) count!: number;
}
