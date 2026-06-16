import { ApiProperty } from '@nestjs/swagger';

/** Result of a save/unsave watchlist toggle. */
export class WatchlistResultDto {
  @ApiProperty({ description: 'true after save, false after remove' })
  saved!: boolean;
}
