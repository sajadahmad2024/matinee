import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AccessService } from './access.service';
import { EntitlementDto, UnlockResultDto } from './dto/access.dto';

/** Exclusive-content access: check lock state and unlock with points. */
@ApiTags('Content · Access')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: RouteNames.CONTENT, version: '1' })
export class AccessController {
  constructor(private readonly access: AccessService) {}

  @Get(':id/entitlement')
  @ApiOperation({ summary: 'Is this content locked for me, and at what points cost?' })
  @ApiEnvelope(EntitlementDto)
  entitlement(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.access.getEntitlement(userId, id);
  }

  @Post(':id/unlock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlock exclusive content by spending its points (idempotent)' })
  @ApiEnvelope(UnlockResultDto)
  unlock(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.access.unlock(userId, id);
  }
}
