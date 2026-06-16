import { UserRecord } from '@db/repositories/users/users.repository';

export interface UserDto {
  id: string;
  accountType: string;
  email: string | null;
  phone: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  avatarUrl: string | null;
  status: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  countryCode: string | null;
  roles: string[];
  permissions: string[];
  createdAt: string;
}

export function toUserDto(user: UserRecord, roles: string[] = [], permissions: string[] = []): UserDto {
  return {
    id: user.id,
    accountType: user.accountType,
    email: user.email,
    phone: user.phone,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    avatarUrl: user.avatarUrl,
    status: user.status,
    isPhoneVerified: user.isPhoneVerified,
    isEmailVerified: user.isEmailVerified,
    countryCode: user.countryCode,
    roles,
    permissions,
    createdAt: user.createdAt,
  };
}
