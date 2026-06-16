import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardQueryDto, LeaderboardResponseDto } from './dto/leaderboard.dto';

/** Admin leaderboard view (any month). */
@ApiTags('Admin · Tokenomics')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.LEADERBOARD}`, version: '1' })
export class AdminLeaderboardController {
  constructor(private readonly leaderboard: LeaderboardService) {}

  @Get()
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'Monthly XP leaderboard for any period' })
  @ApiEnvelope(LeaderboardResponseDto)
  get(@Query() query: LeaderboardQueryDto) {
    return this.leaderboard.getForAdmin(query);
  }
}
