import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CommentService } from './comment.service';
import { CommentActionResultDto, CommentReportDto, ModerateCommentDto, ReportsQueryDto, ResolveReportDto } from './dto/comment.dto';

/** Admin comment moderation: review reports, action/dismiss, hide/restore comments. */
@ApiTags('Admin · Comment Moderation')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.COMMENTS}`, version: '1' })
export class AdminCommentController {
  constructor(private readonly comments: CommentService) {}

  @Get('reports')
  @Permissions('content:write')
  @ApiOperation({ summary: 'List comment reports (filter by status)' })
  @ApiPaginatedEnvelope(CommentReportDto)
  reports(@Query() q: ReportsQueryDto) {
    return this.comments.adminListReports(q.page, q.limit, q.status);
  }

  @Patch('reports/:id/resolve')
  @Permissions('content:write')
  @ApiOperation({ summary: 'Resolve a report (actioned / dismissed)' })
  @ApiEnvelope(CommentActionResultDto)
  resolve(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ResolveReportDto) {
    return this.comments.adminResolveReport(id, dto.status, adminId);
  }

  @Patch(':id/status')
  @Permissions('content:write')
  @ApiOperation({ summary: 'Moderate a comment (hide / restore / delete)' })
  @ApiEnvelope(CommentActionResultDto)
  setStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ModerateCommentDto) {
    return this.comments.adminSetStatus(id, dto.status);
  }
}
