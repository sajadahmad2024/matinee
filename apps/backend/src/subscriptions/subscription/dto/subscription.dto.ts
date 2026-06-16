import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class SubscribeDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() planId!: string;
  @ApiPropertyOptional({ description: 'Provider proof: Stripe session id or IAP receipt (ignored by manual)' })
  @IsOptional() @IsString() @MaxLength(4000)
  proof?: string;
}

export class CancelSubscriptionDto {
  @ApiPropertyOptional({ maxLength: 200 }) @IsOptional() @IsString() @MaxLength(200) reason?: string;
}

export class SubscribersQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 20, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit = 20;
  @ApiPropertyOptional({ enum: ['trialing', 'active', 'past_due', 'canceled', 'unpaid'] })
  @IsOptional() @IsIn(['trialing', 'active', 'past_due', 'canceled', 'unpaid'])
  status?: string;
}

export class InvoicesQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 20, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit = 20;
}

export class SubscriptionDto {
  @ApiProperty() id!: string;
  @ApiProperty() userId!: string;
  @ApiPropertyOptional({ nullable: true }) username?: string | null;
  @ApiPropertyOptional({ nullable: true }) planId!: string | null;
  @ApiPropertyOptional({ nullable: true }) planName!: string | null;
  @ApiProperty() status!: string;
  @ApiPropertyOptional({ nullable: true }) region!: string | null;
  @ApiPropertyOptional({ nullable: true }) amountCents!: number | null;
  @ApiPropertyOptional({ nullable: true }) currency!: string | null;
  @ApiPropertyOptional({ nullable: true }) currentPeriodStart!: string | null;
  @ApiPropertyOptional({ nullable: true }) currentPeriodEnd!: string | null;
  @ApiPropertyOptional({ nullable: true }) trialEndAt!: string | null;
  @ApiPropertyOptional({ nullable: true }) canceledAt!: string | null;
  @ApiPropertyOptional({ nullable: true }) provider!: string | null;
  @ApiProperty() createdAt!: string;
}

export class InvoiceDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional({ nullable: true }) subscriptionId!: string | null;
  @ApiProperty() invoiceNumber!: string;
  @ApiProperty() amountCents!: number;
  @ApiProperty() currency!: string;
  @ApiProperty() status!: string;
  @ApiPropertyOptional({ nullable: true }) paymentMethod!: string | null;
  @ApiProperty() billedAt!: string;
  @ApiPropertyOptional({ nullable: true }) paidAt!: string | null;
  @ApiPropertyOptional({ nullable: true }) refundedAt!: string | null;
}

/** Admin subscription detail — the subscription plus its billing history. */
export class SubscriptionDetailDto {
  @ApiProperty({ type: SubscriptionDto }) subscription!: SubscriptionDto;
  @ApiProperty({ type: [InvoiceDto], description: 'Billing history (max 100)' }) invoices!: InvoiceDto[];
}

/** Result of a cancel (subscription) or refund (invoice) action. */
export class SubscriptionActionResultDto {
  @ApiProperty({ description: 'The affected subscription or invoice id' }) id!: string;
  @ApiProperty({ example: 'canceled', description: 'New status (e.g. canceled / refunded)' }) status!: string;
}

export class PlanOptionDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() interval!: string;
  @ApiProperty({ description: "Price resolved for the caller's region" })
  price!: { priceCents: number; currency: string; region: string | null };
  @ApiProperty() isCurrent!: boolean;
  @ApiProperty({ enum: ['subscribe', 'current', 'upgrade', 'downgrade'] })
  action!: string;
}

export class SubscriptionOverviewDto {
  @ApiPropertyOptional({ type: SubscriptionDto, nullable: true, description: 'Current active subscription (null if none)' })
  current!: SubscriptionDto | null;
  @ApiProperty({ description: 'Whether the caller can cancel right now' })
  canCancel!: boolean;
  @ApiProperty({ type: [PlanOptionDto], description: 'All plans, each with the action available to this user' })
  plans!: PlanOptionDto[];
}
