import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { EarningService } from './earning.service';
import { DailyLoginResultDto } from './dto/earning.dto';

/** Customer earning actions (direct claims; event-driven earns happen server-side). */
@ApiTags('Earn')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: RouteNames.EARN, version: '1' })
export class EarningController {
  constructor(private readonly earning: EarningService) {}

  @Post('daily-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Claim the daily-login bonus (once per day, idempotent)' })
  @ApiEnvelope(DailyLoginResultDto)
  dailyLogin(@CurrentUser('id') userId: string) {
    return this.earning.claimDailyLogin(userId);
  }
}
