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
}

export class ProgressResponseDto {
  @ApiProperty() lastPositionSeconds!: number;
  @ApiProperty() isCompleted!: boolean;
  @ApiPropertyOptional({ nullable: true }) updatedAt!: string | null;
}

export class IngestResultDto {
  @ApiProperty({ description: 'Number of events accepted' }) accepted!: number;
}
