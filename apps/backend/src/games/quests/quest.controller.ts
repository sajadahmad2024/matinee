import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { QuestService } from './quest.service';
import { ActiveQuestDto, QuestClaimResultDto, QuestCustomerDetailDto, QuestParticipationDto } from './dto/quest.dto';

/** Customer quests — watch a set of videos before the deadline to earn. */
@ApiTags('Games · Quests')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: RouteNames.QUESTS, version: '1' })
export class QuestController {
  constructor(private readonly quests: QuestService) {}

  @Get()
  @ApiOperation({ summary: 'Active quests with my progress' })
  @ApiEnvelope(ActiveQuestDto, { isArray: true })
  active(@CurrentUser('id') userId: string) {
    return this.quests.listActive(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Quest detail — contents + my per-content progress' })
  @ApiEnvelope(QuestCustomerDetailDto)
  detail(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.quests.detail(userId, id);
  }

  @Post(':id/contents/:contentId/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a quest content completed (records progress)' })
  @ApiEnvelope(QuestParticipationDto)
  complete(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
  ) {
    return this.quests.completeContent(userId, id, contentId);
  }

  @Post(':id/claim')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Claim the quest reward (once completed; idempotent)' })
  @ApiEnvelope(QuestClaimResultDto)
  claim(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.quests.claim(userId, id);
  }
}
