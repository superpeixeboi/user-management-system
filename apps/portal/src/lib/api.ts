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
