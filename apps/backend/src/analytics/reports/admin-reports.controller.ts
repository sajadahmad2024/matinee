import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, Get, Query, StreamableFile } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { ReportCatalogDto, ReportDto, ReportExportQueryDto } from '../dto/report.dto';
import { ReportsService } from './reports.service';

/** Report builder — metric catalog + CSV/JSON export for a range and region. */
@ApiTags('Admin · Analytics')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.ANALYTICS}/reports`, version: '1' })
export class AdminReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('catalog')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Report-builder metric catalog (groups, presets, ranges)' })
  @ApiEnvelope(ReportCatalogDto)
  catalog() {
    return this.reports.catalog();
  }

  @Get('export')
  @Permissions('users:read')
  @ApiProduces('application/json', 'text/csv')
  @ApiOperation({ summary: 'Generate a report — format=json (enveloped rows) or format=csv (attachment)' })
  @ApiEnvelope(ReportDto)
  async export(@Query() q: ReportExportQueryDto): Promise<ReportDto | StreamableFile> {
    const report = await this.reports.build(q);
    if (q.format !== 'csv') {
      return report;
    }
    const name = `${report.report.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${report.region}-${report.range}.csv`;
    return new StreamableFile(Buffer.from(this.reports.toCsv(report), 'utf8'), {
      type: 'text/csv; charset=utf-8',
      disposition: `attachment; filename="${name}"`,
    });
  }
}
