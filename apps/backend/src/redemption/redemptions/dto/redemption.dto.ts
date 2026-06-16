import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

const STATUSES = ['pending', 'confirmed', 'fulfilled', 'cancelled', 'refunded'];

export class RedemptionsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit = 20;

  @ApiPropertyOptional({ enum: STATUSES })
  @IsOptional() @IsIn(STATUSES)
  status?: string;
}

export class FulfillmentNoteDto {
  @ApiPropertyOptional({ maxLength: 500, description: 'Fulfillment / cancellation note' })
  @IsOptional() @IsString() @MaxLength(500)
  note?: string;
}

export class RedeemResultDto {
  @ApiProperty({ format: 'uuid' }) redemptionId!: string;
  @ApiProperty() itemId!: string;
  @ApiProperty() costPoints!: number;
  @ApiProperty({ example: 'pending' }) status!: string;
  @ApiProperty({ description: 'Points balance after the spend' }) pointsBalance!: number;
}

/** Result of fulfilling a redemption. */
export class FulfillResultDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'fulfilled' }) status!: string;
}

/** Result of cancelling + refunding a redemption. */
export class CancelRedemptionResultDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'refunded' }) status!: string;
  @ApiProperty({ description: 'Points returned to the user' }) refundedPoints!: number;
}

export class RedemptionDto {
  @ApiProperty() id!: string;
  @ApiProperty() itemId!: string;
  @ApiPropertyOptional({ nullable: true }) itemName!: string | null;
  @ApiProperty() userId!: string;
  @ApiPropertyOptional({ nullable: true }) username?: string | null;
  @ApiProperty() costPoints!: number;
  @ApiProperty() status!: string;
  @ApiPropertyOptional({ nullable: true }) fulfillmentNote!: string | null;
  @ApiProperty() redeemedAt!: string;
  @ApiPropertyOptional({ nullable: true }) fulfilledAt!: string | null;
}
