import { SetMetadata } from '@nestjs/common';
import { AccountType } from '../interfaces/jwt-payload.interface';

export const ACCOUNT_TYPES_KEY = 'accountTypes';

/** Restrict a route to one or more account types. No decorator ⇒ any authenticated user. */
export const AccountTypes = (...types: AccountType[]) => SetMetadata(ACCOUNT_TYPES_KEY, types);

export const AdminOnly = () => AccountTypes('admin');
export const CustomerOnly = () => AccountTypes('customer');
export const CustomerOrGuest = () => AccountTypes('guest', 'customer');
