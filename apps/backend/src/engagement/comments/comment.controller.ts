import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PageQuery } from '../dto/engagement-query.dto';
import { CommentService } from './comment.service';
import { CommentDto, CreateCommentDto } from './dto/comment.dto';

/** Content-scoped comments: the thread under a content. */
@ApiTags('Engagement · Comments')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: RouteNames.CONTENT, version: '1' })
export class CommentController {
  constructor(private readonly comments: CommentService) {}

  @Get(':id/comments')
  @ApiOperation({ summary: 'List top-level comments for a content (newest first)' })
  @ApiPaginatedEnvelope(CommentDto)
  list(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Query() q: PageQuery) {
    return this.comments.list(id, userId, q.page, q.limit);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Post a comment on a content' })
  @ApiEnvelope(CommentDto, { status: 201 })
  create(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateCommentDto) {
    return this.comments.create(userId, id, dto.body);
  }
}
