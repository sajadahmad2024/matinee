import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RedemptionService } from './redemption.service';
import { RedeemResultDto, RedemptionDto, RedemptionsQueryDto } from './dto/redemption.dto';

/** Customer redemptions: redeem a reward and view my redemption history. */
@ApiTags('Rewards Store')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: RouteNames.REWARDS, version: '1' })
export class RedemptionController {
  constructor(private readonly redemptions: RedemptionService) {}

  @Post('catalog/:itemId/redeem')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redeem a reward (spends points; checks stock / subscription / region)' })
  @ApiEnvelope(RedeemResultDto)
  redeem(@CurrentUser('id') userId: string, @Param('itemId', ParseUUIDPipe) itemId: string) {
    return this.redemptions.redeem(userId, itemId);
  }

  @Get('redemptions')
  @ApiOperation({ summary: 'My redemption history' })
  @ApiPaginatedEnvelope(RedemptionDto)
  mine(@CurrentUser('id') userId: string, @Query() query: RedemptionsQueryDto) {
    return this.redemptions.myRedemptions(userId, query.page, query.limit);
  }
}
