import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOrGuest } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardQueryDto, LeaderboardResponseDto } from './dto/leaderboard.dto';

/** Monthly XP leaderboard — top ranks + the caller's position. */
@ApiTags('Leaderboard')
@ApiBearerAuth()
@CustomerOrGuest()
@Controller({ path: RouteNames.LEADERBOARD, version: '1' })
export class LeaderboardController {
  constructor(private readonly leaderboard: LeaderboardService) {}

  @Get()
  @ApiOperation({ summary: 'Monthly XP leaderboard (top ranks + my rank)' })
  @ApiEnvelope(LeaderboardResponseDto)
  get(@CurrentUser('id') userId: string, @Query() query: LeaderboardQueryDto) {
    return this.leaderboard.getForViewer(userId, query);
  }
}
