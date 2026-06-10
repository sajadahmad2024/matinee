import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../dto/auth-responses.dto';

export class RoleResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) description!: string | null;
  @ApiProperty() isSystem!: boolean;
  @ApiProperty() isActive!: boolean;
  @ApiProperty({ type: [String] }) permissions!: string[];
}

export class PermissionResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) description!: string | null;
  @ApiProperty() resource!: string;
  @ApiProperty() action!: string;
}

export class EnforcementResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: ['suspend', 'ban', 'reinstate', 'disable', 'enable'] }) action!: string;
  @ApiProperty({ nullable: true }) reason!: string | null;
  @ApiProperty({ nullable: true }) expiresAt!: string | null;
  @ApiProperty({ nullable: true, format: 'uuid' }) performedBy!: string | null;
  @ApiProperty() createdAt!: string;
}

export class UserListResponseDto {
  @ApiProperty({ type: [UserResponseDto] }) data!: UserResponseDto[];
  @ApiProperty() total!: number;
}

export class UserDetailResponseDto {
  @ApiProperty({ type: UserResponseDto }) user!: UserResponseDto;
  @ApiProperty({ type: [EnforcementResponseDto] }) enforcementHistory!: EnforcementResponseDto[];
}
