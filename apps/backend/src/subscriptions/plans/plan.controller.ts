import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOrGuest } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PlanService } from './plan.service';
import { CustomerPlanDto } from './dto/plan.dto';

/** Customer subscription plans (priced for the caller's region). */
@ApiTags('Subscriptions')
@ApiBearerAuth()
@CustomerOrGuest()
@Controller({ path: RouteNames.SUBSCRIPTIONS, version: '1' })
export class PlanController {
  constructor(private readonly plans: PlanService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Available plans with region-resolved pricing' })
  @ApiEnvelope(CustomerPlanDto, { isArray: true })
  list(@CurrentUser('id') userId: string) {
    return this.plans.listForCustomer(userId);
  }
}
