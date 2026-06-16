import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { LedgerService } from '../ledger/ledger.service';
import { AdjustPointsDto, AdjustResultDto } from './dto/adjust-points.dto';

/** Admin manual points/xp adjustment (support / compensation), written to the ledger as 'admin'. */
@ApiTags('Admin · Tokenomics')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.USERS}`, version: '1' })
export class AdminLedgerController {
  constructor(private readonly ledger: LedgerService) {}

  @Post(':id/points-adjust')
  @HttpCode(HttpStatus.OK)
  @Permissions('rewards:write')
  @ApiOperation({ summary: "Grant or deduct a customer's points/xp (audited)" })
  @ApiEnvelope(AdjustResultDto)
  adjust(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AdjustPointsDto) {
    return this.ledger.adjust(id, dto.currency, dto.amount, adminId, dto.reason);
  }
}
