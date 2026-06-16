import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsISO8601, IsObject, IsOptional, IsString, MaxLength, Min } from 'class-validator';

const TARGETS = ['all', 'segment', 'selected'];
const CATEGORIES = ['new_content', 'game_update', 'reward', 'social', 'subscription', 'system', 'general'];

export class CreateCampaignDto {
  @ApiProperty({ maxLength: 150 }) @IsString() @MaxLength(150) title!: string;
  @ApiProperty({ maxLength: 500 }) @IsString() @MaxLength(500) message!: string;
  @ApiPropertyOptional({ maxLength: 300, description: 'In-app deep link' }) @IsOptional() @IsString() @MaxLength(300) deepLink?: string;
  @ApiPropertyOptional({ enum: CATEGORIES, default: 'general' }) @IsOptional() @IsIn(CATEGORIES) category?: string;
  @ApiProperty({ enum: TARGETS, description: 'all customers / a segment / selected users' }) @IsIn(TARGETS) targetType!: 'all' | 'segment' | 'selected';
  @ApiPropertyOptional({ type: 'object', additionalProperties: true, description: 'segment: {region}; selected: {userIds:[]}' }) @IsOptional() @IsObject() targetFilter?: Record<string, unknown>;
  @ApiPropertyOptional({ description: 'Schedule for later (ISO); omit to keep as draft / send now' }) @IsOptional() @IsISO8601() scheduledAt?: string;
}

export class CampaignsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 20, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit = 20;
  @ApiPropertyOptional({ enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'canceled'] }) @IsOptional() @IsIn(['draft', 'scheduled', 'sending', 'sent', 'failed', 'canceled']) status?: string;
}

// ─── Responses ───────────────────────────────────────────────────────────────
/** A notification campaign record. */
export class CampaignDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() message!: string;
  @ApiPropertyOptional({ nullable: true, description: 'In-app deep link' }) deepLink!: string | null;
  @ApiProperty({ enum: TARGETS }) targetType!: string;
  @ApiPropertyOptional({ type: 'object', additionalProperties: true, nullable: true, description: 'Audience filter (segment/selected)' }) targetFilter!: unknown;
  @ApiProperty({ enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'canceled'] }) status!: string;
  @ApiPropertyOptional({ nullable: true, description: 'When the campaign is scheduled to send (ISO)' }) scheduledAt!: string | null;
  @ApiPropertyOptional({ nullable: true, description: 'When the campaign was sent (ISO)' }) sentAt!: string | null;
  @ApiProperty({ description: 'Resolved audience size' }) recipientCount!: number;
  @ApiProperty() createdAt!: string;
}

/** Result of sending / cancelling a campaign. */
export class CampaignActionResultDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: ['sending', 'canceled'], example: 'sending' }) status!: string;
}
