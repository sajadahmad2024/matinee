import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString, MaxLength, MinLength } from 'class-validator';

export class SetUserRolesDto {
  @ApiProperty({ type: [String], example: ['admin'], description: 'Role names to assign (replaces current)' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roles!: string[];
}

export class WarnUserDto {
  @ApiProperty({ minLength: 3, maxLength: 500 })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  message!: string;
}
