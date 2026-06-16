import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { PredictionService } from './prediction.service';
import {
  CreatePredictionDto,
  PredictionCancelResultDto,
  PredictionDeletedResultDto,
  PredictionDetailDto,
  PredictionListDto,
  PredictionLockResultDto,
  PredictionResolveResultDto,
  PredictionsQueryDto,
  ResolvePredictionDto,
  UpdatePredictionDto,
} from './dto/prediction.dto';

/** Admin prediction instances (the games "Predictive" format). */
@ApiTags('Admin · Games')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.PREDICTIONS}`, version: '1' })
export class AdminPredictionController {
  constructor(private readonly predictions: PredictionService) {}

  @Get()
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'List predictions (filter by status)' })
  @ApiEnvelope(PredictionListDto)
  list(@Query() query: PredictionsQueryDto) {
    return this.predictions.adminList(query.page, query.limit, query.status);
  }

  @Post()
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Create a prediction (with options)' })
  @ApiEnvelope(PredictionDetailDto, { status: 201 })
  create(@CurrentUser('id') adminId: string, @Body() dto: CreatePredictionDto) {
    return this.predictions.create(dto, adminId);
  }

  @Get(':id')
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'Prediction detail (with options)' })
  @ApiEnvelope(PredictionDetailDto)
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.predictions.adminGet(id);
  }

  @Patch(':id')
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Edit a prediction (before resolve/cancel)' })
  @ApiEnvelope(PredictionDetailDto)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePredictionDto) {
    return this.predictions.update(id, dto);
  }

  @Delete(':id')
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Delete a prediction (no entries)' })
  @ApiEnvelope(PredictionDeletedResultDto)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.predictions.remove(id);
  }

  @Post(':id/lock')
  @HttpCode(HttpStatus.OK)
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Lock entries (no more entries)' })
  @ApiEnvelope(PredictionLockResultDto)
  lock(@Param('id', ParseUUIDPipe) id: string) {
    return this.predictions.lock(id);
  }

  @Post(':id/resolve')
  @HttpCode(HttpStatus.OK)
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Resolve — set the winning option and pay out correct entries' })
  @ApiEnvelope(PredictionResolveResultDto)
  resolve(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ResolvePredictionDto) {
    return this.predictions.resolve(id, dto.correctOptionId, adminId);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Cancel — refund all stakes' })
  @ApiEnvelope(PredictionCancelResultDto)
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.predictions.cancel(id);
  }
}
