import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { MessageResponseDto } from '@common/dto/message-response.dto';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PageQuery } from '../dto/engagement-query.dto';
import { CommentService } from './comment.service';
import { CommentDto, CreateCommentDto, ReportCommentDto, ReportResultDto, SetCommentReactionDto } from './dto/comment.dto';

/** Comment-scoped actions: replies, reactions, delete-own, report. */
@ApiTags('Engagement · Comments')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: RouteNames.COMMENTS, version: '1' })
export class CommentThreadController {
  constructor(private readonly comments: CommentService) {}

  @Get(':id/replies')
  @ApiOperation({ summary: 'List replies under a comment (oldest first)' })
  @ApiPaginatedEnvelope(CommentDto)
  replies(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Query() q: PageQuery) {
    return this.comments.listReplies(id, userId, q.page, q.limit);
  }

  @Post(':id/replies')
  @ApiOperation({ summary: 'Reply to a comment' })
  @ApiEnvelope(CommentDto, { status: 201 })
  reply(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateCommentDto) {
    return this.comments.reply(userId, id, dto.body);
  }

  @Put(':id/reaction')
  @ApiOperation({ summary: 'Like / dislike a comment' })
  @ApiEnvelope(CommentDto)
  react(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: SetCommentReactionDto) {
    return this.comments.setReaction(userId, id, dto.reaction);
  }

  @Delete(':id/reaction')
  @ApiOperation({ summary: 'Remove my reaction from a comment' })
  @ApiEnvelope(CommentDto)
  unreact(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.comments.removeReaction(userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete my own comment' })
  @ApiEnvelope(MessageResponseDto)
  remove(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.comments.remove(userId, id);
  }

  @Post(':id/report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Report a comment for moderation' })
  @ApiEnvelope(ReportResultDto)
  report(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ReportCommentDto) {
    return this.comments.report(userId, id, dto.reason, dto.description);
  }
}
