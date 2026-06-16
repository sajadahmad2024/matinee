import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { SubscriptionService } from './subscription.service';
import {
  CancelSubscriptionDto,
  InvoiceDto,
  InvoicesQueryDto,
  SubscribeDto,
  SubscriptionActionResultDto,
  SubscriptionDto,
  SubscriptionOverviewDto,
} from './dto/subscription.dto';

/** Customer subscription lifecycle (provider-agnostic — manual/stripe/iap behind the adapter). */
@ApiTags('Subscriptions')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: RouteNames.SUBSCRIPTIONS, version: '1' })
export class SubscriptionController {
  constructor(private readonly subscriptions: SubscriptionService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Subscribe to a plan (via the configured payment provider)' })
  @ApiEnvelope(SubscriptionDto)
  subscribe(@CurrentUser('id') userId: string, @Body() dto: SubscribeDto) {
    return this.subscriptions.subscribe(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'My current subscription' })
  @ApiEnvelope(SubscriptionDto)
  me(@CurrentUser('id') userId: string) {
    return this.subscriptions.mySubscription(userId);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Subscription center — current plan + all plans with per-plan action (subscribe/upgrade/downgrade/current)' })
  @ApiEnvelope(SubscriptionOverviewDto)
  overview(@CurrentUser('id') userId: string) {
    return this.subscriptions.overview(userId);
  }

  @Post('change-plan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upgrade / downgrade to another plan' })
  @ApiEnvelope(SubscriptionDto)
  changePlan(@CurrentUser('id') userId: string, @Body() dto: SubscribeDto) {
    return this.subscriptions.changePlan(userId, dto.planId);
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel my subscription' })
  @ApiEnvelope(SubscriptionActionResultDto)
  cancel(@CurrentUser('id') userId: string, @Body() dto: CancelSubscriptionDto) {
    return this.subscriptions.cancel(userId, dto.reason);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'My billing history' })
  @ApiPaginatedEnvelope(InvoiceDto)
  invoices(@CurrentUser('id') userId: string, @Query() query: InvoicesQueryDto) {
    return this.subscriptions.myInvoices(userId, query.page, query.limit);
  }
}
