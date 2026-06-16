import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ReactionService } from './reaction.service';
import { ReactionStateDto, SetReactionDto } from './dto/reaction.dto';

/** Like / dislike a content (one reaction per user; switching upserts). */
@ApiTags('Engagement · Reactions')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: RouteNames.CONTENT, version: '1' })
export class ReactionController {
  constructor(private readonly reactions: ReactionService) {}

  @Get(':id/reaction')
  @ApiOperation({ summary: 'My reaction + like/dislike counts for a content' })
  @ApiEnvelope(ReactionStateDto)
  get(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.reactions.get(userId, id);
  }

  @Put(':id/reaction')
  @ApiOperation({ summary: 'Set / switch my reaction (like or dislike)' })
  @ApiEnvelope(ReactionStateDto)
  set(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: SetReactionDto) {
    return this.reactions.set(userId, id, dto.reaction);
  }

  @Delete(':id/reaction')
  @ApiOperation({ summary: 'Remove my reaction' })
  @ApiEnvelope(ReactionStateDto)
  remove(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.reactions.remove(userId, id);
  }
}
