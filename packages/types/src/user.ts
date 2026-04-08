import type { Document } from 'mongoose';

export const USER_ROLE = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export interface IUser {
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  role: UserRole;
  loginCounter: number;
  creationTime: Date;
  lastUpdateTime: Date;
}

export interface IUserDocument extends IUser, Document {}
