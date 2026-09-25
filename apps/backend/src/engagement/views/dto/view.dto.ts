import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const EVENT_TYPES = ['play', 'pause', 'seek', 'heartbeat', 'complete'];

/** Where the viewer came from — persisted on `content_views.source` (DB check constraint). */
export const VIEW_SOURCES = ['feed', 'search', 'share', 'notification', 'profile', 'deeplink', 'other'] as const;
export type ViewSource = (typeof VIEW_SOURCES)[number];

// ─── Write ───────────────────────────────────────────────────────────────────
export class StartViewDto {
  @ApiPropertyOptional({ maxLength: 64, description: 'Client session id (dedupe)' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  sessionId?: string;

  @ApiPropertyOptional({ enum: ['ios', 'android', 'web'] })
  @IsOptional()
  @IsIn(['ios', 'android', 'web'])
  device?: string;

  @ApiPropertyOptional({ enum: VIEW_SOURCES, description: 'Traffic source (drives admin traffic-source analytics)' })
  @IsOptional()
  @IsIn(VIEW_SOURCES)
  source?: ViewSource;
}

export class HeartbeatDto {
  @ApiProperty({ minimum: 0, description: 'Seconds actually watched this session' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  watchedSeconds!: number;

  @ApiProperty({ minimum: 0, description: 'Current playhead position (seconds)' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  positionSeconds!: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  completionPercent?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class WatchEventItemDto {
  @ApiProperty({ enum: EVENT_TYPES })
  @IsIn(EVENT_TYPES)
  type!: 'play' | 'pause' | 'seek' | 'heartbeat' | 'complete';

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  positionSeconds!: number;

  @ApiProperty({ example: '2026-06-16T07:00:00Z' })
  @IsISO8601()
  occurredAt!: string;
}

export class IngestWatchEventsDto {
  @ApiPropertyOptional({ format: 'uuid', description: 'The view/session these events belong to' })
  @IsOptional()
  @IsUUID()
  viewId?: string;

  @ApiProperty({ type: [WatchEventItemDto], description: 'Batch of events (≤100)' })
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => WatchEventItemDto)
  events!: WatchEventItemDto[];
}

// ─── Responses ───────────────────────────────────────────────────────────────
export class ViewStartedDto {
  @ApiProperty({ format: 'uuid' }) viewId!: string;
  @ApiProperty({ description: 'true when an existing session was reused (same sessionId, or unfinished within 30 min)' })
  resumed!: boolean;
}

export class StreakTodayDto {
  @ApiProperty({ example: '2026-09-25', description: 'UTC day' }) date!: string;
  @ApiProperty({ description: 'Credited watch seconds today' }) watchSeconds!: number;
  @ApiProperty({ description: "Current level's daily requirement" }) requiredSeconds!: number;
  @ApiProperty() remainingSeconds!: number;
  @ApiProperty({ description: 'Today already counts toward the streak' }) qualified!: boolean;
}

export class ProgressResponseDto {
  @ApiProperty() lastPositionSeconds!: number;
  @ApiProperty() isCompleted!: boolean;
  @ApiPropertyOptional({ nullable: true }) updatedAt!: string | null;
  @ApiPropertyOptional({ type: StreakTodayDto, description: 'Heartbeat only — streak progress for today' })
  today?: StreakTodayDto;
}

export class IngestResultDto {
  @ApiProperty({ description: 'Number of events accepted' }) accepted!: number;
}
