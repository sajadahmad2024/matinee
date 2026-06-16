import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'support', description: 'lowercase identifier' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-z0-9_]+$/, { message: 'name may contain lowercase letters, numbers and underscores' })
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ type: [String], example: ['users:read', 'users:moderate'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permissionNames!: string[];
}

export class UpdateRoleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ type: [String], description: 'Replace the role\'s permission set' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionNames?: string[];
}
