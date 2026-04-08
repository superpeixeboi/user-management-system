import { z } from 'zod';
import mongoose, { Schema } from 'mongoose';
import type { IUser } from '@user-management-system/types';
export { USER_ROLE } from '@user-management-system/types';

export const userRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const userUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  role: z.enum(['user', 'admin']).optional(),
});

export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

export interface IUserDocument extends IUser {
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    loginCounter: {
      type: Number,
      default: 0,
    },
    creationTime: {
      type: Date,
      default: Date.now,
    },
    lastUpdateTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'creationTime', updatedAt: 'lastUpdateTime' },
  }
);

export const User = mongoose.model<IUserDocument>('User', userSchema);
