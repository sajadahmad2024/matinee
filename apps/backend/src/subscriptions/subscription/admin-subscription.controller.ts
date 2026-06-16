import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { SubscriptionService } from './subscription.service';
import {
  CancelSubscriptionDto,
  InvoiceDto,
  SubscribersQueryDto,
  SubscriptionActionResultDto,
  SubscriptionDetailDto,
  SubscriptionDto,
} from './dto/subscription.dto';

/** Admin subscriber management + billing actions. */
@ApiTags('Admin · Subscriptions')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.SUBSCRIPTIONS}`, version: '1' })
export class AdminSubscriptionController {
  constructor(private readonly subscriptions: SubscriptionService) {}

  @Get('subscribers')
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'List subscriptions (filter by status)' })
  @ApiPaginatedEnvelope(SubscriptionDto)
  list(@Query() query: SubscribersQueryDto) {
    return this.subscriptions.adminList(query.page, query.limit, query.status);
  }

  @Get('subscribers/:id')
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'Subscription detail + billing history' })
  @ApiEnvelope(SubscriptionDetailDto)
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.subscriptions.adminGet(id);
  }

  @Get('transactions')
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'Transaction ledger — all invoices across users (filter by status)' })
  @ApiPaginatedEnvelope(InvoiceDto)
  transactions(@Query() query: SubscribersQueryDto) {
    return this.subscriptions.adminTransactions(query.page, query.limit, query.status);
  }

  @Post('subscribers/:id/cancel')
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiEnvelope(SubscriptionActionResultDto)
  cancel(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CancelSubscriptionDto) {
    return this.subscriptions.adminCancel(id, dto.reason);
  }

  @Post('invoices/:id/refund')
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Refund a paid invoice (via the payment provider)' })
  @ApiEnvelope(SubscriptionActionResultDto)
  refund(@Param('id', ParseUUIDPipe) id: string) {
    return this.subscriptions.refundInvoice(id);
  }
}
