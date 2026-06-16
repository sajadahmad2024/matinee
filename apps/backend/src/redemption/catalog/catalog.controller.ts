import { RouteNames } from '@common/route-names';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CatalogService } from './catalog.service';
import { CatalogItemDto, CatalogQueryDto } from './dto/catalog.dto';

/** Customer rewards storefront (Premium Experiences). */
@ApiTags('Rewards Store')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: `${RouteNames.REWARDS}/catalog`, version: '1' })
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'Browse redeemable rewards (active, in-stock, region-available)' })
  @ApiPaginatedEnvelope(CatalogItemDto)
  browse(@CurrentUser('id') userId: string, @Query() query: CatalogQueryDto) {
    return this.catalog.browse(userId, query);
  }
}
