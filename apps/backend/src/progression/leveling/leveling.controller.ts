import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOrGuest } from '../../auth/decorators/account-type.decorator';
import { LevelingService } from './leveling.service';
import { LevelDefDto } from './dto/leveling.dto';

/** The XP→level curve (Level Requirements Table). */
@ApiTags('Leveling')
@ApiBearerAuth()
@CustomerOrGuest()
@Controller({ path: RouteNames.LEVELS, version: '1' })
export class LevelingController {
  constructor(private readonly leveling: LevelingService) {}

  @Get()
  @ApiOperation({ summary: 'Full level curve (level → XP to advance, cumulative XP)' })
  @ApiEnvelope(LevelDefDto, { isArray: true })
  curve() {
    return this.leveling.getCurve();
  }
}
