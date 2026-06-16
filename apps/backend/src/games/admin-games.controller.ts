import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { PaginationDetailsDto } from '@common/dto/pagination.dto';
import { Controller, Get, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../auth/decorators/account-type.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { GamesMetaRepository } from '@db/repositories/games/games-meta.repository';

class InstancesQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 20, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit = 20;
  @ApiPropertyOptional({ enum: ['quest', 'prediction', 'auction'] }) @IsOptional() @IsIn(['quest', 'prediction', 'auction']) type?: string;
}

/** A unified game instance across types (quest / prediction / auction). */
class GameInstanceDto {
  @ApiProperty({ enum: ['quest', 'prediction', 'auction'] }) type!: string;
  @ApiProperty() id!: string;
  @ApiPropertyOptional({ nullable: true }) title!: string | null;
  @ApiPropertyOptional({ nullable: true }) status!: string | null;
  @ApiPropertyOptional({ nullable: true, description: 'Creation timestamp' }) createdAt!: string | null;
}

/** Paginated cross-type game-instances list. */
class GameInstancesListDto {
  @ApiProperty({ type: [GameInstanceDto] }) items!: GameInstanceDto[];
  @ApiProperty({ type: PaginationDetailsDto }) pagination!: PaginationDetailsDto;
}

/** Per-game-type counts for the formats library cards. */
class GameTypesSummaryDto {
  @ApiProperty() quest_total!: number;
  @ApiProperty() quest_active!: number;
  @ApiProperty() prediction_total!: number;
  @ApiProperty() prediction_active!: number;
  @ApiProperty() auction_total!: number;
  @ApiProperty() auction_active!: number;
  @ApiProperty({ description: 'Fixed autonomous type' }) daily_streak_total!: number;
  @ApiProperty({ description: 'Fixed autonomous type' }) shared_content_total!: number;
}

/** Admin games overview — every instance across types + the formats-library summary. */
@ApiTags('Admin · Games')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.GAMES}`, version: '1' })
export class AdminGamesController {
  constructor(private readonly meta: GamesMetaRepository) {}

  @Get('instances')
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'All game instances across types (quest / prediction / auction)' })
  @ApiEnvelope(GameInstancesListDto)
  async instances(@Query() query: InstancesQueryDto) {
    const { items, total } = await this.meta.instances(query.page, query.limit, query.type);
    return { items, pagination: { pageNo: query.page, pageSize: query.limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / query.limit)) } };
  }

  @Get('types')
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'Per-game-type summary (formats library)' })
  @ApiEnvelope(GameTypesSummaryDto)
  types() {
    return this.meta.types();
  }
}
