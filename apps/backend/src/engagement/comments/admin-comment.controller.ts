import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CommentService } from './comment.service';
import {
  AdminCommentDto,
  AdminCommentsQueryDto,
  AdminCommentThreadDto,
  CommentActionResultDto,
  CommentReportDto,
  EnforceCommentAuthorDto,
  EnforceResultDto,
  ModerateCommentDto,
  ReportsQueryDto,
  ResolveReportDto,
  ResolveReportResultDto,
} from './dto/comment.dto';

/** Admin comment moderation: list comments, review reports, action/dismiss, hide/restore comments. */
@ApiTags('Admin · Comment Moderation')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.COMMENTS}`, version: '1' })
export class AdminCommentController {
  constructor(private readonly comments: CommentService) {}

  @Get()
  @Permissions('content:read')
  @ApiOperation({ summary: 'List comments (any status) — filter by content / status / parent / flagged; sortable' })
  @ApiPaginatedEnvelope(AdminCommentDto)
  list(@Query() q: AdminCommentsQueryDto) {
    return this.comments.adminListComments({
      page: q.page,
      limit: q.limit,
      contentId: q.contentId,
      status: q.status,
      parentId: q.parentId,
      flagged: q.flagged,
      sort: q.sort,
    });
  }

  @Get('reports')
  @Permissions('content:write')
  @ApiOperation({ summary: 'List comment reports (filter by status)' })
  @ApiPaginatedEnvelope(CommentReportDto)
  reports(@Query() q: ReportsQueryDto) {
    return this.comments.adminListReports(q.page, q.limit, q.status);
  }

  @Patch('reports/:id/resolve')
  @Permissions('content:write')
  @ApiOperation({ summary: 'Resolve a report (actioned hides the comment; closes the ticket when none pending)' })
  @ApiEnvelope(ResolveReportResultDto)
  resolve(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ResolveReportDto) {
    return this.comments.adminResolveReport(id, dto.status, adminId);
  }

  @Get(':id')
  @Permissions('content:read')
  @ApiOperation({ summary: 'Comment thread ("View in context"): comment, parent, replies, reports, open ticket' })
  @ApiEnvelope(AdminCommentThreadDto)
  thread(@Param('id', ParseUUIDPipe) id: string) {
    return this.comments.adminThread(id);
  }

  @Post(':id/enforce')
  @Permissions('users:moderate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Warn / suspend / ban the comment's author (optionally hides the comment; resolves its ticket + reports)" })
  @ApiEnvelope(EnforceResultDto)
  enforce(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: EnforceCommentAuthorDto) {
    return this.comments.adminEnforce(id, adminId, dto);
  }

  @Patch(':id/status')
  @Permissions('content:write')
  @ApiOperation({ summary: 'Moderate a comment (hide / restore / delete)' })
  @ApiEnvelope(CommentActionResultDto)
  setStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ModerateCommentDto) {
    return this.comments.adminSetStatus(id, dto.status);
  }
}
