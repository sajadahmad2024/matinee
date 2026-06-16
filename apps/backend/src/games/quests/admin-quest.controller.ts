import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { QuestService } from './quest.service';
import {
  CreateQuestDto,
  QuestDeletedResultDto,
  QuestDetailDto,
  QuestListDto,
  QuestStatusResultDto,
  QuestsQueryDto,
  UpdateQuestDto,
} from './dto/quest.dto';

/** Admin quest instances (the games "Quests" format). */
@ApiTags('Admin · Games')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.QUESTS}`, version: '1' })
export class AdminQuestController {
  constructor(private readonly quests: QuestService) {}

  @Get()
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'List quests (filter by status)' })
  @ApiEnvelope(QuestListDto)
  list(@Query() query: QuestsQueryDto) {
    return this.quests.adminList(query.page, query.limit, query.status);
  }

  @Post()
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Create a quest (with its content set)' })
  @ApiEnvelope(QuestDetailDto, { status: 201 })
  create(@CurrentUser('id') adminId: string, @Body() dto: CreateQuestDto) {
    return this.quests.create(dto, adminId);
  }

  @Get(':id')
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'Quest detail (with content ids)' })
  @ApiEnvelope(QuestDetailDto)
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.quests.adminGet(id);
  }

  @Patch(':id')
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Update a quest' })
  @ApiEnvelope(QuestDetailDto)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateQuestDto) {
    return this.quests.update(id, dto);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Activate a quest' })
  @ApiEnvelope(QuestStatusResultDto)
  activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.quests.setStatus(id, 'active');
  }

  @Post(':id/end')
  @HttpCode(HttpStatus.OK)
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'End a quest' })
  @ApiEnvelope(QuestStatusResultDto)
  end(@Param('id', ParseUUIDPipe) id: string) {
    return this.quests.setStatus(id, 'ended');
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Cancel a quest' })
  @ApiEnvelope(QuestStatusResultDto)
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.quests.setStatus(id, 'cancelled');
  }

  @Delete(':id')
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Delete a quest (not while active)' })
  @ApiEnvelope(QuestDeletedResultDto)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.quests.remove(id);
  }
}
