import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateStudioDto {
  @ApiProperty({ example: 'Seoul Studios' }) @IsString() @MinLength(1) @MaxLength(200) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiPropertyOptional({ description: 'Logo media id' }) @IsOptional() @IsUUID() logoMediaId?: string;
}
export class UpdateStudioDto extends PartialType(CreateStudioDto) {}

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
}
export class UpdatePersonDto extends PartialType(CreatePersonDto) {}
