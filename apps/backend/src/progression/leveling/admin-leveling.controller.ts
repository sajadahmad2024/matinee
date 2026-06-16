import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { LevelingService } from './leveling.service';
import { LevelingConfigDto, UpdateLevelingDto } from './dto/leveling.dto';

/** Admin "Leveling Configuration" — tune the curve; saving regenerates the requirements table. */
@ApiTags('Admin · Tokenomics')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.LEVELING}`, version: '1' })
export class AdminLevelingController {
  constructor(private readonly leveling: LevelingService) {}

  @Get()
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'Current leveling config + the generated curve' })
  @ApiEnvelope(LevelingConfigDto)
  get() {
    return this.leveling.getConfig();
  }

  @Put()
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Update the curve config (versioned) and regenerate level_definitions' })
  @ApiEnvelope(LevelingConfigDto)
  update(@CurrentUser('id') adminId: string, @Body() dto: UpdateLevelingDto) {
    return this.leveling.updateConfig(dto, adminId);
  }
}
