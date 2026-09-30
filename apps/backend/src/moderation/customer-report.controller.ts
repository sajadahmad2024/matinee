import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CustomerOnly } from '../auth/decorators/account-type.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CustomerReportDto, ReportReceivedDto } from './dto/moderation.dto';
import { ReportingService } from './reporting.service';

/** Report throttle: 10 / minute, 50 / 30 minutes per route per client. */
const REPORT_THROTTLE = { short: { limit: 10, ttl: 60_000 }, long: { limit: 50, ttl: 30 * 60_000 } };

/** Customer: flag a video for moderation. */
@ApiTags('Moderation · Reports')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: RouteNames.CONTENT, version: '1' })
export class ContentReportController {
  constructor(private readonly reporting: ReportingService) {}

  @Post(':id/report')
  @Throttle(REPORT_THROTTLE)
  @ApiOperation({ summary: 'Report a video (one open report per video per user)' })
  @ApiEnvelope(ReportReceivedDto, { status: 201 })
  report(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: CustomerReportDto) {
    return this.reporting.reportContent(userId, id, dto.reason, dto.note);
  }
}

/** Customer: report another user for moderation. */
@ApiTags('Moderation · Reports')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: RouteNames.USERS, version: '1' })
export class UserReportController {
  constructor(private readonly reporting: ReportingService) {}

  @Post(':id/report')
  @Throttle(REPORT_THROTTLE)
  @ApiOperation({ summary: 'Report a user (one open report per user per reporter; not yourself)' })
  @ApiEnvelope(ReportReceivedDto, { status: 201 })
  report(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: CustomerReportDto) {
    return this.reporting.reportUser(userId, id, dto.reason, dto.note);
  }
}
