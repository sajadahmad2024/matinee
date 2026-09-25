import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { ContentStatsQueryDto } from '../catalog/dto/content-query.dto';
import { ContentInsightsService } from './content-insights.service';
import { ContentStatsDto, LicenseAgreementDto, LicenseListQueryDto, LicenseSummaryDto } from './dto/content-insights.dto';

/**
 * Admin content list-page aggregates. Registered BEFORE AdminContentController so the static
 * segments (`stats`, `licenses`) win over `:id`.
 */
@ApiTags('Admin · Content')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/content`, version: '1' })
export class AdminContentInsightsController {
  constructor(private readonly insights: ContentInsightsService) {}

  @Get('stats')
  @Permissions('content:read')
  @ApiOperation({ summary: 'Tab counts, summary cards and inventory tiles (optionally region-scoped)' })
  @ApiEnvelope(ContentStatsDto)
  stats(@Query() q: ContentStatsQueryDto) {
    return this.insights.stats(q.region);
  }

  @Get('licenses')
  @Permissions('content:read')
  @ApiOperation({ summary: 'Licence agreements (search, expiry window, renewal status, sort)' })
  @ApiPaginatedEnvelope(LicenseAgreementDto)
  licenses(@Query() q: LicenseListQueryDto) {
    return this.insights.licenses(q);
  }

  @Get('licenses/summary')
  @Permissions('content:read')
  @ApiOperation({ summary: 'Licensing & rights rollup (counts, cost, cost per stream, expiry windows, 6-month trend)' })
  @ApiEnvelope(LicenseSummaryDto)
  licenseSummary() {
    return this.insights.licenseSummary();
  }
}
