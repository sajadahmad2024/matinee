import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsISO8601, IsOptional, IsString, Matches } from 'class-validator';
import { REGION_PATTERN } from './dashboard.dto';
import { REPORT_METRICS, REPORT_PRESETS, REPORT_RANGES } from '../reports/report-catalog';

const splitList = ({ value }: { value: unknown }): unknown => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parts = (Array.isArray(value) ? value : [value]).flatMap((v) => String(v).split(','));
  return [...new Set(parts.map((p) => p.trim()).filter((p) => p.length > 0))];
};

export class ReportExportQueryDto {
  @ApiPropertyOptional({ description: 'Comma-separated metric keys (see /reports/catalog). Defaults to the preset.', example: 'total_users,mrr,retention' })
  @IsOptional()
  @Transform(splitList)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(REPORT_METRICS.size)
  @IsIn([...REPORT_METRICS.keys()], { each: true })
  metrics?: string[];

  @ApiPropertyOptional({ enum: Object.keys(REPORT_PRESETS), default: 'custom', description: 'Stakeholder preset (used when metrics is omitted; names the report)' })
  @IsOptional()
  @IsIn(Object.keys(REPORT_PRESETS))
  preset?: string;

  @ApiPropertyOptional({ enum: REPORT_RANGES, default: '30d', description: "'custom' uses from/to" })
  @IsOptional()
  @IsIn(REPORT_RANGES)
  range?: (typeof REPORT_RANGES)[number];

  @ApiPropertyOptional({ description: 'Custom window start (ISO)' }) @IsOptional() @IsISO8601() from?: string;
  @ApiPropertyOptional({ description: 'Custom window end, exclusive (ISO)' }) @IsOptional() @IsISO8601() to?: string;

  @ApiPropertyOptional({ description: 'global | macro-region | ISO country', default: 'global' })
  @IsOptional()
  @IsString()
  @Matches(REGION_PATTERN)
  region?: string;

  @ApiPropertyOptional({ enum: ['csv', 'json'], default: 'json' })
  @IsOptional()
  @IsIn(['csv', 'json'])
  format?: 'csv' | 'json';
}

export class ReportMetricDefDto {
  @ApiProperty() key!: string;
  @ApiProperty() label!: string;
  @ApiProperty() unit!: string;
  @ApiProperty() description!: string;
}
export class ReportGroupDto {
  @ApiProperty() group!: string;
  @ApiProperty({ type: [ReportMetricDefDto] }) metrics!: ReportMetricDefDto[];
}
export class ReportPresetDto {
  @ApiProperty() key!: string;
  @ApiProperty() label!: string;
  @ApiProperty({ type: [String] }) metrics!: string[];
}
export class ReportCatalogDto {
  @ApiProperty({ type: [ReportGroupDto] }) groups!: ReportGroupDto[];
  @ApiProperty({ type: [ReportPresetDto] }) presets!: ReportPresetDto[];
  @ApiProperty({ type: [String] }) ranges!: string[];
}
export class ReportRowDto {
  @ApiProperty() group!: string;
  @ApiProperty() key!: string;
  @ApiProperty() label!: string;
  @ApiProperty() value!: number;
  @ApiProperty() unit!: string;
}
export class ReportDto {
  @ApiProperty() report!: string;
  @ApiProperty() generatedAt!: string;
  @ApiProperty() range!: string;
  @ApiProperty() from!: string;
  @ApiProperty() to!: string;
  @ApiProperty() region!: string;
  @ApiProperty({ type: [ReportRowDto] }) rows!: ReportRowDto[];
}
