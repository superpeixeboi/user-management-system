import axios from 'axios';
import type {
  UserResponse,
  Pagination,
  CreateUserInput,
  UpdateUserInput,
} from '@user-management-system/types';

export const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
});

export type User = UserResponse;

export interface LoginResponse {
  success: boolean;
  data?: {
    user: User;
  };
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
}

export interface ProfileResponse {
  success: boolean;
  data: UserResponse;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: UserResponse[];
    pagination: Pagination;
  };
}

export async function getUsers(page = 1, limit = 6): Promise<UsersResponse> {
  const res = await api.get(`/users?page=${page}&limit=${limit}`);
  return res.data;
}

export interface UserDetailResponse {
  success: boolean;
  data: UserResponse;
}

export async function getUser(id: string): Promise<UserDetailResponse> {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export type UpdateUserRequest = UpdateUserInput;
export type UpdateUserResponse = { success: boolean; data: UserResponse; message?: string };

export async function updateUser(id: string, data: UpdateUserInput): Promise<UpdateUserResponse> {
  const res = await api.patch(`/users/${id}`, data);
  return res.data;
}

export type CreateUserRequest = CreateUserInput;
export type CreateUserResponse = { success: boolean; data?: UserResponse; message?: string };

export async function createUser(data: CreateUserInput): Promise<CreateUserResponse> {
  const res = await api.post('/users', data);
  return res.data;
}

export interface DeleteUserResponse {
  success: boolean;
  message?: string;
}

export async function deleteUser(id: string): Promise<DeleteUserResponse> {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}
