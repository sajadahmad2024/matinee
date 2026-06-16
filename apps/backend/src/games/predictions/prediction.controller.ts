import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PredictionService } from './prediction.service';
import {
  EnterPredictionDto,
  OpenPredictionsResponseDto,
  PredictionCustomerDetailDto,
  PredictionEnterResultDto,
  PredictionEntitlementDto,
} from './dto/prediction.dto';

/** Customer predictions — stake points on an outcome, win on correct. */
@ApiTags('Games · Predictions')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: RouteNames.PREDICTIONS, version: '1' })
export class PredictionController {
  constructor(private readonly predictions: PredictionService) {}

  @Get()
  @ApiOperation({ summary: 'Open predictions with options + my entry + my monthly allowance' })
  @ApiEnvelope(OpenPredictionsResponseDto)
  open(@CurrentUser('id') userId: string) {
    return this.predictions.listOpen(userId);
  }

  @Get('entitlement')
  @ApiOperation({ summary: 'My prediction allowance this month (free cap vs. unlimited for subscribers)' })
  @ApiEnvelope(PredictionEntitlementDto)
  entitlement(@CurrentUser('id') userId: string) {
    return this.predictions.getEntitlement(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Prediction detail (+ result once resolved)' })
  @ApiEnvelope(PredictionCustomerDetailDto)
  detail(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.predictions.detail(userId, id);
  }

  @Post(':id/enter')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enter a prediction (stakes the entry cost)' })
  @ApiEnvelope(PredictionEnterResultDto)
  enter(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: EnterPredictionDto) {
    return this.predictions.enter(userId, id, dto.optionId);
  }
}
