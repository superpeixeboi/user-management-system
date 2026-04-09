import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
});

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

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
  data: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserListItem {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  creationTime: string;
  lastUpdateTime: string;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: UserListItem[];
    pagination: Pagination;
  };
}

export async function getUsers(page = 1, limit = 6): Promise<UsersResponse> {
  const res = await api.get(`/users?page=${page}&limit=${limit}`);
  return res.data;
}

export interface UserDetailResponse {
  success: boolean;
  data: UserListItem;
}

export async function getUser(id: string): Promise<UserDetailResponse> {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
}

export interface UpdateUserResponse {
  success: boolean;
  data: UserListItem;
  message?: string;
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<UpdateUserResponse> {
  const res = await api.patch(`/users/${id}`, data);
  return res.data;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  status?: string;
}

export interface CreateUserResponse {
  success: boolean;
  data?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    creationTime: string;
    lastUpdateTime: string;
  };
  message?: string;
}

export async function createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
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
