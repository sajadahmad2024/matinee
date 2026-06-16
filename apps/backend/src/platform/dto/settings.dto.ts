import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class SetFeatureFlagDto {
  @ApiProperty({ example: 'games_enabled', description: 'Flag key (feature. prefix added if absent)' })
  @IsString()
  @MaxLength(80)
  key!: string;

  @ApiProperty({ example: true, description: 'Flag value (usually boolean)' })
  value!: unknown;
}

export class AppVersionDto {
  @ApiPropertyOptional({ example: '2.4.0' }) @IsOptional() @IsString() @MaxLength(20) iosMinVersion?: string;
  @ApiPropertyOptional({ example: '2.4.0' }) @IsOptional() @IsString() @MaxLength(20) androidMinVersion?: string;
  @ApiPropertyOptional({ description: 'Force update below the min version' }) @IsOptional() @IsBoolean() forceUpdate?: boolean;
  @ApiPropertyOptional({ description: 'Critical maintenance mode' }) @IsOptional() @IsBoolean() criticalMode?: boolean;
}

/**
 * Feature flags as a flat key→value map (dynamic keys, values usually boolean).
 * e.g. `{ "feature.games_enabled": true }`.
 */
export class FeatureFlagsDto {
  [key: string]: unknown;
}

/**
 * App-version gates as a flat key→value map (keys with the `app.` prefix stripped),
 * e.g. `{ "ios_min_version": "2.4.0", "force_update": true }`.
 */
export class AppVersionSettingsDto {
  [key: string]: unknown;
}
