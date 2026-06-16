import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuctionService } from './auction.service';
import { AuctionCustomerDetailDto, OpenAuctionDto, PlaceBidDto, PlaceBidResultDto } from './dto/auction.dto';

/** Customer auctions — spend points to win prizes (hold-on-bid; losers refunded). */
@ApiTags('Games · Bidding')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: RouteNames.AUCTIONS, version: '1' })
export class AuctionController {
  constructor(private readonly auctions: AuctionService) {}

  @Get()
  @ApiOperation({ summary: 'Open auctions with the highest bid + my bid' })
  @ApiEnvelope(OpenAuctionDto, { isArray: true })
  open(@CurrentUser('id') userId: string) {
    return this.auctions.listOpen(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Auction detail' })
  @ApiEnvelope(AuctionCustomerDetailDto)
  detail(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.auctions.detail(userId, id);
  }

  @Post(':id/bid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Place / raise a bid (holds the points)' })
  @ApiEnvelope(PlaceBidResultDto)
  bid(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: PlaceBidDto) {
    return this.auctions.placeBid(userId, id, dto.amount);
  }
}
