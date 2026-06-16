import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CustomerOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { StreakService } from './streak.service';
import { StreakCheckInResultDto, StreakStatusDto } from './dto/streak.dto';

/** Daily streak — earn for showing up every day (🔥). */
@ApiTags('Games · Daily Streak')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: `${RouteNames.GAMES}/streak`, version: '1' })
export class StreakController {
  constructor(private readonly streak: StreakService) {}

  @Get()
  @ApiOperation({ summary: 'My streak status + milestones + monthly calendar history' })
  @ApiQuery({ name: 'month', required: false, example: '2026-06', description: 'Calendar month (YYYY-MM); defaults to current' })
  @ApiEnvelope(StreakStatusDto)
  status(@CurrentUser('id') userId: string, @Query('month') month?: string) {
    return this.streak.getStatus(userId, month);
  }

  @Post('check-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Daily check-in — extend my streak and claim the day's reward" })
  @ApiEnvelope(StreakCheckInResultDto)
  checkIn(@CurrentUser('id') userId: string) {
    return this.streak.checkIn(userId);
  }
}
