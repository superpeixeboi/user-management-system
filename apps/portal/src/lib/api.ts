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
