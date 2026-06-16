import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { RedemptionService } from './redemption.service';
import {
  CancelRedemptionResultDto,
  FulfillmentNoteDto,
  FulfillResultDto,
  RedemptionDto,
  RedemptionsQueryDto,
} from './dto/redemption.dto';

/** Admin redemption fulfillment queue. */
@ApiTags('Admin · Rewards Store')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.REWARDS}/redemptions`, version: '1' })
export class AdminRedemptionController {
  constructor(private readonly redemptions: RedemptionService) {}

  @Get()
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'List redemptions (filter by status)' })
  @ApiPaginatedEnvelope(RedemptionDto)
  list(@Query() query: RedemptionsQueryDto) {
    return this.redemptions.adminList(query.page, query.limit, query.status);
  }

  @Patch(':id/fulfill')
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Mark a redemption fulfilled' })
  @ApiEnvelope(FulfillResultDto)
  fulfill(@Param('id', ParseUUIDPipe) id: string, @Body() dto: FulfillmentNoteDto) {
    return this.redemptions.fulfill(id, dto.note);
  }

  @Patch(':id/cancel')
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Cancel + refund a redemption (returns points & restock)' })
  @ApiEnvelope(CancelRedemptionResultDto)
  cancel(@Param('id', ParseUUIDPipe) id: string, @Body() dto: FulfillmentNoteDto) {
    return this.redemptions.cancel(id, dto.note);
  }
}
