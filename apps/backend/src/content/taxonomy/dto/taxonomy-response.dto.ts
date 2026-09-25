import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PERSON_KNOWN_FOR, PersonKnownFor } from '@db/repositories/content/taxonomy.repository';

const CONTENT_COUNT_DESC = 'Number of non-deleted contents using it (drives "used by" / "most used" / "unused")';

/** Studio reference row (admin). Mirrors `StudioRecord` + usage count. */
export class StudioResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiPropertyOptional({ nullable: true }) logoMediaId!: string | null;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiPropertyOptional({ nullable: true, example: 'KR', description: 'ISO-3166-1 alpha-2' }) countryCode!: string | null;
  @ApiProperty({ description: CONTENT_COUNT_DESC }) contentCount!: number;
}

/** Genre reference row (public). Mirrors `GenreRecord`. */
export class GenreResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() sortOrder!: number;
}
/** Genre row for the admin manager (with usage count). */
export class AdminGenreResponseDto extends GenreResponseDto {
  @ApiProperty({ description: CONTENT_COUNT_DESC }) contentCount!: number;
}

/** Tag reference row (public). Mirrors `TagRecord`. */
export class TagResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
}
/** Tag row for the admin manager (with usage count). */
export class AdminTagResponseDto extends TagResponseDto {
  @ApiProperty({ description: CONTENT_COUNT_DESC }) contentCount!: number;
}

/** Person (cast/crew) reference row (admin). Mirrors `PersonRecord` + usage count. */
export class PersonResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiPropertyOptional({ nullable: true }) photoMediaId!: string | null;
  @ApiPropertyOptional({ nullable: true }) bio!: string | null;
  @ApiPropertyOptional({ enum: PERSON_KNOWN_FOR, nullable: true }) knownFor!: PersonKnownFor | null;
  @ApiProperty({ description: 'Number of distinct non-deleted contents the person is credited on' }) contentCount!: number;
}
