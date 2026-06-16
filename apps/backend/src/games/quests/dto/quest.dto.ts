import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsBoolean, IsIn, IsISO8601, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';

export class CreateQuestDto {
  @ApiProperty({ maxLength: 200 }) @IsString() @MaxLength(200) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) rewardPoints?: number;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) rewardXp?: number;
  @ApiProperty({ example: '2026-06-20T00:00:00Z' }) @IsISO8601() startAt!: string;
  @ApiProperty({ example: '2026-06-30T00:00:00Z' }) @IsISO8601() endAt!: string;
  @ApiPropertyOptional({ default: true, description: 'true = must complete all contents; false = any one' }) @IsOptional() @IsBoolean() requireAll?: boolean;
  @ApiPropertyOptional({ type: [String], description: 'Content ids in this quest' }) @IsOptional() @IsArray() @ArrayUnique() @IsUUID('all', { each: true }) contentIds?: string[];
}

export class UpdateQuestDto {
  @ApiPropertyOptional({ maxLength: 200 }) @IsOptional() @IsString() @MaxLength(200) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) rewardPoints?: number;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) rewardXp?: number;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() startAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() endAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() requireAll?: boolean;
}

export class QuestsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 20, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit = 20;
  @ApiPropertyOptional({ enum: ['draft', 'active', 'ended', 'cancelled'] }) @IsOptional() @IsIn(['draft', 'active', 'ended', 'cancelled']) status?: string;
}

export class ActiveQuestDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty() rewardPoints!: number;
  @ApiProperty() rewardXp!: number;
  @ApiProperty() endAt!: string;
  @ApiProperty() contentCount!: number;
  @ApiProperty({ description: 'Contents needed to complete' }) required!: number;
  @ApiProperty() completedCount!: number;
  @ApiProperty() isCompleted!: boolean;
  @ApiProperty() claimed!: boolean;
}

export class QuestClaimResultDto {
  @ApiProperty() rewardedPoints!: number;
  @ApiProperty() rewardedXp!: number;
  @ApiProperty() alreadyClaimed!: boolean;
}

/** A quest record as stored (admin list/detail base shape). */
export class QuestDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty() rewardPoints!: number;
  @ApiProperty() rewardXp!: number;
  @ApiProperty() startAt!: string;
  @ApiProperty() endAt!: string;
  @ApiProperty() requireAll!: boolean;
  @ApiProperty() status!: string;
  @ApiProperty() contentCount!: number;
}

/** Admin quest detail — the quest plus the content ids it includes. */
export class QuestDetailDto extends QuestDto {
  @ApiProperty({ type: [String] }) contentIds!: string[];
}

/** Paginated admin quest list. */
export class QuestListDto {
  @ApiProperty({ type: [QuestDto] }) items!: QuestDto[];
  @ApiProperty({ type: PaginationDetailsDto }) pagination!: PaginationDetailsDto;
}

/** A single quest content with the caller's completion flag. */
export class QuestContentProgressDto {
  @ApiProperty() contentId!: string;
  @ApiProperty() completed!: boolean;
}

/** Customer quest detail — contents + the caller's per-content + overall progress. */
export class QuestCustomerDetailDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty() rewardPoints!: number;
  @ApiProperty() rewardXp!: number;
  @ApiProperty() startAt!: string;
  @ApiProperty() endAt!: string;
  @ApiProperty() status!: string;
  @ApiProperty({ description: 'Contents needed to complete' }) required!: number;
  @ApiProperty({ type: [QuestContentProgressDto] }) contents!: QuestContentProgressDto[];
  @ApiProperty() completedCount!: number;
  @ApiProperty() isCompleted!: boolean;
  @ApiProperty() claimed!: boolean;
}

/** The caller's participation summary after recording a content completion. */
export class QuestParticipationDto {
  @ApiProperty() completedCount!: number;
  @ApiProperty() isCompleted!: boolean;
  @ApiPropertyOptional({ nullable: true }) completedAt!: string | null;
  @ApiPropertyOptional({ nullable: true }) rewardedAt!: string | null;
}

/** Result of a quest status transition (activate / end / cancel). */
export class QuestStatusResultDto {
  @ApiProperty() id!: string;
  @ApiProperty() status!: string;
}

/** Result of deleting a quest. */
export class QuestDeletedResultDto {
  @ApiProperty({ example: true }) deleted!: boolean;
}
