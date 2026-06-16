import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsISO8601, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';

export class CreateAuctionDto {
  @ApiProperty({ maxLength: 300 }) @IsString() @MaxLength(300) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ maxLength: 300 }) @IsOptional() @IsString() @MaxLength(300) prize?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() contentId?: string;
  @ApiProperty({ example: '2026-06-20T00:00:00Z' }) @IsISO8601() startAt!: string;
  @ApiProperty({ example: '2026-06-25T00:00:00Z' }) @IsISO8601() endAt!: string;
  @ApiPropertyOptional({ minimum: 0, description: 'Minimum bid in points' }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) minBidPoints?: number;
}

export class UpdateAuctionDto {
  @ApiPropertyOptional({ maxLength: 300 }) @IsOptional() @IsString() @MaxLength(300) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ format: 'uuid', description: 'Attach to a content' }) @IsOptional() @IsUUID() contentId?: string;
  @ApiPropertyOptional({ maxLength: 300 }) @IsOptional() @IsString() @MaxLength(300) prize?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() startAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() endAt?: string;
  @ApiPropertyOptional({ minimum: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) minBidPoints?: number;
}

export class PlaceBidDto {
  @ApiProperty({ minimum: 1, description: 'Points to bid (held until settlement)' }) @Type(() => Number) @IsInt() @Min(1) amount!: number;
}

export class AuctionsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 20, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit = 20;
  @ApiPropertyOptional({ enum: ['scheduled', 'open', 'closed', 'settled', 'cancelled'] }) @IsOptional() @IsIn(['scheduled', 'open', 'closed', 'settled', 'cancelled']) status?: string;
}

// ─── Response DTOs ─────────────────────────────────────────────────────────────

/** An auction record as stored (admin list/detail base shape). */
export class AuctionDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiPropertyOptional({ nullable: true }) prize!: string | null;
  @ApiPropertyOptional({ nullable: true }) contentId!: string | null;
  @ApiProperty() startAt!: string;
  @ApiProperty() endAt!: string;
  @ApiProperty() status!: string;
  @ApiProperty() minBidPoints!: number;
  @ApiPropertyOptional({ nullable: true }) winnerUserId!: string | null;
  @ApiPropertyOptional({ nullable: true }) winningAmount!: number | null;
}

/** A bid record (admin view). */
export class BidDto {
  @ApiProperty() id!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() amountPoints!: number;
  @ApiProperty() status!: string;
}

/** Admin auction detail — the auction plus its active bids. */
export class AuctionDetailDto extends AuctionDto {
  @ApiProperty({ type: [BidDto] }) activeBids!: BidDto[];
}

/** Paginated admin auction list. */
export class AuctionListDto {
  @ApiProperty({ type: [AuctionDto] }) items!: AuctionDto[];
  @ApiProperty({ type: PaginationDetailsDto }) pagination!: PaginationDetailsDto;
}

/** An open auction in the customer list (highest + my bid). */
export class OpenAuctionDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional({ nullable: true }) prize!: string | null;
  @ApiProperty() endAt!: string;
  @ApiProperty() minBidPoints!: number;
  @ApiPropertyOptional({ nullable: true }) highestBid!: number | null;
  @ApiPropertyOptional({ nullable: true }) myBid!: number | null;
}

/** Customer auction detail. */
export class AuctionCustomerDetailDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiPropertyOptional({ nullable: true }) prize!: string | null;
  @ApiProperty() status!: string;
  @ApiProperty() endAt!: string;
  @ApiProperty() minBidPoints!: number;
  @ApiPropertyOptional({ nullable: true }) winnerUserId!: string | null;
  @ApiPropertyOptional({ nullable: true }) winningAmount!: number | null;
  @ApiPropertyOptional({ nullable: true }) highestBid!: number | null;
  @ApiPropertyOptional({ nullable: true }) myBid!: number | null;
}

/** Result of placing / raising a bid. */
export class PlaceBidResultDto {
  @ApiProperty() bidId!: string;
  @ApiProperty() amount!: number;
}

/** Result of opening an auction. */
export class AuctionOpenResultDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: 'open' }) status!: string;
}

/** Result of settling an auction. */
export class AuctionSettleResultDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: 'settled' }) status!: string;
  @ApiPropertyOptional({ nullable: true }) winnerUserId!: string | null;
  @ApiPropertyOptional({ nullable: true }) winningAmount!: number | null;
  @ApiProperty() refundedCount!: number;
}

/** Result of cancelling an auction. */
export class AuctionCancelResultDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: 'cancelled' }) status!: string;
  @ApiProperty({ description: 'Number of bids refunded' }) refunded!: number;
}

/** Result of deleting an auction. */
export class AuctionDeletedResultDto {
  @ApiProperty({ example: true }) deleted!: boolean;
}
