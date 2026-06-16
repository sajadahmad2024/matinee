import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { MessageResponseDto } from '@common/dto/message-response.dto';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { PlanService } from './plan.service';
import { AdminPlanDto, CreatePlanDto, PlanDto, RegionPriceResultDto, SetRegionPriceDto, UpdatePlanDto } from './dto/plan.dto';

/** Admin plan configuration + per-region pricing. */
@ApiTags('Admin · Subscriptions')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.SUBSCRIPTIONS}/plans`, version: '1' })
export class AdminPlanController {
  constructor(private readonly plans: PlanService) {}

  @Get()
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'List all plans (with region prices)' })
  @ApiEnvelope(AdminPlanDto, { isArray: true })
  list() {
    return this.plans.adminList();
  }

  @Post()
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Create a plan' })
  @ApiEnvelope(PlanDto, { status: 201 })
  create(@CurrentUser('id') adminId: string, @Body() dto: CreatePlanDto) {
    return this.plans.create(dto, adminId);
  }

  @Patch(':id')
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Update a plan (incl. activate/deactivate)' })
  @ApiEnvelope(PlanDto)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePlanDto) {
    return this.plans.update(id, dto);
  }

  @Delete(':id')
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Delete (soft) a plan' })
  @ApiEnvelope(MessageResponseDto)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.plans.remove(id);
  }

  @Put(':id/region-price')
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Set a region price for a plan (upsert)' })
  @ApiEnvelope(RegionPriceResultDto)
  setRegionPrice(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SetRegionPriceDto) {
    return this.plans.setRegionPrice(id, dto);
  }
}
