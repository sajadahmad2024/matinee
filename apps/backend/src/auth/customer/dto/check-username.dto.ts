import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CheckUsernameDto {
  @ApiProperty({ example: 'neo', description: 'Username to check (3–50 chars, letters/digits/_/.)' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_.]+$/, { message: 'username may contain letters, numbers, "_" and "."' })
  username!: string;
}
