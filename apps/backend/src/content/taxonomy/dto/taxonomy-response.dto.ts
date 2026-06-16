import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Studio reference row (master-data). Mirrors `StudioRecord`. */
export class StudioResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiPropertyOptional({ nullable: true }) logoMediaId!: string | null;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
}

/** Genre reference row (master-data). Mirrors `GenreRecord`. */
export class GenreResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() sortOrder!: number;
}

/** Tag reference row (master-data). Mirrors `TagRecord`. */
export class TagResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
}

/** Person (cast/crew) reference row (master-data). Mirrors `PersonRecord`. */
export class PersonResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiPropertyOptional({ nullable: true }) photoMediaId!: string | null;
  @ApiPropertyOptional({ nullable: true }) bio!: string | null;
}
