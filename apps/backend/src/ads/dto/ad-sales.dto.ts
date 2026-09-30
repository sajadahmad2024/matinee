import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { PlaybackDto } from '@media/dto/media-response.dto';

export const ADVERTISER_STATUSES = ['active', 'paused', 'archived'] as const;
export const CAMPAIGN_TYPES = ['commercial', 'sponsorship'] as const;
export const CAMPAIGN_STATUSES = ['draft', 'scheduled', 'active', 'paused', 'ended'] as const;
export const PRICING_MODELS = ['flat', 'cpm', 'cpc'] as const;
export const LEDGER_KINDS = ['booked', 'accrued', 'invoiced', 'paid', 'credit'] as const;
export const MANUAL_LEDGER_KINDS = ['booked', 'invoiced', 'paid', 'credit'] as const;
const REGIONS = ['NA', 'EU', 'APAC', 'LATAM', 'MEA'];

const trim = ({ value }: { value: unknown }): unknown => (typeof value === 'string' ? value.trim() : value);
const upper = ({ value }: { value: unknown }): unknown => (typeof value === 'string' ? value.trim().toUpperCase() : value);
const toCsv = ({ value }: { value: unknown }): unknown => {
  if (value === undefined || value === null || value === '') return undefined;
  return (Array.isArray(value) ? value : [value]).flatMap((v) => String(v).split(',')).map((s) => s.trim()).filter(Boolean);
};

class Page {
  @ApiPropertyOptional({ default: 1, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}

// ─── Advertisers ─────────────────────────────────────────────────────────────

export class CreateAdvertiserDto {
  @ApiProperty({ example: 'Nike' }) @Transform(trim) @IsString() @MinLength(1) @MaxLength(200) name!: string;
  @ApiPropertyOptional({ format: 'uuid', nullable: true }) @IsOptional() @IsUUID() logoMediaId?: string | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(500) website?: string | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() @MaxLength(200) contactName?: string | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsEmail() @MaxLength(255) contactEmail?: string | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsEmail() @MaxLength(255) billingEmail?: string | null;
  @ApiPropertyOptional({ example: 'USD' }) @IsOptional() @Transform(upper) @Matches(/^[A-Z]{3}$/) currency?: string;
  @ApiPropertyOptional({ enum: ADVERTISER_STATUSES }) @IsOptional() @IsIn(ADVERTISER_STATUSES) status?: (typeof ADVERTISER_STATUSES)[number];
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() @MaxLength(2000) notes?: string | null;
}

export class UpdateAdvertiserDto {
  @ApiPropertyOptional() @IsOptional() @Transform(trim) @IsString() @MinLength(1) @MaxLength(200) name?: string;
  @ApiPropertyOptional({ format: 'uuid', nullable: true }) @IsOptional() @IsUUID() logoMediaId?: string | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsUrl({ require_protocol: true }) @MaxLength(500) website?: string | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() @MaxLength(200) contactName?: string | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsEmail() @MaxLength(255) contactEmail?: string | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsEmail() @MaxLength(255) billingEmail?: string | null;
  @ApiPropertyOptional() @IsOptional() @Transform(upper) @Matches(/^[A-Z]{3}$/) currency?: string;
  @ApiPropertyOptional({ enum: ADVERTISER_STATUSES }) @IsOptional() @IsIn(ADVERTISER_STATUSES) status?: (typeof ADVERTISER_STATUSES)[number];
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() @MaxLength(2000) notes?: string | null;
}

export class AdvertiserQueryDto extends Page {
  @ApiPropertyOptional({ description: 'Search name / contact' }) @IsOptional() @IsString() @MaxLength(200) q?: string;
  @ApiPropertyOptional({ enum: ADVERTISER_STATUSES }) @IsOptional() @IsIn(ADVERTISER_STATUSES) status?: string;
}

export class LedgerTotalsDto {
  @ApiProperty() bookedCents!: number;
  @ApiProperty() accruedCents!: number;
  @ApiProperty() invoicedCents!: number;
  @ApiProperty() paidCents!: number;
  @ApiProperty() creditCents!: number;
  @ApiProperty({ description: 'booked + accrued − credit' }) revenueCents!: number;
  @ApiProperty({ description: 'Outstanding receivable: booked + accrued − paid − credit' }) balanceCents!: number;
}

export class AdvertiserDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) logoMediaId!: string | null;
  @ApiPropertyOptional({ nullable: true }) logoUrl!: string | null;
  @ApiPropertyOptional({ nullable: true }) website!: string | null;
  @ApiPropertyOptional({ nullable: true }) contactName!: string | null;
  @ApiPropertyOptional({ nullable: true }) contactEmail!: string | null;
  @ApiPropertyOptional({ nullable: true }) billingEmail!: string | null;
  @ApiProperty() currency!: string;
  @ApiProperty({ enum: ADVERTISER_STATUSES }) status!: string;
  @ApiPropertyOptional({ nullable: true }) notes!: string | null;
  @ApiPropertyOptional() campaigns?: number;
  @ApiPropertyOptional() activeCampaigns?: number;
  @ApiPropertyOptional({ type: LedgerTotalsDto }) totals?: LedgerTotalsDto;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

// ─── Campaigns ───────────────────────────────────────────────────────────────

class CampaignFields {
  @ApiPropertyOptional({ example: '2026-10-01T00:00:00Z', nullable: true }) @IsOptional() @IsISO8601() startsAt?: string | null;
  @ApiPropertyOptional({ example: '2026-10-31T00:00:00Z', nullable: true }) @IsOptional() @IsISO8601() endsAt?: string | null;
  @ApiPropertyOptional({ enum: REGIONS, isArray: true, description: 'Empty = everywhere' })
  @IsOptional() @IsArray() @ArrayUnique() @IsIn(REGIONS, { each: true }) regions?: string[];
  @ApiPropertyOptional({ format: 'uuid', nullable: true, description: 'Commercial creative video (ready media)' })
  @IsOptional() @IsUUID() creativeMediaId?: string | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) @MaxLength(1000) clickUrl?: string | null;
  @ApiPropertyOptional({ nullable: true, example: 'Shop now' }) @IsOptional() @IsString() @MaxLength(40) ctaLabel?: string | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsInt() @Min(1) @Max(600) durationSeconds?: number | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsInt() @Min(0) @Max(600) skippableAfterSeconds?: number | null;
  @ApiPropertyOptional({ default: 5, description: '1 commercial every N organic feed items' }) @IsOptional() @IsInt() @Min(1) @Max(100) feedFrequency?: number;
  @ApiPropertyOptional({ default: 1, description: 'Rotation share among live commercials' }) @IsOptional() @IsInt() @Min(1) @Max(10) weight?: number;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsInt() @Min(1) @Max(1000) frequencyCapPerUserDay?: number | null;
  @ApiPropertyOptional({ enum: PRICING_MODELS, default: 'flat' }) @IsOptional() @IsIn(PRICING_MODELS) pricingModel?: (typeof PRICING_MODELS)[number];
  @ApiPropertyOptional({ description: 'Flat fee (cents) — booked to the ledger on activation' }) @IsOptional() @IsInt() @Min(0) flatFeeCents?: number;
  @ApiPropertyOptional({ description: 'Price per 1000 impressions (cents)' }) @IsOptional() @IsInt() @Min(0) cpmCents?: number;
  @ApiPropertyOptional({ description: 'Price per click (cents)' }) @IsOptional() @IsInt() @Min(0) cpcCents?: number;
  @ApiPropertyOptional({ nullable: true, description: 'Stop serving when delivered value reaches this (cents)' }) @IsOptional() @IsInt() @Min(0) budgetCents?: number | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsInt() @Min(0) dailyBudgetCents?: number | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsInt() @Min(1) impressionGoal?: number | null;
  @ApiPropertyOptional({ example: 'USD' }) @IsOptional() @Transform(upper) @Matches(/^[A-Z]{3}$/) currency?: string;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() @MaxLength(2000) notes?: string | null;
}

export class CreateCampaignDto extends CampaignFields {
  @ApiPropertyOptional({ format: 'uuid', description: 'Existing advertiser (or send advertiserName)' })
  @ValidateIf((o: CreateCampaignDto) => !o.advertiserName) @IsUUID() advertiserId?: string;
  @ApiPropertyOptional({ description: 'Find-or-create advertiser by name' })
  @ValidateIf((o: CreateCampaignDto) => !o.advertiserId) @Transform(trim) @IsString() @MinLength(1) @MaxLength(200) advertiserName?: string;
  @ApiProperty() @Transform(trim) @IsString() @MinLength(2) @MaxLength(200) name!: string;
  @ApiProperty({ enum: CAMPAIGN_TYPES }) @IsIn(CAMPAIGN_TYPES) type!: (typeof CAMPAIGN_TYPES)[number];
}

export class UpdateCampaignDto extends CampaignFields {
  @ApiPropertyOptional() @IsOptional() @Transform(trim) @IsString() @MinLength(2) @MaxLength(200) name?: string;
}

export class CampaignQueryDto extends Page {
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() advertiserId?: string;
  @ApiPropertyOptional({ enum: CAMPAIGN_TYPES }) @IsOptional() @IsIn(CAMPAIGN_TYPES) type?: string;
  @ApiPropertyOptional({ description: `CSV of ${CAMPAIGN_STATUSES.join(', ')}` })
  @IsOptional() @Transform(toCsv) @IsIn(CAMPAIGN_STATUSES, { each: true }) status?: string[];
  @ApiPropertyOptional({ enum: REGIONS }) @IsOptional() @IsIn(REGIONS) region?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) q?: string;
  @ApiPropertyOptional({ description: 'Flights overlapping [from, to]' }) @IsOptional() @IsISO8601() from?: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() to?: string;
}

export class AttachContentsDto {
  @ApiProperty({ type: [String], format: 'uuid', description: 'Full set — videos whose active sponsorship joins this campaign' })
  @IsArray() @ArrayMaxSize(200) @ArrayUnique() @IsUUID('all', { each: true }) contentIds!: string[];
}

export class CampaignEndDto {
  @ApiPropertyOptional({ maxLength: 30, example: 'manual' }) @IsOptional() @IsString() @MaxLength(30) reason?: string;
}

export class DeliveryDto {
  @ApiProperty() impressions!: number;
  @ApiProperty() uniqueViewers!: number;
  @ApiProperty() clicks!: number;
  @ApiProperty() skips!: number;
  @ApiProperty() completes!: number;
  @ApiProperty({ description: 'CPM/CPC value delivered (cents)' }) deliveredCents!: number;
  @ApiProperty() ctr!: number;
  @ApiProperty() completionRate!: number;
}

export class CampaignDto {
  @ApiProperty() id!: string;
  @ApiProperty() advertiserId!: string;
  @ApiPropertyOptional() advertiserName?: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: CAMPAIGN_TYPES }) type!: string;
  @ApiProperty({ enum: CAMPAIGN_STATUSES }) status!: string;
  @ApiPropertyOptional({ nullable: true }) startsAt!: string | null;
  @ApiPropertyOptional({ nullable: true }) endsAt!: string | null;
  @ApiProperty({ type: [String] }) regions!: string[];
  @ApiPropertyOptional({ nullable: true }) creativeMediaId!: string | null;
  @ApiPropertyOptional({ nullable: true }) clickUrl!: string | null;
  @ApiPropertyOptional({ nullable: true }) ctaLabel!: string | null;
  @ApiPropertyOptional({ nullable: true }) durationSeconds!: number | null;
  @ApiPropertyOptional({ nullable: true }) skippableAfterSeconds!: number | null;
  @ApiProperty() feedFrequency!: number;
  @ApiProperty() weight!: number;
  @ApiPropertyOptional({ nullable: true }) frequencyCapPerUserDay!: number | null;
  @ApiProperty({ enum: PRICING_MODELS }) pricingModel!: string;
  @ApiProperty() flatFeeCents!: number;
  @ApiProperty() cpmCents!: number;
  @ApiProperty() cpcCents!: number;
  @ApiPropertyOptional({ nullable: true }) budgetCents!: number | null;
  @ApiPropertyOptional({ nullable: true }) dailyBudgetCents!: number | null;
  @ApiPropertyOptional({ nullable: true }) impressionGoal!: number | null;
  @ApiProperty() currency!: string;
  @ApiPropertyOptional({ nullable: true, description: 'ends_at | budget | impression_goal | manual' }) endedReason!: string | null;
  @ApiPropertyOptional({ nullable: true }) notes!: string | null;
  @ApiPropertyOptional() linkedContents?: number;
  @ApiPropertyOptional({ type: DeliveryDto }) delivery?: DeliveryDto;
  @ApiPropertyOptional({ description: 'Delivered ÷ budget (0..1), null without budget', nullable: true }) budgetUsed?: number | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}

// ─── Ledger ──────────────────────────────────────────────────────────────────

export class CreateLedgerEntryDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() advertiserId!: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() campaignId?: string;
  @ApiProperty({ enum: MANUAL_LEDGER_KINDS, description: '`accrued` is written by the nightly job only' })
  @IsIn(MANUAL_LEDGER_KINDS) kind!: (typeof MANUAL_LEDGER_KINDS)[number];
  @ApiProperty({ minimum: 0 }) @IsInt() @Min(0) amountCents!: number;
  @ApiPropertyOptional({ example: 'USD', description: "Defaults to the advertiser's currency" }) @IsOptional() @Transform(upper) @Matches(/^[A-Z]{3}$/) currency?: string;
  @ApiPropertyOptional({ example: '2026-09-25' }) @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) entryDate?: string;
  @ApiPropertyOptional({ description: 'Required for invoiced' })
  @ValidateIf((o: CreateLedgerEntryDto) => o.kind === 'invoiced' || o.invoiceNumber !== undefined)
  @IsString() @MinLength(1) @MaxLength(60) invoiceNumber?: string;
  @ApiPropertyOptional({ example: '2026-10-25' }) @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) dueDate?: string;
  @ApiPropertyOptional({ description: 'Payment reference / PO' }) @IsOptional() @IsString() @MaxLength(200) reference?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) note?: string;
}

export class LedgerQueryDto extends Page {
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() advertiserId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() campaignId?: string;
  @ApiPropertyOptional({ description: `CSV of ${LEDGER_KINDS.join(', ')}` }) @IsOptional() @Transform(toCsv) @IsIn(LEDGER_KINDS, { each: true }) kind?: string[];
  @ApiPropertyOptional({ example: '2026-09-01' }) @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) from?: string;
  @ApiPropertyOptional({ example: '2026-09-30' }) @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) to?: string;
}

export class StatementQueryDto {
  @ApiPropertyOptional({ example: '2026-09-01' }) @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) from?: string;
  @ApiPropertyOptional({ example: '2026-09-30' }) @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) to?: string;
}

export class LedgerEntryDto {
  @ApiProperty() id!: string;
  @ApiProperty() advertiserId!: string;
  @ApiPropertyOptional({ nullable: true }) advertiserName!: string | null;
  @ApiPropertyOptional({ nullable: true }) campaignId!: string | null;
  @ApiPropertyOptional({ nullable: true }) campaignName!: string | null;
  @ApiProperty({ enum: LEDGER_KINDS }) kind!: string;
  @ApiProperty() amountCents!: number;
  @ApiProperty() currency!: string;
  @ApiProperty() entryDate!: string;
  @ApiPropertyOptional({ nullable: true }) invoiceNumber!: string | null;
  @ApiPropertyOptional({ nullable: true }) dueDate!: string | null;
  @ApiPropertyOptional({ nullable: true }) reference!: string | null;
  @ApiPropertyOptional({ nullable: true }) note!: string | null;
  @ApiPropertyOptional({ nullable: true }) createdBy!: string | null;
  @ApiProperty() createdAt!: string;
}

// ─── Home / inventory ────────────────────────────────────────────────────────

export class AdWindowRegionQueryDto {
  @ApiPropertyOptional({ description: 'Window start (ISO); default 30 days before `to`' }) @IsOptional() @IsISO8601() from?: string;
  @ApiPropertyOptional({ description: 'Window end (ISO, exclusive); default now' }) @IsOptional() @IsISO8601() to?: string;
  @ApiPropertyOptional({ enum: REGIONS }) @IsOptional() @IsIn(REGIONS) region?: string;
}

export class InventoryQueryDto extends AdWindowRegionQueryDto {
  @ApiPropertyOptional({ default: 10, maximum: 50 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) top?: number;
}

// ─── Customer commercial serving ─────────────────────────────────────────────

export class CommercialAdvertiserDto {
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ nullable: true }) logoUrl!: string | null;
}

export class CommercialServeDto {
  @ApiProperty() campaignId!: string;
  @ApiProperty({ description: 'true → client should skip this slot (see skipReason)' }) skip!: boolean;
  @ApiPropertyOptional({ enum: ['ad_free', 'frequency_cap', 'not_live'], nullable: true }) skipReason!: string | null;
  @ApiPropertyOptional({ type: CommercialAdvertiserDto, nullable: true }) advertiser!: CommercialAdvertiserDto | null;
  @ApiPropertyOptional({ type: PlaybackDto, nullable: true }) creative!: PlaybackDto | null;
  @ApiPropertyOptional({ nullable: true }) clickUrl!: string | null;
  @ApiPropertyOptional({ nullable: true }) ctaLabel!: string | null;
  @ApiPropertyOptional({ nullable: true }) durationSeconds!: number | null;
  @ApiPropertyOptional({ nullable: true }) skippableAfterSeconds!: number | null;
}
