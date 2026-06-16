import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsISO8601, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';

export class CreatePredictionDto {
  @ApiProperty({ maxLength: 500 }) @IsString() @MaxLength(500) question!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ format: 'uuid', description: 'Attach to a content' }) @IsOptional() @IsUUID() contentId?: string;
  @ApiProperty({ example: '2026-06-20T00:00:00Z' }) @IsISO8601() startAt!: string;
  @ApiProperty({ example: '2026-06-25T00:00:00Z' }) @IsISO8601() endAt!: string;
  @ApiPropertyOptional({ minimum: 0, description: 'Flat reward if free prediction' }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) rewardPoints?: number;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) rewardXp?: number;
  @ApiPropertyOptional({ minimum: 0, description: 'Points staked to enter (0 = free)' }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) entryCostPoints?: number;
  @ApiPropertyOptional({ minimum: 1, default: 1, description: 'Correct payout = stake × multiplier' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) payoutMultiplier?: number;
  @ApiProperty({ type: [String], minItems: 2, description: 'Option labels' }) @IsArray() @ArrayMinSize(2) @IsString({ each: true }) options!: string[];
}

export class UpdatePredictionDto {
  @ApiPropertyOptional({ maxLength: 500 }) @IsOptional() @IsString() @MaxLength(500) question?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ format: 'uuid', description: 'Attach to a content' }) @IsOptional() @IsUUID() contentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() startAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() endAt?: string;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) rewardPoints?: number;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) rewardXp?: number;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) entryCostPoints?: number;
  @ApiPropertyOptional({ minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) payoutMultiplier?: number;
}

export class EnterPredictionDto {
  @ApiProperty({ format: 'uuid', description: 'The option you predict' }) @IsUUID() optionId!: string;
}

export class ResolvePredictionDto {
  @ApiProperty({ format: 'uuid', description: 'The winning option' }) @IsUUID() correctOptionId!: string;
}

export class PredictionsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 20, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit = 20;
  @ApiPropertyOptional({ enum: ['open', 'locked', 'resolved', 'cancelled'] }) @IsOptional() @IsIn(['open', 'locked', 'resolved', 'cancelled']) status?: string;
}

// ─── Response DTOs ─────────────────────────────────────────────────────────────

/** A prediction record as stored (admin list/detail base shape). */
export class PredictionDto {
  @ApiProperty() id!: string;
  @ApiProperty() question!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiPropertyOptional({ nullable: true }) contentId!: string | null;
  @ApiProperty() startAt!: string;
  @ApiProperty() endAt!: string;
  @ApiProperty() status!: string;
  @ApiProperty() rewardPoints!: number;
  @ApiProperty() rewardXp!: number;
  @ApiProperty() entryCostPoints!: number;
  @ApiProperty() payoutMultiplier!: number;
  @ApiPropertyOptional({ nullable: true }) correctOptionId!: string | null;
}

/** A prediction option (admin view — full record). */
export class PredictionOptionDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional({ nullable: true }) label!: string | null;
  @ApiPropertyOptional({ nullable: true }) optionMediaId!: string | null;
  @ApiProperty() sortOrder!: number;
  @ApiProperty() isCorrect!: boolean;
}

/** Admin prediction detail — the prediction plus its options. */
export class PredictionDetailDto extends PredictionDto {
  @ApiProperty({ type: [PredictionOptionDto] }) options!: PredictionOptionDto[];
}

/** Paginated admin prediction list. */
export class PredictionListDto {
  @ApiProperty({ type: [PredictionDto] }) items!: PredictionDto[];
  @ApiProperty({ type: PaginationDetailsDto }) pagination!: PaginationDetailsDto;
}

/** The caller's monthly prediction allowance (entitlement). */
export class PredictionEntitlementDto {
  @ApiProperty() isSubscriber!: boolean;
  @ApiPropertyOptional({ nullable: true, description: 'null = unlimited (subscribers)' }) viewsAllowed!: number | null;
  @ApiProperty() viewsUsed!: number;
  @ApiPropertyOptional({ nullable: true, description: 'null = unlimited' }) viewsRemaining!: number | null;
  @ApiProperty() canEnter!: boolean;
}

/** A prediction option as shown to a customer (isCorrect only once resolved). */
export class PredictionCustomerOptionDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional({ nullable: true }) label!: string | null;
  @ApiPropertyOptional({ nullable: true }) optionMediaId!: string | null;
  @ApiPropertyOptional({ description: 'Only present once the prediction is resolved' }) isCorrect?: boolean;
}

/** The caller's entry on a prediction (null when they have not entered). */
export class MyPredictionEntryDto {
  @ApiProperty() optionId!: string;
  @ApiProperty() pointsStaked!: number;
  @ApiPropertyOptional({ nullable: true }) isCorrect!: boolean | null;
  @ApiProperty() pointsAwarded!: number;
}

/** An open prediction in the customer list (options + my entry). */
export class OpenPredictionDto {
  @ApiProperty() id!: string;
  @ApiProperty() question!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty() endAt!: string;
  @ApiProperty() entryCostPoints!: number;
  @ApiProperty() payoutMultiplier!: number;
  @ApiProperty() rewardXp!: number;
  @ApiProperty({ type: [PredictionCustomerOptionDto] }) options!: PredictionCustomerOptionDto[];
  @ApiPropertyOptional({ type: MyPredictionEntryDto, nullable: true }) myEntry!: MyPredictionEntryDto | null;
}

/** Customer open-predictions response — entitlement + open instances. */
export class OpenPredictionsResponseDto {
  @ApiProperty({ type: PredictionEntitlementDto }) entitlement!: PredictionEntitlementDto;
  @ApiProperty({ type: [OpenPredictionDto] }) items!: OpenPredictionDto[];
}

/** Customer prediction detail (result fields populated once resolved). */
export class PredictionCustomerDetailDto {
  @ApiProperty() id!: string;
  @ApiProperty() question!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty() status!: string;
  @ApiProperty() endAt!: string;
  @ApiProperty() entryCostPoints!: number;
  @ApiProperty() payoutMultiplier!: number;
  @ApiProperty() rewardXp!: number;
  @ApiPropertyOptional({ nullable: true }) correctOptionId!: string | null;
  @ApiProperty({ type: [PredictionCustomerOptionDto] }) options!: PredictionCustomerOptionDto[];
  @ApiPropertyOptional({ type: MyPredictionEntryDto, nullable: true }) myEntry!: MyPredictionEntryDto | null;
}

/** Result of entering a prediction. */
export class PredictionEnterResultDto {
  @ApiProperty() entryId!: string;
  @ApiProperty() optionId!: string;
  @ApiProperty() pointsStaked!: number;
}

/** Result of locking a prediction. */
export class PredictionLockResultDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: 'locked' }) status!: string;
}

/** Result of resolving a prediction. */
export class PredictionResolveResultDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: 'resolved' }) status!: string;
  @ApiProperty() correctOptionId!: string;
  @ApiProperty() totalEntries!: number;
  @ApiProperty() correctCount!: number;
}

/** Result of cancelling a prediction. */
export class PredictionCancelResultDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: 'cancelled' }) status!: string;
  @ApiProperty({ description: 'Number of stakes refunded' }) refunded!: number;
}

/** Result of deleting a prediction. */
export class PredictionDeletedResultDto {
  @ApiProperty({ example: true }) deleted!: boolean;
}
