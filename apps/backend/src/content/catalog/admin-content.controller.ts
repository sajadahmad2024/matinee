import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { MessageResponseDto } from '@common/dto/message-response.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { ContentService } from './content.service';
import { ContentListQueryDto } from './dto/content-query.dto';
import { ContentFullDto, LinkedGamesDto, ThumbnailCandidateDto } from './dto/content-admin-views.dto';
import { ContentResponseDto } from './dto/content-response.dto';
import {
  BoostContentDto,
  CreateContentDto,
  RejectContentDto,
  ScheduleContentDto,
  SetCastDto,
  UpdateContentDto,
} from './dto/content-write.dto';

/** Admin content management: directory + CRUD + the review→publish workflow. */
@ApiTags('Admin · Content')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/content`, version: '1' })
export class AdminContentController {
  constructor(private readonly content: ContentService) {}

  @Get()
  @Permissions('content:read')
  @ApiOperation({ summary: 'Content directory (multi-status, region, date ranges, search, sort) with enriched rows' })
  @ApiPaginatedEnvelope(ContentResponseDto)
  list(@Query() query: ContentListQueryDto) {
    return this.content.adminList(query);
  }

  @Get(':id')
  @Permissions('content:read')
  @ApiOperation({ summary: 'Content detail (admin, full signals)' })
  @ApiEnvelope(ContentResponseDto)
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.content.getAdmin(id);
  }

  @Get(':id/full')
  @Permissions('content:read')
  @ApiOperation({ summary: 'Editor bundle: content + license + sponsorship + regions + history + linked games' })
  @ApiEnvelope(ContentFullDto)
  full(@Param('id', ParseUUIDPipe) id: string) {
    return this.content.getFull(id);
  }

  @Get(':id/games')
  @Permissions('content:read')
  @ApiOperation({ summary: 'Games linked to this content (predictions, auctions, quests)' })
  @ApiEnvelope(LinkedGamesDto)
  games(@Param('id', ParseUUIDPipe) id: string) {
    return this.content.linkedGames(id);
  }

  @Get(':id/thumbnail-candidates')
  @Permissions('content:read')
  @ApiOperation({ summary: 'Thumbnail candidates (current, transcoder poster, stored stills/posters)' })
  @ApiEnvelope(ThumbnailCandidateDto, { isArray: true })
  thumbnailCandidates(@Param('id', ParseUUIDPipe) id: string) {
    return this.content.thumbnailCandidates(id);
  }

  @Post(':id/thumbnail/from-poster')
  @Permissions('content:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Use the video's transcoder poster as the thumbnail" })
  @ApiEnvelope(ContentResponseDto)
  thumbnailFromPoster(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.content.useTranscoderPoster(adminId, id);
  }

  @Post()
  @Permissions('content:write')
  @ApiOperation({ summary: 'Create content (draft)' })
  @ApiEnvelope(ContentResponseDto, { status: 201 })
  create(@CurrentUser('id') adminId: string, @Body() dto: CreateContentDto) {
    return this.content.create(adminId, dto);
  }

  @Patch(':id')
  @Permissions('content:write')
  @ApiOperation({ summary: 'Update content' })
  @ApiEnvelope(ContentResponseDto)
  update(
    @CurrentUser('id') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContentDto,
  ) {
    return this.content.update(adminId, id, dto);
  }

  @Post(':id/publish')
  @Permissions('content:publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve & publish now' })
  @ApiEnvelope(ContentResponseDto)
  publish(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.content.publish(adminId, id);
  }

  @Post(':id/schedule')
  @Permissions('content:publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve & schedule for a future go-live' })
  @ApiEnvelope(ContentResponseDto)
  schedule(
    @CurrentUser('id') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ScheduleContentDto,
  ) {
    return this.content.publish(adminId, id, dto.scheduledAt);
  }

  @Post(':id/unschedule')
  @Permissions('content:publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a scheduled go-live (scheduled → pending approval)' })
  @ApiEnvelope(ContentResponseDto)
  unschedule(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.content.unschedule(adminId, id);
  }

  @Post(':id/reject')
  @Permissions('content:publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a submission (with reason)' })
  @ApiEnvelope(ContentResponseDto)
  reject(
    @CurrentUser('id') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectContentDto,
  ) {
    return this.content.reject(adminId, id, dto.reason);
  }

  @Post(':id/archive')
  @Permissions('content:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive / unpublish' })
  @ApiEnvelope(ContentResponseDto)
  archive(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.content.archive(adminId, id);
  }

  @Post(':id/submit')
  @Permissions('content:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit a draft for review (draft → pending approval)' })
  @ApiEnvelope(ContentResponseDto)
  submit(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.content.submit(adminId, id);
  }

  @Post(':id/boost')
  @Permissions('content:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Boost / un-boost content in the feed (window + channels)' })
  @ApiEnvelope(ContentResponseDto)
  boost(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: BoostContentDto) {
    return this.content.boost(adminId, id, dto);
  }

  @Get(':id/cast')
  @Permissions('content:read')
  @ApiOperation({ summary: 'Cast & crew for a content' })
  @ApiEnvelope(ContentResponseDto)
  getCast(@Param('id', ParseUUIDPipe) id: string) {
    return this.content.getAdmin(id);
  }

  @Put(':id/cast')
  @Permissions('content:write')
  @ApiOperation({ summary: 'Replace the cast & crew list on a content' })
  @ApiEnvelope(ContentResponseDto)
  setCast(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: SetCastDto) {
    return this.content.setCast(adminId, id, dto.cast);
  }

  @Delete(':id')
  @Permissions('content:write')
  @ApiOperation({ summary: 'Soft-delete content' })
  @ApiEnvelope(MessageResponseDto)
  remove(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.content.remove(adminId, id);
  }
}
