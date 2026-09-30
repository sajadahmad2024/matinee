import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CustomerOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { StreakService } from './streak.service';
import { StreakActivityItemDto, StreakActivityQueryDto, StreakCheckInResultDto, StreakStatusDto } from './dto/streak.dto';

/** Watch-based daily streak — watch the level's minutes each day (🔥). */
@ApiTags('Games · Daily Streak')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: `${RouteNames.GAMES}/streak`, version: '1' })
export class StreakController {
  constructor(private readonly streak: StreakService) {}

  @Get()
  @ApiOperation({ summary: "My streak: level track, today's session, calendar, badges" })
  @ApiQuery({ name: 'month', required: false, example: '2026-06', description: 'Calendar month (YYYY-MM); defaults to current' })
  @ApiEnvelope(StreakStatusDto)
  status(@CurrentUser('id') userId: string, @Query('month') month?: string) {
    return this.streak.getStatus(userId, month);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Activity log — qualified days (newest first)' })
  @ApiPaginatedEnvelope(StreakActivityItemDto)
  activity(@CurrentUser('id') userId: string, @Query() q: StreakActivityQueryDto) {
    return this.streak.activity(userId, q.page, q.limit);
  }

  @Post('check-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Evaluate today's watch time (qualifies automatically on heartbeats too)" })
  @ApiEnvelope(StreakCheckInResultDto)
  checkIn(@CurrentUser('id') userId: string) {
    return this.streak.checkIn(userId);
  }
}
