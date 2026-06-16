import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CatalogService } from './catalog.service';
import { CatalogItemDto, CatalogQueryDto, CreateCatalogItemDto, UpdateCatalogItemDto } from './dto/catalog.dto';

/** Admin rewards-catalog management. */
@ApiTags('Admin · Rewards Store')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.REWARDS}/catalog`, version: '1' })
export class AdminCatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'List all catalog items' })
  @ApiPaginatedEnvelope(CatalogItemDto)
  list(@Query() query: CatalogQueryDto) {
    return this.catalog.adminList(query);
  }

  @Post()
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Create a catalog item' })
  @ApiEnvelope(CatalogItemDto, { status: 201 })
  create(@CurrentUser('id') adminId: string, @Body() dto: CreateCatalogItemDto) {
    return this.catalog.create(dto, adminId);
  }

  @Patch(':id')
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Update a catalog item (incl. activate/deactivate, restock)' })
  @ApiEnvelope(CatalogItemDto)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCatalogItemDto) {
    return this.catalog.update(id, dto);
  }
}
