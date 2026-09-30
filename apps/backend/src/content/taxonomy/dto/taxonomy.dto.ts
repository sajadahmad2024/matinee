import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { PERSON_KNOWN_FOR, PersonKnownFor } from '@db/repositories/content/taxonomy.repository';

/** Trim + uppercase so `us` / ` us ` are accepted as `US`; `null` passes through (clears on update). */
const toCountryCode = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

export class CreateStudioDto {
  @ApiProperty({ example: 'Seoul Studios' }) @IsString() @MinLength(1) @MaxLength(200) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiPropertyOptional({ description: 'Logo media id' }) @IsOptional() @IsUUID() logoMediaId?: string;
  @ApiPropertyOptional({ example: 'KR', description: 'ISO-3166-1 alpha-2 country code (uppercased)' })
  @IsOptional()
  @Transform(toCountryCode)
  @Matches(/^[A-Z]{2}$/, { message: 'countryCode must be an ISO-3166 alpha-2 code (e.g. US, KR)' })
  countryCode?: string;
}
export class UpdateStudioDto extends PartialType(OmitType(CreateStudioDto, ['countryCode'] as const)) {
  @ApiPropertyOptional({ example: 'KR', nullable: true, description: 'ISO-3166-1 alpha-2; `null` clears it' })
  @IsOptional()
  @Transform(toCountryCode)
  @ValidateIf((_o, v) => v !== null)
  @Matches(/^[A-Z]{2}$/, { message: 'countryCode must be an ISO-3166 alpha-2 code (e.g. US, KR)' })
  countryCode?: string | null;
}

export class CreateGenreDto {
  @ApiProperty({ example: 'Action' }) @IsString() @MinLength(1) @MaxLength(100) name!: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() sortOrder?: number;
}
export class UpdateGenreDto extends PartialType(CreateGenreDto) {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class CreateTagDto {
  @ApiProperty({ example: 'trending' }) @IsString() @MinLength(1) @MaxLength(80) name!: string;
}

export class CreatePersonDto {
  @ApiProperty({ example: 'Min-jun Kim' }) @IsString() @MinLength(1) @MaxLength(200) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) bio?: string;
  @ApiPropertyOptional({ description: 'Headshot media id' }) @IsOptional() @IsUUID() photoMediaId?: string;
  @ApiPropertyOptional({ enum: PERSON_KNOWN_FOR, description: 'Person-level primary role (credit roles stay on content_cast)' })
  @IsOptional()
  @IsIn(PERSON_KNOWN_FOR)
  knownFor?: PersonKnownFor;
}
export class UpdatePersonDto extends PartialType(OmitType(CreatePersonDto, ['knownFor'] as const)) {
  @ApiPropertyOptional({ enum: PERSON_KNOWN_FOR, nullable: true, description: '`null` clears it' })
  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsIn(PERSON_KNOWN_FOR)
  knownFor?: PersonKnownFor | null;
}
