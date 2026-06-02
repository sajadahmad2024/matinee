import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CompleteProfileDto {
  @ApiProperty({ example: 'neo', description: 'Unique display username (3–50 chars)' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_.]+$/, { message: 'username may contain letters, numbers, "_" and "."' })
  username!: string;

  @ApiPropertyOptional({ example: 'ABC123', description: "Another user's referral code" })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  referralCode?: string;

  @ApiPropertyOptional({ enum: ['male', 'female', 'other', 'prefer_not_to_say'] })
  @IsOptional()
  @IsIn(['male', 'female', 'other', 'prefer_not_to_say'])
  gender?: string;

  @ApiPropertyOptional({ example: 'Thomas Anderson' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  fullName?: string;
}
