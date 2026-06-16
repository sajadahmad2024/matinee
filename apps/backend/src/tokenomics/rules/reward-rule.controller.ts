import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOrGuest } from '../../auth/decorators/account-type.decorator';
import { RewardRuleService } from './reward-rule.service';
import { EarnRuleDto } from './dto/reward-rule.dto';

/** Customer-facing earning catalog — what actions earn points/xp. */
@ApiTags('Earn')
@ApiBearerAuth()
@CustomerOrGuest()
@Controller({ path: RouteNames.EARN, version: '1' })
export class RewardRuleController {
  constructor(private readonly rules: RewardRuleService) {}

  @Get('rules')
  @ApiOperation({ summary: 'Enabled earning rules (daily streak, quests, shares, referral, …)' })
  @ApiEnvelope(EarnRuleDto, { isArray: true })
  list() {
    return this.rules.listForCustomer();
  }
}
