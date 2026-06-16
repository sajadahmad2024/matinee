import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { AuctionService } from './auction.service';
import {
  AuctionCancelResultDto,
  AuctionDeletedResultDto,
  AuctionDetailDto,
  AuctionListDto,
  AuctionOpenResultDto,
  AuctionSettleResultDto,
  AuctionsQueryDto,
  CreateAuctionDto,
  UpdateAuctionDto,
} from './dto/auction.dto';

/** Admin auction instances (the games "Bidding" format). */
@ApiTags('Admin · Games')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.AUCTIONS}`, version: '1' })
export class AdminAuctionController {
  constructor(private readonly auctions: AuctionService) {}

  @Get()
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'List auctions (filter by status)' })
  @ApiEnvelope(AuctionListDto)
  list(@Query() query: AuctionsQueryDto) {
    return this.auctions.adminList(query.page, query.limit, query.status);
  }

  @Post()
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Create an auction' })
  @ApiEnvelope(AuctionDetailDto, { status: 201 })
  create(@CurrentUser('id') adminId: string, @Body() dto: CreateAuctionDto) {
    return this.auctions.create(dto, adminId);
  }

  @Get(':id')
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'Auction detail (with active bids)' })
  @ApiEnvelope(AuctionDetailDto)
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.auctions.adminGet(id);
  }

  @Patch(':id')
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Edit an auction (before settle/cancel)' })
  @ApiEnvelope(AuctionDetailDto)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAuctionDto) {
    return this.auctions.update(id, dto);
  }

  @Delete(':id')
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Delete an auction (no bids)' })
  @ApiEnvelope(AuctionDeletedResultDto)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.auctions.remove(id);
  }

  @Post(':id/open')
  @HttpCode(HttpStatus.OK)
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Open an auction for bidding' })
  @ApiEnvelope(AuctionOpenResultDto)
  openAuction(@Param('id', ParseUUIDPipe) id: string) {
    return this.auctions.open(id);
  }

  @Post(':id/settle')
  @HttpCode(HttpStatus.OK)
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Settle — highest bid wins, losers refunded' })
  @ApiEnvelope(AuctionSettleResultDto)
  settle(@Param('id', ParseUUIDPipe) id: string) {
    return this.auctions.settle(id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Cancel — refund all bids' })
  @ApiEnvelope(AuctionCancelResultDto)
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.auctions.cancel(id);
  }
}
