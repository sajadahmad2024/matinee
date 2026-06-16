import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString, IsUrl, IsUUID, MaxLength } from 'class-validator';

const GENDERS = ['male', 'female', 'non_binary', 'prefer_not_to_say'];

/**
 * Editable profile fields (Edit-profile screen). Username/phone are identity and are NOT
 * editable here — username is set once at sign-up; phone changes through the auth flows.
 * Email IS settable here (phone-first customers add a contact email); a new/changed email is
 * stored unverified until confirmed.
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'jordan@example.com', description: 'Contact email; stored unverified when set/changed' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: 'Jordan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Lee' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ description: 'About You', example: 'Film buff & trivia addict.' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string;

  @ApiPropertyOptional({ enum: GENDERS })
  @IsOptional()
  @IsIn(GENDERS)
  gender?: string;

  @ApiPropertyOptional({ description: 'Avatar from an uploaded media asset' })
  @IsOptional()
  @IsUUID()
  avatarMediaId?: string;

  @ApiPropertyOptional({ description: 'Avatar URL (external / social avatar)' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'US', description: 'ISO-3166 alpha-2' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  countryCode?: string;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;
}
